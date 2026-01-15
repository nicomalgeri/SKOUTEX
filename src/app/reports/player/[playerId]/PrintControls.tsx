"use client";

export function PrintControls({
  playerId,
  isDense,
}: {
  playerId: string;
  isDense: boolean;
}) {
  return (
    <div className="no-print border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="mx-auto max-w-4xl flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {isDense ? "Dense Report" : "Quick Report"}
          </span>{" "}
          • Use Ctrl+P (Cmd+P) to print or save as PDF
        </div>
        <div className="flex gap-2">
          {!isDense && (
            <a
              href={`/reports/player/${playerId}?depth=dense`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Switch to Dense
            </a>
          )}
          {isDense && (
            <a
              href={`/reports/player/${playerId}?depth=quick`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Switch to Quick
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
