/**
 * Lazy-loaded Chart Components
 * Reduces initial bundle size by loading charts only when needed
 */

import { lazy, Suspense, ComponentType } from "react";
import { Loader2 } from "lucide-react";

// Lazy load all chart components
export const RadarChart = lazy(() => import("./RadarChart"));
export const BarChart = lazy(() => import("./BarChart"));
export const LineChart = lazy(() => import("./LineChart"));
export const DistributionChart = lazy(() => import("./DistributionChart"));

/**
 * Chart Loading Skeleton
 * Shows while chart component is loading
 */
function ChartSkeleton({ height = "400px" }: { height?: string }) {
  return (
    <div
      className="flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        <p className="text-sm text-gray-500">Loading chart...</p>
      </div>
    </div>
  );
}

/**
 * Higher-order component to wrap charts with Suspense
 */
export function withChartSuspense<P extends object>(
  ChartComponent: ComponentType<P>,
  height?: string
) {
  return function WrappedChart(props: P) {
    return (
      <Suspense fallback={<ChartSkeleton height={height} />}>
        <ChartComponent {...props} />
      </Suspense>
    );
  };
}

// Export pre-wrapped charts for convenience
export const LazyRadarChart = withChartSuspense(RadarChart);
export const LazyBarChart = withChartSuspense(BarChart);
export const LazyLineChart = withChartSuspense(LineChart);
export const LazyDistributionChart = withChartSuspense(DistributionChart);
