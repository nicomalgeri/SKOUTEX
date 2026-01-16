import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
async function markAllRead(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("Failed to mark all as read:", error);
      return NextResponse.json(
        { error: "Failed to mark all as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(RateLimitPresets.NORMAL, markAllRead);
