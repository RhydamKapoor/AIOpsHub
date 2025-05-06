import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
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
import { Check, ChevronsUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Custom node types

const initialNodes = [
  {
    id: "input",
    type: "inputNode",
    position: { x: 330, y: 50 },
    data: { label: "User Query" },
  },
  {
    id: "llm",
    type: "langchainNode",
    position: { x: 330, y: 120 },
    data: { label: "LLM", type: "Groq - Llama 3" },
  },
  {
    id: "output",
    type: "outputNode",
    position: { x: 330, y: 210},
    data: { label: "Response" },
  },
];

const options = [
  { label: "Weather Report", value: "weather report" },
  { label: "News Report", value: "news report" },
  { label: "Stock Market Report", value: "stock market report" },
  { label: "Sports Report", value: "sports report" },
];

export default function AgentBuilder() {
  const { register, handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      selectedTools: [],
    }
  });
  const [open, setOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const reactFlowRef = useRef(null);
  
  // Watch for selectedTools changes
  const selectedTools = watch("selectedTools") || [];

  // Memoize nodeTypes to prevent constant recreation
  const nodeTypes = useMemo(() => ({
    langchainNode: LangChainNode,
    toolNode: ToolNode,
    inputNode: InputNode,
    outputNode: OutputNode,
  }), []);

  // Custom node components
function LangChainNode({ data }) {
  return (
    <div className="p-3 bg-blue-100 border-2 border-blue-500 rounded-md min-w-[150px]">
      <div className="font-bold">{data.label}</div>
      <div className="text-xs capitalize">{watch("llm") || `Select LLM`}</div>
    </div>
  );
}

function ToolNode({ data }) {
  return (
    <div className="p-3 bg-green-100 border-2 border-green-500 rounded-md min-w-[150px]">
      <div className="font-bold">{data.label}</div>
      <div className="text-xs">{data.description || "Custom Tool"}</div>
    </div>
  );
}

function InputNode({ data }) {
  return (
    <div className="p-3 border-2 rounded-md min-w-[150px] bg-[var(--color-base-300)]/40">
      <div className="font-bold">{data.label}</div>
      <div className="text-xs">{watch("userQuery")}</div>
    </div>
  );
}
function OutputNode({ data }) {
  return (
    <div className="p-3 bg-purple-100 border-2 border-purple-500 rounded-md min-w-[150px]">
      <div className="font-bold">{data.label}</div>
      <div className="text-xs">{watch("output")}</div>
    </div>
  );
}
 

  const fetchTools = async () => {
    try {
      const response = await axiosInstance.get("/tools");
      setTools(response.data);
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast.error("Failed to fetch tools");
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axiosInstance.get("/agents");
      setAgents(response.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to fetch agents");
    }
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  // const handleSaveAgent = async () => {
  //   if (!agentName || !agentDescription) {
  //     toast.error("Name and description are required");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     // Extract toolIds from nodes
  //     const toolIds = nodes
  //       .filter((node) => node.type === "toolNode")
  //       .map((node) => node.data.toolId);

  //     const agentData = {
  //       name: agentName,
  //       description: agentDescription,
  //       nodes,
  //       edges,
  //       toolIds,
  //       langSmithProjectId,
  //     };

  //     await axiosInstance.post("/agents", agentData);
  //     toast.success("Agent saved successfully");
  //     setShowSaveModal(false);
  //     setAgentName("");
  //     setAgentDescription("");
  //     setLangSmithProjectId("");
  //     fetchAgents();
  //   } catch (error) {
  //     console.error("Error saving agent:", error);
  //     toast.error("Failed to save agent");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //   if (!selectedAgent) {
  //     toast.error("No agent selected");
  //     return;
  //   }

  //   if (!userPrompt.trim()) {
  //     toast.error("Please enter a prompt");
  //     return;
  //   }

  //   setLoading(true);
  //   setAgentOutput(null);
  //   try {
  //     const response = await axiosInstance.post(
  //       `/agents/${selectedAgent._id}/run`,
  //       {
  //         input: userPrompt,
  //         tracingEnabled: true,
  //       }
  //     );

  //     setAgentOutput(response.data.result);
  //     toast.success("Agent executed successfully");

  //     // If LangSmith URL is available, open it in a new tab
  //     if (response.data.langSmithUrl) {
  //       window.open(response.data.langSmithUrl, "_blank");
  //     }
  //   } catch (error) {
  //     console.error("Error running agent:", error);
  //     toast.error("Failed to run agent");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // Add this new function to update all edges when tools change
  const updateEdgesAfterToolChange = useCallback(() => {
    try {
      // We need to completely rebuild our edges
      // Start with the main edge from input to LLM
      const mainEdges = [
        {
          id: "e-input-llm",
          source: "input",
          target: "llm",
          type: "simplebezier", // Change from straight to simplebezier
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { 
            strokeWidth: 2.5,
            stroke: '#8B5CF6'
          }
        }
      ];
      
      // Get all tool nodes
      const toolNodes = nodes.filter(node => node.id.startsWith('tool-'));
      
      // If we have no tool nodes, just connect LLM to output directly
      if (toolNodes.length === 0) {
        mainEdges.push({
          id: "ellm-output",
          source: "llm",
          target: "output",
          type: "simplebezier", // Change from straight to simplebezier
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { 
            strokeWidth: 2.5,
            stroke: '#8B5CF6'
          }
        });
      } else {
        // We have tool nodes, so connect LLM to each tool node
        // and each tool node to output
        const toolEdges = toolNodes.flatMap(node => [
          {
            id: `ellm-${node.id}`,
            source: "llm",
            target: node.id,
            type: "simplebezier", // Change from straight to simplebezier
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { 
              strokeWidth: 2,
              stroke: '#2563EB' 
            }
          },
          {
            id: `e${node.id}-output`,
            source: node.id,
            target: "output",
            type: "simplebezier", // Change from straight to simplebezier
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { 
              strokeWidth: 2,
              stroke: '#059669'
            }
          }
        ]);
        
        // Add tool edges to main edges
        mainEdges.push(...toolEdges);
      }
      
      // Set all edges at once
      setEdges(mainEdges);
    } catch (error) {
      console.error("Error updating edges:", error);
    }
  }, [nodes, setEdges]);

  // Call the edge update function after nodes change
 

  // Update toggle option to use form's selectedTools
  const toggleOption = (id, title, fileName, env) => {
    // Get current selected tools
    const currentSelectedTools = getValues("selectedTools") || [];
    
    // Check if this tool is already selected
    const toolIndex = currentSelectedTools.findIndex(tool => tool.id === id);
    const isAlreadySelected = toolIndex !== -1;
    
    if (isAlreadySelected) {
      // Remove this tool from the selection
      const updatedTools = currentSelectedTools.filter(tool => tool.id !== id);
      setValue("selectedTools", updatedTools);
      
      // Remove the node if it exists
      setNodes(nodes => nodes.filter(node => node.id !== `tool-${id}`));
      
      // Reposition remaining tool nodes after removing one
      setTimeout(() => {
        setNodes(currentNodes => {
          const toolNodes = currentNodes.filter(node => node.id.startsWith('tool-'));
          const centerX = 330; // Center X position (LLM node's X position)
          
          // Update y-position based on changes
          const yPos = 160; // Position between LLM and Output
          
          // Calculate positions with multiple rows if needed
          const maxNodesPerRow = 5; // Maximum number of nodes in a single row
          
          // Position nodes in a single row centered
          const updatedNodes = currentNodes.map(node => {
            if (node.id.startsWith('tool-')) {
              // Find this node's index among tool nodes
              const index = toolNodes.findIndex(n => n.id === node.id);
              
              // Determine position in single row
              const totalWidth = Math.min(toolNodes.length, maxNodesPerRow) * 180;
              const startX = centerX - (totalWidth / 2) + 90;
              const xPos = startX + (index * 180);
              
              return {
                ...node,
                position: { 
                  x: xPos, 
                  y: yPos 
                }
              };
            }
            return node;
          });
          
          return updatedNodes;
        });
      }, 10);
    } else {
      // Add this tool to the selection
      const newTool = { 
        id, 
        title, 
        fileName,
        env
      };
      setValue("selectedTools", [...currentSelectedTools, newTool]);
      
      // Add a new tool node
      const toolNodeId = `tool-${id}`;
      
      // First add the node with temporary position
      setNodes(currentNodes => {
        const newNode = {
          id: toolNodeId,
          type: "toolNode",
          position: { x: 330, y: 160 }, // Position between LLM and Output
          data: {
            label: title,
            fileName: fileName,
            toolId: id,
          },
        };
        
        return [...currentNodes, newNode];
      });
      
      // Then calculate positions for all tool nodes
      setTimeout(() => {
        setNodes(currentNodes => {
          const toolNodes = currentNodes.filter(node => node.id.startsWith('tool-'));
          const centerX = 330; // Center X position (LLM node's X position)
          
          // Update y-position based on changes
          const yPos = 160; // Position between LLM and Output
          
          // Calculate positions in single row
          const totalWidth = Math.min(toolNodes.length, 5) * 180;
          const startX = centerX - (totalWidth / 2) + 90;
          
          // Position all nodes in a row
          return currentNodes.map(node => {
            if (node.id.startsWith('tool-')) {
              // Find this node's index
              const index = toolNodes.findIndex(n => n.id === node.id);
              const xPos = startX + (index * 180);
              
              return {
                ...node,
                position: { 
                  x: xPos, 
                  y: yPos 
                }
              };
            }
            return node;
          });
        });
      }, 10);
    }
  };

  const saveAgent = async (data) => {
    console.log({...data, nodes, edges});
    const toastID = toast.loading("Building Agent...");
    try {
      const response = await axiosInstance.post("/agents", {...data, nodes, edges});
      console.log(response);
      toast.success("Agent built successfully", {id: toastID});
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {id: toastID});
    }
  }; 
  
  useEffect(() => {
    updateEdgesAfterToolChange();
  }, [nodes, updateEdgesAfterToolChange]);

  // More aggressive fit view with fallback
  useEffect(() => {
    // This will make sure the view fits after nodes and edges are updated
    const timeoutIds = [];
    
    if (reactFlowRef.current) {
      // Try a sequence of fit view operations with increasing delay
      [100, 300, 600, 1000].forEach(delay => {
        const id = setTimeout(() => {
          try {
            // Use reactFlowRef.current.fitView if available, otherwise try other methods
            if (typeof reactFlowRef.current.fitView === 'function') {
              reactFlowRef.current.fitView({
                duration: 200,
                padding: 0.3,
                minZoom: 0.1,
                maxZoom: 2
              });
            } else if (reactFlowRef.current.viewportInitialized && typeof reactFlowRef.current.zoomTo === 'function') {
              // Try fallback to zoomTo instead
              reactFlowRef.current.zoomTo(0.8);
              reactFlowRef.current.setCenter(330, 160);
            }
          } catch (error) {
            console.error(`Error in fitView (${delay}ms):`, error);
          }
        }, delay);
        timeoutIds.push(id);
      });
    }
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [nodes, edges]);
 // Fetch tools on component mount
 useEffect(() => {
  fetchTools();
  fetchAgents();
}, []);
  return (
    <div className="w-full h-full relative flex">
      <div className="flex w-1/2 p-3">
        <form onSubmit={handleSubmit(saveAgent)} className="flex flex-col gap-y-9 w-full bg-[var(--color-base-300)]/40 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col w-full gap-y-5">
            <h1 className="text-3xl font-bold text-center">Agent Info</h1>
            <div className="flex *:w-full gap-x-4">
              <div className="flex flex-col gap-y-1">
                <label htmlFor="agentName">Agent Name</label>
                <input
                  type="text"
                  id="agentName"
                  {...register("agentName")}
                  placeholder="Ex: Weather-agent"
                  className="border outline-none rounded-md p-3 "
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <label htmlFor="agentDescription">Agent Description</label>
                <input
                  type="text"
                  id="agentDescription"
                  {...register("agentDescription")}
                  className="border outline-none rounded-md p-3 "
                  placeholder="Ex: This agent is used to get the weather in a specific city"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-y-2">
            <h1 className="text-xl font-bold text-center">Build your Agent</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-1 col-span-2">
                <label htmlFor="agentName">Prompt</label>
                <input
                  type="text"
                  id="userQuery"
                  {...register("userQuery")}
                  placeholder="Ex: What is the weather in Tokyo?"
                  className="border outline-none rounded-md p-3 "
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <label htmlFor="selectLLM">Select LLM</label>
                <Select value={watch("llm")} onValueChange={(value) => setValue("llm", value)}>
                  <SelectTrigger id="selectLLM" className="border outline-none rounded-md px-3 py-6 w-full text-base cursor-pointer">
                    <SelectValue placeholder="Select a LLM" />
                  </SelectTrigger>
                  <SelectContent
                    className={`bg-[var(--color-base-100)] text-[var(--color-base-content)]/80`}
                  >
                    <SelectGroup>
                      <SelectLabel className="text-base font-bold">
                        LLMs
                      </SelectLabel>
                      <SelectItem
                        value="openai"
                        className={`cursor-pointer hover:bg-[var(--color-base-content)]/20`}
                      >
                        OpenAI - GPT-4
                      </SelectItem>
                      <SelectItem
                        value="groq"
                        className={`cursor-pointer hover:bg-[var(--color-base-content)]/20`}
                      >
                        Groq - Llama 3.3
                      </SelectItem>
                      <SelectItem
                        value="claude"
                        className={`cursor-pointer hover:bg-[var(--color-base-content)]/20`}
                      >
                        Claude - 3.5 Sonnet
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-y-1">
                <label htmlFor="selectTools">Select Tools</label>
                <div className="flex items-center">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger id="selectTools" className={`"border outline-none rounded-md px-3 py-6 ${selectedTools.length > 0 ? 'w-5/6' : 'w-full'} text-base cursor-pointer"`} asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className=" justify-between"
                      >
                        {selectedTools.length > 0
                          ? `Selected (${selectedTools.length})`
                          : "Select Tools"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[var(--color-base-100)] text-[var(--color-base-content)]/80 p-0 ">
                      <Command>
                      <CommandInput className="text-base py-2" placeholder="Search..." />
                        <CommandGroup className="max-h-[140px] overflow-y-auto">
                          {tools.map((option) => (
                            <CommandItem
                              key={option._id}
                              onSelect={() => toggleOption(option._id, option.title, option.fileName, option.env)}
                              className="cursor-pointer hover:bg-[var(--color-base-content)]/20"
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selectedTools.some(tool => tool.id === option._id)
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50"
                                )}
                              >
                                {selectedTools.some(tool => tool.id === option._id) && (
                                  <Check className="h-4 w-4" />
                                )}
                              </div>
                              {option.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex justify-center items-center w-1/4">
                  {selectedTools.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={`22`} className="cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[var(--color-base-100)] text-[var(--color-base-content)]/80 p-4 rounded-xl">
                          <div className="flex flex-col gap-y-3 flex-wrap gap-1">
                          <h1 className="text-lg font-bold text-center">Selected Tools</h1>
                            {selectedTools.map((tool) => {
                              return (
                                <Badge key={tool.id} variant="outline" className="text-sm">
                                  {tool.title}
                                </Badge>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-y-1 col-span-2">
                <label htmlFor="output">Output</label>
                <input
                  type="text"
                  id="output"
                  {...register("output")}
                  className="border outline-none rounded-md p-3 "
                  placeholder="Ex: The temperature in Tokyo is 20 degrees Celsius"
                />
              </div>

              <div className="flex flex-col items-center col-span-2 justify-center">
                <button type="submit"
                  className="bg-[var(--color-neutral)] text-[var(--color-neutral-content)] px-4 py-2 rounded-md cursor-pointer" >
                  Build Agent
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="w-1/2 h-full overflow-hidden">
        <div className="w-full h-full bg-[var(--color-base-300)]/10 rounded-xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            panOnScroll={true}
            zoomOnScroll={true}
            panOnDrag={true}
            nodesDraggable={false}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
            ref={reactFlowRef}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
            fitView
            style={{ width: '100%', height: '100%' }}
            defaultEdgeOptions={{ type: 'simplebezier' }}
          >
            <Controls position="bottom-right" showInteractive={true} />
            <Background variant="dots" gap={12} size={1} color="var(--color-base-content)/10" />
          </ReactFlow>
        </div>
      </div>

    </div>
  );
}
