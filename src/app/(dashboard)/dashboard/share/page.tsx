"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Share2,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Plus,
  MoreVertical,
  Trash2,
  Edit3,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { formatCurrency, getCurrentTeam, getInitials } from "@/lib/utils";
import { usePlayerSearch } from "@/lib/hooks/useSportmonks";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";

interface SalePage {
  id: string;
  playerId: string;
  playerName: string;
  title: string;
  slug: string;
  views: number;
  createdAt: string;
  status: "active" | "draft" | "expired";
  expiresAt?: string;
}

export default function SharePage() {
  const [salePages, setSalePages] = useState<SalePage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    name: string;
    position: string;
    club: string;
    marketValue: number;
    image?: string;
  } | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");

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
    "position;detailedPosition;teams.team"
  );

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`https://skoutex.com/players/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const handlePlayerSelect = (player: SportmonksPlayer) => {
    const currentTeam = getCurrentTeam(player);
    setSelectedPlayer({
      id: String(player.id),
      name: player.display_name || player.name || "Unknown",
      position: player.detailedPosition?.name || player.position?.name || "Unknown",
      club: currentTeam?.name || "Free Agent",
      marketValue: player.market_value || 0,
      image: player.image_path,
    });
    setPlayerSearchQuery("");
    // Auto-generate page title
    const name = player.display_name || player.name || "";
    const position = player.detailedPosition?.name || player.position?.name || "";
    setPageTitle(`${name} - ${position} Profile`);
  };

  const handleCreatePage = () => {
    if (!selectedPlayer) return;

    const slug = selectedPlayer.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const newPage: SalePage = {
      id: `sp-${Date.now()}`,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      title: pageTitle,
      slug: `${slug}-${Date.now().toString(36)}`,
      views: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
      expiresAt: expirationDate || undefined,
    };

    setSalePages([newPage, ...salePages]);
    setShowCreateModal(false);
    setSelectedPlayer(null);
    setPageTitle("");
    setExpirationDate("");
  };

  const deletePage = (id: string) => {
    setSalePages(salePages.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2">
              Sale Pages
            </h1>
            <p className="text-gray-500">
              Create shareable player profiles for agents and other clubs
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028CC] transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Sale Page
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#0031FF]/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0031FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2C2C2C]">{salePages.length}</p>
            <p className="text-gray-500 text-sm">Total Pages</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2C2C2C]">
              {salePages.filter((p) => p.status === "active").length}
            </p>
            <p className="text-gray-500 text-sm">Active</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2C2C2C]">
              {salePages.reduce((acc, p) => acc + p.views, 0)}
            </p>
            <p className="text-gray-500 text-sm">Total Views</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2C2C2C]">12</p>
            <p className="text-gray-500 text-sm">Unique Visitors</p>
          </div>
        </div>

        {/* Sale Pages List */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#2C2C2C]">Your Sale Pages</h2>
          </div>

          {salePages.length === 0 ? (
            <div className="p-12 text-center">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">
                No sale pages yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first sale page to share player profiles with agents
                and clubs
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028CC] transition-all"
              >
                Create Sale Page
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {salePages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#2C2C2C]">{page.title}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                            page.status
                          )}`}
                        >
                          {page.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Link2 className="w-4 h-4" />
                          skoutex.com/players/{page.slug}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          {page.views} views
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Created {page.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(page.slug, page.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          copiedId === page.id
                            ? "bg-green-500/10 text-green-500"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {copiedId === page.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </>
                        )}
                      </button>
                      <a
                        href={`/dashboard/players/${page.playerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="relative group">
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors rounded-t-lg">
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deletePage(page.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#2C2C2C]">Create Sale Page</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Select a player to create a shareable profile page
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedPlayer(null);
                    setPageTitle("");
                    setExpirationDate("");
                  }}
                  className="text-gray-500 hover:text-[#2C2C2C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Search Player
                  </label>

                  {selectedPlayer ? (
                    <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0031FF]/10 rounded-full flex items-center justify-center overflow-hidden">
                          {selectedPlayer.image ? (
                            <Image
                              src={selectedPlayer.image}
                              alt={selectedPlayer.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[#0031FF] font-bold">
                              {getInitials(selectedPlayer.name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#2C2C2C]">{selectedPlayer.name}</h4>
                          <p className="text-gray-500 text-sm">
                            {selectedPlayer.position} - {formatCurrency(selectedPlayer.marketValue)}
                          </p>
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-[#2C2C2C] placeholder-gray-500 focus:outline-none focus:border-[#0031FF]"
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
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-all text-left"
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

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="e.g., Player Name - Position Analysis"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-[#2C2C2C] placeholder-gray-500 focus:outline-none focus:border-[#0031FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Expiration (Optional)
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedPlayer(null);
                    setPageTitle("");
                    setExpirationDate("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePage}
                  disabled={!selectedPlayer || !pageTitle}
                  className="flex-1 px-4 py-2.5 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028CC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
