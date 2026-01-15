"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: {
    subject: string;
    value: number;
    fullMark: number;
    compareValue?: number;
  }[];
  compareLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function RadarChart({
  data,
  compareLabel,
  primaryColor = "#0031FF",
  secondaryColor = "#FF6B35",
}: RadarChartProps) {
  const hasComparison = data.some((d) => d.compareValue !== undefined);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#888", fontSize: 11 }}
          tickLine={{ stroke: "#444" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: "#666", fontSize: 10 }}
          tickCount={5}
          axisLine={{ stroke: "#333" }}
        />
        <Radar
          name="Player"
          dataKey="value"
          stroke={primaryColor}
          fill={primaryColor}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {hasComparison && (
          <Radar
            name={compareLabel || "Comparison"}
            dataKey="compareValue"
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid #222",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          itemStyle={{ color: "#fff" }}
        />
        {hasComparison && (
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#888" }}
          />
        )}
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
