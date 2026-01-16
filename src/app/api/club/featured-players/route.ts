import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSportmonksClient } from "@/lib/sportmonks";
import { memoryCache } from "@/lib/cache/memory";

// Cache TTL: 1 hour (featured players don't change frequently)
const CACHE_TTL_SECONDS = 60 * 60;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get club context
    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("club_context")
      .eq("id", user.user_metadata.club_id)
      .single();

    if (clubError || !clubData?.club_context) {
      // Return empty array if no context (user hasn't completed onboarding)
      return NextResponse.json({ data: [], total: 0 });
    }

    const context = clubData.club_context;

    // Extract recruitment criteria
    const priorityPositions = context.recruitment?.priority_positions || [];
    const minAge = context.recruitment?.age_preference?.min || 18;
    const maxAge = context.recruitment?.age_preference?.max || 35;
    const maxValue = context.finances?.transfer_budget_eur || 50000000;

    // Create cache key based on club criteria
    const cacheKey = `featured-players:${user.user_metadata.club_id}:${priorityPositions.sort().join(",")}:${minAge}-${maxAge}:${maxValue}`;

    // Check cache first
    const cachedData = memoryCache.get<{ data: unknown[]; total: number }>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // If no priority positions, return random featured players
    if (priorityPositions.length === 0) {
      const sportmonks = getSportmonksClient();
      const players = await sportmonks.getAllPlayers({
        filters: { transferValueMin: 1000000, transferValueMax: maxValue },
        include: "position;nationality;currentTeam",
        per_page: 12,
      });

      const result = {
        data: players.data || [],
        total: players.pagination?.count || 0,
      };

      // Cache the result
      memoryCache.set(cacheKey, result, CACHE_TTL_SECONDS);

      return NextResponse.json(result);
    }

    // Map position abbreviations to Sportmonks IDs (approximate)
    const positionMapping: Record<string, number[]> = {
      // Goalkeepers
      GK: [24], // Goalkeeper

      // Defenders
      CB: [25, 28], // Centre-Back, Sweeper
      LB: [27], // Left-Back
      RB: [26], // Right-Back
      LWB: [32], // Left Wing-Back
      RWB: [33], // Right Wing-Back

      // Midfielders
      CDM: [21], // Defensive Midfield
      CM: [20], // Central Midfield
      CAM: [19], // Attacking Midfield
      LM: [17], // Left Midfield
      RM: [16], // Right Midfield

      // Forwards
      LW: [15], // Left Winger
      RW: [14], // Right Winger
      ST: [22], // Striker
      CF: [23], // Centre-Forward
    };

    // Collect all position IDs for priority positions
    const positionIds: number[] = [];
    for (const pos of priorityPositions) {
      if (positionMapping[pos]) {
        positionIds.push(...positionMapping[pos]);
      }
    }

    if (positionIds.length === 0) {
      // Fallback if position mapping fails
      return NextResponse.json({ data: [], total: 0 });
    }

    // Fetch players from Sportmonks
    const sportmonks = getSportmonksClient();

    // Build filters
    const filtersStr = [
      `positionIds:${positionIds.join(",")}`,
      `transferValueMax:${maxValue}`,
      `transferValueMin:100000`, // Exclude players with no value
    ].join(";");

    const players = await sportmonks.getAllPlayers({
      filters: { filters: filtersStr },
      include: "position;nationality;currentTeam;statistics",
      per_page: 12,
    });

    if (!players.data) {
      return NextResponse.json({ data: [], total: 0 });
    }

    // Filter by age on our end (Sportmonks may not support age filters)
    const filteredPlayers = players.data.filter((player) => {
      if (!player.date_of_birth) return true;
      const age = calculateAge(player.date_of_birth);
      return age >= minAge && age <= maxAge;
    });

    const result = {
      data: filteredPlayers.slice(0, 12),
      total: filteredPlayers.length,
    };

    // Cache the result
    memoryCache.set(cacheKey, result, CACHE_TTL_SECONDS);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Featured players error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured players" },
      { status: 500 }
    );
  }
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
