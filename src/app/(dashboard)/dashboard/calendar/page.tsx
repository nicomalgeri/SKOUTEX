"use client";

import { useState, useMemo } from "react";
import Header from "@/components/dashboard/Header";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFixtures, useTeamSearch } from "@/lib/hooks/useSportmonks";
import type { SportmonksFixture } from "@/lib/sportmonks/types";
import { toLocalISODate } from "@/lib/utils";

// Calendar Event type for scouting assignments
interface ScoutingEvent {
  id: string;
  type: "scouting" | "match";
  title: string;
  date: string;
  time?: string;
  fixture?: SportmonksFixture;
  players?: string[]; // Player IDs to scout
  notes?: string;
  priority?: "high" | "medium" | "low";
}

// Get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return toLocalISODate(date);
}

// Parse fixture date/time
function parseFixtureDateTime(fixture: SportmonksFixture) {
  const date = new Date(fixture.starting_at);
  return {
    date: formatDate(date),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    dayOfMonth: date.getDate(),
  };
}

// Month names
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const today = new Date();
  const todayStr = formatDate(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Team search for filtering fixtures
  const { data: teamResults, loading: searchLoading } = useTeamSearch(
    teamSearch.length >= 2 ? teamSearch : null
  );

  // Calculate date range for the current month view
  const startDate = useMemo(() => {
    return formatDate(new Date(currentYear, currentMonth, 1));
  }, [currentYear, currentMonth]);

  const endDate = useMemo(() => {
    const lastDay = getDaysInMonth(currentYear, currentMonth);
    return formatDate(new Date(currentYear, currentMonth, lastDay));
  }, [currentYear, currentMonth]);

  // Fetch fixtures for the current month
  const { data: fixturesResponse, loading: fixturesLoading } = useFixtures({
    startDate,
    endDate,
    teamId: selectedTeamId || undefined,
    per_page: 100,
    include: "participants;league;venue;state",
  });

  const fixtures = fixturesResponse?.data || [];

  // Group fixtures by date
  const fixturesByDate = useMemo(() => {
    const grouped: Record<string, SportmonksFixture[]> = {};
    fixtures.forEach((fixture) => {
      const { date } = parseFixtureDateTime(fixture);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(fixture);
    });
    return grouped;
  }, [fixtures]);

  // Navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(formatDate(today));
  };

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentYear, currentMonth]);

  // Get selected date's fixtures
  const selectedDateFixtures = selectedDate ? fixturesByDate[selectedDate] || [] : [];

  // Handle team selection
  const handleTeamSelect = (teamId: number, teamName: string) => {
    setSelectedTeamId(teamId);
    setTeamSearch(teamName);
    setShowTeamDropdown(false);
  };

  const clearTeamFilter = () => {
    setSelectedTeamId(null);
    setTeamSearch("");
  };

  return (
    <>
      <Header
        title="Scout Calendar"
        subtitle="Track matches and scouting assignments"
      />

      <div className="p-4 lg:p-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Team Filter */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by team..."
              value={teamSearch}
              onChange={(e) => {
                setTeamSearch(e.target.value);
                setShowTeamDropdown(true);
              }}
              onFocus={() => setShowTeamDropdown(true)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0031FF]/20 focus:border-[#0031FF]"
            />
            {selectedTeamId && (
              <button
                onClick={clearTeamFilter}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}

            {/* Team Dropdown */}
            {showTeamDropdown && teamSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : teamResults?.data && teamResults.data.length > 0 ? (
                  teamResults.data.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id, team.name)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      {team.image_path ? (
                        <Image
                          src={team.image_path}
                          alt={team.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-500">
                          {team.name[0]}
                        </div>
                      )}
                      <span className="text-sm text-[#2C2C2C]">{team.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No teams found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-[#0031FF] bg-[#0031FF]/10 rounded-lg hover:bg-[#0031FF]/20 transition-colors"
            >
              Today
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["month", "week", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                    viewMode === mode
                      ? "bg-white text-[#2C2C2C] shadow-sm"
                      : "text-gray-500 hover:text-[#2C2C2C]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-[#2C2C2C]">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[100px] p-2 bg-gray-50 border-b border-r border-gray-100"
                    />
                  );
                }

                const dateStr = formatDate(
                  new Date(currentYear, currentMonth, day)
                );
                const dayFixtures = fixturesByDate[dateStr] || [];
                const isToday = dateStr === formatDate(today);
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[100px] p-2 text-left border-b border-r border-gray-100 transition-colors ${
                      isSelected
                        ? "bg-[#0031FF]/5 border-[#0031FF]/20"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "w-7 h-7 flex items-center justify-center bg-[#0031FF] text-white rounded-full"
                            : isSelected
                            ? "text-[#0031FF]"
                            : "text-[#2C2C2C]"
                        }`}
                      >
                        {day}
                      </span>
                      {dayFixtures.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {dayFixtures.length}
                        </span>
                      )}
                    </div>

                    {/* Fixture Indicators */}
                    <div className="space-y-1">
                      {dayFixtures.slice(0, 3).map((fixture) => {
                        const home = fixture.participants?.find(
                          (p) => p.meta.location === "home"
                        );
                        const away = fixture.participants?.find(
                          (p) => p.meta.location === "away"
                        );
                        return (
                          <div
                            key={fixture.id}
                            className="text-xs truncate px-1.5 py-0.5 bg-[#0031FF]/10 text-[#0031FF] rounded"
                          >
                            {home?.short_code || home?.name?.slice(0, 3)} vs{" "}
                            {away?.short_code || away?.name?.slice(0, 3)}
                          </div>
                        );
                      })}
                      {dayFixtures.length > 3 && (
                        <div className="text-xs text-gray-400 px-1.5">
                          +{dayFixtures.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {fixturesLoading && (
              <div className="p-4 text-center border-t border-gray-200">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading fixtures...</p>
              </div>
            )}
          </div>

          {/* Selected Date Details */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-[#2C2C2C]">
                {selectedDate
                  ? new Date(selectedDate + "T12:00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Select a date"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDateFixtures.length} match
                {selectedDateFixtures.length !== 1 ? "es" : ""} scheduled
              </p>
            </div>

            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {selectedDateFixtures.length > 0 ? (
                selectedDateFixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No matches scheduled for this date
                  </p>
                  {!selectedTeamId && (
                    <p className="text-gray-400 text-xs mt-1">
                      Try filtering by a specific team
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Click a date to view matches
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Matches Summary */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#2C2C2C]">Upcoming Matches</h3>
              <p className="text-sm text-gray-500">
                Next 7 days{selectedTeamId && teamSearch ? ` · ${teamSearch}` : ""}
              </p>
            </div>
            <Link
              href="/dashboard/search"
              className="text-sm text-[#0031FF] hover:underline font-medium"
            >
              Find Players to Scout
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {fixtures
              .filter((f) => {
                const fixtureDate = new Date(f.starting_at);
                const weekFromNow = new Date(
                  today.getTime() + 7 * 24 * 60 * 60 * 1000
                );
                return fixtureDate >= today && fixtureDate <= weekFromNow;
              })
              .sort(
                (a, b) =>
                  new Date(a.starting_at).getTime() -
                  new Date(b.starting_at).getTime()
              )
              .slice(0, 5)
              .map((fixture) => (
                <FixtureRow key={fixture.id} fixture={fixture} />
              ))}

            {fixtures.filter((f) => {
              const fixtureDate = new Date(f.starting_at);
              const weekFromNow = new Date(
                today.getTime() + 7 * 24 * 60 * 60 * 1000
              );
              return fixtureDate >= today && fixtureDate <= weekFromNow;
            }).length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">
                  No upcoming matches in the next 7 days
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Fixture Card Component for sidebar
function FixtureCard({ fixture }: { fixture: SportmonksFixture }) {
  const home = fixture.participants?.find((p) => p.meta.location === "home");
  const away = fixture.participants?.find((p) => p.meta.location === "away");
  const { time } = parseFixtureDateTime(fixture);

  // Get scores
  const homeScore = fixture.scores?.find(
    (s) => s.participant_id === home?.id && s.description === "CURRENT"
  );
  const awayScore = fixture.scores?.find(
    (s) => s.participant_id === away?.id && s.description === "CURRENT"
  );

  const isLive = fixture.state?.developer_name === "inplay";
  const isFinished =
    fixture.state?.developer_name === "finished" ||
    fixture.state?.developer_name === "FT";

  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      {/* League & Time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 truncate flex-1">
          {fixture.league?.name || "League"}
        </span>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
              LIVE
            </span>
          )}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {home?.image_path ? (
              <Image
                src={home.image_path}
                alt={home.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain flex-shrink-0"
              />
            ) : (
              <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-[#2C2C2C] truncate">
              {home?.name || "Home"}
            </span>
          </div>
          {(isLive || isFinished) && (
            <span className="text-sm font-bold text-[#2C2C2C] ml-2">
              {homeScore?.score.goals ?? "-"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {away?.image_path ? (
              <Image
                src={away.image_path}
                alt={away.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain flex-shrink-0"
              />
            ) : (
              <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-[#2C2C2C] truncate">
              {away?.name || "Away"}
            </span>
          </div>
          {(isLive || isFinished) && (
            <span className="text-sm font-bold text-[#2C2C2C] ml-2">
              {awayScore?.score.goals ?? "-"}
            </span>
          )}
        </div>
      </div>

      {/* Venue */}
      {fixture.venue?.name && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{fixture.venue.name}</span>
        </div>
      )}

      {/* Action */}
      <button className="w-full mt-3 px-3 py-2 text-xs font-medium text-[#0031FF] bg-[#0031FF]/10 rounded-lg hover:bg-[#0031FF]/20 transition-colors flex items-center justify-center gap-1.5">
        <Eye className="w-3.5 h-3.5" />
        Add Scouting Assignment
      </button>
    </div>
  );
}

// Fixture Row Component for list view
function FixtureRow({ fixture }: { fixture: SportmonksFixture }) {
  const home = fixture.participants?.find((p) => p.meta.location === "home");
  const away = fixture.participants?.find((p) => p.meta.location === "away");
  const { date, time } = parseFixtureDateTime(fixture);

  const fixtureDate = new Date(fixture.starting_at);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Date */}
        <div className="text-center flex-shrink-0 w-16">
          <p className="text-xs text-gray-500 uppercase">
            {fixtureDate.toLocaleDateString("en-US", { weekday: "short" })}
          </p>
          <p className="text-lg font-semibold text-[#2C2C2C]">
            {fixtureDate.getDate()}
          </p>
          <p className="text-xs text-gray-500">
            {fixtureDate.toLocaleDateString("en-US", { month: "short" })}
          </p>
        </div>

        {/* Teams */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {home?.image_path && (
              <Image
                src={home.image_path}
                alt={home.name}
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="text-sm font-medium text-[#2C2C2C] truncate">
              {home?.name}
            </span>
            <span className="text-xs text-gray-400">vs</span>
            <span className="text-sm font-medium text-[#2C2C2C] truncate">
              {away?.name}
            </span>
            {away?.image_path && (
              <Image
                src={away.image_path}
                alt={away.name}
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {time}
            </span>
            <span>{fixture.league?.name}</span>
            {fixture.venue?.name && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />
                {fixture.venue.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      <button className="px-3 py-1.5 text-xs font-medium text-[#0031FF] bg-[#0031FF]/10 rounded-lg hover:bg-[#0031FF]/20 transition-colors flex-shrink-0 ml-4">
        Scout Match
      </button>
    </div>
  );
}
