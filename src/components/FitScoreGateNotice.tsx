"use client";

import type { FitScoreGateResult } from "@/lib/club-context/fitScoreGate";

export default function FitScoreGateNotice({
  gate,
}: {
  gate: FitScoreGateResult;
}) {
  if (gate.unlocked) return null;

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
