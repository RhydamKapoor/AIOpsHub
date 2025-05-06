import { Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import axiosInstance from "@/utils/axiosConfig";

export default function ChatWithAgent() {
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "I'm Opal, your AI assistant. How can I help you today?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { register, handleSubmit, watch, setValue } = useForm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuery = async(data) => {
    if(data.query.trim() === "") return;
    
    // Add user message to chat
    const userMessage = { role: "user", content: data.query };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setValue("query", "");
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Send request to backend
      const response = await axiosInstance.post("/chat", { message: data.query });
      // console.log(`response ${JSON.stringify(response)}`);
      // Add assistant response to chat
      const assistantMessage = { 
        role: "assistant", 
        content: response.data.response || "I'm having trouble processing that right now."
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending query:", error);
      // Add error message to chat
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again later."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 790);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // run on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className="flex justify-center items-center h-full overflow-hidden">
      <motion.div
        className="flex flex-col rounded-xl w-2/3 bg-[var(--color-base-300)]/40 shadow-xl"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "66.6%", opacity: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          type: "spring",
          boxShadow: { delay: 1 },
        }}
      >
        <div className="flex flex-col px-5 py-4 border-b">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-xl font-semibold"
          >
            Chat with Agent
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm"
          >
            Chat instantly with your AI agent to get quick answers and support.
          </motion.p>
        </div>
        <motion.div
          className="flex flex-col overflow-y-auto"
          initial={{ height: 0 }}
          animate={{ height: 400, padding: '4px 0' }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            type: "spring",
            boxShadow: { delay: 1 },
          }}
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} p-2`}
            >
              <p 
                className={`${
                  message.role === "user" 
                    ? "bg-[var(--color-neutral)] text-[var(--color-neutral-content)]" 
                    : "bg-[var(--color-base-100)]"
                } p-3 rounded-lg ${
                  message.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
                } border max-w-1/2`}
              >
                {message.content}
              </p>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start p-2">
              <p className="bg-[var(--color-base-100)] p-3 rounded-lg rounded-tl-none border max-w-1/2">
                <span className="inline-block animate-pulse">...</span>
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>
        <div className="flex p-3 border-t">
          <form className="w-full" onSubmit={handleSubmit(sendQuery)}>
            <div className="flex relative">
              <input
                type="text"
                name="query"
                id="query"
                {...register("query")}
                className="outline-none w-full py-3 pl-6 pr-16 border rounded-full "
                disabled={isLoading}
                placeholder="Type your message here..."
              />
              <button 
                type="submit" 
                className={`absolute top-1/2 -translate-y-1/2 right-2 ${
                  isLoading ? "bg-gray-400" : "bg-[var(--color-success)]/60"
                } h-10 w-10 flex justify-center items-center text-white rounded-full cursor-pointer`}
                disabled={isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
