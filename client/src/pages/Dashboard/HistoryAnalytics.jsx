import axiosInstance from "@/utils/axiosConfig";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";

export default function HistoryAnalytics() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [visibleDateCount, setVisibleDateCount] = useState(1);

  const userHistory = history.filter(item =>
    user.role === "Admin" ? true : item.user === user._id
  );
  
  // Get sorted and unique dates
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
      // All items shown, reveal next date
      setVisibleDateCount((prev) => prev + 1);
    }

    setVisibleCounts((prev) => ({
      ...prev,
      [date]: newCount,
    }));
  };

  const fetchHistory = async () => {
    const response = await axiosInstance.get(`/allWorkflows`);
    setHistory(response.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col p-3 gap-y-10 relative">
      {sortedDates.slice(0, visibleDateCount).map((date, index) => {
        const itemsForDate = history
          .filter((item) => {
            const itemDate = item.createdAt
              ? format(new Date(item.createdAt), "dd MMM yyyy")
              : "";
            return (
              itemDate === date &&
              (user.role === "Admin" || item.user === user._id)
            );
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const visibleItems = itemsForDate.slice(0, visibleCounts[date] || 10);
        return (
          <div className="flex flex-col gap-y-8 h-full" key={index}>
            <div
              key={index}
              className="text-xl font-semibold sticky top-0 bg-[var(--color-base-300)]/70 backdrop-blur-3xl p-3 rounded-lg flex justify-between items-center"
            >
              <h1>{date}</h1>
              <button
                className="text-sm cursor-pointer"
                onClick={() => handleShowMore(date, itemsForDate.length)}
              >
                Show more...
              </button>
            </div>
            <div className="flex flex-col gap-y-9 overflow-y-auto h-full">
              {visibleItems
                .filter((item) => {
                  const itemDate = item.createdAt
                    ? format(new Date(item.createdAt), "dd MMM yyyy")
                    : "";
                  return (
                    itemDate === date &&
                    (user.role === "Admin" || item.user === user._id)
                  );
                })
                .map((item, index) => {
                  const step0 = item?.steps[0]?.tokenUsage?.totalTokens || 0;
                  const step1 = item?.steps[1]?.tokenUsage?.totalTokens || 0;
                  const step2 = item?.steps[2]?.tokenUsage?.totalTokens || 0;

                  const cost =
                    Number((step0 / 1690000).toFixed(5)) +
                    Number(((step1 + step2) / 1270000).toFixed(5));
                  return (
                    <div
                      key={index}
                      className="flex flex-col shadow-lg rounded-lg min-h-[300px] max-h-[600px] "
                    >
                      <div className="flex justify-between p-3 bg-[var(--color-base-300)]/40 rounded-xl min-h-[300px]">
                        <div className="flex flex-col gap-x-4 w-2/3 rounded-xl gap-y-3">
                          <h1 className="font-semibold text-center text-2xl">
                            Workflow
                          </h1>
                          <div className="flex flex-col">
                            <ul className="flex flex-col gap-y-4">
                              <li className="flex">
                                <span className="font-semibold w-16">
                                  Input:
                                </span>{" "}
                                <p className="w-[calc(100%-140px)]">
                                  {item?.steps[0]?.input}
                                </p>
                              </li>
                              <li className="flex">
                                (Selecting agent... &nbsp;{" "}
                                <span className="font-semibold w-16">
                                  Tokens:
                                </span>{" "}
                                {item?.steps[0]?.tokenUsage?.totalTokens})
                              </li>
                              <li className="capitalize flex">
                                <span className="font-semibold w-16">
                                  Tools:
                                </span>{" "}
                                <p className="w-[calc(100%-140px)]">
                                  {item?.steps[0]?.toolUsed
                                    .map((tool) => tool)
                                    .join(", ") || `No tools used`}
                                </p>
                              </li>
                              {item?.steps[1]?.tokenUsage?.totalTokens && (
                                <li className="flex">
                                  (Using tool... &nbsp;{" "}
                                  <span className="font-semibold w-16">
                                    Tokens:
                                  </span>{" "}
                                  {item?.steps[1]?.tokenUsage?.totalTokens})
                                </li>
                              )}
                              {item?.steps[2]?.tokenUsage?.totalTokens && (
                                <li className="flex">
                                  (Merging outputs... &nbsp;{" "}
                                  <span className="font-semibold w-16">
                                    Tokens:
                                  </span>{" "}
                                  {item?.steps[2]?.tokenUsage?.totalTokens})
                                </li>
                              )}
                              <li className="flex">
                                <span className="font-semibold w-16">
                                  Output:
                                </span>{" "}
                                <p className="w-[calc(100%-140px)]">
                                  {item?.finalResponse || `No response`}
                                </p>
                              </li>
                            </ul>
                            {/* <p>{`1. ${item?.steps[0]?.input}  -> Tokens: ${item?.steps[0]?.tokenUsage?.totalTokens}`} {item?.steps[0]?.output && `-> Output: ${item?.steps[0]?.output}`}</p>
                      {item?.steps[1] && <p>{`${item?.steps[1]?.input}  -> Tokens: ${item?.steps[1]?.tokenUsage?.totalTokens} -> Output: ${item?.steps[1]?.output}`}</p>} */}
                          </div>
                        </div>

                        <div className="flex flex-col w-1/3 shadow-lg rounded-xl">
                          <div className="flex flex-col gap-y-4 items-center justify-center h-full">
                            <h1 className="font-semibold text-4xl">Groq</h1>
                            <div className="flex gap-x-7 items-center">
                              <div className="flex flex-col items-center">
                                <h1 className="font-semibold text-2xl">
                                  Total Token Usage
                                </h1>
                                <p className="text-[var(--color-base-content)]/70 text-lg">
                                  {item?.totalTokenUsage?.totalTokens} Tokens
                                </p>
                              </div>
                              <div className="flex flex-col items-center">
                                <h1 className="font-semibold text-2xl">
                                  Total Token Cost
                                </h1>
                                {/* <p className="text-[var(--color-base-content)]/70 text-lg">${(((item?.steps[0]?.tokenUsage?.totalTokens + (item?.steps[1]?.tokenUsage?.totalTokens || 0 ) + (item?.steps[1]?.tokenUsage?.totalTokens || 0))/1690000) * 1).toFixed(5)}</p> */}
                                <p className="text-[var(--color-base-content)]/70 text-lg">
                                  ${cost.toFixed(5)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
