import { TrendingUp } from "lucide-react";
import { CartesianGrid, Dot, Line, LineChart, XAxis, YAxis } from "recharts";
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
    console.log(dayMatch);
    console.log(data?.weeklyTokenUsage);

    return {
      month: weekday,
      value: dayMatch ? dayMatch.totalTokenUsage : 0,
    };
  });
  // Sum of usage over the week
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
    <Card className="w-full bg-[var(--color-base-300)]/40 ">
      <div className="flex">
        <div className="flex flex-col justify-between w-1/2 pl-4 pb-4">
          <div className="flex flex-col gap-y-3">
            <CardHeader className="gap-y-0.5 w-full p-0">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <h1 className="text-5xl font-bold">
              {data?.totalTokenUsage.toLocaleString("en-IN")}
            </h1>
          </div>
          <div className="flex">
            <CardFooter className="flex-col items-start gap-y-2 text-sm p-0 ">
              <div className="flex gap-2 font-medium leading-none items-center">
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
              <div className="leading-none text-muted-foreground">
                Estimated token cost $
                {data?.totalTokenCost.toLocaleString("en-IN")}
              </div>
            </CardFooter>
          </div>
        </div>
        <CardContent className=" p-0">
          <ChartContainer config={chartConfig}>
            <LineChart
              width={500}
              height={200}
              data={chartData}
              margin={{
                right: 24,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                className="bg-[var(--color-base-300)]/60"
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey={tooltipName}
                    hideLabel="true"
                    formatter={(value) => `${value.toLocaleString("en-IN")} ${tooltipName}`}
                  />
                }
              />
              <Line
                className="h-full"
                dataKey="value"
                type="monotone"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy } = props;
                  return (
                    <Dot
                      key={uuid()}
                      r={4}
                      cx={cx?.toString()}
                      cy={cy?.toString()}
                      fill="#3b82f6"
                      stroke="#3b82f6"
                    />
                  );
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </div>
    </Card>
  );
}
