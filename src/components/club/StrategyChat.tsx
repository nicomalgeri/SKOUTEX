"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface ExtractedStrategy {
  priority_positions?: string[];
  age_preference?: {
    min: number;
    max: number;
    ideal: number;
  };
  experience_level?: string;
  transfer_budget_eur?: number;
  playing_style?: {
    style?: string;
    pressing_intensity?: string;
  };
  transfer_philosophy?: string;
  risk_appetite?: string;
  physical_profile?: string;
  notes?: string;
}

interface StrategyChatProps {
  onApply: (data: ExtractedStrategy) => void;
  className?: string;
}

export function StrategyChat({ onApply, className = "" }: StrategyChatProps) {
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedStrategy | null>(null);

  const handleAnalyze = async () => {
    if (strategy.trim().length < 10) {
      setError("Please enter at least 10 characters describing your strategy");
      return;
    }

    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const response = await fetch("/api/club/analyze-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: strategy.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze strategy");
      }

      setExtractedData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze strategy");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onApply(extractedData);
      // Clear after applying
      setStrategy("");
      setExtractedData(null);
    }
  };

  const formatValue = (value: string) => {
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#0031FF]" />
        <h3 className="text-lg font-semibold text-[#2C2C2C]">AI Strategy Assistant</h3>
      </div>

      <p className="text-sm text-gray-600">
        Describe your recruitment strategy in plain language, and AI will extract the structured data
        for you.
      </p>

      {/* Textarea */}
      <div>
        <textarea
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder="Example: We need two center-backs and a striker who can press high. Budget around €20M. Want young players with potential, aged 21-25 years old. Prefer technically gifted players who fit a possession-based system."
          rows={5}
          className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] placeholder:text-gray-400 focus:outline-none focus:border-[#0031FF] resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {strategy.length} characters {strategy.length < 10 && "(minimum 10)"}
          </span>
          <span className="text-xs text-gray-400">Powered by GPT-4</span>
        </div>
      </div>

      {/* Analyze Button */}
      {!extractedData && (
        <button
          onClick={handleAnalyze}
          disabled={loading || strategy.trim().length < 10}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0031FF] text-white font-medium hover:bg-[#0028CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Strategy
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Analysis Failed</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={handleAnalyze}
              className="text-sm text-red-700 underline mt-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-900">Strategy Extracted Successfully!</p>
          </div>

          <div className="space-y-3">
            {/* Priority Positions */}
            {extractedData.priority_positions && extractedData.priority_positions.length > 0 && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Priority Positions
                </p>
                <div className="flex flex-wrap gap-2">
                  {extractedData.priority_positions.map((pos) => (
                    <span
                      key={pos}
                      className="px-2.5 py-1 rounded-lg bg-[#0031FF] text-white text-sm font-medium"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Age Preference */}
            {extractedData.age_preference && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Age Range
                </p>
                <p className="text-sm text-[#2C2C2C]">
                  {extractedData.age_preference.min} - {extractedData.age_preference.max} years
                  <span className="text-gray-500"> (ideal: {extractedData.age_preference.ideal})</span>
                </p>
              </div>
            )}

            {/* Transfer Budget */}
            {extractedData.transfer_budget_eur && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Transfer Budget
                </p>
                <p className="text-sm text-[#2C2C2C] font-semibold">
                  €{extractedData.transfer_budget_eur.toLocaleString()}
                </p>
              </div>
            )}

            {/* Experience Level */}
            {extractedData.experience_level && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Experience Level
                </p>
                <p className="text-sm text-[#2C2C2C]">{extractedData.experience_level}</p>
              </div>
            )}

            {/* Playing Style */}
            {extractedData.playing_style && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Playing Style
                </p>
                <div className="space-y-1 text-sm text-[#2C2C2C]">
                  {extractedData.playing_style.style && (
                    <p>Style: {formatValue(extractedData.playing_style.style)}</p>
                  )}
                  {extractedData.playing_style.pressing_intensity && (
                    <p>Pressing: {formatValue(extractedData.playing_style.pressing_intensity)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Transfer Philosophy */}
            {extractedData.transfer_philosophy && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Transfer Philosophy
                </p>
                <p className="text-sm text-[#2C2C2C]">
                  {formatValue(extractedData.transfer_philosophy)}
                </p>
              </div>
            )}

            {/* Risk Appetite */}
            {extractedData.risk_appetite && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Risk Appetite
                </p>
                <p className="text-sm text-[#2C2C2C]">{extractedData.risk_appetite}</p>
              </div>
            )}

            {/* Physical Profile */}
            {extractedData.physical_profile && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Physical Profile
                </p>
                <p className="text-sm text-[#2C2C2C]">{extractedData.physical_profile}</p>
              </div>
            )}

            {/* Notes */}
            {extractedData.notes && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-sm text-gray-600 italic">{extractedData.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply to Form
            </button>
            <button
              onClick={() => {
                setExtractedData(null);
                setStrategy("");
              }}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
