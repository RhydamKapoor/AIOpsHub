const Agent = require("../models/Agent");
const Tool = require("../models/Tool");

const MAX_CHAT_HISTORY = 20;

function dedupeToolsByFileName(toolDefs = []) {
  const seen = new Set();
  return toolDefs.filter((tool) => {
    const key = tool.fileName || tool.id?.toString() || tool.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanitizeChatHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (entry) =>
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim()
    )
    .slice(-MAX_CHAT_HISTORY)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim(),
    }));
}

function messageLikelyNeedsTools(message) {
  const text = message.trim().toLowerCase();

  const conversational =
    /^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye)\b|how many (agents|tools)|what agents|what tools|list (agents|tools)|who are you|what was my (last|previous)|previous question|last question|tell me about (the )?agents?|workspace|remember (what|when|my)/i;
  if (conversational.test(text)) return false;

  const toolSignals =
    /\bweather\b|\btemperature\b|\bforecast\b|\bcalculate\b|\bcompute\b|\d+\s*[\+\-\*\/×÷]\s*\d+|(\d+.*(plus|minus|times|multiplied|divide|divided|add|subtract|multiply))|(what is|what's)\s+\d+/i;
  return toolSignals.test(text);
}

function buildWorkspaceContextBlock({ agents, allTools, activeTools = [] }) {
  const agentNames = agents.map((a) => a.name);
  const toolNames = allTools.map((t) => t.title);
  const activeToolNames = activeTools.map((t) => t.title);

  const agentDetails = agents.length
    ? agents
        .map((agent) => {
          const assigned =
            (agent.tools || []).map((t) => t.title).join(", ") || "none";
          return `- ${agent.name}: ${agent.description} (assigned tools: ${assigned})`;
        })
        .join("\n")
    : "No agents configured yet.";

  const toolInstruction =
    activeTools.length > 0
      ? "- Use tools silently when needed for calculations or external data; never tell the user whether you used a tool."
      : "- For this message, answer directly from WORKSPACE FACTS and conversation history. Do not call any tools.";

  return `
WORKSPACE FACTS (use these exact numbers when asked about agents or tools — never guess):
- Total agents: ${agents.length}
- Agent names: ${agentNames.length ? agentNames.join(", ") : "none"}
- Total tools in Tool Manager: ${allTools.length}
- Tool Manager tool names: ${toolNames.length ? toolNames.join(", ") : "none"}
- Tools available for this message: ${activeTools.length}
${activeToolNames.length ? `- Available tool names: ${activeToolNames.join(", ")}` : ""}

Agent details:
${agentDetails}

Instructions:
- When asked how many agents or tools exist, answer using WORKSPACE FACTS above.
- Use conversation history for follow-up questions (e.g. "what was my last question?").
${toolInstruction}
- Do not mention workspace facts, Tool Manager, or other internal/technical details unless the user explicitly asks about agents or tools.`.trim();
}

async function getWorkspaceContext() {
  const [agents, allTools] = await Promise.all([
    Agent.find({}).sort({ createdAt: -1 }),
    Tool.find({}).sort({ createdAt: -1 }),
  ]);

  const agentToolDefs = dedupeToolsByFileName(
    agents.flatMap((agent) => agent.tools || [])
  );

  return {
    agents,
    allTools,
    chatTools: agentToolDefs,
    contextBlock: buildWorkspaceContextBlock({
      agents,
      allTools,
      activeTools: agentToolDefs,
    }),
  };
}

function buildContextForMessage(workspace, activeTools) {
  return buildWorkspaceContextBlock({
    agents: workspace.agents,
    allTools: workspace.allTools,
    activeTools,
  });
}

module.exports = {
  MAX_CHAT_HISTORY,
  dedupeToolsByFileName,
  sanitizeChatHistory,
  messageLikelyNeedsTools,
  buildWorkspaceContextBlock,
  buildContextForMessage,
  getWorkspaceContext,
};
