import React from "react";
import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <Card className="flex flex-col w-full bg-[var(--color-base-300)]/40">
      <CardHeader className="items-center pb-0">
        <CardTitle>Model Distribution</CardTitle>
        <CardDescription>April 2025</CardDescription>
      </CardHeader>
      <CardContent className={`flex justify-center`}>
          <PieChart width={300} height={200}  className="">
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
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
                        y={cy - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-[var(--color-base-content)] text-3xl font-bold"
                      >
                        {total.toLocaleString()}%
                      </text>
                      <text
                        x={cx}
                        y={cy + 20}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-[var(--color-primary)] text-sm"
                      >
                        Distribution
                      </text>
                    </>
                  );
                }}
              />
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
              itemStyle={{ color: "#fff" }}
              formatter={(value, name) => [`${value}%`, `${name}`]}
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
            />
          </PieChart>

      </CardContent>
    </Card>
  );
}
