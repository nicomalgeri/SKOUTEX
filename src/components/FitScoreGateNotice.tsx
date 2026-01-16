"use client";

import type { FitScoreGateResult } from "@/lib/club-context/fitScoreGate";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function FitScoreGateNotice({
  gate,
  variant = "default",
}: {
  gate: FitScoreGateResult;
  variant?: "default" | "compact";
}) {
  if (gate.unlocked) return null;

  // Compact variant - just the message, no field details
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Complete profile to see fit score</p>
            <Link
              href="/dashboard/club"
              className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Complete your club profile →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - shows field details
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Complete profile to see fit score</p>

      {gate.missing_required_fields.length > 0 && (
        <div className="mt-3">
          <p className="font-medium">Missing required fields:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {gate.missing_required_fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {gate.blocking_missing_fields.length > 0 && (
        <div className="mt-3">
          <p className="font-medium">Blocking fields:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {gate.blocking_missing_fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
