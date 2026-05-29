import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Play,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CollapsiblePanel,
  accordionChevronClass,
} from "@/components/ui/CollapsiblePanel";

const LLM_OPTIONS = [
  { value: "groq", label: "Groq - Llama 3.3", supported: true },
  { value: "openai", label: "OpenAI - GPT-4", supported: false },
  { value: "claude", label: "Claude - 3.5 Sonnet", supported: false },
];

/** Layout constants — positions are top-left; CENTER_X is the flow horizontal center */
const LAYOUT = {
  CENTER_X: 330,
  NODE_WIDTH: 200,
  H_SPACING: 260,
  V_STEP: 130,
  TOOLS_PER_ROW: 3,
  TOOL_ROW_HEIGHT: 120,
  INPUT_Y: 24,
};

function nodeX(centerX = LAYOUT.CENTER_X) {
  return centerX - LAYOUT.NODE_WIDTH / 2;
}

const baseNodes = () => [
  {
    id: "input",
    type: "inputNode",
    position: { x: nodeX(), y: LAYOUT.INPUT_Y },
    data: { label: "User Query", preview: "" },
  },
  {
    id: "llm",
    type: "langchainNode",
    position: { x: nodeX(), y: LAYOUT.INPUT_Y + LAYOUT.V_STEP },
    data: { label: "LLM", llmLabel: "Select LLM" },
  },
  {
    id: "output",
    type: "outputNode",
    position: { x: nodeX(), y: LAYOUT.INPUT_Y + LAYOUT.V_STEP * 2 },
    data: { label: "Response", preview: "" },
  },
];

function InputNode({ data }) {
  return (
    <div className="p-3 border-2 rounded-md w-[200px] bg-base-300/40 relative">
      <Handle type="source" position={Position.Bottom} />
      <div className="font-bold">{data.label}</div>
      <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
        {data.preview || "Enter a prompt on the left"}
      </div>
    </div>
  );
}

function LangChainNode({ data }) {
  return (
    <div className="p-3 bg-blue-100 border-2 border-blue-500 rounded-md w-[200px] relative">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="font-bold">{data.label}</div>
      <div className="text-xs capitalize">{data.llmLabel}</div>
    </div>
  );
}

function ToolNode({ data }) {
  return (
    <div className="p-3 bg-green-100 border-2 border-green-500 rounded-md w-[200px] relative">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="font-bold">{data.label}</div>
      <div className="text-xs line-clamp-2">
        {data.description || "Custom tool"}
      </div>
    </div>
  );
}

function OutputNode({ data }) {
  return (
    <div className="p-3 bg-purple-100 border-2 border-purple-500 rounded-md w-[200px] relative">
      <Handle type="target" position={Position.Top} />
      <div className="font-bold">{data.label}</div>
      <div className="text-xs mt-1 line-clamp-3">
        {data.preview || "Run agent to see output"}
      </div>
    </div>
  );
}

const nodeTypes = {
  langchainNode: LangChainNode,
  toolNode: ToolNode,
  inputNode: InputNode,
  outputNode: OutputNode,
};

function llmShortLabel(llm) {
  return LLM_OPTIONS.find((o) => o.value === llm)?.label?.split(" - ")[0] || llm || "—";
}

function AgentSidebarCard({ agent, isActive, onSelect, onDelete }) {
  const toolCount = agent.tools?.length ?? 0;

  return (
    <article
      className={cn(
        "group relative rounded-xl border p-3.5 transition-all cursor-pointer",
        "bg-base-100/60 border-base-content/10",
        "hover:border-primary/40 hover:shadow-md",
        isActive &&
          "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isActive
              ? "bg-primary text-primary-content"
              : "bg-base-300 text-base-content/70"
          )}
        >
          <Bot className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-semibold text-[15px] leading-tight truncate pr-6">
            {agent.name}
          </h3>
          <p className="text-xs text-base-content/55 line-clamp-2 leading-relaxed">
            {agent.description || "No description"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-base-300/80 px-2 py-0.5 text-[11px] font-medium">
              <Wrench className="h-3 w-3 opacity-70" />
              {toolCount} {toolCount === 1 ? "tool" : "tools"}
            </span>
            <span className="inline-flex rounded-md bg-[var(--color-secondary)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--color-secondary)]">
              {llmShortLabel(agent.llm)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        title="Delete agent"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        className={cn(
          "absolute top-3 right-3 rounded-lg p-1.5",
          "text-base-content/40 opacity-0 transition-opacity",
          "hover:bg-error/15 hover:text-error",
          "group-hover:opacity-100 focus:opacity-100",
          isActive && "opacity-70"
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </article>
  );
}

function layoutToolNodes(toolNodes, toolsBaseY) {
  const count = toolNodes.length;
  if (count === 0) return toolNodes;

  const { CENTER_X, NODE_WIDTH, H_SPACING, TOOLS_PER_ROW, TOOL_ROW_HEIGHT } =
    LAYOUT;

  return toolNodes.map((node, index) => {
    const row = Math.floor(index / TOOLS_PER_ROW);
    const col = index % TOOLS_PER_ROW;
    const colsInRow = Math.min(TOOLS_PER_ROW, count - row * TOOLS_PER_ROW);
    const colOffset = (col - (colsInRow - 1) / 2) * H_SPACING;

    return {
      ...node,
      position: {
        x: CENTER_X + colOffset - NODE_WIDTH / 2,
        y: toolsBaseY + row * TOOL_ROW_HEIGHT,
      },
    };
  });
}

function getToolsBlockHeight(toolCount) {
  if (toolCount === 0) return 0;
  const rows = Math.ceil(toolCount / LAYOUT.TOOLS_PER_ROW);
  return rows * LAYOUT.TOOL_ROW_HEIGHT + 40;
}

function buildEdges(toolNodeIds) {
  const mainEdges = [
    {
      id: "e-input-llm",
      source: "input",
      target: "llm",
      type: "simplebezier",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2.5, stroke: "#8B5CF6" },
    },
  ];

  if (!toolNodeIds.length) {
    mainEdges.push({
      id: "e-llm-output",
      source: "llm",
      target: "output",
      type: "simplebezier",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2.5, stroke: "#8B5CF6" },
    });
    return mainEdges;
  }

  toolNodeIds.forEach((toolId) => {
    mainEdges.push(
      {
        id: `e-llm-${toolId}`,
        source: "llm",
        target: toolId,
        type: "simplebezier",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: "#2563EB" },
      },
      {
        id: `e-${toolId}-output`,
        source: toolId,
        target: "output",
        type: "simplebezier",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: "#059669" },
      }
    );
  });

  return mainEdges;
}

function buildCanvasNodes(selectedTools, previews, llmLabel) {
  const hasTools = selectedTools.length > 0;
  const llmY = LAYOUT.INPUT_Y + LAYOUT.V_STEP;
  const toolsBaseY = llmY + LAYOUT.V_STEP;
  const outputY = hasTools
    ? toolsBaseY + getToolsBlockHeight(selectedTools.length)
    : llmY + LAYOUT.V_STEP;

  const core = baseNodes().map((node) => {
    if (node.id === "input") {
      return { ...node, data: { ...node.data, preview: previews.userQuery } };
    }
    if (node.id === "llm") {
      return { ...node, data: { ...node.data, llmLabel } };
    }
    if (node.id === "output") {
      return {
        ...node,
        data: { ...node.data, preview: previews.output },
        position: { x: nodeX(), y: outputY },
      };
    }
    return node;
  });

  const toolNodes = selectedTools.map((tool) => ({
    id: `tool-${tool.id}`,
    type: "toolNode",
    position: { x: nodeX(), y: toolsBaseY },
    data: {
      label: tool.title,
      description: tool.description,
      toolId: tool.id,
      fileName: tool.fileName,
    },
  }));

  return [...core, ...layoutToolNodes(toolNodes, toolsBaseY)];
}

export default function AgentBuilder() {
  const { register, handleSubmit, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      agentName: "",
      agentDescription: "",
      userQuery: "",
      llm: "groq",
      output: "",
      selectedTools: [],
    },
  });

  const [open, setOpen] = useState(false);
  const [agentsPanelOpen, setAgentsPanelOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(baseNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowRef = useRef(null);

  const selectedTools = watch("selectedTools") || [];
  const userQuery = watch("userQuery");
  const output = watch("output");
  const llm = watch("llm");

  const llmLabel =
    LLM_OPTIONS.find((o) => o.value === llm)?.label || "Select LLM";

  const syncCanvas = useCallback(
    (nextSelectedTools, previews) => {
      const canvasNodes = buildCanvasNodes(nextSelectedTools, previews, llmLabel);
      const toolIds = canvasNodes
        .filter((n) => n.id.startsWith("tool-"))
        .map((n) => n.id);
      setNodes(canvasNodes);
      setEdges(buildEdges(toolIds));
    },
    [llmLabel, setNodes, setEdges]
  );

  useEffect(() => {
    syncCanvas(selectedTools, { userQuery, output });
  }, [userQuery, output, llmLabel, selectedTools, syncCanvas]);

  const fetchTools = async () => {
    try {
      const response = await axiosInstance.get("/tools");
      setTools(response.data);
    } catch {
      toast.error("Failed to fetch tools");
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axiosInstance.get("/agents");
      setAgents(response.data);
    } catch {
      toast.error("Failed to fetch agents");
    }
  };

  useEffect(() => {
    fetchTools();
    fetchAgents();
  }, []);

  const resetBuilder = () => {
    setEditingId(null);
    reset({
      agentName: "",
      agentDescription: "",
      userQuery: "",
      llm: "groq",
      output: "",
      selectedTools: [],
    });
    syncCanvas([], { userQuery: "", output: "" });
  };

  const loadAgent = (agent) => {
    setEditingId(agent._id);
    const selected = (agent.tools || []).map((t) => ({
      id: t.id || t._id,
      title: t.title,
      fileName: t.fileName,
      env: t.env,
      description: t.description,
    }));

    reset({
      agentName: agent.name,
      agentDescription: agent.description,
      userQuery: agent.view?.userQuery || "",
      llm: agent.llm || "groq",
      output: agent.view?.output || "",
      selectedTools: selected,
    });

    // Always re-layout from tools so spacing stays consistent
    syncCanvas(selected, {
      userQuery: agent.view?.userQuery || "",
      output: agent.view?.output || "",
    });
  };

  const toggleOption = (option) => {
    const current = getValues("selectedTools") || [];
    const exists = current.find((t) => t.id === option._id);

    if (exists) {
      const updated = current.filter((t) => t.id !== option._id);
      setValue("selectedTools", updated);
      return;
    }

    setValue("selectedTools", [
      ...current,
      {
        id: option._id,
        title: option.title,
        fileName: option.fileName,
        env: option.env,
        description: option.description,
      },
    ]);
  };

  const saveAgent = async (data) => {
    const selectedLlm = LLM_OPTIONS.find((o) => o.value === data.llm);
    if (!selectedLlm?.supported) {
      toast.error("Only Groq is configured on the server right now");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(editingId ? "Updating agent..." : "Building agent...");
    const payload = {
      ...data,
      nodes,
      edges,
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/agents/${editingId}`, payload);
        toast.success("Agent updated", { id: toastId });
      } else {
        const res = await axiosInstance.post("/agents", payload);
        setEditingId(res.data.agent._id);
        toast.success("Agent built successfully", { id: toastId });
      }
      await fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save agent", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async () => {
    const data = getValues();
    if (!data.userQuery?.trim()) {
      toast.error("Enter a prompt before running");
      return;
    }

    const selectedLlm = LLM_OPTIONS.find((o) => o.value === data.llm);
    if (!selectedLlm?.supported) {
      toast.error("Only Groq is configured on the server right now");
      return;
    }

    setRunning(true);
    const toastId = toast.loading("Running agent...");

    try {
      let response;
      if (editingId) {
        response = await axiosInstance.post(`/agents/${editingId}/run`, {
          input: data.userQuery,
        });
      } else {
        response = await axiosInstance.post("/agents/run", data);
      }

      const result = response.data.result;
      setValue("output", result);
      syncCanvas(data.selectedTools || [], {
        userQuery: data.userQuery,
        output: result,
      });
      toast.success("Agent run complete", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to run agent", {
        id: toastId,
      });
    } finally {
      setRunning(false);
    }
  };

  const deleteAgent = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this agent?")) return;

    try {
      await axiosInstance.delete(`/agents/${id}`);
      toast.success("Agent deleted");
      if (editingId === id) resetBuilder();
      await fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete agent");
    }
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      ),
    [setEdges]
  );

  useEffect(() => {
    const timeouts = [100, 400, 800].map((delay) =>
      setTimeout(() => {
        reactFlowRef.current?.fitView?.({
          padding: 0.25,
          duration: 200,
          minZoom: 0.2,
          maxZoom: 1.5,
        });
      }, delay)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [nodes, edges]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-y-auto p-3 pb-6 sm:gap-4 xl:flex-row xl:overflow-hidden xl:p-3">
      {/* Form — first on mobile for quick access */}
      <section className="order-1 min-w-0 w-full shrink-0 xl:order-2 xl:w-[min(100%,420px)]">
        <form
          onSubmit={handleSubmit(saveAgent)}
          className="flex w-full flex-col gap-5 rounded-2xl border border-base-content/8 bg-base-300/40 p-4 shadow-xl sm:gap-6 sm:p-5"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-xl font-bold sm:text-2xl">Agent Builder</h1>
            <p className="text-xs text-base-content/55 sm:text-sm">
              Configure your agent, pick tools, then run or save.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="agentName" className="text-sm font-medium">
                  Agent name
                </label>
                <input
                  id="agentName"
                  {...register("agentName", { required: true })}
                  placeholder="Weather Agent"
                  className="min-h-11 w-full rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="agentDescription" className="text-sm font-medium">
                  Description
                </label>
                <input
                  id="agentDescription"
                  {...register("agentDescription", { required: true })}
                  placeholder="Gets weather for a city"
                  className="min-h-11 w-full rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="userQuery" className="text-sm font-medium">
                Prompt
              </label>
              <textarea
                id="userQuery"
                rows={2}
                {...register("userQuery", { required: true })}
                placeholder="What is the weather in Tokyo?"
                className="min-h-11 w-full resize-y rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30 sm:rows-1 sm:min-h-11"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="selectLLM" className="text-sm font-medium">
                  LLM
                </label>
                <Select value={llm} onValueChange={(value) => setValue("llm", value)}>
                  <SelectTrigger
                    id="selectLLM"
                    className="min-h-11 w-full cursor-pointer text-base"
                  >
                    <SelectValue placeholder="Select LLM" />
                  </SelectTrigger>
                  <SelectContent className="bg-base-100">
                    <SelectGroup>
                      <SelectLabel>Models</SelectLabel>
                      {LLM_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="cursor-pointer"
                        >
                          {opt.label}
                          {!opt.supported && " (soon)"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Tools</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-full justify-between text-base"
                    >
                      <span className="truncate">
                        {selectedTools.length
                          ? `${selectedTools.length} tool${selectedTools.length > 1 ? "s" : ""} selected`
                          : "Select tools"}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[min(calc(100vw-2rem),var(--radix-popover-trigger-width))] bg-base-100 p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search tools..." />
                      <CommandGroup className="max-h-48 overflow-y-auto">
                        {tools.map((option) => (
                          <CommandItem
                            key={option._id}
                            onSelect={() => toggleOption(option)}
                            className="cursor-pointer"
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                selectedTools.some((t) => t.id === option._id)
                                  ? "border-primary bg-primary text-primary-content"
                                  : "opacity-50"
                              )}
                            >
                              {selectedTools.some((t) => t.id === option._id) && (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                            {option.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedTools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTools.map((t) => (
                      <Badge key={t.id} variant="outline" className="text-xs">
                        {t.title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="output" className="text-sm font-medium">
                Output
              </label>
              <textarea
                id="output"
                rows={3}
                {...register("output")}
                readOnly
                placeholder="Run the agent to fill this field"
                className="w-full resize-none rounded-lg border bg-base-100/50 px-3 py-2.5 text-sm outline-none sm:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={runAgent}
              disabled={running || loading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-primary-content disabled:opacity-50 sm:w-auto"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Agent
            </button>
            <button
              type="submit"
              disabled={loading || running}
              className="min-h-11 w-full rounded-lg bg-neutral px-4 py-2.5 text-neutral-content disabled:opacity-50 sm:w-auto"
            >
              {loading ? (
                <Loader2 className="inline h-4 w-4 animate-spin" />
              ) : editingId ? (
                "Update Agent"
              ) : (
                "Save Agent"
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Saved agents — collapsible on mobile, sidebar on desktop */}
      <aside className="order-2 flex min-w-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-base-content/8 bg-[var(--color-base-200)]/50 shadow-lg xl:order-1 xl:w-72">
        <button
          type="button"
          onClick={() => setAgentsPanelOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left xl:hidden"
          aria-expanded={agentsPanelOpen}
        >
          <span className="flex items-center gap-2 font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            Your Agents
            {agents.length > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                {agents.length}
              </span>
            )}
          </span>
          <ChevronDown className={accordionChevronClass(agentsPanelOpen)} />
        </button>

        <CollapsiblePanel
          open={agentsPanelOpen}
          alwaysOpenFrom="xl"
          className="flex min-h-0 flex-col"
        >
        <div className="flex min-h-0 flex-col overflow-hidden">
          <header className="hidden shrink-0 border-b border-base-content/8 bg-base-100/40 px-4 pb-3 pt-4 xl:block">
            <div className="mb-1 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold tracking-tight">Your Agents</h2>
            </div>
            <p className="mb-3 pl-7 text-xs text-base-content/50">
              Select an agent to edit or run
            </p>
            <button
              type="button"
              onClick={resetBuilder}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-base-content/20 bg-base-100/80 px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              New agent
            </button>
          </header>

          <div className="border-b border-base-content/8 px-4 py-3 xl:hidden">
            <button
              type="button"
              onClick={resetBuilder}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-base-content/20 bg-base-100/80 px-3 py-2.5 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              New agent
            </button>
          </div>

          <div className="max-h-[min(280px,45vh)] min-h-0 flex-1 overflow-y-auto p-3 space-y-2.5 xl:max-h-none">
            {agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-content/15 bg-base-100/30 px-4 py-8 text-center">
                <Bot className="h-8 w-8 text-base-content/40" />
                <p className="text-sm text-base-content/55">
                  No agents yet — build one above.
                </p>
              </div>
            ) : (
              agents.map((agent) => (
                <AgentSidebarCard
                  key={agent._id}
                  agent={agent}
                  isActive={editingId === agent._id}
                  onSelect={() => {
                    loadAgent(agent);
                    setAgentsPanelOpen(false);
                  }}
                  onDelete={(e) => deleteAgent(agent._id, e)}
                />
              ))
            )}
          </div>

          {agents.length > 0 && (
            <footer className="shrink-0 border-t border-base-content/8 px-4 py-2.5 text-center text-[11px] text-base-content/45">
              {agents.length} saved {agents.length === 1 ? "agent" : "agents"}
            </footer>
          )}
        </div>
        </CollapsiblePanel>
      </aside>

      {/* React Flow */}
      <section className="order-3 min-h-[min(50vh,400px)] min-w-0 w-full flex-1 xl:order-3 xl:min-h-0">
        <div className="h-full min-h-[min(50vh,400px)] w-full rounded-2xl border border-base-content/10 bg-base-300/10 xl:min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            panOnScroll
            zoomOnScroll
            panOnDrag
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
            onInit={(instance) => {
              reactFlowRef.current = instance;
            }}
            minZoom={0.15}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
            fitView
            style={{ width: "100%", height: "100%" }}
            defaultEdgeOptions={{ type: "simplebezier" }}
          >
            <Controls position="bottom-right" />
            <Background
              variant="dots"
              gap={12}
              size={1}
              color="var(--color-base-content)"
              style={{ opacity: 0.08 }}
            />
          </ReactFlow>
        </div>
      </section>
    </div>
  );
}
