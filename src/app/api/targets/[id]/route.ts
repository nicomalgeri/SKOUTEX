import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateTargetInput } from "@/lib/targets/types";

/**
 * GET /api/targets/[id]
 * Fetch a single transfer target by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch target
    const { data, error } = await supabase
      .from("transfer_targets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Target not found" }, { status: 404 });
      }
      console.error("Transfer target fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transfer target" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Transfer target fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer target" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/targets/[id]
 * Update a transfer target
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: UpdateTargetInput = await request.json();

    // Build update object
    const updates: any = {};
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.target_price_eur !== undefined) updates.target_price_eur = body.target_price_eur;
    if (body.max_price_eur !== undefined) updates.max_price_eur = body.max_price_eur;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.status !== undefined) updates.status = body.status;

    // Update target
    const { data, error } = await supabase
      .from("transfer_targets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Target not found" }, { status: 404 });
      }
      console.error("Transfer target update error:", error);
      return NextResponse.json(
        { error: "Failed to update transfer target" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Transfer target update error:", error);
    return NextResponse.json(
      { error: "Failed to update transfer target" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/targets/[id]
 * Delete a transfer target
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete target
    const { error } = await supabase
      .from("transfer_targets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Transfer target delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete transfer target" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transfer target delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete transfer target" },
      { status: 500 }
    );
  }
}
