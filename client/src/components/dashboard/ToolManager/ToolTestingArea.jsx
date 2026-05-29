import { ChevronDown, Loader2, Play } from "lucide-react";
import { useState } from "react";
import {
  CollapsiblePanel,
  accordionChevronClass,
} from "@/components/ui/CollapsiblePanel";

export default function ToolTestingArea({
  testToolBar,
  setTestToolBar,
  register,
  watch,
  testTool,
}) {
  const [testOutput, setTestOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runTool = async () => {
    const testPromptValue = watch("testPrompt");
    if (!testPromptValue?.trim()) {
      setTestOutput("Please enter a prompt to test the tool.");
      return;
    }
    if (!testToolBar?.tool?._id) {
      setTestOutput("Select a tool from the list above, then test it here.");
      return;
    }

    setIsLoading(true);
    setTestOutput("Running tool...");

    try {
      const result = await testTool(testToolBar.tool._id, testPromptValue);
      setTestOutput(result || "No result returned from tool.");
    } catch (error) {
      setTestOutput(
        `Error: ${error.message || "An error occurred while testing the tool."}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shrink-0 overflow-hidden rounded-xl border border-base-content/10 bg-base-100/50">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 border-b border-base-content/10 px-4 py-3.5 text-left"
        onClick={() =>
          setTestToolBar({ ...testToolBar, open: !testToolBar.open })
        }
        aria-expanded={testToolBar.open}
      >
        <div>
          <h2 className="text-base font-semibold sm:text-lg">Tool Testing</h2>
          <p className="text-xs text-base-content/55">
            {testToolBar?.tool?.title
              ? `Testing: ${testToolBar.tool.title}`
              : "Pick a tool and run a prompt"}
          </p>
        </div>
        <ChevronDown className={accordionChevronClass(testToolBar.open)} />
      </button>

      <CollapsiblePanel open={testToolBar.open}>
        <div className="flex flex-col gap-4 border-t border-base-content/10 p-4 lg:flex-row lg:gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                <span className="font-semibold">Tool:</span>{" "}
                {testToolBar?.tool?.title || "None selected"}
              </p>
              <button
                type="button"
                disabled={isLoading || !testToolBar?.tool?._id}
                onClick={runTool}
                className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isLoading ? "Running..." : "Run Tool"}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="testPrompt" className="text-sm font-medium">
                Test prompt
              </label>
              <textarea
                id="testPrompt"
                rows={4}
                {...register("testPrompt")}
                className="w-full resize-y rounded-lg border bg-base-100 px-3 py-2.5 text-base outline-none"
                placeholder="Enter a prompt to test the tool..."
                disabled={isLoading || !testToolBar?.tool?._id}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium">Output</span>
            <div className="min-h-[120px] flex-1 overflow-auto rounded-lg border bg-base-100 p-3 text-sm lg:min-h-[160px]">
              {testOutput ? (
                <pre className="whitespace-pre-wrap wrap-break-word font-sans">
                  {testOutput}
                </pre>
              ) : (
                <p className="text-base-content/45">
                  Run the tool to see output here
                </p>
              )}
            </div>
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
