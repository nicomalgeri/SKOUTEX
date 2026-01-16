"use client";

import { useEffect, useMemo, useState } from "react";

type KpiRingProps = {
  title: string;
  value: number | null;
  size?: number;
};

function getRingColor(value: number | null): string {
  if (value === null) return "stroke-gray-300";
  if (value >= 90) return "stroke-emerald-500";
  if (value >= 75) return "stroke-indigo-500";
  if (value >= 50) return "stroke-blue-500";
  return "stroke-gray-300";
}

export default function KpiRing({ title, value, size = 56 }: KpiRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const [progress, setProgress] = useState<number>(value ?? 0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (value === null) {
      setProgress(0);
      return;
    }

    if (reducedMotion) {
      setProgress(value);
      return;
    }

    setProgress(0);
    const frame = window.requestAnimationFrame(() => {
      setProgress(value);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [value, reducedMotion]);

  const displayValue = value === null ? "—" : Math.round(value).toString();
  const dashOffset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${title}: ${displayValue}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`${getRingColor(value)} ${
            reducedMotion ? "" : "transition-all duration-[900ms]"
          }`}
          strokeDasharray={circumference}
          strokeDashoffset={value === null ? circumference : dashOffset}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-gray-700 text-[12px] font-semibold"
        >
          {displayValue}
        </text>
      </svg>
      <div className="text-[11px] font-medium text-gray-500">{title}</div>
    </div>
  );
}
