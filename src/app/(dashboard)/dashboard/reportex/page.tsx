"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/dashboard/Header";
import {
  FileText,
  Download,
  Search,
  Plus,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Edit3,
  Eye,
  Save,
  Printer,
  Share2,
  Image as ImageIcon,
  BarChart3,
  User,
  Trophy,
  TrendingUp,
  ClipboardList,
  CheckSquare,
} from "lucide-react";
import Image from "next/image";
import { usePlayer, usePlayerSearch } from "@/lib/hooks/useSportmonks";
import {
  getPositionCode,
  getPositionColor,
  calculateAge,
  formatCurrency,
  getInitials,
  formatHeight,
  formatWeight,
  getCurrentTeam,
  getPrimaryPlayerStats,
} from "@/lib/utils";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";

// Report section types
type SectionType =
  | "header"
  | "bio"
  | "stats"
  | "performance"
  | "career"
  | "strengths"
  | "weaknesses"
  | "notes"
  | "recommendation";

interface ReportSection {
  id: string;
  type: SectionType;
  title: string;
  content?: string;
  enabled: boolean;
  order: number;
}

// Default sections for a player report
const DEFAULT_SECTIONS: ReportSection[] = [
  { id: "header", type: "header", title: "Player Header", enabled: true, order: 0 },
  { id: "bio", type: "bio", title: "Player Bio", enabled: true, order: 1 },
  { id: "stats", type: "stats", title: "Season Statistics", enabled: true, order: 2 },
  { id: "performance", type: "performance", title: "Performance Metrics", enabled: true, order: 3 },
  { id: "career", type: "career", title: "Career History", enabled: true, order: 4 },
  { id: "strengths", type: "strengths", title: "Strengths", content: "", enabled: true, order: 5 },
  { id: "weaknesses", type: "weaknesses", title: "Weaknesses", content: "", enabled: true, order: 6 },
  { id: "notes", type: "notes", title: "Scout Notes", content: "", enabled: true, order: 7 },
  { id: "recommendation", type: "recommendation", title: "Recommendation", content: "", enabled: true, order: 8 },
];

export default function ReportexPage() {
  // Player selection state
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  // Report state
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [reportTitle, setReportTitle] = useState("Player Scouting Report");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce player search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPlayerSearch(playerSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [playerSearchQuery]);

  // Fetch player search results
  const { data: playerSearchResults, loading: searchLoading } = usePlayerSearch(
    debouncedPlayerSearch.length >= 2 ? debouncedPlayerSearch : null,
    "position;detailedPosition;nationality;teams"
  );

  // Fetch selected player data
  const { data: playerResponse, loading: playerLoading } = usePlayer(
    selectedPlayerId,
    "position;detailedPosition;nationality;teams;statistics.details;transfers"
  );

  const player = playerResponse?.data;

  // Handle player selection
  const handlePlayerSelect = (p: SportmonksPlayer) => {
    setSelectedPlayerId(String(p.id));
    setPlayerSearchQuery(p.display_name || p.name || "");
    setShowPlayerDropdown(false);
    setReportTitle(`${p.display_name || p.name} - Scouting Report`);
  };

  // Toggle section enabled
  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Update section content
  const updateSectionContent = (sectionId: string, content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content } : s))
    );
  };

  // Move section up/down
  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newSections = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [newSections[index], newSections[swapIndex]] = [
        newSections[swapIndex],
        newSections[index],
      ];
      return newSections.map((s, i) => ({ ...s, order: i }));
    });
  };

  // Generate PDF (mock - in production would use a library like jsPDF or html2pdf)
  const handleExportPDF = () => {
    setIsSaving(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsSaving(false);
      alert("PDF export functionality would be implemented here using jsPDF or html2pdf library.");
    }, 1500);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Get player stats
  const getPlayerStats = () => {
    const primaryStats = getPrimaryPlayerStats(player);
    if (!primaryStats?.details) return null;
    const stats = primaryStats.details;
    const getStatValue = (typeId: number) => {
      const stat = stats.find((s) => s.type_id === typeId);
      return stat?.value?.total || stat?.value?.average || 0;
    };

    return {
      appearances: getStatValue(321),
      goals: getStatValue(52),
      assists: getStatValue(79),
      minutesPlayed: getStatValue(119),
      passAccuracy: getStatValue(83),
      dribbleSuccess: getStatValue(86),
      tackleSuccess: getStatValue(90),
      aerialWon: getStatValue(88),
      rating: getStatValue(118),
    };
  };

  const stats = getPlayerStats();

  return (
    <>
      <Header
        title="ReportTeX"
        subtitle="Create professional scouting reports"
      />

      <div className="p-4 lg:p-6">
        {/* Top Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Player Search */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a player to create report..."
              value={playerSearchQuery}
              onChange={(e) => {
                setPlayerSearchQuery(e.target.value);
                setShowPlayerDropdown(true);
              }}
              onFocus={() => setShowPlayerDropdown(true)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0031FF]/20 focus:border-[#0031FF]"
            />

            {/* Player Dropdown */}
            {showPlayerDropdown && debouncedPlayerSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : playerSearchResults?.data && playerSearchResults.data.length > 0 ? (
                  playerSearchResults.data.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePlayerSelect(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      {p.image_path ? (
                        <Image
                          src={p.image_path}
                          alt={p.display_name || p.name || ""}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                          {getInitials(p.display_name || p.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#2C2C2C]">
                          {p.display_name || p.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getCurrentTeam(p)?.name || "Free Agent"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No players found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                isPreviewMode
                  ? "bg-[#0031FF] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreviewMode ? "Edit Mode" : "Preview"}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!player || isSaving}
              className="px-4 py-2 bg-[#0031FF] text-white text-sm font-medium rounded-lg hover:bg-[#0028cc] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export PDF
            </button>
          </div>
        </div>

        {player ? (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Section Controls (Left Panel) */}
            {!isPreviewMode && (
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4 h-fit">
                <h3 className="font-semibold text-[#2C2C2C] mb-4">Report Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={() => toggleSection(section.id)}
                          className="rounded border-gray-300 text-[#0031FF] focus:ring-[#0031FF]"
                        />
                        <span className="text-sm text-[#2C2C2C]">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveSection(section.id, "up")}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveSection(section.id, "down")}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Preview/Editor (Main Panel) */}
            <div className={`${isPreviewMode ? "lg:col-span-4" : "lg:col-span-3"}`}>
              <div
                id="report-content"
                className="bg-white border border-gray-200 rounded-xl overflow-hidden print:border-0 print:shadow-none"
              >
                {/* Report Title */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0031FF]/10 to-transparent print:bg-white">
                  {isPreviewMode ? (
                    <h1 className="text-2xl font-bold text-[#2C2C2C]">{reportTitle}</h1>
                  ) : (
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="text-2xl font-bold text-[#2C2C2C] bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                    />
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Generated on {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Sections */}
                <div className="p-6 space-y-8">
                  {sections
                    .filter((s) => s.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <ReportSectionRenderer
                        key={section.id}
                        section={section}
                        player={player}
                        stats={stats}
                        isPreviewMode={isPreviewMode}
                        onUpdateContent={(content) =>
                          updateSectionContent(section.id, content)
                        }
                      />
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 print:bg-white">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Powered by SKOUTEX · AI Agents for Football Intelligence</span>
                    <span>Confidential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
              Create a Scouting Report
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Search for a player above to start building a professional scouting report
              with data, statistics, and your own analysis.
            </p>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content,
          #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

// Section Renderer Component
function ReportSectionRenderer({
  section,
  player,
  stats,
  isPreviewMode,
  onUpdateContent,
}: {
  section: ReportSection;
  player: SportmonksPlayer;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
    passAccuracy: number;
    dribbleSuccess: number;
    tackleSuccess: number;
    aerialWon: number;
    rating: number;
  } | null;
  isPreviewMode: boolean;
  onUpdateContent: (content: string) => void;
}) {
  const position = player.detailedPosition?.name || player.position?.name || "Unknown";
  const posCode = getPositionCode(position);
  const age = calculateAge(player.date_of_birth);
  const currentTeam = getCurrentTeam(player)?.name || "Free Agent";

  switch (section.type) {
    case "header":
      return (
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            {player.image_path ? (
              <Image
                src={player.image_path}
                alt={player.display_name || player.name || ""}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                {getInitials(player.display_name || player.name)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[#2C2C2C]">
                {player.display_name || player.name}
              </h2>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium ${getPositionColor(
                  position
                )} text-white`}
              >
                {posCode}
              </span>
            </div>
            <p className="text-lg text-gray-600 mb-2">{currentTeam}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{age ? `${age} years old` : "Age unknown"}</span>
              <span>·</span>
              <span>{player.nationality?.name || "Unknown"}</span>
              <span>·</span>
              <span>{formatHeight(player.height)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#2C2C2C]">
              {formatCurrency(player.market_value)}
            </p>
            <p className="text-sm text-gray-500">Market Value</p>
          </div>
        </div>
      );

    case "bio":
      return (
        <div>
          <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#0031FF]" />
            Player Profile
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard label="Full Name" value={player.name || "Unknown"} />
            <InfoCard label="Date of Birth" value={player.date_of_birth || "Unknown"} />
            <InfoCard label="Height" value={formatHeight(player.height)} />
            <InfoCard label="Weight" value={formatWeight(player.weight)} />
            <InfoCard label="Position" value={position} />
            <InfoCard label="Nationality" value={player.nationality?.name || "Unknown"} />
            <InfoCard label="Current Club" value={currentTeam} />
            <InfoCard label="Market Value" value={formatCurrency(player.market_value)} />
          </div>
        </div>
      );

    case "stats":
      if (!stats) return null;
      return (
        <div>
          <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0031FF]" />
            Season Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Appearances" value={stats.appearances} />
            <StatCard label="Goals" value={stats.goals} />
            <StatCard label="Assists" value={stats.assists} />
            <StatCard label="Minutes" value={stats.minutesPlayed.toLocaleString()} />
            <StatCard label="Rating" value={stats.rating ? stats.rating.toFixed(1) : "N/A"} />
            <StatCard label="G+A" value={stats.goals + stats.assists} />
          </div>
        </div>
      );

    case "performance":
      if (!stats) return null;
      return (
        <div>
          <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0031FF]" />
            Performance Metrics
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Technical</h4>
              <div className="space-y-2">
                <ProgressBar label="Pass Accuracy" value={stats.passAccuracy} />
                <ProgressBar label="Dribble Success" value={stats.dribbleSuccess} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Defensive</h4>
              <div className="space-y-2">
                <ProgressBar label="Tackle Success" value={stats.tackleSuccess} />
                <ProgressBar label="Aerial Duels Won" value={stats.aerialWon} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Output</h4>
              <div className="space-y-2">
                <MetricRow label="Goals per 90" value={stats.minutesPlayed > 0 ? ((stats.goals / stats.minutesPlayed) * 90).toFixed(2) : "0.00"} />
                <MetricRow label="Assists per 90" value={stats.minutesPlayed > 0 ? ((stats.assists / stats.minutesPlayed) * 90).toFixed(2) : "0.00"} />
              </div>
            </div>
          </div>
        </div>
      );

    case "career":
      if (!player.teams || player.teams.length === 0) return null;
      return (
        <div>
          <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#0031FF]" />
            Career History
          </h3>
          <div className="space-y-3">
            {player.teams.slice(0, 5).map((team, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                {team.image_path ? (
                  <Image
                    src={team.image_path}
                    alt={team.name || ""}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                    {team.name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-[#2C2C2C]">{team.name}</p>
                  <p className="text-sm text-gray-500">
                    {team.pivot?.start || "N/A"} - {team.pivot?.end || "Present"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "strengths":
    case "weaknesses":
    case "notes":
    case "recommendation":
      const iconMap = {
        strengths: <CheckSquare className="w-5 h-5 text-green-500" />,
        weaknesses: <ClipboardList className="w-5 h-5 text-red-500" />,
        notes: <Edit3 className="w-5 h-5 text-[#0031FF]" />,
        recommendation: <FileText className="w-5 h-5 text-purple-500" />,
      };

      return (
        <div>
          <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            {iconMap[section.type]}
            {section.title}
          </h3>
          {isPreviewMode ? (
            <div className="p-4 bg-gray-50 rounded-lg min-h-[100px]">
              {section.content ? (
                <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
              ) : (
                <p className="text-gray-400 italic">No content added</p>
              )}
            </div>
          ) : (
            <textarea
              value={section.content || ""}
              onChange={(e) => onUpdateContent(e.target.value)}
              placeholder={`Add ${section.title.toLowerCase()} here...`}
              rows={4}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#0031FF] resize-none"
            />
          )}
        </div>
      );

    default:
      return null;
  }
}

// Helper Components
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-[#2C2C2C]">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-2xl font-bold text-[#2C2C2C]">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-[#2C2C2C]">{value}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0031FF] rounded-full transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-[#2C2C2C]">{value}</span>
    </div>
  );
}
