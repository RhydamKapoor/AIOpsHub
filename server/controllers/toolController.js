const { ChatGroq } = require("@langchain/groq");
const vm = require("vm");
const Tool = require("../models/Tool");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { AIMessage } = require("@langchain/core/messages");
const { Client: LangSmithClient } = require("langsmith");
const {
  MessagesAnnotation,
  StateGraph,
} = require("@langchain/langgraph");
const path = require("path");
const fs = require("fs");
const { encrypt, decrypt } = require("../utils/encryption");
const Agent = require("../models/Agent");
const Workflow = require("../models/AllStats");
const { runAgentWithTools } = require("../utils/agentRunner");
const { getUserIdFromRequest } = require("../utils/resolveUserId");
// const { StringOutputParser } = require("@langchain/core/output_parsers");
// const { PromptTemplate } = require("@langchain/core/prompts");
// const { RunnableSequence } = require("@langchain/core/runnables");
// const { convertToOpenAIFunction } = require("langchain/tools");
// const { DynamicTool } = require("langchain/tools");
// const { VM } = require("vm2");

// Initialize LangSmith client if API key is available
let langsmithClient = null;
if (process.env.LANGCHAIN_API_KEY) {
  langsmithClient = new LangSmithClient({
    apiKey: process.env.LANGCHAIN_API_KEY,
    apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
  });
}

// Initialize the Groq LLM
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile", // Specify the desired Groq model
  temperature: 0,
});

// Helper function to get a Groq model instance

// Get all tools
exports.getAllTools = async (req, res) => {
  try {
    const tools = await Tool.find();
    res.status(200).json(tools);
  } catch (error) {
    console.error("Error fetching tools:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch tools", error: error.message });
  }
};

// Create a new tool
exports.createTool = async (req, res) => {
  try {
    const { title, description, fileName, fileType, code, env } = req.body;

    if (!title || !description || !fileName || !fileType || !code) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate file type
    if (fileType !== "javascript" && fileType !== "python") {
      return res
        .status(400)
        .json({ message: "File type must be javascript or python" });
    }

    let envArray = [];
    if (env) {
      envArray = await Promise.all(
        env.map(async ({ key, value }) => {
          return { key, value: encrypt(value) };
        })
      );
    }

    const toolsDir = path.join(__dirname, "dynamicTools");
    const setFileName = `tool_${fileName}`; // unique name
    const filePath = path.join(toolsDir, setFileName);

    // 2️⃣ Ensure the directory exists
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir, { recursive: true });
    }

    // 3️⃣ Write code to the new file
    fs.writeFileSync(filePath, code, "utf-8");

    const tool = new Tool({
      title,
      description,
      fileName,
      fileType,
      env: envArray,
    });

    await tool.save();
    res.status(201).json({ message: "Tool created successfully", tool });
  } catch (error) {
    console.error("Error creating tool:", error);
    res
      .status(500)
      .json({ message: "Failed to create tool", error: error.message });
  }
};

// Get a single tool
exports.getTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    res.status(200).json(tool);
  } catch (error) {
    console.error("Error fetching tool:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch tool", error: error.message });
  }
};

// Delete a tool
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }
    const toolsDir = path.join(__dirname, "dynamicTools");
    const fileToDelete = `tool_${tool.fileName}`;
    const filePath = path.join(toolsDir, fileToDelete);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      // console.log(`File ${fileToDelete} deleted successfully.`);
    } else {
      console.log(`File ${fileToDelete} does not exist.`);
    }

    res.status(200).json({ message: "Tool deleted successfully" });
  } catch (error) {
    console.error("Error deleting tool:", error);
    res
      .status(500)
      .json({ message: "Failed to delete tool", error: error.message });
  }
};

// Execute JavaScript code safely in a sandbox
const executeJsCode = async (userId, input, tool) => {
  try {
    let envObject = {};
    if (tool.env) {
      const entries = await Promise.all(
        tool.env.map(async ({ key, value }) => {
          return [key, decrypt(value)];
        })
      );
      envObject = Object.fromEntries(entries);
    }

    const toolsDir = path.join(__dirname, "dynamicTools");
    const setFileName = `tool_${tool.fileName}`; // unique name
    const filePath = path.join(toolsDir, setFileName);
    const code = fs.readFileSync(filePath, "utf8");

    const context = {
      axios: require("axios"),
      z: require("zod"),
      tool: require("@langchain/core/tools").tool,
      env: envObject,
      global: {},
    };

    vm.createContext(context); // Contextify the object
    const script = new vm.Script(code);
    script.runInContext(context);

    const tools = [context.global.toolNode];
    const llmWithTools = model.bindTools(tools);

    async function llmCall(state) {
      // LLM decides whether to call a tool or not
      const result = await llmWithTools.invoke([
        {
          role: "system",
          content: `You are a helpful assistant named Opal. Your task is to answer the user's query accurately using the provided tools.
            - Analyze the query to determine if any tools are required to answer it, if the query is not related to the tools, then just tell user that you can give answers only to tool provided queries.
            - Use the tool which you have been provided.
            - If the query is resolved, provide a concise final answer in plain text without further tool calls.
            - Do not call tools unnecessarily or repeat tool calls for the same step.
          `,
        },
        ...state.messages,
      ]);

      // Extract tokenUsage from response_metadata if available
      const tokenUsage = result.response_metadata?.tokenUsage || {
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0,
      };

      return {
        messages: [result],
        tokenUsage: tokenUsage,
      };
    }

    const toolNode = new ToolNode(tools);

    // Conditional edge function to route to the tool node or end
    function shouldContinue(state) {
      const messages = state.messages;
      const lastMessage = messages.at(-1);

      // If the LLM makes a tool call, then perform an action
      if (lastMessage?.tool_calls?.length) {
        return "Action";
      }
      // Otherwise, we stop (reply to the user)
      return "__end__";
    }

    // Build workflow
    const agentBuilder = new StateGraph(MessagesAnnotation)
      .addNode("llmCall", llmCall)
      .addNode("tools", toolNode)
      // Add edges to connect nodes
      .addEdge("__start__", "llmCall")
      .addConditionalEdges("llmCall", shouldContinue, {
        // Name returned by shouldContinue : Name of next node to visit
        Action: "tools",
        __end__: "__end__",
      })
      .addEdge("tools", "llmCall")
      .compile();

    function getFinalAnswer(messages) {
      let finalMessageWithContent = null;

      for (const msg of messages) {
        if (msg instanceof AIMessage) {
          if (msg.content?.trim()) {
            finalMessageWithContent = msg;
          }
        }
      }

      return finalMessageWithContent
        ? {
            content: finalMessageWithContent.content,
          }
        : null;
    }

    const messages = [
      {
        role: "user",
        content: input,
      },
    ];
    const result = await agentBuilder.invoke({ messages });
    const finalAnswer = getFinalAnswer(result.messages);
    return finalAnswer.content;
  } catch (error) {
    console.error("Error executing tool:", error);
    return `Error: ${error.message}`;
  }
};

// Test a tool
exports.testTool = async (req, res) => {
  try {
    const { id } = req.params;
    const { input } = req.body;

    const tool = await Tool.findById(id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    let result;

    // Execute the tool code based on file type
    if (tool.fileType === "javascript") {
      result = await executeJsCode(req.user.details._id, input, tool);
    } else {
      // We would need a Python execution environment like pyodide for browser
      // or a Python subprocess on the server for real implementation
      result = `Mock execution of Python tool "${tool.title}" with input: ${input}`;
    }

    res.status(200).json({ result: String(result) });
  } catch (error) {
    console.error("Error testing tool:", error);
    res
      .status(500)
      .json({ message: "Failed to test tool", error: error.message });
  }
};

function validateAgentPayload(body) {
  const {
    agentName,
    agentDescription,
    userQuery,
    llm,
    nodes,
    edges,
  } = body;
  if (
    !agentName?.trim() ||
    !agentDescription?.trim() ||
    !userQuery?.trim() ||
    !llm ||
    !nodes?.length ||
    !edges?.length
  ) {
    return "Agent name, description, prompt, LLM, and workflow graph are required";
  }
  return null;
}

async function executeAgentRun({
  agentName,
  agentDescription,
  userQuery,
  llm,
  selectedTools,
  userId,
  workflowTitle,
}) {
  const systemPrompt = `You are the agent "${agentName}". ${agentDescription}`;
  const runResult = await runAgentWithTools({
    tools: selectedTools || [],
    llm,
    userMessage: userQuery,
    systemPrompt,
  });

  if (!runResult.finalResponse) {
    throw new Error("Agent did not produce a response");
  }

  const workflow = new Workflow({
    user: userId,
    title: workflowTitle || `Agent: ${agentName}`,
    steps: runResult.history,
    finalResponse: runResult.finalResponse,
    totalTokenUsage: runResult.totalTokenUsage,
  });
  await workflow.save();

  return runResult;
}

exports.createAgent = async (req, res) => {
  try {
    const {
      agentName,
      agentDescription,
      userQuery,
      llm,
      selectedTools,
      output,
      nodes,
      edges,
    } = req.body;

    const validationError = validateAgentPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const isAgentExists = await Agent.findOne({ name: agentName.trim() });
    if (isAgentExists) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const agent = new Agent({
      name: agentName.trim(),
      description: agentDescription.trim(),
      tools: selectedTools || [],
      llm,
      view: {
        nodes,
        edges,
        userQuery,
        output: output || "",
      },
    });

    await agent.save();
    res.status(201).json({ message: "Agent created successfully", agent });
  } catch (error) {
    console.error("Error creating agent:", error);
    res
      .status(500)
      .json({ message: "Failed to create agent", error: error.message });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch agents", error: error.message });
  }
};

exports.getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch agent", error: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agentName,
      agentDescription,
      userQuery,
      llm,
      selectedTools,
      output,
      nodes,
      edges,
    } = req.body;

    const validationError = validateAgentPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const duplicate = await Agent.findOne({
      name: agentName.trim(),
      _id: { $ne: id },
    });
    if (duplicate) {
      return res.status(400).json({ message: "Another agent uses this name" });
    }

    agent.name = agentName.trim();
    agent.description = agentDescription.trim();
    agent.tools = selectedTools || [];
    agent.llm = llm;
    agent.view = { nodes, edges, userQuery, output: output || "" };

    await agent.save();
    res.status(200).json({ message: "Agent updated successfully", agent });
  } catch (error) {
    console.error("Error updating agent:", error);
    res
      .status(500)
      .json({ message: "Failed to update agent", error: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res
      .status(500)
      .json({ message: "Failed to delete agent", error: error.message });
  }
};

exports.runAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const userQuery = req.body.input?.trim() || agent.view?.userQuery;
    if (!userQuery) {
      return res.status(400).json({ message: "Prompt is required to run agent" });
    }

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid user session" });
    }
    const runResult = await executeAgentRun({
      agentName: agent.name,
      agentDescription: agent.description,
      userQuery,
      llm: agent.llm,
      selectedTools: agent.tools,
      userId,
      workflowTitle: `Agent: ${agent.name}`,
    });

    agent.view = {
      ...agent.view,
      userQuery,
      output: runResult.finalResponse,
    };
    await agent.save();

    res.status(200).json({
      result: runResult.finalResponse,
      toolsLoaded: runResult.toolsLoaded,
      tokenUsage: runResult.totalTokenUsage,
    });
  } catch (error) {
    console.error("Error running agent:", error);
    res.status(500).json({ message: error.message || "Failed to run agent" });
  }
};

exports.runAgentPreview = async (req, res) => {
  try {
    const {
      agentName,
      agentDescription,
      userQuery,
      llm,
      selectedTools,
    } = req.body;

    if (!agentName?.trim() || !agentDescription?.trim() || !userQuery?.trim() || !llm) {
      return res.status(400).json({
        message: "Agent name, description, prompt, and LLM are required to run",
      });
    }

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid user session" });
    }
    const runResult = await executeAgentRun({
      agentName: agentName.trim(),
      agentDescription: agentDescription.trim(),
      userQuery: userQuery.trim(),
      llm,
      selectedTools: selectedTools || [],
      userId,
      workflowTitle: `Preview: ${agentName.trim()}`,
    });

    res.status(200).json({
      result: runResult.finalResponse,
      toolsLoaded: runResult.toolsLoaded,
      tokenUsage: runResult.totalTokenUsage,
    });
  } catch (error) {
    console.error("Error running agent preview:", error);
    res.status(500).json({ message: error.message || "Failed to run agent" });
  }
};
