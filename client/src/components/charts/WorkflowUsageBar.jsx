import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#3b82f6",
  },
};

export function WorkflowUsageBar({ workflows }) {
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const key = date.toISOString().split("T")[0];
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    days.push({ key, day });
  }

  const counts = {};
  days.forEach(({ key }) => (counts[key] = 0));

  workflows.forEach((workflow) => {
    const date = new Date(workflow.createdAt);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().split("T")[0];
    if (Object.hasOwn(counts, key)) {
      counts[key]++;
    }
  });

  const chartData = days.map(({ key, day }) => ({
    day,
    desktop: counts[key],
  }));

  function calculateGrowth(workflows) {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    const twoWeeksAgo = new Date(today);

    oneWeekAgo.setDate(today.getDate() - 7);
    twoWeeksAgo.setDate(today.getDate() - 14);

    let thisWeek = 0;
    let lastWeek = 0;

    workflows.forEach((workflow) => {
      const created = new Date(workflow.createdAt);
      if (created >= oneWeekAgo && created < today) thisWeek++;
      else if (created >= twoWeeksAgo && created < oneWeekAgo) lastWeek++;
    });

    const growth =
      lastWeek === 0
        ? thisWeek > 0
          ? 100
          : 0
        : ((thisWeek - lastWeek) / lastWeek) * 100;

    return growth;
  }

  const growthPercentage = calculateGrowth(workflows);

  return (
    <Card className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-base-300/40 lg:flex-row">
      <div className="flex w-full flex-col justify-between gap-4 p-4 sm:p-6 lg:w-[34%] lg:shrink-0 xl:w-[30%]">
        <CardHeader className="p-0">
          <CardTitle className="text-base sm:text-lg">Workflow Usage</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            April 2025
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 p-0 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 font-medium">
            {growthPercentage >= 0 ? (
              <>
                Trending up by {growthPercentage.toFixed(1)}%
                <TrendingUp className="h-4 w-4 shrink-0 text-green-500" />
              </>
            ) : (
              <>
                Dropped by {Math.abs(growthPercentage).toFixed(1)}%
                <TrendingUp className="h-4 w-4 shrink-0 rotate-180 text-red-500" />
              </>
            )}
          </div>
          <div className="leading-snug text-muted-foreground">
            Total Workflows: {workflows.length.toLocaleString("en-IN")}
          </div>
        </CardContent>
      </div>

      <div className="min-w-0 flex-1 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-0 lg:pr-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[180px]! w-full min-w-0 sm:h-[200px]! lg:h-[220px]!"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={6}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 11 }}
                width={28}
              />
              <ChartTooltip
                className="bg-base-300/40"
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey="desktop"
                    hideLabel="true"
                    formatter={(value) => `${value} Workflows`}
                  />
                }
              />
              <Bar
                dataKey="desktop"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
}
