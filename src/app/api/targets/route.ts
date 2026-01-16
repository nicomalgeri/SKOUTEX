import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateTargetInput } from "@/lib/targets/types";

/**
 * GET /api/targets
 * Fetch all transfer targets for the authenticated user's club
 */
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

    // Get club_id from user metadata
    const clubId = user.user_metadata.club_id;
    if (!clubId) {
      return NextResponse.json({ error: "No club associated with user" }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    // Build query
    let query = supabase
      .from("transfer_targets")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Transfer targets fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transfer targets" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error("Transfer targets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer targets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/targets
 * Create a new transfer target
 */
export async function POST(request: NextRequest) {
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

    // Get club_id from user metadata
    const clubId = user.user_metadata.club_id;
    if (!clubId) {
      return NextResponse.json({ error: "No club associated with user" }, { status: 400 });
    }

    // Parse request body
    const body: CreateTargetInput = await request.json();

    // Validate required fields
    if (!body.player_id || !body.player_name || !body.priority) {
      return NextResponse.json(
        { error: "Missing required fields: player_id, player_name, priority" },
        { status: 400 }
      );
    }

    // Insert target
    const { data, error } = await supabase
      .from("transfer_targets")
      .insert({
        club_id: clubId,
        user_id: user.id,
        player_id: body.player_id,
        player_name: body.player_name,
        current_club: body.current_club || null,
        position: body.position || null,
        age: body.age || null,
        nationality: body.nationality || null,
        market_value_eur: body.market_value_eur || null,
        priority: body.priority,
        target_price_eur: body.target_price_eur || null,
        max_price_eur: body.max_price_eur || null,
        notes: body.notes || null,
        status: body.status || "scouting",
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This player is already in your transfer targets" },
          { status: 409 }
        );
      }

      console.error("Transfer target creation error:", error);
      return NextResponse.json(
        { error: "Failed to create transfer target" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Transfer target creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transfer target" },
      { status: 500 }
    );
  }
}
