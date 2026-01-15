"use client";

import { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  Newspaper,
  Search,
  ExternalLink,
  Clock,
  Filter,
  Loader2,
  TrendingUp,
  Users,
  Trophy,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import {
  useNews,
  useSportsHeadlines,
  useTransferNews,
  useLeagueNews,
  useClubNews,
  usePlayerNews,
} from "@/lib/hooks/useSportmonks";

// News categories
type NewsCategory = "headlines" | "transfer" | "league" | "club" | "player" | "search";

const CATEGORIES: { id: NewsCategory; label: string; icon: React.ReactNode }[] = [
  { id: "headlines", label: "Headlines", icon: <Newspaper className="w-4 h-4" /> },
  { id: "transfer", label: "Transfers", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "league", label: "League News", icon: <Trophy className="w-4 h-4" /> },
  { id: "club", label: "Club News", icon: <Users className="w-4 h-4" /> },
  { id: "player", label: "Player News", icon: <Users className="w-4 h-4" /> },
];

// Popular leagues for quick filtering
const POPULAR_LEAGUES = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Champions League",
  "Europa League",
];

// Time ago formatter
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>("headlines");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Fetch news based on category
  const { data: headlines, loading: headlinesLoading, refetch: refetchHeadlines } = useSportsHeadlines({
    max: 20,
  });

  const { data: transferNews, loading: transferLoading, refetch: refetchTransfer } = useTransferNews({
    max: 20,
  });

  const { data: leagueNews, loading: leagueLoading, refetch: refetchLeague } = useLeagueNews(
    category === "league" ? selectedLeague : null,
    { max: 20 }
  );

  const { data: clubNews, loading: clubLoading, refetch: refetchClub } = useClubNews(
    category === "club" ? selectedClub : null,
    { max: 20 }
  );

  const { data: playerNews, loading: playerLoading, refetch: refetchPlayer } = usePlayerNews(
    category === "player" ? selectedPlayer : null,
    { max: 20 }
  );

  const { data: searchNews, loading: searchLoading, refetch: refetchSearch } = useNews({
    query: activeSearch || undefined,
    max: 20,
    enabled: !!activeSearch,
  });

  // Get current news and loading state based on category
  const getCurrentNews = () => {
    switch (category) {
      case "headlines":
        return { news: headlines, loading: headlinesLoading, refetch: refetchHeadlines };
      case "transfer":
        return { news: transferNews, loading: transferLoading, refetch: refetchTransfer };
      case "league":
        return { news: leagueNews, loading: leagueLoading, refetch: refetchLeague };
      case "club":
        return { news: clubNews, loading: clubLoading, refetch: refetchClub };
      case "player":
        return { news: playerNews, loading: playerLoading, refetch: refetchPlayer };
      case "search":
        return { news: searchNews, loading: searchLoading, refetch: refetchSearch };
      default:
        return { news: headlines, loading: headlinesLoading, refetch: refetchHeadlines };
    }
  };

  const { news, loading, refetch } = getCurrentNews();
  const articles = news?.articles || [];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      setCategory("search");
    }
  };

  // Handle league selection
  const handleLeagueSelect = (league: string) => {
    setSelectedLeague(league);
    setCategory("league");
  };

  // Handle club/player input
  const handleEntitySearch = (type: "club" | "player", value: string) => {
    if (type === "club") {
      setSelectedClub(value);
      setCategory("club");
    } else {
      setSelectedPlayer(value);
      setCategory("player");
    }
  };

  return (
    <>
      <Header
        title="Football News"
        subtitle="Stay updated with the latest football news"
      />

      <div className="p-4 lg:p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0031FF]/20 focus:border-[#0031FF]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#0031FF] text-white text-sm font-medium rounded-lg hover:bg-[#0028cc] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === cat.id
                  ? "bg-[#0031FF] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:text-[#2C2C2C] hover:border-gray-300"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
          {category === "search" && activeSearch && (
            <button
              onClick={() => {
                setCategory("headlines");
                setActiveSearch("");
                setSearchQuery("");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600"
            >
              Search: "{activeSearch}" ×
            </button>
          )}
        </div>

        {/* Quick League Filters */}
        {(category === "headlines" || category === "league") && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Quick filters:</span>
            {POPULAR_LEAGUES.map((league) => (
              <button
                key={league}
                onClick={() => handleLeagueSelect(league)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedLeague === league && category === "league"
                    ? "bg-[#0031FF]/10 text-[#0031FF] border border-[#0031FF]/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        )}

        {/* Entity Search for Club/Player */}
        {(category === "club" || category === "player") && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {category === "club" ? "Club Name" : "Player Name"}
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${category} name...`}
                  value={category === "club" ? selectedClub || "" : selectedPlayer || ""}
                  onChange={(e) =>
                    category === "club"
                      ? setSelectedClub(e.target.value)
                      : setSelectedPlayer(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = category === "club" ? selectedClub : selectedPlayer;
                      if (value) {
                        handleEntitySearch(category, value);
                      }
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0031FF]/20 focus:border-[#0031FF]"
                />
              </div>
              <button
                onClick={() => {
                  const value = category === "club" ? selectedClub : selectedPlayer;
                  if (value) {
                    handleEntitySearch(category, value);
                  }
                }}
                className="px-4 py-2.5 bg-[#0031FF] text-white text-sm font-medium rounded-lg hover:bg-[#0028cc] transition-colors mt-6"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-[#0031FF] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <NewsCard key={`${article.url}-${index}`} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
              No news found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {category === "league" && !selectedLeague
                ? "Select a league to see news"
                : category === "club" && !selectedClub
                ? "Enter a club name to search for news"
                : category === "player" && !selectedPlayer
                ? "Enter a player name to search for news"
                : "Try a different search term or category"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// News Card Component
interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

function NewsCard({ article }: { article: Article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Source & Time */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#0031FF]">
            {article.source.name}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#2C2C2C] mb-2 line-clamp-2 group-hover:text-[#0031FF] transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {article.description}
        </p>

        {/* Read More */}
        <div className="flex items-center gap-1 text-sm font-medium text-[#0031FF] group-hover:underline">
          Read more
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}
