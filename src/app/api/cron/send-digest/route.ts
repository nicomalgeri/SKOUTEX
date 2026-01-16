/**
 * Background Job: Send Email Digests
 * Runs daily to send notification digests to users
 *
 * Vercel Cron: Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-digest",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 *
 * Schedule explanation:
 * - Daily: "0 9 * * *" (9 AM UTC every day)
 * - Weekly: Check if it's Monday in the code
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDailyDigest, sendWeeklyDigest } from "@/lib/email/sender";

// Vercel cron jobs require Node runtime
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

interface DigestStats {
  users_processed: number;
  daily_digests_sent: number;
  weekly_digests_sent: number;
  daily_digests_failed: number;
  weekly_digests_failed: number;
  duration_ms: number;
}

/**
 * Check if today is Monday (for weekly digest)
 */
function isMonday(): boolean {
  const now = new Date();
  return now.getDay() === 1; // 0 = Sunday, 1 = Monday
}

/**
 * Send email digests to all users
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
    const sendWeekly = isMonday();

    // Initialize stats
    const stats: DigestStats = {
      users_processed: 0,
      daily_digests_sent: 0,
      weekly_digests_sent: 0,
      daily_digests_failed: 0,
      weekly_digests_failed: 0,
      duration_ms: 0,
    };

    // Get all users with their email and preferences
    const { data: users, error: usersError } = await supabase
      .from("notification_preferences")
      .select(`
        user_id,
        email_digest_daily,
        email_digest_weekly
      `);

    if (usersError || !users) {
      console.error("Failed to fetch users:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Process each user
    for (const userPrefs of users) {
      stats.users_processed++;

      try {
        // Get user email from auth.users
        const { data: authUser } = await supabase.auth.admin.getUserById(
          userPrefs.user_id
        );

        if (!authUser?.user?.email) {
          console.warn(`No email found for user ${userPrefs.user_id}`);
          continue;
        }

        const userEmail = authUser.user.email;

        // Send daily digest if enabled
        if (userPrefs.email_digest_daily) {
          // Get notifications from last 24 hours
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const { data: dailyNotifications, error: dailyError } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userPrefs.user_id)
            .gte("created_at", yesterday.toISOString())
            .order("created_at", { ascending: false });

          if (dailyError) {
            console.error(
              `Failed to fetch daily notifications for ${userPrefs.user_id}:`,
              dailyError
            );
            stats.daily_digests_failed++;
            continue;
          }

          if (dailyNotifications && dailyNotifications.length > 0) {
            // Count unread notifications
            const unreadCount = dailyNotifications.filter((n) => !n.read).length;

            const success = await sendDailyDigest(
              userEmail,
              userPrefs.user_id,
              dailyNotifications,
              unreadCount
            );

            if (success) {
              stats.daily_digests_sent++;
            } else {
              stats.daily_digests_failed++;
            }
          }
        }

        // Send weekly digest if enabled and it's Monday
        if (sendWeekly && userPrefs.email_digest_weekly) {
          // Get notifications from last 7 days
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);

          const { data: weeklyNotifications, error: weeklyError } =
            await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", userPrefs.user_id)
              .gte("created_at", lastWeek.toISOString())
              .order("created_at", { ascending: false });

          if (weeklyError) {
            console.error(
              `Failed to fetch weekly notifications for ${userPrefs.user_id}:`,
              weeklyError
            );
            stats.weekly_digests_failed++;
            continue;
          }

          if (weeklyNotifications && weeklyNotifications.length > 0) {
            // Count unread notifications
            const unreadCount = weeklyNotifications.filter((n) => !n.read).length;

            const success = await sendWeeklyDigest(
              userEmail,
              userPrefs.user_id,
              weeklyNotifications,
              unreadCount
            );

            if (success) {
              stats.weekly_digests_sent++;
            } else {
              stats.weekly_digests_failed++;
            }
          }
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `Error processing user ${userPrefs.user_id}:`,
          error
        );
        continue;
      }
    }

    stats.duration_ms = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      stats,
      is_monday: sendWeekly,
    });
  } catch (error) {
    console.error("Email digest error:", error);
    return NextResponse.json(
      {
        error: "Failed to send email digests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
