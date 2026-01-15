"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/dashboard/Header";
import {
  FileText,
  Download,
  Share2,
  Eye,
  Clock,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Loader2,
  X,
  Upload,
  File,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { getInitials, getCurrentTeam } from "@/lib/utils";
import { usePlayerSearch } from "@/lib/hooks/useSportmonks";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";

interface Report {
  id: string;
  type: "quick" | "detailed" | "comparison" | "manual";
  playerName: string;
  playerId: string;
  createdAt: string;
  views: number;
  pdfUrl?: string;
  shareableUrl?: string;
  // Manual report specific fields
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  notes?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<"quick" | "detailed" | "comparison">("quick");
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; club: string } | null>(null);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPlayerName, setUploadPlayerName] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    "position;teams.team"
  );

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.playerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesType;
  });

  const deleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "quick":
        return "Quick Report";
      case "detailed":
        return "Detailed Report";
      case "comparison":
        return "Comparison";
      case "manual":
        return "Manual Upload";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quick":
        return "bg-blue-500/20 text-blue-500";
      case "detailed":
        return "bg-green-500/20 text-green-500";
      case "comparison":
        return "bg-purple-500/20 text-purple-500";
      case "manual":
        return "bg-orange-500/20 text-orange-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  // File upload handlers
  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, image, or Word document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadReport = () => {
    if (!uploadedFile || !uploadPlayerName.trim()) return;

    const newReport: Report = {
      id: `manual-${Date.now()}`,
      type: "manual",
      playerName: uploadPlayerName.trim(),
      playerId: "",
      createdAt: new Date().toISOString(),
      views: 0,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.type,
      notes: uploadNotes.trim() || undefined,
      pdfUrl: "#", // In production, this would be the uploaded file URL
    };

    setReports([newReport, ...reports]);
    setShowUploadModal(false);
    setUploadedFile(null);
    setUploadPlayerName("");
    setUploadNotes("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <File className="w-5 h-5" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes("image")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handlePlayerSelect = (player: SportmonksPlayer) => {
    const currentTeam = getCurrentTeam(player);
    setSelectedPlayer({
      id: String(player.id),
      name: player.display_name || player.name || "Unknown",
      club: currentTeam?.name || "Unknown",
    });
    setPlayerSearchQuery("");
  };

  const handleCreateReport = () => {
    if (!selectedPlayer && selectedReportType !== "comparison") return;

    const newReport: Report = {
      id: `report-${Date.now()}`,
      type: selectedReportType,
      playerName: selectedPlayer?.name || "New Comparison",
      playerId: selectedPlayer?.id || "",
      createdAt: new Date().toISOString(),
      views: 0,
      pdfUrl: "#",
    };

    setReports([newReport, ...reports]);
    setShowNewReportModal(false);
    setSelectedPlayer(null);
    setPlayerSearchQuery("");
  };

  return (
    <>
      <Header title="Reports" subtitle={`${reports.length} reports generated`} />

      <div className="p-4 lg:p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[#2C2C2C] text-sm placeholder-gray-500 focus:outline-none focus:border-[#0031FF]"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[#2C2C2C] text-sm focus:outline-none focus:border-[#0031FF]"
            >
              <option value="all">All Types</option>
              <option value="quick">Quick Reports</option>
              <option value="detailed">Detailed Reports</option>
              <option value="comparison">Comparisons</option>
              <option value="manual">Manual Uploads</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-white border border-gray-200 text-[#2C2C2C] text-sm font-medium rounded-xl hover:border-gray-300 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Report
            </button>
            <button
              onClick={() => setShowNewReportModal(true)}
              className="px-4 py-2 bg-[#0031FF] text-white text-sm font-medium rounded-xl hover:bg-[#0028cc] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#0031FF]" />
                    </div>
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(
                          report.type
                        )}`}
                      >
                        {getTypeLabel(report.type)}
                      </span>
                    </div>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-[#2C2C2C] opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-[#2C2C2C] mb-2 truncate">
                  {report.playerName}
                </h3>

                {/* Manual report file info */}
                {report.type === "manual" && report.fileName && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    {getFileIcon(report.fileType)}
                    <span className="truncate">{report.fileName}</span>
                    {report.fileSize && (
                      <span className="text-gray-400">
                        ({formatFileSize(report.fileSize)})
                      </span>
                    )}
                  </div>
                )}

                {/* Notes preview for manual reports */}
                {report.type === "manual" && report.notes && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2 italic">
                    &ldquo;{report.notes}&rdquo;
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {report.views} views
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  {report.pdfUrl && (
                    <button className="flex-1 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  )}
                  {report.shareableUrl && (
                    <button className="flex-1 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
              No reports found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Generate your first report to get started"}
            </p>
            <button
              onClick={() => setShowNewReportModal(true)}
              className="px-6 py-3 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028cc] transition-all"
            >
              Create Report
            </button>
          </div>
        )}

        {/* New Report Modal */}
        {showNewReportModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowNewReportModal(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2C2C2C]">
                  Create New Report
                </h3>
                <button
                  onClick={() => setShowNewReportModal(false)}
                  className="text-gray-500 hover:text-[#2C2C2C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Report Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["quick", "detailed", "comparison"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedReportType(type)}
                        className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all capitalize ${
                          selectedReportType === type
                            ? "bg-[#0031FF] border-[#0031FF] text-white"
                            : "bg-[#f6f6f6] border-gray-300 text-[#2C2C2C] hover:border-[#0031FF]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedReportType !== "comparison" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Search Player
                    </label>

                    {selectedPlayer ? (
                      <div className="flex items-center justify-between p-3 bg-[#f6f6f6] border border-gray-300 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-[#2C2C2C]">
                              {getInitials(selectedPlayer.name)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#2C2C2C]">{selectedPlayer.name}</p>
                            <p className="text-sm text-gray-500">{selectedPlayer.club}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPlayer(null)}
                          className="text-gray-500 hover:text-[#2C2C2C]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={playerSearchQuery}
                          onChange={(e) => setPlayerSearchQuery(e.target.value)}
                          placeholder="Search players..."
                          className="w-full pl-10 pr-4 py-3 bg-[#f6f6f6] border border-gray-300 rounded-xl text-[#2C2C2C] placeholder-gray-500 focus:outline-none focus:border-[#0031FF]"
                        />

                        {/* Search Results Dropdown */}
                        {playerSearchQuery.length >= 2 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                            {searchLoading && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-[#0031FF]" />
                              </div>
                            )}

                            {!searchLoading && playerSearchResults?.data?.map((player) => (
                              <button
                                key={player.id}
                                onClick={() => handlePlayerSelect(player)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-[#f6f6f6] transition-all text-left"
                              >
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                  {player.image_path ? (
                                    <Image
                                      src={player.image_path}
                                      alt={player.display_name || player.name || ""}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-medium text-[#2C2C2C]">
                                      {getInitials(player.display_name || player.name)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-[#2C2C2C] truncate">
                                    {player.display_name || player.name}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {getCurrentTeam(player)?.name || "Free Agent"}
                                  </p>
                                </div>
                              </button>
                            ))}

                            {!searchLoading && playerSearchResults?.data?.length === 0 && (
                              <p className="text-center text-gray-500 py-4">No players found</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewReportModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  disabled={!selectedPlayer && selectedReportType !== "comparison"}
                  className="flex-1 py-3 bg-[#0031FF] text-white font-medium rounded-xl hover:bg-[#0028cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate
                </button>
              </div>
            </div>
          </>
        )}

        {/* Upload Report Modal */}
        {showUploadModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowUploadModal(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2C2C2C]">
                  Upload Manual Report
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                    setUploadPlayerName("");
                    setUploadNotes("");
                  }}
                  className="text-gray-500 hover:text-[#2C2C2C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Report File
                  </label>
                  {uploadedFile ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadedFile.type)}
                        <div>
                          <p className="text-sm font-medium text-[#2C2C2C] truncate max-w-[200px]">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(uploadedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-[#0031FF] bg-[#0031FF]/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                      />
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#2C2C2C] mb-1">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, Word, or images up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Player Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Player Name / Report Title
                  </label>
                  <input
                    type="text"
                    value={uploadPlayerName}
                    onChange={(e) => setUploadPlayerName(e.target.value)}
                    placeholder="e.g., Marcus Rashford Scouting Report"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#0031FF]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="Add any additional notes about this report..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:border-[#0031FF] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                    setUploadPlayerName("");
                    setUploadNotes("");
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadReport}
                  disabled={!uploadedFile || !uploadPlayerName.trim()}
                  className="flex-1 py-3 bg-[#0031FF] text-white font-medium rounded-xl hover:bg-[#0028cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
