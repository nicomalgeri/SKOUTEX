"use client";

import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LineChartProps {
  data: {
    name: string;
    [key: string]: string | number;
  }[];
  lines: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  showGrid?: boolean;
  showLegend?: boolean;
}

export default function LineChart({
  data,
  lines,
  showGrid = true,
  showLegend = true,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLine data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#222" />}
        <XAxis
          dataKey="name"
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={{ stroke: "#333" }}
        />
        <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={{ stroke: "#333" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid #222",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          itemStyle={{ color: "#fff" }}
        />
        {showLegend && (
          <Legend wrapperStyle={{ fontSize: "12px", color: "#888" }} />
        )}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  );
}
