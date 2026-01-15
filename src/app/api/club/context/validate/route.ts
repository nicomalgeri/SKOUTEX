import { NextRequest, NextResponse } from "next/server";
import {
  mergeClubContext,
  validateClubContext,
} from "@/lib/club/context";
import { getClubContextForUser } from "@/lib/club/contextStore";
import { getAuthedUserOrThrow } from "@/lib/auth/getUserAndClub";

export async function POST(request: NextRequest) {
  try {
    await getAuthedUserOrThrow();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const bodyKeys = Object.keys(body || {});

    let contextInput: Partial<Record<string, unknown>> | undefined;
    if (body?.context && typeof body.context === "object") {
      contextInput = body.context as Partial<Record<string, unknown>>;
    } else if (bodyKeys.length > 0) {
      contextInput = body as Partial<Record<string, unknown>>;
    }

    const stored = await getClubContextForUser();
    if (!stored && !contextInput) {
      return NextResponse.json(
        { error: "Missing context" },
        { status: 400 }
      );
    }

    const context = mergeClubContext(
      (contextInput as object) ?? (stored as object) ?? undefined
    );

    const validation = validateClubContext(context);
    return NextResponse.json({ validation });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to validate club context" },
      { status: 500 }
    );
  }
}
