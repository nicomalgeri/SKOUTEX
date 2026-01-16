/**
 * Background Job: Check Watchlist for Changes
 * Runs daily to detect changes in watchlist players and create notifications
 *
 * Vercel Cron: Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-watchlist",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  notifyPriceChange,
  notifyContractUpdate,
  notifyPerformanceUpdate,
  getUserNotificationPreferences,
} from "@/lib/notifications/generator";

// Vercel cron jobs require Node runtime
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

/**
 * Check watchlist for all users and create notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const startTime = Date.now();

    // Get all watchlist entries with user info
    const { data: watchlistEntries, error: watchlistError } = await supabase
      .from("watchlist")
      .select("user_id, player_id, club_id, created_at");

    if (watchlistError || !watchlistEntries) {
      console.error("Failed to fetch watchlist:", watchlistError);
      return NextResponse.json(
        { error: "Failed to fetch watchlist" },
        { status: 500 }
      );
    }

    let notificationsCreated = 0;
    let playersChecked = 0;

    // Group by user for efficient processing
    const userWatchlists = new Map<string, typeof watchlistEntries>();
    for (const entry of watchlistEntries) {
      if (!userWatchlists.has(entry.user_id)) {
        userWatchlists.set(entry.user_id, []);
      }
      userWatchlists.get(entry.user_id)!.push(entry);
    }

    // Process each user's watchlist
    for (const [userId, entries] of userWatchlists) {
      // Get user's notification preferences
      const prefs = await getUserNotificationPreferences(userId);

      // Skip if user has disabled all notifications
      if (!prefs.watchlist_price_change &&
          !prefs.watchlist_contract_update &&
          !prefs.watchlist_performance_update) {
        continue;
      }

      for (const entry of entries) {
        playersChecked++;

        try {
          // TODO: Fetch actual player data from Sportmonks API
          // For now, we'll create mock checks
          // In production, you would:
          // 1. Fetch current player data from Sportmonks
          // 2. Compare with cached/stored data
          // 3. Detect changes
          // 4. Create notifications based on changes

          // Example mock check (replace with real API call):
          const shouldNotifyPrice = Math.random() > 0.95 && prefs.watchlist_price_change;
          const shouldNotifyContract = Math.random() > 0.98 && prefs.watchlist_contract_update;
          const shouldNotifyPerformance = Math.random() > 0.9 && prefs.watchlist_performance_update;

          if (shouldNotifyPrice) {
            await notifyPriceChange(
              userId,
              entry.player_id,
              `Player ${entry.player_id}`,
              5000000,
              5500000
            );
            notificationsCreated++;
          }

          if (shouldNotifyContract) {
            await notifyContractUpdate(
              userId,
              entry.player_id,
              `Player ${entry.player_id}`,
              "2025-06-30"
            );
            notificationsCreated++;
          }

          if (shouldNotifyPerformance) {
            await notifyPerformanceUpdate(
              userId,
              entry.player_id,
              `Player ${entry.player_id}`,
              3,
              2,
              7.5
            );
            notificationsCreated++;
          }
        } catch (error) {
          console.error(`Error processing player ${entry.player_id}:`, error);
          // Continue processing other players
        }
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      stats: {
        users_processed: userWatchlists.size,
        players_checked: playersChecked,
        notifications_created: notificationsCreated,
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error("Watchlist check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check watchlist",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
