const { ChatGroq } = require("@langchain/groq");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { tool } = require("@langchain/core/tools");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { AIMessage } = require("@langchain/core/messages");
const { MessagesAnnotation, StateGraph } = require("@langchain/langgraph");
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const Agent = require("../models/Agent");
const { decrypt } = require("../utils/encryption");
const Workflow = require("../models/AllStats");

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// Collect all agent tools into one flat tool array
async function loadAllTools(agents) {
  const allTools = [];
  for (const agent of agents) {
    for (const toolDef of agent.tools) {
      try {
        let envObject = {};
        if (toolDef.env) {
          const entries = await Promise.all(
            toolDef.env.map(async ({ key, value }) => [key, decrypt(value)])
          );
          envObject = Object.fromEntries(entries);
        }

        const toolsDir = path.join(__dirname, "dynamicTools");
        const setFileName = `tool_${toolDef.fileName}`;
        const filePath = path.join(toolsDir, setFileName);
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

        allTools.push(context.global.toolNode);
      } catch (err) {
        console.error(`Failed to load tool ${toolDef.title}:`, err);
      }
    }
  }
  return allTools;
}

async function createGraphWithTools(tools) {
  const llmWithTools = model.bindTools(tools);

  async function llmCall(state) {
    const result = await llmWithTools.invoke([
      {
        role: "system",
        content: `You are a smart AI agent. You have access to tools. 
        Only use a tool when the user's question cannot be answered from your general knowledge.
        If the question is about general facts (e.g., 'Who is the PM of India?'), answer directly.
        Do NOT call tools unless they are clearly required.
        `,
      },
      ...state.messages,
    ]);

    const tokenUsage = result.response_metadata?.tokenUsage || {
      completionTokens: 0,
      promptTokens: 0,
      totalTokens: 0,
    };

    return {
      messages: [result],
      tokenUsage,
    };
  }

  const toolNode = new ToolNode(tools);

  const shouldContinue = (state) => {
    const lastMessage = state.messages.at(-1);
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

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.details._id;
    const agents = await Agent.find({});
    const tools = await loadAllTools(agents);
    if (tools.length === 0) return res.json({ response: "No tools found." });

    const graph = await createGraphWithTools(tools);

    const history = []; // to log workflow steps
    let totalTokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    // Wrap the graph.invoke manually to log steps
    const result = await graph.invoke({
      messages: [{ role: "user", content: message }],
    });

    for (const msg of result.messages) {
      if (msg.role === "tool") {
        toolsUsed.push(msg.name);
        history.push({
          stepName: msg.name || "Tool Step",
          input: msg.input || "",
          output: msg.content || "",
          toolUsed: [msg.name],
          tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, // tools usually don't consume tokens
        });
      } else if (msg.role === "assistant" || msg instanceof AIMessage) {
        const usage = msg.response_metadata?.tokenUsage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };

        totalTokenUsage.promptTokens += usage.promptTokens;
        totalTokenUsage.completionTokens += usage.completionTokens;
        totalTokenUsage.totalTokens += usage.totalTokens;

        const toolCalls = msg.tool_calls?.map((call) => call.name) || [];

        history.push({
          stepName: "LLM Call",
          input: message,
          output: msg.content,
          toolUsed: toolCalls,
          tokenUsage: usage,
        });
      }
    }

    const finalAnswer = result.messages.find(
      (msg) => msg instanceof AIMessage && msg.content?.trim()
    );

    // Save Workflow
    const workflow = new Workflow({
      user: userId,
      title: "Agent Chat", // or customize based on use-case
      steps: history,
      finalResponse: finalAnswer?.content || "",
      totalTokenUsage,
    });

    await workflow.save();
    // console.log("Saved Workflow:", savedWorkflow);

    const usedToolNames = history.map((call) => call.toolUsed) || [];

    let content = finalAnswer?.content || "No response generated.";

    // If no tools were used, add disclaimer
    if (usedToolNames.length === 0) {
      content += `\n\nNote: This response was not based on any specific agent or tool.`;
    }

    res.json({ response: content || "No response generated." });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
