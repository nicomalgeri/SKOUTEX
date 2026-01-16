import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateTargetInput } from "@/lib/targets/types";
import { withRateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";
import { withValidation, validateQuery } from "@/lib/middleware/validate";
import { CreateTargetSchema, TargetFiltersSchema } from "@/lib/validation/schemas";
import { sanitizeObject } from "@/lib/validation/schemas";

/**
 * GET /api/targets
 * Fetch all transfer targets for the authenticated user's club
 */
async function getTargets(request: NextRequest) {
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

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const filters = validateQuery(TargetFiltersSchema, searchParams);

    // Build query
    let query = supabase
      .from("transfer_targets")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.priority) {
      query = query.eq("priority", filters.priority);
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

// Apply rate limiting (30 requests per minute)
export const GET = withRateLimit(RateLimitPresets.NORMAL, getTargets);

/**
 * POST /api/targets
 * Create a new transfer target
 */
async function createTarget(request: NextRequest, validatedData: CreateTargetInput) {
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

    // Sanitize text inputs to prevent XSS
    const sanitized = sanitizeObject(validatedData);

    // Insert target
    const { data, error } = await supabase
      .from("transfer_targets")
      .insert({
        club_id: clubId,
        user_id: user.id,
        player_id: sanitized.player_id,
        player_name: sanitized.player_name,
        current_club: sanitized.current_club || null,
        position: sanitized.position || null,
        age: sanitized.age || null,
        nationality: sanitized.nationality || null,
        market_value_eur: sanitized.market_value_eur || null,
        priority: sanitized.priority,
        target_price_eur: sanitized.target_price_eur || null,
        max_price_eur: sanitized.max_price_eur || null,
        notes: sanitized.notes || null,
        status: sanitized.status || "scouting",
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

// Apply rate limiting and validation (30 requests per minute)
export const POST = withRateLimit(
  RateLimitPresets.NORMAL,
  withValidation(CreateTargetSchema, createTarget)
);
