import { Trash, Triangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { motion } from "motion/react";
import ToolTestingArea from "@/components/dashboard/ToolManager/ToolTestingArea";

const tools = [
  {
    id: "012",
    title: "Tool 1",
    file: "Python",
  },
  {
    id: "016",
    title: "Tool 2",
    file: "Javascript",
  },
  {
    id: "018",
    title: "Tool 3",
    file: "Javascript",
  },
  {
    id: "050",
    title: "Tool 4",
    file: "Python",
  },
];
export default function ToolManager() {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [uploadedTools, setUploadedTools] = useState(tools);
  const [testToolBar, setTestToolBar] = useState({
    open: false,
    id: "",
    testTitle: "",
  });

  const uploadTool = async (data) => {
    console.log(data);
  };

  const deleteTool = async (id) => {
    const restTools = uploadedTools.filter(tool => tool.id !== id);
    setUploadedTools(restTools);
  };

  useEffect(() => {
    setUploadedTools(tools)
  }, [tools]);
  return (
    <div className="flex h-full p-4 gap-y-7">
      <div className="flex w-full shadow-xl rounded-xl bg-[var(--color-base-300)]/40">
        <div className="flex flex-col h-full gap-y-6 p-6 w-1/3">
          <div className="flex h-1/5">
            <label
              htmlFor="file"
              className="flex items-center justify-center w-full h-full bg-[var(--color-base-300)]/40 border-2 border-dashed rounded-xl text-lg cursor-pointer"
            >
              Upload a tool file ( .js or .py file)
            </label>
            <input type="file" name="file" id="file" className="hidden" />
          </div>

          <form
            className="flex flex-col justify-around h-3/5"
            onClick={handleSubmit(uploadTool)}
          >
            <div className="flex flex-col">
              <label htmlFor="title" className="text-base">
                Title
              </label>
              <input
                type="text"
                id="title"
                {...register("title")}
                className="border outline-none rounded-md p-3 "
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description" className="text-base">
                Description
              </label>
              <textarea
                type="text"
                id="description"
                {...register("description")}
                className="border outline-none rounded-md p-3"
              ></textarea>
            </div>
            <div className="flex items-center justify-center">
              <button className="py-3 px-4 bg-[var(--color-neutral)] text-[var(--color-neutral-content)] rounded-lg w-full cursor-pointer ">
                Upload
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col w-2/3 p-6 justify-between">
          <motion.div className="flex flex-col items-center gap-y-3 overflow-hidden"
            initial={{ height: "100%" }}
            animate={{ height: testToolBar.open ? "60%" : "100%" }}
          >
            <h1 className="text-xl font-semibold">Uploaded Tools</h1>
            <div className="flex flex-col w-full overflow-y-auto">
              <div className="px-3 w-full">
                <div className="flex *:flex *:justify-center *:w-1/3 w-full p-4">
                  <h1>Tool Name</h1>
                  <h1>Script</h1>
                  <h1 className="flex">Action</h1>
                </div>
              </div>
              <div className="flex flex-col w-full gap-y-5 p-3">
                {uploadedTools.length !== 0 ? uploadedTools.map((tool, i) => (
                  <div
                    className="flex *:flex *:justify-center *:w-1/3 capitalize bg-[var(--color-base-100)]/50 rounded-xl p-4"
                    key={i}
                  >
                    <h1>{tool.title}</h1>
                    <h1>{tool.file}</h1>
                    <h1 className="flex items-center gap-x-5">
                      <span onClick={() => setTestToolBar({open: true, id: tool.id, testTitle: tool.title})}>
                        <Triangle
                          size={20}
                          className="-rotate-[30deg] text-green-600 cursor-pointer"
                        />
                      </span>
                      <span onClick={() => deleteTool(tool.id)}>
                        <Trash
                          size={20}
                          className="text-red-700 cursor-pointer"
                        />
                      </span>
                    </h1>
                  </div>
                )) : (<p className="text-center">No tools uploaded yet.</p>)}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center p-5 overflow-hidden"
            initial={{ height: "18%" }}
            animate={{ height: testToolBar.open ? "100%" : "18%" }}
          >
            <ToolTestingArea
              testToolBar={testToolBar}
              setTestToolBar={setTestToolBar}
              register={register}
              watch={watch}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
