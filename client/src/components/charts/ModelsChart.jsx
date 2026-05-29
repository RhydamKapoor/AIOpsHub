import {
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const data = [
  { name: "GPT-4", value: 55, color: "var(--color-base-content)" },
  { name: "Claude 3.5 Sonnet", value: 25, color: "var(--color-secondary-content)" },
  { name: "Grok", value: 10, color: "var(--color-neutral-content)" },
  { name: "Gemini", value: 5, color: "var(--color-info-content)" },
  { name: "Others", value: 5, color: "var(--color-warning)" },
];

export default function ModelsChart() {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <Card className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-base-300/40 sm:flex-row">
      <CardHeader className="w-full shrink-0 p-4 pb-0 sm:w-2/5 sm:p-6 sm:pb-0 lg:w-1/3">
        <CardTitle className="text-base sm:text-lg">Model Distribution</CardTitle>
        <CardDescription className="text-xs sm:text-sm">April 2025</CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-[200px] w-full min-w-0 flex-1 items-center justify-center p-4 pt-3 sm:p-6 sm:pt-4">
        <div className="h-[180px] w-full max-w-[280px] sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    const { cx, cy } = viewBox;
                    return (
                      <>
                        <text
                          x={cx}
                          y={cy - 8}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-base-content text-xl font-bold sm:text-2xl lg:text-3xl"
                        >
                          {total.toLocaleString()}%
                        </text>
                        <text
                          x={cx}
                          y={cy + 16}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-primary text-[10px] sm:text-xs"
                        >
                          Distribution
                        </text>
                      </>
                    );
                  }}
                />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value, name) => [`${value}%`, `${name}`]}
                cursor={{ fill: "rgba(255,255,255,0.1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
