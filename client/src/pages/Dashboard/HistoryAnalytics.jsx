import axiosInstance from "@/utils/axiosConfig";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { isSameUser } from "@/utils/resolveUserId";

function belongsToUser(item, user) {
  if (!user) return false;
  if (user.role === "Admin") return true;
  return isSameUser(item.user, user._id);
}

function getWorkflowInput(item) {
  const fromSteps =
    item?.steps?.find((step) => step.input?.trim())?.input ||
    item?.steps?.[0]?.input;
  if (fromSteps?.trim()) return fromSteps;
  if (item?.title?.startsWith("Chat:")) {
    return item.title.replace(/^Chat:\s*/, "");
  }
  return item?.title || "—";
}

function getToolsUsed(item) {
  const allTools = (item?.steps || []).flatMap((step) => step.toolUsed || []);
  return [...new Set(allTools.filter(Boolean))];
}

export default function HistoryAnalytics() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [visibleDateCount, setVisibleDateCount] = useState(1);

  const userHistory = history.filter((item) => belongsToUser(item, user));

  const sortedDates = Array.from(
    new Set(
      userHistory.map((item) =>
        item.createdAt ? format(new Date(item.createdAt), "dd MMM yyyy") : ""
      )
    )
  )
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));

  const handleShowMore = (date, totalItems) => {
    const currentCount = visibleCounts[date] || 10;
    const newCount = currentCount + 10;

    if (newCount >= totalItems) {
      setVisibleDateCount((prev) => prev + 1);
    }

    setVisibleCounts((prev) => ({
      ...prev,
      [date]: newCount,
    }));
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/allWorkflows`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 overflow-x-hidden p-4 pb-12 sm:gap-8 sm:p-5 sm:pb-14 lg:p-6 lg:pb-16">
      {loading ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-base-content/60">
            Loading workflow history...
          </p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-base-content/15 bg-base-300/30 p-8 text-center">
          <p className="text-base font-medium">No history yet</p>
          <p className="text-sm text-base-content/55">
            Chat with Opal or run an agent — activity will appear here.
          </p>
        </div>
      ) : (
        sortedDates.slice(0, visibleDateCount).map((date) => {
          const itemsForDate = userHistory
            .filter((item) => {
              const itemDate = item.createdAt
                ? format(new Date(item.createdAt), "dd MMM yyyy")
                : "";
              return itemDate === date;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          const visibleItems = itemsForDate.slice(
            0,
            visibleCounts[date] || 10
          );

          return (
            <section key={date} className="flex flex-col gap-4 sm:gap-5">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-xl border border-base-content/10 bg-base-300/80 px-4 py-3 backdrop-blur-md">
                <h2 className="text-base font-semibold sm:text-xl">{date}</h2>
                {visibleItems.length < itemsForDate.length && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 sm:text-sm"
                    onClick={() => handleShowMore(date, itemsForDate.length)}
                  >
                    Show more
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:gap-5">
                {visibleItems.map((item) => {
                  const toolsUsed = getToolsUsed(item);
                  const step0 = item?.steps?.[0]?.tokenUsage?.totalTokens || 0;
                  const step1 = item?.steps?.[1]?.tokenUsage?.totalTokens || 0;
                  const step2 = item?.steps?.[2]?.tokenUsage?.totalTokens || 0;
                  const cost =
                    Number((step0 / 1690000).toFixed(5)) +
                    Number(((step1 + step2) / 1270000).toFixed(5));

                  return (
                    <article
                      key={item._id}
                      className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-300/40 shadow-lg"
                    >
                      <header className="border-b border-base-content/10 bg-base-100/30 px-4 py-3 sm:px-5">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug sm:text-lg">
                          {item?.title || "Workflow"}
                        </h3>
                        {item.createdAt && (
                          <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
                            {format(new Date(item.createdAt), "h:mm a")}
                          </p>
                        )}
                      </header>

                      <div className="flex flex-col lg:flex-row">
                        <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-5">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                              Input
                            </span>
                            <p className="break-words text-sm leading-relaxed sm:text-base">
                              {getWorkflowInput(item)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                              Tools
                            </span>
                            <p className="break-words text-sm capitalize leading-relaxed sm:text-base">
                              {toolsUsed.length ? toolsUsed.join(", ") : "None"}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                              Output
                            </span>
                            <p className="max-h-[min(280px,40vh)] overflow-y-auto break-words whitespace-pre-wrap text-sm leading-relaxed sm:text-base lg:max-h-none">
                              {item?.finalResponse || "No response"}
                            </p>
                          </div>
                        </div>

                        <aside className="grid shrink-0 grid-cols-2 gap-3 border-t border-base-content/10 bg-base-100/20 p-4 sm:gap-4 lg:w-56 lg:grid-cols-1 lg:border-l lg:border-t-0 xl:w-64">
                          <div className="flex flex-col items-center justify-center rounded-xl bg-base-100/40 px-3 py-4 text-center">
                            <span className="text-xs font-medium text-base-content/55">
                              Model
                            </span>
                            <span className="mt-1 text-sm font-semibold sm:text-base">
                              Groq
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center rounded-xl bg-base-100/40 px-3 py-4 text-center">
                            <span className="text-xs font-medium text-base-content/55">
                              Tokens
                            </span>
                            <span className="mt-1 text-sm font-semibold sm:text-base">
                              {item?.totalTokenUsage?.totalTokens ?? 0}
                            </span>
                          </div>
                          <div className="col-span-2 flex flex-col items-center justify-center rounded-xl bg-base-100/40 px-3 py-4 text-center lg:col-span-1">
                            <span className="text-xs font-medium text-base-content/55">
                              Est. cost
                            </span>
                            <span className="mt-1 text-sm font-semibold sm:text-base">
                              ${cost.toFixed(5)}
                            </span>
                          </div>
                        </aside>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
