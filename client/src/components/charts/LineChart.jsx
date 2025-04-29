import { TrendingUp } from "lucide-react"
import { CartesianGrid, Dot, Line, LineChart, XAxis, YAxis } from "recharts"
import { v4 as uuid } from 'uuid';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Mon", visitors: 275 },
  { month: "Tue", visitors: 200 },
  { month: "Wed", visitors: 187 },
  { month: "Thu", visitors: 173 },
  { month: "Fri", visitors: 90 },
  { month: "Sat", visitors: 150 },
  { month: "Sun", visitors: 150 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "#3b82f6",
  }
}

export function LineChartComp({title, description, value, description2, tooltipName}) {
  return (
    <Card className="w-full bg-[var(--color-base-300)]/40 ">
      <div className="flex">
        <div className="flex flex-col justify-between w-full pl-4 pb-4">
          <div className="flex flex-col gap-y-3">
            <CardHeader className="gap-y-0.5 w-full p-0">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <h1 className="text-5xl font-bold">{value}</h1>
          </div>
          <div className="flex">
            <CardFooter className="flex-col items-start gap-y-2 text-sm p-0 ">
              <div className="flex gap-2 font-medium leading-none items-center">
                Trending up by 5.2% <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                {description2}
              </div>
            </CardFooter>
          </div>
        </div>
        <CardContent className="h-fit p-0">
          <ChartContainer config={chartConfig}>
            <LineChart
              width={350}
              height={200}
              data={chartData}
              margin={{
                top: 24,
                left: 24,
                right: 24,
                bottom: 24,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                className="bg-[var(--color-base-300)]/60"
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey={tooltipName}
                    hideLabel="true"
                    formatter={(value) => `${value} ${tooltipName}`}
                  />
                }
              />
              <Line
                className="h-full"
                dataKey="visitors"
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
  )
}
