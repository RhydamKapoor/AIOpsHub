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

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#3b82f6",
  },
};

export function WorkflowUsageBar() {
  return (
    <Card className="w-full bg-[var(--color-base-300)]/40">
      <div className="flex flex-col w-full">
        <CardHeader>
          <CardTitle>Workflow Usage</CardTitle>
          <CardDescription>April 2025</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[170px] overflow-hidden">
          <div className="w-full h-full">
            <ChartContainer config={chartConfig}>
              <BarChart
                width={700}
                height={180}
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={0}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  tick={{ fill: "var(--color-base-content)" }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={0} 
                  tick={{ fill: "var(--color-base-content)" }}/>
                <ChartTooltip
                  className="bg-[var(--color-base-300)]/40"
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      nameKey="desktop"
                      hideLabel="true"
                      formatter={(value) => `${value} visitors`}
                    />
                  }
                />
                <Bar
                  dataKey="desktop"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
