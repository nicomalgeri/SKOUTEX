"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/dashboard/Header";
import {
  ACADEMY_LEVELS,
  BRAND_VALUE_IMPORTANCE,
  BUILD_UP_STYLES,
  CLUB_TIERS,
  ClubContext,
  EXPERIENCE_LEVELS,
  IMAGE_RIGHTS_POLICIES,
  IMPORTANCE_LEVELS,
  INJURY_TOLERANCE_LEVELS,
  INSTALLMENT_PREFERENCES,
  PHYSICAL_PROFILES,
  PLAYING_STYLES,
  PRESSING_INTENSITIES,
  PROJECT_TIMELINES,
  RELEASE_CLAUSE_POLICIES,
  RISK_APPETITES,
  SEASON_OBJECTIVES,
  SET_PIECE_IMPORTANCE,
  TRANSFER_PHILOSOPHIES,
  WING_PLAY_PREFERENCES,
  YOUTH_INTEGRATION_POLICIES,
  clubContextDefaults,
  mergeClubContext,
} from "@/lib/club/context";
import { useClub, useClubSearch } from "@/lib/hooks/useSportmonks";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Save, Search } from "lucide-react";
import { formatNumber, parseFormattedNumber } from "@/lib/utils/formatters";
import { PositionSelector } from "@/components/club/PositionSelector";
import { StrategyChat } from "@/components/club/StrategyChat";

type StepId =
  | "identity"
  | "finances"
  | "playing_style"
  | "squad"
  | "recruitment"
  | "technical"
  | "strategy";

const steps: { id: StepId; label: string; description: string }[] = [
  { id: "identity", label: "Step A", description: "Club Identity" },
  { id: "finances", label: "Step B", description: "Budget & Finances" },
  { id: "playing_style", label: "Step C", description: "Playing Style" },
  { id: "squad", label: "Step D", description: "Squad Profile" },
  { id: "recruitment", label: "Step E", description: "Recruitment Priorities" },
  { id: "technical", label: "Step F", description: "Technical Requirements" },
  { id: "strategy", label: "Step G", description: "Strategic Goals" },
];

const stepRequiredFields: Record<StepId, string[]> = {
  identity: [
    "identity.club_name",
    "identity.country",
    "identity.league",
    "identity.tier",
  ],
  finances: [
    "finances.transfer_budget_eur",
    "finances.currency",
  ],
  playing_style: [
    "playing_style.formation_primary",
    "playing_style.style",
    "playing_style.build_up",
  ],
  squad: [
    "squad.squad_size_target",
    "squad.foreign_player_limit",
    "squad.homegrown_requirement",
  ],
  recruitment: [
    "recruitment.priority_positions",
    "recruitment.age_preference.min",
    "recruitment.age_preference.max",
    "recruitment.age_preference.ideal",
    "recruitment.experience_level",
  ],
  technical: ["technical.physical_profile"],
  strategy: [
    "strategy.season_objective",
    "strategy.transfer_philosophy",
    "strategy.risk_appetite",
  ],
};

const fieldLabels: Record<string, string> = {
  "identity.club_name": "Club name",
  "identity.country": "Country",
  "identity.league": "League",
  "identity.tier": "Tier",
  "finances.transfer_budget_eur": "Transfer budget (EUR)",
  "finances.currency": "Currency",
  "playing_style.formation_primary": "Primary formation",
  "playing_style.style": "Playing style",
  "playing_style.build_up": "Build up",
  "squad.squad_size_target": "Squad size target",
  "squad.foreign_player_limit": "Foreign player limit",
  "squad.homegrown_requirement": "Homegrown requirement",
  "recruitment.priority_positions": "Priority positions",
  "recruitment.age_preference.min": "Age preference (min)",
  "recruitment.age_preference.max": "Age preference (max)",
  "recruitment.age_preference.ideal": "Age preference (ideal)",
  "recruitment.experience_level": "Experience level",
  "technical.physical_profile": "Physical profile",
  "contracts.contract_length_preference.min_years": "Contract length (min)",
  "contracts.contract_length_preference.max_years": "Contract length (max)",
  "contracts.loan_interest": "Loan interest",
  "contracts.sell_on_clause_ok": "Sell-on clause",
  "strategy.season_objective": "Season objective",
  "strategy.transfer_philosophy": "Transfer philosophy",
  "strategy.risk_appetite": "Risk appetite",
};

const academyLevelLabels: Record<(typeof ACADEMY_LEVELS)[number], string> = {
  none: "None",
  basic: "Basic",
  category_2: "Category 2 (lower)",
  category_1: "Category 1 (higher)",
  elite: "Elite (top)",
};

function getValueByPath(obj: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isValuePresent(path: string, value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") {
    if (path === "finances.transfer_budget_eur") {
      return value > 0;
    }
    return true;
  }
  return true;
}

export default function ClubOnboardingPage() {
  const [context, setContext] = useState<ClubContext>(() =>
    mergeClubContext({ ...clubContextDefaults })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<Record<StepId, boolean>>({
    identity: false,
    finances: false,
    playing_style: false,
    squad: false,
    recruitment: false,
    technical: false,
    strategy: false,
  });

  const [clubSearchQuery, setClubSearchQuery] = useState("");
  const [debouncedClubSearch, setDebouncedClubSearch] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [showClubResults, setShowClubResults] = useState(false);
  const [clubLogoUrl, setClubLogoUrl] = useState<string | null>(null);
  const [clubMeta, setClubMeta] = useState<{ name?: string; logo_url?: string } | null>(
    null
  );

  const { data: clubSearchResponse, loading: clubSearchLoading } = useClubSearch(
    debouncedClubSearch.length >= 2 ? debouncedClubSearch : null,
    "country"
  );
  const { data: clubResponse } = useClub(selectedClubId, "country");

  const currentStep = steps[currentStepIndex];

  const updateField = useCallback(
    (path: string, value: unknown) => {
      setContext((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as ClubContext;
        const keys = path.split(".");
        let pointer: Record<string, unknown> = next as unknown as Record<
          string,
          unknown
        >;
        keys.slice(0, -1).forEach((key) => {
          pointer = pointer[key] as Record<string, unknown>;
        });
        pointer[keys[keys.length - 1]] = value;
        return next;
      });
    },
    [setContext]
  );

  const updateArrayField = useCallback(
    (path: string, raw: string, limit?: number) => {
      const values = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const limited = limit ? values.slice(0, limit) : values;
      updateField(path, limited);
    },
    [updateField]
  );

  const handleApplyStrategy = useCallback(
    (extractedData: {
      priority_positions?: string[];
      age_preference?: { min: number; max: number; ideal: number };
      experience_level?: string;
      transfer_budget_eur?: number;
      playing_style?: { style?: string; pressing_intensity?: string };
      transfer_philosophy?: string;
      risk_appetite?: string;
      physical_profile?: string;
    }) => {
      setContext((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as ClubContext;

        // Apply priority positions
        if (extractedData.priority_positions) {
          next.recruitment.priority_positions = extractedData.priority_positions;
        }

        // Apply age preference
        if (extractedData.age_preference) {
          next.recruitment.age_preference = extractedData.age_preference;
        }

        // Apply experience level
        if (extractedData.experience_level) {
          next.recruitment.experience_level = extractedData.experience_level as any;
        }

        // Apply transfer budget
        if (extractedData.transfer_budget_eur) {
          next.finances.transfer_budget_eur = extractedData.transfer_budget_eur;
        }

        // Apply playing style
        if (extractedData.playing_style?.style) {
          next.playing_style.style = extractedData.playing_style.style as any;
        }
        if (extractedData.playing_style?.pressing_intensity) {
          next.playing_style.pressing_intensity = extractedData.playing_style.pressing_intensity as any;
        }

        // Apply transfer philosophy
        if (extractedData.transfer_philosophy) {
          next.strategy.transfer_philosophy = extractedData.transfer_philosophy as any;
        }

        // Apply risk appetite
        if (extractedData.risk_appetite) {
          next.strategy.risk_appetite = extractedData.risk_appetite as any;
        }

        // Apply physical profile
        if (extractedData.physical_profile) {
          next.technical.physical_profile = extractedData.physical_profile as any;
        }

        return next;
      });

      // Show success message or indicator
      setSaved(false);
      setTimeout(() => {
        handleSave();
      }, 100);
    },
    [handleSave]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedClubSearch(clubSearchQuery), 400);
    return () => clearTimeout(timer);
  }, [clubSearchQuery]);

  useEffect(() => {
    if (debouncedClubSearch.length < 2) {
      setShowClubResults(false);
    }
  }, [debouncedClubSearch]);

  useEffect(() => {
    if (!clubResponse?.data) return;
    const club = clubResponse.data;
    const logoUrl = club.image_path || null;
    setContext((prev) => ({
      ...prev,
      identity: {
        ...prev.identity,
        club_name: club.name || prev.identity.club_name,
        country: club.country?.name || prev.identity.country,
      },
    }));
    setClubLogoUrl(logoUrl);
    const meta: { name?: string; logo_url?: string } = {};
    if (club.name) meta.name = club.name;
    if (logoUrl) meta.logo_url = logoUrl;
    setClubMeta(Object.keys(meta).length > 0 ? meta : null);
    // TODO: Map SportMonks league data to identity.league when available.
  }, [clubResponse]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/club/context");
        if (!response.ok) throw new Error("Failed to load club context");
        const result = await response.json();
        if (active && result?.context) {
          setContext(mergeClubContext(result.context));
          setClubLogoUrl(result?.club?.logo_url ?? null);
        }
      } catch {
        if (active) {
          setContext(mergeClubContext({ ...clubContextDefaults }));
          setClubLogoUrl(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    // TODO: Apply smart defaults based on league tier when rules are defined.
    load();
    return () => {
      active = false;
    };
  }, []);

  const missingCurrentStep = useMemo(() => {
    return stepRequiredFields[currentStep.id].filter((path) => {
      const value = getValueByPath(context as unknown as Record<string, unknown>, path);
      return !isValuePresent(path, value);
    });
  }, [context, currentStep.id]);

  useEffect(() => {
    if (stepErrors.length === 0) return;
    setStepErrors((prev) => prev.filter((path) => missingCurrentStep.includes(path)));
  }, [missingCurrentStep, stepErrors.length]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, unknown> = { context };
      if (clubMeta && (clubMeta.name || clubMeta.logo_url)) {
        payload.club = clubMeta;
      }
      const response = await fetch("/api/club/context", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (missingCurrentStep.length > 0) {
      setStepErrors(missingCurrentStep);
      return;
    }
    setStepErrors([]);
    await handleSave();
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepErrors([]);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderFieldError = (path: string) =>
    stepErrors.includes(path) ? (
      <p className="text-xs text-red-500 mt-1">{fieldLabels[path]} is required.</p>
    ) : null;

  if (loading) {
    return (
      <>
        <Header title="Club Onboarding" subtitle="Set up your club context" />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0031FF]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Club Onboarding" subtitle="Complete Steps A-G to power fit scoring" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setStepErrors([]);
                setCurrentStepIndex(index);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentStepIndex === index
                  ? "bg-[#0031FF] text-white"
                  : "bg-white text-gray-500 hover:text-[#2C2C2C]"
              }`}
            >
              {step.label}: {step.description}
            </button>
          ))}
        </div>

        {stepErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Missing required fields:{" "}
            {stepErrors.map((path) => fieldLabels[path] || path).join(", ")}.
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#2C2C2C]">
                {currentStep.label}: {currentStep.description}
              </h2>
              <p className="text-sm text-gray-500">Core fields first, advanced optional.</p>
            </div>
            <button
              onClick={() =>
                setShowAdvanced((prev) => ({
                  ...prev,
                  [currentStep.id]: !prev[currentStep.id],
                }))
              }
              className="text-sm text-[#0031FF] hover:underline"
            >
              {showAdvanced[currentStep.id] ? "Hide Advanced" : "Show Advanced"}
            </button>
          </div>

          {currentStep.id === "identity" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Search club (SportMonks)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={clubSearchQuery}
                    onChange={(e) => {
                      setClubSearchQuery(e.target.value);
                      setShowClubResults(true);
                    }}
                    placeholder="Start typing club name..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                </div>
                {clubSearchLoading && (
                  <div className="text-xs text-gray-500 mt-2">Searching...</div>
                )}
                {showClubResults &&
                  debouncedClubSearch.length >= 2 &&
                  clubSearchResponse?.data &&
                  clubSearchResponse.data.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-xl max-h-60 overflow-auto">
                    {clubSearchResponse.data.map((club) => (
                      <button
                        key={club.id}
                        onClick={() => {
                          setSelectedClubId(club.id);
                          setClubSearchQuery(club.name || "");
                          setShowClubResults(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        <span className="font-medium">{club.name}</span>
                        {club.country?.name && (
                          <span className="text-gray-500"> - {club.country.name}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {clubLogoUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                      <Image
                        src={clubLogoUrl}
                        alt={`${context.identity.club_name || "Club"} crest`}
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="text-xs text-gray-500">Club crest</span>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={context.identity.club_name}
                    onChange={(e) => updateField("identity.club_name", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("identity.club_name")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={context.identity.country}
                    onChange={(e) => updateField("identity.country", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("identity.country")}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    League
                  </label>
                  <input
                    type="text"
                    value={context.identity.league}
                    onChange={(e) => updateField("identity.league", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("identity.league")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Tier
                  </label>
                  <select
                    value={context.identity.tier}
                    onChange={(e) => updateField("identity.tier", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {CLUB_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("identity.tier")}
                </div>
              </div>

              {showAdvanced.identity && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      value={context.identity.founded_year ?? ""}
                      onChange={(e) =>
                        updateField(
                          "identity.founded_year",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Stadium Capacity
                    </label>
                    <input
                      type="number"
                      value={context.identity.stadium_capacity ?? ""}
                      onChange={(e) =>
                        updateField(
                          "identity.stadium_capacity",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Academy Level
                    </label>
                    <select
                      value={context.identity.academy_level}
                      onChange={(e) => updateField("identity.academy_level", e.target.value)}
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {ACADEMY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {academyLevelLabels[level] || level.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "finances" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Transfer Budget (EUR)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(context.finances.transfer_budget_eur)}
                    onChange={(e) =>
                      updateField("finances.transfer_budget_eur", parseFormattedNumber(e.target.value))
                    }
                    placeholder="10,000,000"
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("finances.transfer_budget_eur")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={context.finances.currency}
                    onChange={(e) => updateField("finances.currency", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("finances.currency")}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAdvanced((prev) => ({ ...prev, finances: !prev.finances }))
                }
                className="flex items-center gap-2 text-sm text-[#0031FF] hover:underline"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showAdvanced.finances ? "rotate-180" : ""
                  }`}
                />
                {showAdvanced.finances ? "Hide" : "Show"} Advanced Options
              </button>

              {showAdvanced.finances && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Weekly Wage Budget (EUR) <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formatNumber(context.finances.wage_budget_weekly_eur)}
                      onChange={(e) =>
                        updateField("finances.wage_budget_weekly_eur", parseFormattedNumber(e.target.value))
                      }
                      placeholder="500,000"
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={context.finances.sell_to_buy}
                      onChange={(e) => updateField("finances.sell_to_buy", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-600">Sell to buy</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Installment Preference
                    </label>
                    <select
                      value={context.finances.installment_preference}
                      onChange={(e) =>
                        updateField("finances.installment_preference", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {INSTALLMENT_PREFERENCES.map((pref) => (
                        <option key={pref} value={pref}>
                          {pref.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Agent Fee Ceiling (%)
                    </label>
                    <input
                      type="number"
                      value={context.finances.agent_fee_ceiling_pct}
                      onChange={(e) =>
                        updateField("finances.agent_fee_ceiling_pct", Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "playing_style" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Primary Formation
                  </label>
                  <input
                    type="text"
                    value={context.playing_style.formation_primary}
                    onChange={(e) =>
                      updateField("playing_style.formation_primary", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("playing_style.formation_primary")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Style
                  </label>
                  <select
                    value={context.playing_style.style}
                    onChange={(e) => updateField("playing_style.style", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {PLAYING_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("playing_style.style")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Build Up
                  </label>
                  <select
                    value={context.playing_style.build_up}
                    onChange={(e) => updateField("playing_style.build_up", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {BUILD_UP_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("playing_style.build_up")}
                </div>
              </div>

              {showAdvanced.playing_style && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Secondary Formation
                    </label>
                    <input
                      type="text"
                      value={context.playing_style.formation_secondary ?? ""}
                      onChange={(e) =>
                        updateField(
                          "playing_style.formation_secondary",
                          e.target.value === "" ? null : e.target.value
                        )
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Pressing Intensity
                    </label>
                    <select
                      value={context.playing_style.pressing_intensity}
                      onChange={(e) =>
                        updateField("playing_style.pressing_intensity", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {PRESSING_INTENSITIES.map((value) => (
                        <option key={value} value={value}>
                          {value.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Wing Play Preference
                    </label>
                    <select
                      value={context.playing_style.wing_play_preference}
                      onChange={(e) =>
                        updateField("playing_style.wing_play_preference", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {WING_PLAY_PREFERENCES.map((value) => (
                        <option key={value} value={value}>
                          {value.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Set Piece Importance
                    </label>
                    <select
                      value={context.playing_style.set_piece_importance}
                      onChange={(e) =>
                        updateField("playing_style.set_piece_importance", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {SET_PIECE_IMPORTANCE.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "squad" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Squad Size Target
                  </label>
                  <input
                    type="number"
                    value={context.squad.squad_size_target}
                    onChange={(e) =>
                      updateField("squad.squad_size_target", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("squad.squad_size_target")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Foreign Player Limit
                  </label>
                  <input
                    type="number"
                    value={context.squad.foreign_player_limit}
                    onChange={(e) =>
                      updateField("squad.foreign_player_limit", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("squad.foreign_player_limit")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Homegrown Requirement
                  </label>
                  <input
                    type="number"
                    value={context.squad.homegrown_requirement}
                    onChange={(e) =>
                      updateField("squad.homegrown_requirement", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("squad.homegrown_requirement")}
                </div>
              </div>

              {showAdvanced.squad && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Current Squad Size
                    </label>
                    <input
                      type="number"
                      value={context.squad.current_squad_size ?? ""}
                      onChange={(e) =>
                        updateField(
                          "squad.current_squad_size",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Average Squad Age
                    </label>
                    <input
                      type="number"
                      value={context.squad.average_squad_age ?? ""}
                      onChange={(e) =>
                        updateField(
                          "squad.average_squad_age",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Youth Integration Policy
                    </label>
                    <select
                      value={context.squad.youth_integration_policy}
                      onChange={(e) =>
                        updateField("squad.youth_integration_policy", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {YOUTH_INTEGRATION_POLICIES.map((value) => (
                        <option key={value} value={value}>
                          {value.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "recruitment" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Priority Positions (max 5)
                  </label>
                  <PositionSelector
                    value={context.recruitment.priority_positions}
                    onChange={(positions) => updateField("recruitment.priority_positions", positions)}
                    maxSelections={5}
                    placeholder="Select up to 5 positions"
                  />
                  {renderFieldError("recruitment.priority_positions")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={context.recruitment.experience_level}
                    onChange={(e) =>
                      updateField("recruitment.experience_level", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {EXPERIENCE_LEVELS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("recruitment.experience_level")}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Age Min
                  </label>
                  <input
                    type="number"
                    value={context.recruitment.age_preference.min}
                    onChange={(e) =>
                      updateField("recruitment.age_preference.min", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("recruitment.age_preference.min")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Age Max
                  </label>
                  <input
                    type="number"
                    value={context.recruitment.age_preference.max}
                    onChange={(e) =>
                      updateField("recruitment.age_preference.max", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("recruitment.age_preference.max")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Ideal Age
                  </label>
                  <input
                    type="number"
                    value={context.recruitment.age_preference.ideal}
                    onChange={(e) =>
                      updateField("recruitment.age_preference.ideal", Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                  {renderFieldError("recruitment.age_preference.ideal")}
                </div>
              </div>

              {showAdvanced.recruitment && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Preferred Leagues
                    </label>
                    <input
                      type="text"
                      value={context.recruitment.preferred_leagues.join(", ")}
                      onChange={(e) =>
                        updateArrayField("recruitment.preferred_leagues", e.target.value)
                      }
                      placeholder="La Liga, Ligue 1"
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Preferred Nationalities
                    </label>
                    <input
                      type="text"
                      value={context.recruitment.preferred_nationalities.join(", ")}
                      onChange={(e) =>
                        updateArrayField(
                          "recruitment.preferred_nationalities",
                          e.target.value
                        )
                      }
                      placeholder="Spanish, French"
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Avoid Leagues
                    </label>
                    <input
                      type="text"
                      value={context.recruitment.avoid_leagues.join(", ")}
                      onChange={(e) =>
                        updateArrayField("recruitment.avoid_leagues", e.target.value)
                      }
                      placeholder="League X"
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={context.recruitment.left_foot_priority}
                      onChange={(e) =>
                        updateField("recruitment.left_foot_priority", e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-600">Left-foot priority</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "technical" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Physical Profile
                  </label>
                  <select
                    value={context.technical.physical_profile}
                    onChange={(e) =>
                      updateField("technical.physical_profile", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {PHYSICAL_PROFILES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("technical.physical_profile")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Minimum Height (cm) <span className="text-xs text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={context.technical.minimum_height_cm ?? ""}
                    onChange={(e) =>
                      updateField(
                        "technical.minimum_height_cm",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                </div>
              </div>

              {showAdvanced.technical && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Speed Importance
                    </label>
                    <select
                      value={context.technical.speed_importance}
                      onChange={(e) =>
                        updateField("technical.speed_importance", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {IMPORTANCE_LEVELS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Aerial Importance
                    </label>
                    <select
                      value={context.technical.aerial_importance}
                      onChange={(e) =>
                        updateField("technical.aerial_importance", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {IMPORTANCE_LEVELS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Technical Floor (0-100)
                    </label>
                    <input
                      type="number"
                      value={context.technical.technical_floor ?? ""}
                      onChange={(e) =>
                        updateField(
                          "technical.technical_floor",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Injury History Tolerance
                    </label>
                    <select
                      value={context.technical.injury_history_tolerance}
                      onChange={(e) =>
                        updateField("technical.injury_history_tolerance", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {INJURY_TOLERANCE_LEVELS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep.id === "strategy" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Season Objective
                  </label>
                  <select
                    value={context.strategy.season_objective}
                    onChange={(e) =>
                      updateField("strategy.season_objective", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {SEASON_OBJECTIVES.map((value) => (
                      <option key={value} value={value}>
                        {value.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("strategy.season_objective")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Transfer Philosophy
                  </label>
                  <select
                    value={context.strategy.transfer_philosophy}
                    onChange={(e) =>
                      updateField("strategy.transfer_philosophy", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {TRANSFER_PHILOSOPHIES.map((value) => (
                      <option key={value} value={value}>
                        {value.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("strategy.transfer_philosophy")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Risk Appetite
                  </label>
                  <select
                    value={context.strategy.risk_appetite}
                    onChange={(e) => updateField("strategy.risk_appetite", e.target.value)}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  >
                    {RISK_APPETITES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  {renderFieldError("strategy.risk_appetite")}
                </div>
              </div>

              {showAdvanced.strategy && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Project Timeline
                    </label>
                    <select
                      value={context.strategy.project_timeline}
                      onChange={(e) =>
                        updateField("strategy.project_timeline", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {PROJECT_TIMELINES.map((value) => (
                        <option key={value} value={value}>
                          {value.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Brand Value Importance
                    </label>
                    <select
                      value={context.strategy.brand_value_importance}
                      onChange={(e) =>
                        updateField("strategy.brand_value_importance", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                    >
                      {BRAND_VALUE_IMPORTANCE.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={context.strategy.social_media_presence_factor}
                      onChange={(e) =>
                        updateField(
                          "strategy.social_media_presence_factor",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />
                    Social media presence factor
                  </label>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* AI Strategy Assistant */}
              <StrategyChat onApply={handleApplyStrategy} />
            </div>
          )}

        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0031FF] text-white"
            >
              {currentStepIndex === steps.length - 1 ? "Finish" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
