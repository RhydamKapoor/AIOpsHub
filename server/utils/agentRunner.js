const path = require("path");
const fs = require("fs");
const vm = require("vm");
const { ChatGroq } = require("@langchain/groq");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { AIMessage } = require("@langchain/core/messages");
const { MessagesAnnotation, StateGraph } = require("@langchain/langgraph");
const { decrypt } = require("./encryption");

const GROQ_MODEL = "llama-3.3-70b-versatile";
const TOOLS_DIR = path.join(__dirname, "../controllers/dynamicTools");

const LLM_LABELS = {
  groq: "Groq - Llama 3.3",
  openai: "OpenAI - GPT-4",
  claude: "Claude - 3.5 Sonnet",
};

function getChatModel(llm = "groq") {
  if (llm !== "groq") {
    throw new Error(
      `LLM "${LLM_LABELS[llm] || llm}" is not configured on the server yet. Use Groq for now.`
    );
  }
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in server environment");
  }
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: GROQ_MODEL,
    temperature: 0,
  });
}

async function resolveEnv(envArray = []) {
  if (!envArray.length) return {};
  const entries = await Promise.all(
    envArray.map(async ({ key, value }) => {
      try {
        return [key, decrypt(value)];
      } catch {
        return [key, value];
      }
    })
  );
  return Object.fromEntries(entries);
}

async function loadToolsFromDefinitions(toolDefs = []) {
  const loaded = [];
  for (const toolDef of toolDefs) {
    try {
      const fileName = toolDef.fileName;
      if (!fileName) continue;

      const setFileName = fileName.startsWith("tool_")
        ? fileName
        : `tool_${fileName}`;
      const filePath = path.join(TOOLS_DIR, setFileName);
      if (!fs.existsSync(filePath)) {
        console.error(`Tool file missing: ${setFileName}`);
        continue;
      }

      const envObject = await resolveEnv(toolDef.env);
      const code = fs.readFileSync(filePath, "utf8");
      const context = {
        axios: require("axios"),
        z: require("zod"),
        tool: require("@langchain/core/tools").tool,
        env: envObject,
        global: {},
      };

      vm.createContext(context);
      const script = new vm.Script(code);
      script.runInContext(context);

      if (context.global.toolNode) {
        loaded.push(context.global.toolNode);
      }
    } catch (err) {
      console.error(
        `Failed to load tool ${toolDef.title || toolDef.fileName}:`,
        err
      );
    }
  }
  return loaded;
}

async function createAgentGraph(tools, llm, systemPrompt, options = {}) {
  const maxToolRounds = options.maxToolRounds ?? 5;
  const model = getChatModel(llm);
  const defaultSystem = `You are a helpful AI agent. Answer the user accurately.
When tools are available, use them only when needed to answer the question.
If tools are not required, respond directly without calling tools.
After at most one or two tool calls, give a final plain-text answer.`;

  if (!tools.length) {
    return {
      invoke: async ({ messages }) => {
        const result = await model.invoke([
          { role: "system", content: systemPrompt || defaultSystem },
          ...messages,
        ]);
        return { messages: [result] };
      },
    };
  }

  const llmWithTools = model.bindTools(tools);

  function countToolRoundTrips(messages) {
    return messages.filter(
      (msg) =>
        (msg instanceof AIMessage || msg.role === "assistant") &&
        msg.tool_calls?.length > 0
    ).length;
  }

  async function llmCall(state) {
    const result = await llmWithTools.invoke([
      { role: "system", content: systemPrompt || defaultSystem },
      ...state.messages,
    ]);
    const tokenUsage = result.response_metadata?.tokenUsage || {
      completionTokens: 0,
      promptTokens: 0,
      totalTokens: 0,
    };
    return { messages: [result], tokenUsage };
  }

  const toolNode = new ToolNode(tools);
  const shouldContinue = (state) => {
    const lastMessage = state.messages.at(-1);
    if (countToolRoundTrips(state.messages) >= maxToolRounds) {
      return "__end__";
    }
    return lastMessage?.tool_calls?.length ? "Action" : "__end__";
  };

  return new StateGraph(MessagesAnnotation)
    .addNode("llmCall", llmCall)
    .addNode("tools", toolNode)
    .addEdge("__start__", "llmCall")
    .addConditionalEdges("llmCall", shouldContinue, {
      Action: "tools",
      __end__: "__end__",
    })
    .addEdge("tools", "llmCall")
    .compile();
}

function getMessageContent(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("")
      .trim();
  }
  return content ? String(content).trim() : "";
}

async function invokeDirectAnswer({ llm, systemPrompt, messages }) {
  const model = getChatModel(llm);
  const result = await model.invoke([
    {
      role: "system",
      content: `${systemPrompt}\n\nRespond directly to the user in clear, natural language.`,
    },
    ...messages,
  ]);
  return getMessageContent(result.content);
}

function getFinalAnswer(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof AIMessage || msg.role === "assistant") {
      const text = getMessageContent(msg.content);
      if (text) return text;
    }
  }
  return null;
}

function buildWorkflowHistory(result, userMessage) {
  const history = [];
  let totalTokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };

  for (const msg of result.messages) {
    if (msg.role === "tool" || msg.name) {
      history.push({
        stepName: msg.name || "Tool Step",
        input: msg.input || "",
        output: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        toolUsed: [msg.name].filter(Boolean),
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });
    } else if (msg.role === "assistant" || msg instanceof AIMessage) {
      const usage = msg.response_metadata?.tokenUsage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
      totalTokenUsage.promptTokens += usage.promptTokens || 0;
      totalTokenUsage.completionTokens += usage.completionTokens || 0;
      totalTokenUsage.totalTokens += usage.totalTokens || 0;

      const toolCalls = msg.tool_calls?.map((call) => call.name) || [];
      history.push({
        stepName: "LLM Call",
        input: userMessage,
        output: typeof msg.content === "string" ? msg.content : "",
        toolUsed: toolCalls,
        tokenUsage: usage,
      });
    }
  }

  return { history, totalTokenUsage };
}

async function runAgentWithTools({
  tools,
  llm,
  userMessage,
  messages,
  systemPrompt,
  maxToolRounds = 5,
  recursionLimit = 25,
  fallbackWithoutTools = true,
}) {
  const langchainTools = await loadToolsFromDefinitions(tools);
  const graph = await createAgentGraph(langchainTools, llm, systemPrompt, {
    maxToolRounds,
  });

  const chatMessages =
    messages?.length > 0
      ? messages
      : [{ role: "user", content: userMessage }];

  const invokeOptions = { recursionLimit };
  let result;

  try {
    result = await graph.invoke({ messages: chatMessages }, invokeOptions);
  } catch (err) {
    const isRecursionLimit =
      err?.lc_error_code === "GRAPH_RECURSION_LIMIT" ||
      err?.name === "GraphRecursionError";

    if (isRecursionLimit && fallbackWithoutTools) {
      console.warn("Graph recursion limit hit — using direct answer fallback");
      const direct = await invokeDirectAnswer({
        llm,
        systemPrompt,
        messages: chatMessages,
      });
      return {
        finalResponse: direct,
        history: [],
        totalTokenUsage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        toolsLoaded: langchainTools.length,
        usedFallback: true,
      };
    }
    throw err;
  }

  let finalResponse = getFinalAnswer(result.messages);

  if (!finalResponse && fallbackWithoutTools) {
    finalResponse = await invokeDirectAnswer({
      llm,
      systemPrompt,
      messages: chatMessages,
    });
  }

  const latestUserMessage =
    [...chatMessages].reverse().find((msg) => msg.role === "user")?.content ||
    userMessage;
  const { history, totalTokenUsage } = buildWorkflowHistory(
    result,
    latestUserMessage
  );
  return {
    finalResponse,
    history,
    totalTokenUsage,
    toolsLoaded: langchainTools.length,
  };
}

module.exports = {
  LLM_LABELS,
  getChatModel,
  loadToolsFromDefinitions,
  createAgentGraph,
  runAgentWithTools,
  invokeDirectAnswer,
  getMessageContent,
  buildWorkflowHistory,
};
