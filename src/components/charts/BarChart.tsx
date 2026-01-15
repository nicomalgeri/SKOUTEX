"use client";

import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BarChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  horizontal?: boolean;
  showGrid?: boolean;
  barColor?: string;
}

export default function BarChart({
  data,
  horizontal = false,
  showGrid = true,
  barColor = "#0031FF",
}: BarChartProps) {
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={data} layout="vertical" margin={{ left: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />}
          <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} axisLine={{ stroke: "#333" }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#888", fontSize: 11 }}
            axisLine={{ stroke: "#333" }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #222",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || barColor} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBar data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />}
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
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || barColor} />
          ))}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  );
}
