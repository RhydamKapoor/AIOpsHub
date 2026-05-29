const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const Tool = require("./models/Tool");
const Agent = require("./models/Agent");

const LAYOUT = {
  CENTER_X: 330,
  NODE_WIDTH: 200,
  H_SPACING: 260,
  V_STEP: 130,
  TOOLS_PER_ROW: 3,
  TOOL_ROW_HEIGHT: 120,
  INPUT_Y: 24,
};
const TOOLS_DIR = path.join(__dirname, "controllers/dynamicTools");

function nodeX() {
  return LAYOUT.CENTER_X - LAYOUT.NODE_WIDTH / 2;
}

function getToolsBlockHeight(toolCount) {
  if (toolCount === 0) return 0;
  const rows = Math.ceil(toolCount / LAYOUT.TOOLS_PER_ROW);
  return rows * LAYOUT.TOOL_ROW_HEIGHT + 40;
}

const ARITHMETIC_TOOLS = [
  {
    title: "Addition",
    fileName: "addition.js",
    description: "Adds two numbers (a + b)",
  },
  {
    title: "Subtraction",
    fileName: "subtraction.js",
    description: "Subtracts b from a (a - b)",
  },
  {
    title: "Multiplication",
    fileName: "multiplication.js",
    description: "Multiplies two numbers (a × b)",
  },
  {
    title: "Division",
    fileName: "division.js",
    description: "Divides a by b (a ÷ b)",
  },
];

function buildAgentView(selectedTools, userQuery, output) {
  const llmY = LAYOUT.INPUT_Y + LAYOUT.V_STEP;
  const toolsBaseY = llmY + LAYOUT.V_STEP;
  const outputY = toolsBaseY + getToolsBlockHeight(selectedTools.length);

  const coreNodes = [
    {
      id: "input",
      type: "inputNode",
      position: { x: nodeX(), y: LAYOUT.INPUT_Y },
      data: { label: "User Query", preview: userQuery },
    },
    {
      id: "llm",
      type: "langchainNode",
      position: { x: nodeX(), y: llmY },
      data: { label: "LLM", llmLabel: "Groq - Llama 3.3" },
    },
    {
      id: "output",
      type: "outputNode",
      position: { x: nodeX(), y: outputY },
      data: { label: "Response", preview: output },
    },
  ];

  const toolNodes = selectedTools.map((tool, index) => {
    const row = Math.floor(index / LAYOUT.TOOLS_PER_ROW);
    const col = index % LAYOUT.TOOLS_PER_ROW;
    const colsInRow = Math.min(
      LAYOUT.TOOLS_PER_ROW,
      selectedTools.length - row * LAYOUT.TOOLS_PER_ROW
    );
    const colOffset = (col - (colsInRow - 1) / 2) * LAYOUT.H_SPACING;

    return {
      id: `tool-${tool.id}`,
      type: "toolNode",
      position: {
        x: LAYOUT.CENTER_X + colOffset - LAYOUT.NODE_WIDTH / 2,
        y: toolsBaseY + row * LAYOUT.TOOL_ROW_HEIGHT,
      },
      data: {
        label: tool.title,
        description: tool.description,
        toolId: tool.id,
        fileName: tool.fileName,
      },
    };
  });

  const nodes = [...coreNodes, ...toolNodes];

  const edges = [
    {
      id: "e-input-llm",
      source: "input",
      target: "llm",
      type: "simplebezier",
      animated: true,
    },
  ];

  toolNodes.forEach((node) => {
    edges.push(
      { id: `e-llm-${node.id}`, source: "llm", target: node.id, type: "simplebezier", animated: true },
      { id: `e-${node.id}-output`, source: node.id, target: "output", type: "simplebezier", animated: true }
    );
  });

  return { nodes, edges, userQuery, output };
}

async function ensureToolOnDisk(fileName) {
  const diskName = `tool_${fileName}`;
  const filePath = path.join(TOOLS_DIR, diskName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing tool file: ${diskName}`);
  }
}

async function seedArithmetic() {
  await connectDB();

  const savedTools = [];

  for (const def of ARITHMETIC_TOOLS) {
    await ensureToolOnDisk(def.fileName);

    let tool = await Tool.findOne({ fileName: def.fileName });
    if (!tool) {
      tool = await Tool.create({
        title: def.title,
        description: def.description,
        fileType: "javascript",
        fileName: def.fileName,
        env: [],
      });
      console.log(`✅ Created tool: ${def.title}`);
    } else {
      tool.title = def.title;
      tool.description = def.description;
      await tool.save();
      console.log(`ℹ️  Tool already exists: ${def.title}`);
    }

    savedTools.push({
      id: tool._id.toString(),
      title: tool.title,
      fileName: tool.fileName,
      description: tool.description,
      env: tool.env || [],
    });
  }

  const userQuery = "What is 48 divided by 6, then add 5 to the result?";
  const output = "The quotient of 48 divided by 6 is 8. The sum of 8 and 5 is 13.";

  const view = buildAgentView(savedTools, userQuery, output);

  const agentPayload = {
    name: "Arithmetic",
    description:
      "An arithmetic agent that solves math problems using addition, subtraction, multiplication, and division tools. Always use the correct tool for each operation.",
    tools: savedTools,
    llm: "groq",
    view,
  };

  let agent = await Agent.findOne({ name: "Arithmetic" });
  if (!agent) {
    agent = await Agent.create(agentPayload);
    console.log("✅ Created agent: Arithmetic");
  } else {
    agent.description = agentPayload.description;
    agent.tools = agentPayload.tools;
    agent.llm = agentPayload.llm;
    agent.view = agentPayload.view;
    await agent.save();
    console.log("ℹ️  Updated agent: Arithmetic");
  }

  console.log("\nArithmetic agent is ready with 4 tools:");
  savedTools.forEach((t) => console.log(`  - ${t.title} (${t.fileName})`));
  process.exit(0);
}

seedArithmetic().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
