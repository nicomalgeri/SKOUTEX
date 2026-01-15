"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DistributionChartProps {
  data: {
    x: number;
    before: number;
    after: number;
  }[];
  beforeLabel?: string;
  afterLabel?: string;
  meanBefore?: number;
  meanAfter?: number;
}

export default function DistributionChart({
  data,
  beforeLabel = "Without Player",
  afterLabel = "With Player",
  meanBefore,
  meanAfter,
}: DistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <defs>
          <linearGradient id="beforeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="afterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C896" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis
          dataKey="x"
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={{ stroke: "#333" }}
          label={{ value: "Points", position: "bottom", fill: "#888", fontSize: 11 }}
        />
        <YAxis
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={{ stroke: "#333" }}
          label={{ value: "Probability", angle: -90, position: "left", fill: "#888", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid #222",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          itemStyle={{ color: "#fff" }}
        />
        <Area
          type="monotone"
          dataKey="before"
          name={beforeLabel}
          stroke="#FF6B35"
          strokeWidth={2}
          fill="url(#beforeGradient)"
        />
        <Area
          type="monotone"
          dataKey="after"
          name={afterLabel}
          stroke="#00C896"
          strokeWidth={2}
          fill="url(#afterGradient)"
        />
        {meanBefore && (
          <ReferenceLine
            x={meanBefore}
            stroke="#FF6B35"
            strokeDasharray="5 5"
            label={{ value: `Avg: ${meanBefore}`, fill: "#FF6B35", fontSize: 10 }}
          />
        )}
        {meanAfter && (
          <ReferenceLine
            x={meanAfter}
            stroke="#00C896"
            strokeDasharray="5 5"
            label={{ value: `Avg: ${meanAfter}`, fill: "#00C896", fontSize: 10 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
