const Agent = require("../models/Agent");
const Workflow = require("../models/AllStats");
const { runAgentWithTools } = require("../utils/agentRunner");
const { getUserIdFromRequest } = require("../utils/resolveUserId");
const {
  dedupeToolsByFileName,
  getWorkspaceContext,
  sanitizeChatHistory,
  messageLikelyNeedsTools,
  buildContextForMessage,
} = require("../utils/chatContext");

exports.chat = async (req, res) => {
  try {
    const { message, agentId, history } = req.body;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const workspace = await getWorkspaceContext();
    let tools = [];
    let llm = "groq";
    let maxToolRounds = 3;
    let recursionLimit = 12;
    let basePrompt =
      "You are Opal, a smart AI assistant for the AIOpsHub workspace.";

    if (agentId) {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      tools = dedupeToolsByFileName(agent.tools || []);
      llm = agent.llm || "groq";
      maxToolRounds = 5;
      recursionLimit = 20;
      basePrompt = `You are Opal running as the agent "${agent.name}". ${agent.description}`;
    } else if (messageLikelyNeedsTools(message)) {
      tools = workspace.chatTools;
    }

    const systemPrompt = `${basePrompt}\n\n${buildContextForMessage(workspace, tools)}`;
    const priorMessages = sanitizeChatHistory(history);
    const chatMessages = [
      ...priorMessages,
      { role: "user", content: message.trim() },
    ];

    const runResult = await runAgentWithTools({
      tools,
      llm,
      messages: chatMessages,
      userMessage: message.trim(),
      systemPrompt,
      maxToolRounds,
      recursionLimit,
      fallbackWithoutTools: true,
    });

    if (!runResult.finalResponse) {
      return res.json({
        response: "I'm having trouble right now. Please try again in a moment.",
      });
    }

    const steps =
      runResult.history?.length > 0
        ? runResult.history
        : [
            {
              stepName: "User Message",
              input: message.trim(),
              output: "",
              toolUsed: [],
              tokenUsage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
              },
            },
            {
              stepName: "Assistant Reply",
              input: message.trim(),
              output: runResult.finalResponse,
              toolUsed: [],
              tokenUsage: runResult.totalTokenUsage || {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
              },
            },
          ];

    const shortPrompt =
      message.trim().length > 72
        ? `${message.trim().slice(0, 72)}…`
        : message.trim();

    const workflow = new Workflow({
      user: userId,
      title: agentId ? `Chat: ${shortPrompt}` : `Chat: ${shortPrompt}`,
      steps,
      finalResponse: runResult.finalResponse,
      totalTokenUsage: runResult.totalTokenUsage,
    });
    await workflow.save();

    res.json({
      response: runResult.finalResponse,
      workspace: {
        agentCount: workspace.agents.length,
        toolCount: workspace.allTools.length,
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
};
