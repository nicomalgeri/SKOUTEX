import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read/unread
 */
async function updateNotification(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { read } = body;

    if (typeof read !== "boolean") {
      return NextResponse.json(
        { error: "read field must be a boolean" },
        { status: 400 }
      );
    }

    const updateData: any = { read };
    if (read) {
      updateData.read_at = new Date().toISOString();
    } else {
      updateData.read_at = null;
    }

    const { data, error } = await supabase
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update notification:", error);
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
async function deleteNotification(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete notification:", error);
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export with rate limiting wrapper that handles context
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Apply rate limit check
  const rateLimitHandler = withRateLimit(
    RateLimitPresets.NORMAL,
    async (req: NextRequest) => updateNotification(req, context)
  );
  return rateLimitHandler(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Apply rate limit check
  const rateLimitHandler = withRateLimit(
    RateLimitPresets.NORMAL,
    async (req: NextRequest) => deleteNotification(req, context)
  );
  return rateLimitHandler(request);
}
