"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatAUDFromDollars } from "@/lib/utils";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fill: "#A89F94", fontSize: 12 }}
          axisLine={{ stroke: "#2E2E2E" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#A89F94", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 0 }}
          labelStyle={{ color: "#F5F0E8" }}
          formatter={(value) => [formatAUDFromDollars(value as number), "Revenue"] as [string, string]}
        />
        <Bar dataKey="revenue" fill="#C9A227" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
