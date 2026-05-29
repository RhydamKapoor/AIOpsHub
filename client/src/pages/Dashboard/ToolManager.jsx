import { ChevronDown, Play, Trash, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ToolTestingArea from "@/components/dashboard/ToolManager/ToolTestingArea";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import {
  CollapsiblePanel,
  accordionChevronClass,
} from "@/components/ui/CollapsiblePanel";

export default function ToolManager() {
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      env: [{ key: "", value: "" }],
      testPrompt: "",
    },
  });
  const [uploadedTools, setUploadedTools] = useState([]);
  const [testToolBar, setTestToolBar] = useState({ open: false, tool: null });
  const [loading, setLoading] = useState(false);
  const [fileStore, setFileStore] = useState({
    fileName: "",
    fileContent: "",
    fileType: "",
  });
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setUploadFormOpen(isDesktop);
  }, [isDesktop]);

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

    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "js" && extension !== "py") {
      toast.error("Only .js and .py files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileStore({
        fileName: file.name,
        fileType: extension === "js" ? "javascript" : "python",
        fileContent: ev.target.result,
      });
    };
    reader.readAsText(file);
  };

  const uploadTool = async (data) => {
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
      await axiosInstance.post("/tools", {
        title: data.title,
        description: data.description,
        fileName: fileStore.fileName,
        fileType: fileStore.fileType,
        code: fileStore.fileContent,
        env: data.env,
      });
      toast.success("Tool uploaded successfully");
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
      setUploadedTools((prev) => prev.filter((tool) => tool._id !== id));
      if (testToolBar.tool?._id === id) {
        setTestToolBar({ open: false, tool: null });
      }
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast.error("Failed to delete tool");
    } finally {
      setLoading(false);
    }
  };

  const testTool = async (id, testInput) => {
    if (!testInput) {
      toast.error("Test input is required");
      return null;
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

  const openTestPanel = (tool) => {
    setTestToolBar({ open: true, tool });
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <div className="w-full p-3 pb-10 sm:p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex w-full flex-col rounded-2xl border border-base-content/8 bg-base-300/40 shadow-xl lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
        {/* Uploaded tools + testing — first on mobile */}
        <section className="order-1 flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:order-2 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">Uploaded Tools</h2>
              <span className="rounded-full bg-base-300 px-2.5 py-0.5 text-xs font-medium">
                {uploadedTools.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              {uploadedTools.length === 0 ? (
                <p className="rounded-xl border border-dashed border-base-content/15 py-10 text-center text-sm text-base-content/50">
                  No tools uploaded yet. Expand &quot;Upload Tool&quot; below to add one.
                </p>
              ) : (
                uploadedTools.map((tool) => (
                  <article
                    key={tool._id}
                    className={cn(
                      "rounded-xl border border-base-content/10 bg-base-100/50 p-4",
                      testToolBar.tool?._id === tool._id &&
                        "ring-2 ring-primary/40"
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <h3 className="truncate font-semibold capitalize">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-base-content/55">
                          {tool.fileType} · {tool.fileName}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openTestPanel(tool)}
                          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-sm font-medium text-success sm:flex-initial"
                        >
                          <Play className="h-4 w-4" />
                          Test
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTool(tool._id)}
                          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-error/10 text-error"
                          aria-label="Delete tool"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <ToolTestingArea
            testToolBar={testToolBar}
            setTestToolBar={setTestToolBar}
            register={register}
            watch={watch}
            testTool={testTool}
          />
        </section>

        {/* Upload form — collapsible on mobile, sidebar on desktop */}
        <section className="order-2 flex w-full shrink-0 flex-col border-t border-base-content/10 lg:order-1 lg:w-[min(400px,38%)] lg:border-t-0 lg:border-r">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left lg:hidden"
            onClick={() => setUploadFormOpen((v) => !v)}
            aria-expanded={uploadFormOpen}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Upload className="h-5 w-5 text-primary" />
              Upload Tool
            </span>
            <ChevronDown className={accordionChevronClass(uploadFormOpen)} />
          </button>

          <CollapsiblePanel
            open={uploadFormOpen}
            alwaysOpenFrom="lg"
          >
            <div className="flex flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0 lg:pt-6">
            <div className="hidden lg:block">
              <h2 className="text-lg font-bold sm:text-xl">Upload Tool</h2>
              <p className="mt-1 text-xs text-base-content/55 sm:text-sm">
                Add a .js or .py file and configure it below.
              </p>
            </div>

            <label
              htmlFor="file"
              className="flex min-h-[72px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-base-content/20 bg-base-300/40 px-4 py-4 text-center text-sm"
            >
              {fileStore?.fileContent ? (
                <span className="text-success">
                  ✓ {fileStore.fileName}
                </span>
              ) : (
                "Tap to upload .js or .py file"
              )}
            </label>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".js,.py"
            />

            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit(uploadTool)}
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Environment variables</h3>
                <div className="flex max-h-28 flex-col gap-3 overflow-y-auto sm:max-h-36">
                  {watch("env")?.map((_, index) => (
                    <div
                      className="flex flex-col gap-2 sm:flex-row"
                      key={index}
                    >
                      <input
                        type="text"
                        placeholder="Key"
                        {...register(`env.${index}.key`)}
                        className="min-h-11 w-full rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none sm:w-1/2"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        {...register(`env.${index}.value`)}
                        className="min-h-11 w-full rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none sm:w-1/2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title")}
                  className="min-h-11 w-full rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={2}
                  {...register("description")}
                  className="w-full resize-y rounded-lg border bg-base-100/50 px-3 py-2.5 text-base outline-none"
                />
              </div>

              <button
                type="submit"
                className="min-h-11 w-full rounded-lg bg-neutral px-4 py-3 text-neutral-content disabled:opacity-50"
                disabled={loading || !fileStore?.fileContent}
              >
                {loading ? "Processing..." : "Upload Tool"}
              </button>
            </form>
            </div>
          </CollapsiblePanel>
        </section>
      </div>
    </div>
  );
}
