import { NextRequest, NextResponse } from "next/server";
import {
  ClubContextSchema,
  applyClubContextUpdate,
  mergeClubContext,
} from "@/lib/club/context";
import {
  getClubContextForUser,
  upsertClubContextForUser,
} from "@/lib/club/contextStore";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { withRateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";
import { withValidation } from "@/lib/middleware/validate";
import { ClubContextUpdateSchema } from "@/lib/validation/schemas";
import { sanitizeObject } from "@/lib/validation/schemas";

async function getContext(_request: NextRequest) {
  try {
    const { club } = await getClubForUserOrCreate();
    const existing = await getClubContextForUser();
    const context = mergeClubContext({
      ...(existing || {}),
      club_id: club.id,
    });

    return NextResponse.json({
      context,
      club: { id: club.id, name: club.name, logo_url: club.logo_url },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to load club context" },
      { status: 500 }
    );
  }
}

// POST = full context save from onboarding (accepts full or partial context payload).
async function saveContext(request: NextRequest, validatedData: any) {
  try {
    const { club, supabase } = await getClubForUserOrCreate();

    // Sanitize inputs to prevent XSS
    const sanitized = sanitizeObject(validatedData);

    const now = new Date().toISOString();
    const payload =
      (sanitized.context as Partial<Record<string, unknown>> | undefined) ??
      (sanitized as Partial<Record<string, unknown>>);
    const clubPayload =
      sanitized.club && typeof sanitized.club === "object"
        ? (sanitized.club as Record<string, unknown>)
        : null;
    const clubUpdate: { name?: string; logo_url?: string } = {};
    if (clubPayload && typeof clubPayload.name === "string") {
      const trimmed = clubPayload.name.trim();
      if (trimmed) clubUpdate.name = trimmed;
    }
    if (clubPayload && typeof clubPayload.logo_url === "string") {
      const trimmed = clubPayload.logo_url.trim();
      if (trimmed) clubUpdate.logo_url = trimmed;
    }

    const existing = await getClubContextForUser();
    const base = mergeClubContext(existing ?? undefined);
    const updated = applyClubContextUpdate(base, payload as object);
    updated.club_id = club.id;
    updated.updated_at = now;
    updated.version = "1.0";

    const parsed = ClubContextSchema.parse(updated);
    const saved = await upsertClubContextForUser(parsed);

    let clubInfo = { id: club.id, name: club.name, logo_url: club.logo_url };
    if (Object.keys(clubUpdate).length > 0) {
      const { data: updatedClub, error: clubError } = await supabase
        .from("clubs")
        .update(clubUpdate)
        .eq("id", club.id)
        .select("id, name, logo_url")
        .single();
      if (clubError || !updatedClub) {
        throw clubError || new Error("Failed to update club profile");
      }
      clubInfo = {
        id: updatedClub.id,
        name: updatedClub.name,
        logo_url: updatedClub.logo_url,
      };
    }

    return NextResponse.json({ context: saved, club: clubInfo });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to save club context" },
      { status: 500 }
    );
  }
}

// PATCH = partial context updates from inline edits.
async function updateContext(request: NextRequest, validatedData: any) {
  try {
    const { club, supabase } = await getClubForUserOrCreate();

    // Sanitize inputs to prevent XSS
    const sanitized = sanitizeObject(validatedData);

    const now = new Date().toISOString();
    const payload =
      (sanitized.context as Partial<Record<string, unknown>> | undefined) ??
      (sanitized as Partial<Record<string, unknown>>);
    const clubPayload =
      sanitized.club && typeof sanitized.club === "object"
        ? (sanitized.club as Record<string, unknown>)
        : null;
    const clubUpdate: { name?: string; logo_url?: string } = {};
    if (clubPayload && typeof clubPayload.name === "string") {
      const trimmed = clubPayload.name.trim();
      if (trimmed) clubUpdate.name = trimmed;
    }
    if (clubPayload && typeof clubPayload.logo_url === "string") {
      const trimmed = clubPayload.logo_url.trim();
      if (trimmed) clubUpdate.logo_url = trimmed;
    }

    const existing = await getClubContextForUser();
    const base = mergeClubContext(existing ?? undefined);
    const updated = applyClubContextUpdate(base, payload as object);
    updated.club_id = club.id;
    updated.updated_at = now;
    updated.version = "1.0";

    const parsed = ClubContextSchema.parse(updated);
    const saved = await upsertClubContextForUser(parsed);

    let clubInfo = { id: club.id, name: club.name, logo_url: club.logo_url };
    if (Object.keys(clubUpdate).length > 0) {
      const { data: updatedClub, error: clubError } = await supabase
        .from("clubs")
        .update(clubUpdate)
        .eq("id", club.id)
        .select("id, name, logo_url")
        .single();
      if (clubError || !updatedClub) {
        throw clubError || new Error("Failed to update club profile");
      }
      clubInfo = {
        id: updatedClub.id,
        name: updatedClub.name,
        logo_url: updatedClub.logo_url,
      };
    }

    return NextResponse.json({ context: saved, club: clubInfo });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update club context" },
      { status: 500 }
    );
  }
}

// Export with rate limiting and validation
export const GET = withRateLimit(RateLimitPresets.GENEROUS, getContext);

export const POST = withRateLimit(
  RateLimitPresets.NORMAL,
  withValidation(ClubContextUpdateSchema, saveContext)
);

export const PATCH = withRateLimit(
  RateLimitPresets.NORMAL,
  withValidation(ClubContextUpdateSchema, updateContext)
);
