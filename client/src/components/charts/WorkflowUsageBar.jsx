import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// const chartData = [
//   { month: "January", desktop: 186 },
//   { month: "February", desktop: 305 },
//   { month: "March", desktop: 237 },
//   { month: "April", desktop: 73 },
//   { month: "May", desktop: 209 },
//   { month: "June", desktop: 214 },
// ];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#3b82f6",
  },
};

export function WorkflowUsageBar({workflows}) {

  const today = new Date();
const days = [];

for (let i = 6; i >= 0; i--) {
  const date = new Date();
  date.setDate(today.getDate() - i);
  date.setHours(0, 0, 0, 0);

  const key = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const day = date.toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue", etc.
  days.push({ key, day });
}

// 2. Count how many workflows per day
const counts = {};
days.forEach(({ key }) => (counts[key] = 0));

workflows.forEach((workflow) => {
  const date = new Date(workflow.createdAt);
  date.setHours(0, 0, 0, 0);
  const key = date.toISOString().split("T")[0];
  if (counts.hasOwnProperty(key)) {
    counts[key]++;
  }
});

// 3. Generate final chartData
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
      lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : ((thisWeek - lastWeek) / lastWeek) * 100;
  
    return growth;
  }
  const growthPercentage = calculateGrowth(workflows);
  return (
    <Card className="w-full flex flex-row h-full bg-[var(--color-base-300)]/40">
      <div className="flex flex-col justify-between w-1/3 h-full">
        <CardHeader>
          <CardTitle>Workflow Usage</CardTitle>
          <CardDescription>April 2025</CardDescription>
        </CardHeader>
        <CardContent className={`h-fit flex flex-col gap-y-2`}>
          <div className="flex gap-2 font-medium  items-center text-sm">
            {growthPercentage >= 0 ? (
              <>
                Trending up by {growthPercentage.toFixed(1)}%
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Dropped by {Math.abs(growthPercentage).toFixed(1)}%
                <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
              </>
            )}
          </div>
          <div className="leading-none text-muted-foreground text-sm">
            Total Workflows: {workflows.length.toLocaleString('en-IN')}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex-col flex justify-end gap-2 text-sm">
        <div className="w-full flex justify-center">
          <ChartContainer config={chartConfig}>
            <BarChart
              width={800}
              height={180}
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={0}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                tick={{ fill: "var(--color-base-content)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={0}
                tick={{ fill: "var(--color-base-content)" }}
              />
              <ChartTooltip
                className="bg-[var(--color-base-300)]/40"
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
                radius={[8, 8, 0, 0]}
                maxBarSize={70}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardFooter>
    </Card>
  );
}
