"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import {
  TransferWindow,
  TransferWindowStatus,
} from "@/lib/transfer-windows/config";
import {
  calculateWindowStatus,
  formatDaysRemaining,
  formatDaysUntilOpen,
  getUrgencyLevel,
  getUrgencyColor,
} from "@/lib/transfer-windows/calculator";

interface TransferWindowBadgeProps {
  window: TransferWindow | null;
  compact?: boolean;
  showIcon?: boolean;
}

export function TransferWindowBadge({
  window,
  compact = false,
  showIcon = true,
}: TransferWindowBadgeProps) {
  const [status, setStatus] = useState<TransferWindowStatus>(() =>
    calculateWindowStatus(window)
  );

  // Recalculate status every minute to keep it up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(calculateWindowStatus(window));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [window]);

  if (!window || status.isClosed) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-lg border border-gray-200">
        {showIcon && <Calendar className="w-4 h-4" />}
        <span>Transfer window closed</span>
      </div>
    );
  }

  if (status.isOpen && status.daysRemaining !== null) {
    const urgency = getUrgencyLevel(status.daysRemaining);
    const colorClass = getUrgencyColor(urgency);

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border ${colorClass}`}
      >
        {showIcon && (
          <>
            {urgency === "critical" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </>
        )}
        <span className="font-medium">
          {compact
            ? `${status.daysRemaining}d`
            : formatDaysRemaining(status.daysRemaining)}
        </span>
        {!compact && (
          <span className="text-xs opacity-75">
            • {window.window_type} window
          </span>
        )}
      </div>
    );
  }

  if (status.isUpcoming && status.daysUntilOpen !== null) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
        {showIcon && <Calendar className="w-4 h-4" />}
        <span>
          {compact
            ? `Opens in ${status.daysUntilOpen}d`
            : formatDaysUntilOpen(status.daysUntilOpen)}
        </span>
      </div>
    );
  }

  return null;
}

/**
 * Transfer window card with full details
 */
export function TransferWindowCard({
  window,
}: {
  window: TransferWindow | null;
}) {
  const [status, setStatus] = useState<TransferWindowStatus>(() =>
    calculateWindowStatus(window)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(calculateWindowStatus(window));
    }, 60000);

    return () => clearInterval(interval);
  }, [window]);

  if (!window) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-gray-500">
          <Calendar className="w-5 h-5" />
          <p className="text-sm">No transfer window information available</p>
        </div>
      </div>
    );
  }

  const startDate = new Date(window.start_date);
  const endDate = new Date(window.end_date);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {window.league}
          </h3>
          <p className="text-sm text-gray-500 capitalize">
            {window.window_type} Transfer Window {window.season}
          </p>
        </div>
        <TransferWindowBadge window={window} />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Opens</p>
          <p className="text-sm font-medium text-gray-900">
            {startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Closes</p>
          <p className="text-sm font-medium text-gray-900">
            {endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Status message */}
      {status.isOpen && status.daysRemaining !== null && (
        <div
          className={`p-3 rounded-lg ${
            status.daysRemaining <= 3
              ? "bg-red-50 text-red-700"
              : status.daysRemaining <= 7
              ? "bg-amber-50 text-amber-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          <p className="text-sm font-medium">
            {status.daysRemaining <= 3
              ? "⚠️ Transfer window closing soon!"
              : status.daysRemaining <= 7
              ? "⏰ Less than a week remaining"
              : "✅ Transfer window is open"}
          </p>
        </div>
      )}

      {status.isClosed && (
        <div className="p-3 rounded-lg bg-gray-50 text-gray-600">
          <p className="text-sm">
            This transfer window has closed. Check back for the next window.
          </p>
        </div>
      )}
    </div>
  );
}
