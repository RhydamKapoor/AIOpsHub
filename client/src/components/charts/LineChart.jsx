import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { v4 as uuid } from "uuid";

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

const chartConfig = {
  value: {
    label: "Value",
    color: "#3b82f6",
  },
};

export function LineChartComp({ data, title, description, tooltipName }) {
  const getPast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      days.push(weekday);
    }

    return days;
  };

  const sortedDays = getPast7Days();

  const chartData = sortedDays.map((weekday) => {
    const dayMatch = data?.weeklyTokenUsage?.find((d) => d.weekday === weekday);

    return {
      month: weekday,
      value: dayMatch ? dayMatch.totalTokenUsage : 0,
    };
  });

  const totalFirstHalf = chartData
    ?.slice(0, 3)
    .reduce((sum, d) => sum + d.value, 0);
  const totalSecondHalf = chartData
    ?.slice(-3)
    .reduce((sum, d) => sum + d.value, 0);

  let growthPercentage = 0;
  if (totalFirstHalf > 0) {
    growthPercentage =
      ((totalSecondHalf - totalFirstHalf) / totalFirstHalf) * 100;
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden bg-base-300/40">
      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-stretch">
        <div className="flex w-full min-w-0 flex-col justify-between gap-4 lg:w-2/5 xl:w-[38%]">
          <div className="flex flex-col gap-2 sm:gap-3">
            <CardHeader className="w-full gap-y-0.5 p-0">
              <CardTitle className="text-base sm:text-lg lg:text-xl">
                {title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {description}
              </CardDescription>
            </CardHeader>
            <p className="break-all text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              {data?.totalTokenUsage.toLocaleString("en-IN")}
            </p>
          </div>

          <CardFooter className="flex-col items-start gap-2 p-0 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 font-medium leading-none">
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
              Estimated token cost $
              {data?.totalTokenCost.toLocaleString("en-IN")}
            </div>
          </CardFooter>
        </div>

        <CardContent className="min-w-0 flex-1 p-0">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[180px]! w-full min-w-0 sm:h-[200px]!"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  width={36}
                />
                <ChartTooltip
                  cursor={false}
                  className="bg-base-300/60"
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      nameKey={tooltipName}
                      hideLabel="true"
                      formatter={(value) =>
                        `${value.toLocaleString("en-IN")} ${tooltipName}`
                      }
                    />
                  }
                />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy } = props;
                    return (
                      <Dot
                        key={uuid()}
                        r={3}
                        cx={cx?.toString()}
                        cy={cy?.toString()}
                        fill="#3b82f6"
                        stroke="#3b82f6"
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </div>
    </Card>
  );
}
