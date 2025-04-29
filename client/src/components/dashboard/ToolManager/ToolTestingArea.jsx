import { ChevronDown, ChevronUp, Triangle } from "lucide-react";
import React from "react";

export default function ToolTestingArea({
  testToolBar,
  setTestToolBar,
  register,
}) {
  const runTool = async (id, testTitle) => {
    alert(`${testTitle} is running...`);
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
              {testToolBar.testTitle}
            </h1>
            <div className="flex items-center text-green-600 cursor-pointer " onClick={() => runTool(testToolBar.id, testToolBar.testTitle)}>
              <span>
                Run
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
              placeholder="Check my system's speed."
            ></textarea>
          </div>
        </div>

        <div className="flex flex-col px-4">
          <h1 className="font-semibold">Output:</h1>
          <ul className="flex flex-col list-['-'] pl-4">
            <li>Speed Testing...</li>
            <li>Your system speed is good!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
