import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { memoryCache } from "@/lib/cache/memory";
import { withRateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";

// Cache TTL: 1 day (transfer windows don't change frequently)
const CACHE_TTL_SECONDS = 24 * 60 * 60;

async function getTransferWindows(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league");

    // Create cache key
    const cacheKey = league ? `transfer-windows:${league}` : "transfer-windows:all";

    // Check cache first
    const cached = memoryCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("transfer_windows")
      .select("*")
      .order("start_date", { ascending: false });

    // Filter by league if provided
    if (league) {
      query = query.eq("league", league);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Transfer windows fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transfer windows" },
        { status: 500 }
      );
    }

    const result = { data: data || [], total: data?.length || 0 };

    // Cache the result
    memoryCache.set(cacheKey, result, CACHE_TTL_SECONDS);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Transfer windows error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer windows" },
      { status: 500 }
    );
  }
}

// Export with rate limiting
export const GET = withRateLimit(RateLimitPresets.GENEROUS, getTransferWindows);
