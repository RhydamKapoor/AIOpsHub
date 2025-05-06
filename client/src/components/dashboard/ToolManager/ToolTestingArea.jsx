import { ChevronDown, ChevronUp, Triangle } from "lucide-react";
import React, { useState } from "react";

export default function ToolTestingArea({
  testToolBar,
  setTestToolBar,
  register,
  watch,
  testTool
}) {
  const [testOutput, setTestOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const sendQuery = async(data) => {
  //   if(data.query.trim() === "") return;
    
  //   // Add user message to chat
  //   const userMessage = { role: "user", content: data.query };
  //   setMessages(prev => [...prev, userMessage]);
    
  //   // Clear input field
  //   setValue("query", "");
    
  //   // Show loading state
  //   setIsLoading(true);
    
  //   try {
  //     // Send request to backend
  //     const response = await axiosInstance.post("/chat", { message: data.query });
  //     // console.log(`response ${JSON.stringify(response)}`);
  //     // Add assistant response to chat
  //     const assistantMessage = { 
  //       role: "assistant", 
  //       content: response.data.response || "I'm having trouble processing that right now."
  //     };
  //     setMessages(prev => [...prev, assistantMessage]);
  //   } catch (error) {
  //     console.error("Error sending query:", error);
  //     // Add error message to chat
  //     const errorMessage = { 
  //       role: "assistant", 
  //       content: "Sorry, I encountered an error. Please try again later."
  //     };
  //     setMessages(prev => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  const runTool = async () => {
    // debugger;
    const testPromptValue = watch("testPrompt");
    if (!testPromptValue) {
      setTestOutput("Please enter a prompt to test the tool.");
      return;
    }

    setIsLoading(true);
    setTestOutput("Running tool...");
    
    try {
      const result = await testTool(testToolBar.tool._id, testPromptValue);
      setTestOutput(result || "No result returned from tool.");
    } catch (error) {
      setTestOutput(`Error: ${error.message || "An error occurred while testing the tool."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col border-2 border-b-none w-full rounded-lg h-full bg-[var(--color-base-100)]/50 overflow-hidden">
      <div
        className="flex border-b-2 justify-center py-2 relative cursor-pointer"
        onClick={() =>
          setTestToolBar({ ...testToolBar, open: !testToolBar.open })
        }
      >
        <h1 className="text-xl font-semibold">Tools Testing Area</h1>
        <span className="absolute right-5 top-1/2 -translate-y-1/2">
          {!testToolBar.open ? <ChevronUp /> : <ChevronDown />}
        </span>
      </div>

      <div className="flex overflow-hidden p-4">
        <div className="flex flex-col gap-y-3 w-2/5">
          <div className="flex justify-between">
            <h1>
              <span className="font-semibold">Title:</span>{" "}
              {testToolBar?.tool?.title || "Select a tool to test"}
            </h1>
            <div 
              className={`flex items-center text-green-600 cursor-pointer ${!testToolBar?.tool?._id || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={() => !isLoading && testToolBar?.tool?._id && runTool()}
            >
              <span>
                {isLoading ? "Running..." : "Run"}
              </span>
              <span>
                <Triangle
                  size={14}
                  className="-rotate-[30deg]"
                />
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="testPrompt" className="font-semibold">
              Prompt:
            </label>
            <textarea
              type="text"
              id="testPrompt"
              rows={5}
              {...register("testPrompt")}
              className="border outline-none rounded-md p-3 resize-none"
              placeholder="Enter a prompt to test the tool..."
              disabled={isLoading || !testToolBar?.tool?._id}
            ></textarea>
          </div>
        </div>

        <div className="flex flex-col px-4 w-3/5">
          <h1 className="font-semibold">Output:</h1>
          <div className="border p-3 rounded-md h-full overflow-auto mt-2 bg-gray-50">
            {testOutput ? (
              <pre className="whitespace-pre-wrap">{testOutput}</pre>
            ) : (
              <p className="text-gray-400">Run the tool to see output here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
