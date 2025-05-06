import { Minus, Plus, Trash, Triangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import ToolTestingArea from "@/components/dashboard/ToolManager/ToolTestingArea";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";

export default function ToolManager() {
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      env: [
        { key: "", value: "" },
      ],
    },
  });
  const [uploadedTools, setUploadedTools] = useState([]);
  const [testToolBar, setTestToolBar] = useState({
    open: false,
  });
  const [loading, setLoading] = useState(false);
  const [fileStore, setFileStore] = useState({
    fileName: "",
    fileContent: "",
    fileType: "",
  });

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/tools");
      setUploadedTools(response.data);
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast.error("Failed to fetch tools");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "js" && extension !== "py") {
      toast.error("Only .js and .py files are supported");
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileStore({
        fileName: file.name,
        fileType: extension === "js" ? "javascript" : "python",
        fileContent: e.target.result,
      });
    };
    reader.readAsText(file);
  };

  const uploadTool = async (data) => {
    console.log(data);
    if (!fileStore.fileContent) {
      toast.error("Please upload a file first");
      return;
    }

    if (!data.title || !data.description) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const toolData = {
        title: data.title,
        description: data.description,
        fileName: fileStore.fileName,
        fileType: fileStore.fileType,
        code: fileStore.fileContent,
        env: data.env,
      };

      await axiosInstance.post("/tools", toolData);
      toast.success("Tool uploaded successfully");

      // Reset form and fetch updated tools
      // reset();
      // setFileStore({
      //   fileName: "",
      //   fileContent: "",
      //   fileType: "",
      // });
      fetchTools();
    } catch (error) {
      console.error("Error uploading tool:", error);
      toast.error("Failed to upload tool");
    } finally {
      setLoading(false);
    }
  };

  const deleteTool = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/tools/${id}`);
      toast.success("Tool deleted successfully");

      // Update local state
      setUploadedTools(uploadedTools.filter((tool) => tool._id !== id));
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast.error("Failed to delete tool");
    } finally {
      setLoading(false);
    }
  };

  const testTool = async (id, testInput) => {
    // debugger;
    if (!testInput) {
      toast.error("Test input are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/tools/${id}/test`, {
        input: testInput,
      });
      toast.success("Tool tested successfully");
      return response.data.result;
    } catch (error) {
      console.error("Error testing tool:", error);
      toast.error("Failed to test tool");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <div className="flex h-full p-4 gap-y-7">
      <div className="flex w-full shadow-xl rounded-xl bg-[var(--color-base-300)]/40">
        <div className="flex flex-col h-full gap-y-6 p-6 w-1/3">
          <div className="flex h-1/5">
            <label
              htmlFor="file"
              className="flex items-center justify-center w-full h-full bg-[var(--color-base-300)]/40 border-2 border-dashed rounded-xl text-lg cursor-pointer"
            >
              {fileStore?.fileContent
                ? "File uploaded"
                : "Upload a tool file (.js or .py file)"}
            </label>
            <input
              type="file"
              name="file"
              id="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".js,.py"
            />
          </div>

          <form
            className="flex flex-col justify-around h-full"
            onSubmit={handleSubmit(uploadTool)}
          >
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-base text-center">Environment Variables</h1>
              <div className="flex *:w-1/2 text-center text-[var(--color-base-content)]/70">
                <h1>Key</h1>
                <h1>Value</h1>
              </div>

              <div className="flex flex-col overflow-y-auto  gap-y-3 h-16 py-1.5">
                {watch("env")?.map((env, index) => (
                  <div className="flex text-center gap-x-2" key={index}>
                    <input
                      type="text"
                      id={`key${index}`}
                      {...register(`env.${index}.key`)}
                      className="border outline-none rounded-md p-3 w-1/2"
                      />
                      <input
                        type="text"
                        id={`value${index}`}
                        {...register(`env.${index}.value`)}
                        className="border outline-none rounded-md p-3 w-1/2"
                      />
                      {/* <span className="flex flex-col gap-y-1 items-center justify-center w-fit">
                        <Plus size={22} className="text-white cursor-pointer rounded-full bg-green-700 p-1" />
                        <Minus size={22} className="bg-red-700 cursor-pointer rounded-full p-1" />
                      </span> */}
                    </div>
                ))}
              </div>
            </div>

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
                rows={2}
              ></textarea>
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="py-3 px-4 bg-[var(--color-neutral)] text-[var(--color-neutral-content)] rounded-lg w-full cursor-pointer disabled:opacity-50"
                disabled={loading || !fileStore?.fileContent}
              >
                {loading ? "Processing..." : "Upload"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col w-2/3 p-6 justify-between">
          <motion.div
            className="flex flex-col items-center gap-y-3 overflow-hidden"
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
                {uploadedTools.length !== 0 ? (
                  uploadedTools.map((tool) => (
                    <div
                      className="flex *:flex *:justify-center *:w-1/3 capitalize bg-[var(--color-base-100)]/50 rounded-xl p-4"
                      key={tool._id}
                    >
                      <h1>{tool.title}</h1>
                      <h1>{tool.fileType}</h1>
                      <h1 className="flex items-center gap-x-5">
                        <span
                          onClick={() => setTestToolBar({ open: true, tool })}
                        >
                          <Triangle
                            size={20}
                            className="-rotate-[30deg] text-green-600 cursor-pointer"
                          />
                        </span>
                        <span onClick={() => deleteTool(tool._id)}>
                          <Trash
                            size={20}
                            className="text-red-700 cursor-pointer"
                          />
                        </span>
                      </h1>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No tools uploaded yet.</p>
                )}
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
              fileStore={fileStore}
              register={register}
              watch={watch}
              testTool={testTool}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
