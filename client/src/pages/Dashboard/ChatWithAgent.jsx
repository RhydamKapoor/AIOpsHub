import { RotateCcw, Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosConfig";

const MAX_HISTORY = 20;

const WELCOME_MESSAGE =
  "I'm Opal, your AI assistant. How can I help?";

const initialMessages = () => [
  { role: "assistant", content: WELCOME_MESSAGE },
];

export default function ChatWithAgent() {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { register, handleSubmit, setValue, reset } = useForm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    reset();
    setMessages(initialMessages());
  };

  const sendQuery = async (data) => {
    if (data.query.trim() === "" || isLoading) return;

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
            disabled={isLoading}
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
                disabled={isLoading}
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className={`absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white ${
                  isLoading ? "bg-gray-400" : "bg-success/60"
                }`}
                disabled={isLoading}
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
