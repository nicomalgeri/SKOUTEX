/**
 * Radar Chart Component
 * Displays player KPIs in a circular radar chart format
 */

"use client";

import { useEffect, useRef, useState } from "react";

export interface RadarChartData {
  label: string;
  value: number; // 0-10 scale
  percentile?: number; // Original percentile for tooltip
}

interface RadarChartProps {
  data: RadarChartData[];
  size?: number;
  showLabels?: boolean;
  showBenchmark?: boolean;
  benchmarkData?: number[]; // League average values
  animate?: boolean;
  className?: string;
}

export function RadarChart({
  data,
  size = 120,
  showLabels = true,
  showBenchmark = false,
  benchmarkData,
  animate = true,
  className = "",
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;

    const startTime = Date.now();
    const duration = 900;

    const animateChart = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animateChart);
      }
    };

    requestAnimationFrame(animateChart);
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const angleStep = (Math.PI * 2) / data.length;

    // Draw background circles
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw radial axes
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    data.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const progress = animationProgress;
      const x = centerX + Math.cos(angle) * radius * progress;
      const y = centerY + Math.sin(angle) * radius * progress;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw benchmark data (league average) if provided
    if (showBenchmark && benchmarkData && benchmarkData.length === data.length) {
      ctx.strokeStyle = "#D1D5DB";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      benchmarkData.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (value / 10) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw filled area
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(0, 49, 255, 0.4)");
    gradient.addColorStop(1, "rgba(76, 111, 255, 0.2)");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#0031FF";
    ctx.lineWidth = 2;

    ctx.beginPath();
    data.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (item.value / 10) * radius * animationProgress;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw data points
    data.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (item.value / 10) * radius * animationProgress;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Highlight hovered axis
      if (hoveredAxis === index) {
        ctx.fillStyle = "#0031FF";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw white inner circle
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#0031FF";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [data, size, showBenchmark, benchmarkData, animationProgress, hoveredAxis]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const angle = Math.atan2(y, x) + Math.PI / 2;
    const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
    const angleStep = (Math.PI * 2) / data.length;
    const axisIndex = Math.round(normalizedAngle / angleStep) % data.length;

    // Check if mouse is within reasonable distance of an axis
    const distance = Math.sqrt(x * x + y * y);
    const radius = size / 2 - 20;
    if (distance < radius + 10) {
      setHoveredAxis(axisIndex);
    } else {
      setHoveredAxis(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredAxis(null);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="block" />

      {/* Labels */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none">
          {data.map((item, index) => {
            const angleStep = (Math.PI * 2) / data.length;
            const angle = index * angleStep - Math.PI / 2;
            const labelDistance = size / 2 - 8;
            const x = size / 2 + Math.cos(angle) * labelDistance;
            const y = size / 2 + Math.sin(angle) * labelDistance;

            // Calculate label position to avoid overflow
            let textAlign: "left" | "center" | "right" = "center";
            let transform = "translate(-50%, -50%)";

            if (x < size * 0.3) {
              textAlign = "right";
              transform = "translate(-100%, -50%)";
            } else if (x > size * 0.7) {
              textAlign = "left";
              transform = "translate(0%, -50%)";
            }

            return (
              <div
                key={index}
                className={`absolute text-[10px] font-medium whitespace-nowrap transition-colors ${
                  hoveredAxis === index ? "text-blue-600" : "text-gray-600"
                }`}
                style={{
                  left: x,
                  top: y,
                  transform,
                  textAlign,
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {hoveredAxis !== null && data[hoveredAxis] && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
          <div className="font-semibold">{data[hoveredAxis].label}</div>
          <div className="text-gray-300">
            {data[hoveredAxis].percentile
              ? `${Math.round(data[hoveredAxis].percentile!)}th percentile`
              : `${data[hoveredAxis].value.toFixed(1)}/10`}
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
}
