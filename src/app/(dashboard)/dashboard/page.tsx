/**
 * Premium Dashboard Page
 * Enhanced dashboard with position targets, radar charts, and AI assistant
 */

"use client";

import Header from "@/components/dashboard/Header";
import { PositionTargetsSection, type PositionNeed } from "@/components/dashboard/PositionTargetsSection";
import { RecentTransfersSection, type Transfer } from "@/components/dashboard/RecentTransfersSection";
import { AIScoutAssistant } from "@/components/dashboard/AIScoutAssistant";
import { TrendingUp, Users, Search, Star } from "lucide-react";
import { useState } from "react";

// Mock data for demonstration
const mockPositionNeeds: PositionNeed[] = [
  {
    position: "CB",
    fullName: "Centre Back",
    priority: "high",
    recommendations: [
      {
        id: 1,
        name: "Antonio Silva",
        club: "Benfica",
        age: 21,
        position: "CB",
        fitScore: 89,
      },
      {
        id: 2,
        name: "Leny Yoro",
        club: "Lille",
        age: 19,
        position: "CB",
        fitScore: 85,
      },
    ],
  },
  {
    position: "RW",
    fullName: "Right Winger",
    priority: "medium",
    recommendations: [
      {
        id: 3,
        name: "Mohamed Kudus",
        club: "West Ham",
        age: 24,
        position: "RW",
        fitScore: 82,
      },
      {
        id: 4,
        name: "Desiré Doué",
        club: "Rennes",
        age: 19,
        position: "RW",
        fitScore: 78,
      },
    ],
  },
  {
    position: "CM",
    fullName: "Central Midfielder",
    priority: "low",
    recommendations: [
      {
        id: 5,
        name: "Joao Neves",
        club: "Benfica",
        age: 20,
        position: "CM",
        fitScore: 86,
      },
      {
        id: 6,
        name: "Warren Zaïre-Emery",
        club: "PSG",
        age: 18,
        position: "CM",
        fitScore: 83,
      },
    ],
  },
];

const mockTransfers: Transfer[] = [
  {
    id: "1",
    playerName: "João Neves",
    fromClub: "Benfica",
    toClub: "PSG",
    fee: 60000000,
    feeDisplay: "£60M",
    position: "CM",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: "2h ago",
    playerId: 5,
  },
  {
    id: "2",
    playerName: "Leny Yoro",
    fromClub: "Lille",
    toClub: "Real Madrid",
    fee: 62000000,
    feeDisplay: "£62M",
    position: "CB",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    timeAgo: "5h ago",
    playerId: 2,
  },
  {
    id: "3",
    playerName: "Antonio Silva",
    fromClub: "Benfica",
    toClub: "Manchester United",
    fee: 42500000,
    feeDisplay: "£42.5M",
    position: "CB",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    timeAgo: "12h ago",
    playerId: 1,
  },
  {
    id: "4",
    playerName: "Desiré Doué",
    fromClub: "Rennes",
    toClub: "Bayern Munich",
    fee: 35000000,
    feeDisplay: "£35M",
    position: "RW",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    timeAgo: "18h ago",
    playerId: 4,
  },
  {
    id: "5",
    playerName: "Mohamed Kudus",
    fromClub: "Ajax",
    toClub: "West Ham",
    fee: 38000000,
    feeDisplay: "£38M",
    position: "RW",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timeAgo: "1d ago",
    playerId: 3,
  },
  {
    id: "6",
    playerName: "Jurrien Timber",
    fromClub: "Ajax",
    toClub: "Arsenal",
    fee: 40000000,
    feeDisplay: "£40M",
    position: "CB",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeAgo: "2d ago",
  },
  {
    id: "7",
    playerName: "Rasmus Højlund",
    fromClub: "Atalanta",
    toClub: "Manchester United",
    fee: 72000000,
    feeDisplay: "£72M",
    position: "ST",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeAgo: "3d ago",
  },
  {
    id: "8",
    playerName: "Declan Rice",
    fromClub: "West Ham",
    toClub: "Arsenal",
    fee: 105000000,
    feeDisplay: "£105M",
    position: "CM",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    timeAgo: "4d ago",
  },
];

export default function PremiumDashboardPage() {
  const [transfers, setTransfers] = useState(mockTransfers);

  const handleAddToShortlist = (playerId: number) => {
    console.log("Added player to shortlist:", playerId);
    // TODO: Implement actual shortlist functionality
  };

  const handleTransferFilterChange = (filters: any) => {
    console.log("Transfer filters changed:", filters);
    // TODO: Implement actual filtering
    // For now, just use mock data
    setTransfers(mockTransfers);
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back to SKOUTEX" showClubInfo />

      <div className="p-3 sm:p-6 lg:p-12 space-y-8 sm:space-y-12 w-full max-w-[100vw] lg:max-w-[1440px] mx-auto overflow-hidden">
        {/* Hero Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            icon={<Search className="w-5 h-5" />}
            label="Searches Today"
            value="24"
            change="+12%"
            changeType="positive"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Players Analyzed"
            value="156"
            change="+8%"
            changeType="positive"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Watchlist"
            value="32"
            change="+4"
            changeType="positive"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Avg Fit Score"
            value="82"
            change="+3%"
            changeType="positive"
          />
        </div>

        {/* Position Targets Section */}
        <PositionTargetsSection
          positionNeeds={mockPositionNeeds}
          onAddToShortlist={handleAddToShortlist}
        />

        {/* Recent Transfers Section */}
        <RecentTransfersSection
          transfers={transfers}
          availableLeagues={["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]}
          availablePositions={["GK", "CB", "FB", "CM", "W", "ST"]}
          defaultFilters={{
            leagues: ["Premier League"],
            positions: [],
            targetRelatedOnly: false,
          }}
          onFilterChange={handleTransferFilterChange}
        />

        {/* AI Scout Assistant */}
        <AIScoutAssistant />
      </div>
    </>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatCard({ icon, label, value, change, changeType = "neutral" }: StatCardProps) {
  const changeColorClass =
    changeType === "positive"
      ? "text-green-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white border border-gray-300 hover:border-blue-600 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50">
          {icon}
        </div>
      </div>
      <div>
        <span className="block text-sm text-gray-500 mb-1">{label}</span>
        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <span className={`text-sm font-medium ${changeColorClass}`}>{change}</span>
          )}
        </div>
      </div>
    </div>
  );
}
