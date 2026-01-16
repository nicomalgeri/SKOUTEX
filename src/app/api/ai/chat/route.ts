import { NextRequest, NextResponse } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAI } from "@/lib/ai/openai";
import { MODELS } from "@/lib/ai/models";
import { ScoutIntentSchema, PlayerReportSchema } from "@/lib/ai/schemas";

import { intentParserPrompt } from "@/lib/ai/prompts/intentParser";
import { explainRankingPrompt } from "@/lib/ai/prompts/explainRanking";
import { reportWriterPrompt } from "@/lib/ai/prompts/reportWriter";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { getClubContextForUser } from "@/lib/club/contextStore";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { withRateLimit, RateLimitPresets } from "@/lib/middleware/rate-limit";
import { withValidation } from "@/lib/middleware/validate";
import { AIChatSchema } from "@/lib/validation/schemas";
import { sanitizeString } from "@/lib/validation/schemas";

// IMPORTANT: OpenAI SDK requires Node runtime in most Next.js deployments.
export const runtime = "nodejs";

type ClubModel = {
  id: string;
  name?: string;
  // Add what your onboarding captures: style, priorities by role, age range, etc.
};

type Player = {
  id: string;
  name: string;
  age?: number | null;
  club?: string | null;
  // Include whatever you have available from SportMonks/DB
};

function scoreFit(_club: ClubModel, _player: Player) {
  // TODO: deterministic scoring engine in TS (no AI)
  return {
    fit_percent: 0,
    verdict: "unknown" as const,
    reasons: [] as string[],
    risks: [] as string[],
    data_gaps: [] as string[],
  };
}

async function getClubModel(clubId: string): Promise<ClubModel> {
  const context = await getClubContextForUser();
  return { id: clubId, name: context?.identity?.club_name ?? "Club" };
}

async function searchPlayers(_args: {
  clubId: string;
  filters: any;
  limit: number;
}): Promise<Player[]> {
  // TODO: query your DB/cache that you populate from SportMonks
  return [];
}

async function getPlayerProfile(_args: {
  clubId: string;
  playerId?: string | null;
  playerName?: string | null;
}): Promise<Player | null> {
  // TODO: look up and return a full player profile object
  return null;
}

async function chat(req: NextRequest, validatedData: any) {
  // Sanitize message to prevent XSS
  const message = sanitizeString(validatedData.message);
  const depth: "quick" | "dense" = validatedData.depth === "dense" ? "dense" : "quick";

  let clubId = "";
  try {
    const { club } = await getClubForUserOrCreate();
    clubId = club.id;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const club = await getClubModel(clubId);
  const clubContext = await getClubContextForUser();
  const gate = getFitScoreGate(clubContext ?? null);
  const openai = getOpenAI();

  if (!openai) {
    return NextResponse.json(
      { error: "OpenAI not configured" },
      { status: 500 }
    );
  }

  // 1) Parse intent (structured)
  const parsed = await openai.responses.parse({
    model: MODELS.parse,
    input: [
      { role: "system", content: intentParserPrompt() },
      {
        role: "user",
        content: JSON.stringify({
          message,
          club,
          // Optionally add short conversation context here later
        }),
      },
    ],
    text: { format: zodTextFormat(ScoutIntentSchema, "scout_intent") },
  });

  const intent = parsed.output_parsed;

  if (!intent) {
    return NextResponse.json(
      { error: "Failed to parse intent from message" },
      { status: 500 }
    );
  }

  if (intent.needs_clarification && intent.follow_up_question) {
    return NextResponse.json({
      type: "clarify",
      question: intent.follow_up_question,
      intent,
    });
  }

  if (!gate.unlocked) {
    return NextResponse.json({
      type: "answer",
      text: "Complete profile to see fit score",
      gate,
      intent,
    });
  }

  // 2) Execute based on intent
  if (intent.intent === "search_players") {
    const players = await searchPlayers({
      clubId,
      filters: intent.filters,
      limit: intent.limit,
    });

    const results = players
      .map((p) => {
        const fit = scoreFit(club, p);
        return { ...p, fit };
      })
      .sort((a, b) => (b.fit.fit_percent ?? 0) - (a.fit.fit_percent ?? 0))
      .slice(0, intent.limit);

    // 3) Premium explanation (LLM writes; your code decides)
    const answer = await openai.responses.create({
      model: MODELS.chat,
      input: [
        { role: "system", content: explainRankingPrompt() },
        {
          role: "user",
          content: JSON.stringify({
            userMessage: message,
            club,
            intent,
            results,
          }),
        },
      ],
    });

    return NextResponse.json({
      type: "answer",
      text: answer.output_text,
      intent,
      results,
    });
  }

  if (intent.intent === "open_player") {
    const player = await getPlayerProfile({
      clubId,
      playerId: intent.entities.player_id,
      playerName: intent.entities.player_name,
    });

    if (!player) {
      return NextResponse.json({
        type: "answer",
        text:
          intent.language.startsWith("es")
            ? "No encuentro ese jugador con la información actual. ¿Me pasas el enlace o el club actual?"
            : "I can’t find that player with the current info. Can you share a link or their current club?",
        intent,
      });
    }

    const fit = scoreFit(club, player);

    const answer = await openai.responses.create({
      model: MODELS.chat,
      input: [
        { role: "system", content: explainRankingPrompt() },
        {
          role: "user",
          content: JSON.stringify({
            userMessage: message,
            club,
            intent,
            results: [{ ...player, fit }],
          }),
        },
      ],
    });

    return NextResponse.json({
      type: "answer",
      text: answer.output_text,
      intent,
      player: { ...player, fit },
    });
  }

  if (intent.intent === "generate_report") {
    const player = await getPlayerProfile({
      clubId,
      playerId: intent.entities.player_id,
      playerName: intent.entities.player_name,
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found for report", intent },
        { status: 404 }
      );
    }

    const fit = scoreFit(club, player);

    const report = await openai.responses.parse({
      model: MODELS.report,
      input: [
        { role: "system", content: reportWriterPrompt() },
        {
          role: "user",
          content: JSON.stringify({
            language: intent.language,
            depth,
            club,
            player,
            fit,
            // Add any precomputed metrics you want displayed in the dossier
          }),
        },
      ],
      text: { format: zodTextFormat(PlayerReportSchema, "player_report") },
    });

    return NextResponse.json({
      type: "report",
      report: report.output_parsed,
      intent,
    });
  }

  // fallback
  return NextResponse.json({
    type: "answer",
    text:
      intent.language.startsWith("es")
        ? "¿Quieres buscar jugadores, abrir la ficha de un jugador o generar un informe?"
        : "Do you want to search players, open a player profile, or generate a report?",
    intent,
  });
}

// Export with rate limiting and validation
export const POST = withRateLimit(
  RateLimitPresets.AI_OPERATIONS,
  withValidation(AIChatSchema, chat)
);
