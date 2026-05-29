import { RotateCcw, Send } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosConfig";

const MAX_HISTORY = 20;

const defaultWelcome =
  "I'm Opal, your AI assistant. Loading workspace info...";

export default function ChatWithAgent() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: defaultWelcome },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const messagesEndRef = useRef(null);
  const { register, handleSubmit, setValue, reset } = useForm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadWelcome = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const [agentsRes, toolsRes] = await Promise.all([
        axiosInstance.get("/agents"),
        axiosInstance.get("/tools"),
      ]);
      const agentCount = agentsRes.data?.length ?? 0;
      const toolCount = toolsRes.data?.length ?? 0;
      const agentNames = (agentsRes.data || [])
        .map((a) => a.name)
        .slice(0, 5)
        .join(", ");

      setMessages([
        {
          role: "assistant",
          content:
            agentCount > 0
              ? `I'm Opal, your AI assistant. This workspace has ${agentCount} agent${agentCount === 1 ? "" : "s"} and ${toolCount} tool${toolCount === 1 ? "" : "s"}${agentNames ? ` (${agentNames}${agentCount > 5 ? ", ..." : ""})` : ""}. I remember our recent messages in this chat — ask me anything!`
              : `I'm Opal, your AI assistant. This workspace has ${toolCount} tool${toolCount === 1 ? "" : "s"} but no agents yet. I remember our recent messages in this chat — ask me anything!`,
        },
      ]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content:
            "I'm Opal, your AI assistant. I remember our recent messages in this chat — how can I help?",
        },
      ]);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    loadWelcome();
  }, [loadWelcome]);

  const clearChat = () => {
    reset();
    loadWelcome();
  };

  const sendQuery = async (data) => {
    if (data.query.trim() === "" || isLoading || isBootstrapping) return;

    const userMessage = { role: "user", content: data.query.trim() };
    const historyForApi = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-MAX_HISTORY);

    setMessages((prev) => [...prev, userMessage]);
    setValue("query", "");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/chat", {
        message: data.query.trim(),
        history: historyForApi,
      });
      const assistantMessage = {
        role: "assistant",
        content:
          response.data.response ||
          "I'm having trouble processing that right now.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending query:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100dvh-5rem)] items-center justify-center p-3 sm:p-4">
      <motion.div
        className="flex h-full max-h-[min(720px,calc(100dvh-6rem))] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-base-content/8 bg-base-300/40 shadow-xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-base-content/10 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold sm:text-xl">Chat with Agent</h1>
            <p className="text-xs text-base-content/60 sm:text-sm">
              Uses your saved agents & tools. Remembers the last {MAX_HISTORY}{" "}
              messages in this session.
            </p>
          </div>
          <button
            type="button"
            onClick={clearChat}
            disabled={isLoading || isBootstrapping}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-base-content/15 bg-base-100/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-base-100 disabled:opacity-50 sm:text-sm"
            title="Clear chat memory"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New chat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex p-2 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <p
                className={`max-w-[min(100%,28rem)] whitespace-pre-wrap border p-3 text-sm sm:text-base ${
                  message.role === "user"
                    ? "rounded-lg rounded-tr-none bg-neutral text-neutral-content"
                    : "rounded-lg rounded-tl-none bg-base-100"
                }`}
              >
                {message.content}
              </p>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start p-2">
              <p className="max-w-[min(100%,28rem)] rounded-lg rounded-tl-none border bg-base-100 p-3">
                <span className="inline-block animate-pulse">...</span>
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-base-content/10 p-3 sm:p-4">
          <form className="w-full" onSubmit={handleSubmit(sendQuery)}>
            <div className="relative flex">
              <input
                type="text"
                id="query"
                {...register("query")}
                className="w-full rounded-full border border-base-content/15 bg-base-100/50 py-3 pl-5 pr-14 outline-none focus:border-primary/40 sm:pl-6"
                disabled={isLoading || isBootstrapping}
                placeholder={
                  isBootstrapping
                    ? "Loading workspace..."
                    : "Type your message..."
                }
              />
              <button
                type="submit"
                className={`absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white ${
                  isLoading || isBootstrapping
                    ? "bg-gray-400"
                    : "bg-success/60"
                }`}
                disabled={isLoading || isBootstrapping}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
