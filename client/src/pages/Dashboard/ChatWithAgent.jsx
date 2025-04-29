import { Send } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function ChatWithAgent() {
  const [isMobile, setIsMobile] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm();

  const sendQuery = async(data) => {
    console.log(data);
    
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
          <div className="flex justify-start p-2">
            <p className="bg-[var(--color-base-100)] p-3 rounded-lg rounded-tl-none border max-w-1/2">
              I'm Opal, your AI assistant. How can I help you today?
            </p>
          </div>
          <div className="flex justify-end p-2">
            <p className="bg-[var(--color-neutral)] text-[var(--color-neutral-content)] p-3 rounded-lg rounded-tr-none border max-w-1/2">
              What's the weather today?
            </p>
          </div>
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
              />
              <button type="submit" className="absolute top-1/2 -translate-y-1/2 right-2 bg-[var(--color-success)]/60 h-10 w-10 flex justify-center items-center text-white rounded-full cursor-pointer">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
