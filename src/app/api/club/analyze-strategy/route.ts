import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { FOOTBALL_POSITIONS } from "@/lib/club/positions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for extracted strategy data
const StrategyExtractionSchema = z.object({
  priority_positions: z.array(z.string()).max(5).describe("Up to 5 priority positions (e.g., CB, ST, CM)"),
  age_preference: z.object({
    min: z.number().min(16).max(40).describe("Minimum age preference"),
    max: z.number().min(16).max(40).describe("Maximum age preference"),
    ideal: z.number().min(16).max(40).describe("Ideal age"),
  }).optional(),
  experience_level: z.enum([
    "Rookie / Prospect",
    "Developing",
    "Experienced",
    "Veteran / Peak",
    "Legendary"
  ]).optional().describe("Player experience level preference"),
  transfer_budget_eur: z.number().positive().optional().describe("Transfer budget in EUR"),
  playing_style: z.object({
    style: z.enum([
      "possession",
      "counter_attacking",
      "direct",
      "high_pressing",
      "balanced"
    ]).optional(),
    pressing_intensity: z.enum(["low", "medium", "high", "very_high"]).optional(),
  }).optional(),
  transfer_philosophy: z.enum([
    "bargain_hunting",
    "young_potential",
    "proven_quality",
    "star_signings",
    "balanced"
  ]).optional(),
  risk_appetite: z.enum(["Low", "Medium", "High"]).optional(),
  physical_profile: z.enum([
    "Any",
    "Technical / Agile",
    "Balanced",
    "Physical / Strong",
    "Tall / Aerial"
  ]).optional(),
  notes: z.string().optional().describe("Additional context or notes from the strategy"),
});

type StrategyExtraction = z.infer<typeof StrategyExtractionSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategy } = body;

    if (!strategy || typeof strategy !== "string" || strategy.trim().length < 10) {
      return NextResponse.json(
        { error: "Strategy text must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Valid position values for validation
    const validPositions = FOOTBALL_POSITIONS.map(p => p.value);

    // Create the extraction prompt
    const systemPrompt = `You are an expert football recruitment analyst. Extract structured recruitment data from natural language strategy descriptions.

Available positions: ${validPositions.join(", ")}

Rules:
1. Only extract positions that are explicitly mentioned or strongly implied
2. Map common position names to standard abbreviations (e.g., "center-back" → "CB", "striker" → "ST")
3. Extract age ranges from phrases like "young players", "experienced veterans", "20-25 years old"
4. Identify transfer budget from mentions of money (convert to EUR if needed)
5. Infer playing style from tactical descriptions (e.g., "high press" → high_pressing)
6. Infer risk appetite from phrases like "proven players" (Low), "potential stars" (High)
7. If information is not mentioned or unclear, omit that field
8. Extract up to 5 priority positions maximum`;

    const userPrompt = `Extract recruitment strategy data from this description:\n\n"${strategy}"`;

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "strategy_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              priority_positions: {
                type: "array",
                items: { type: "string" },
                description: "Up to 5 priority positions",
              },
              age_preference: {
                type: "object",
                properties: {
                  min: { type: "number", description: "Minimum age" },
                  max: { type: "number", description: "Maximum age" },
                  ideal: { type: "number", description: "Ideal age" },
                },
                required: ["min", "max", "ideal"],
                additionalProperties: false,
              },
              experience_level: {
                type: "string",
                enum: ["Rookie / Prospect", "Developing", "Experienced", "Veteran / Peak", "Legendary"],
              },
              transfer_budget_eur: { type: "number", description: "Budget in EUR" },
              playing_style: {
                type: "object",
                properties: {
                  style: {
                    type: "string",
                    enum: ["possession", "counter_attacking", "direct", "high_pressing", "balanced"],
                  },
                  pressing_intensity: {
                    type: "string",
                    enum: ["low", "medium", "high", "very_high"],
                  },
                },
                additionalProperties: false,
              },
              transfer_philosophy: {
                type: "string",
                enum: ["bargain_hunting", "young_potential", "proven_quality", "star_signings", "balanced"],
              },
              risk_appetite: {
                type: "string",
                enum: ["Low", "Medium", "High"],
              },
              physical_profile: {
                type: "string",
                enum: ["Any", "Technical / Agile", "Balanced", "Physical / Strong", "Tall / Aerial"],
              },
              notes: { type: "string", description: "Additional context" },
            },
            required: ["priority_positions"],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse and validate the response
    const extractedData = JSON.parse(responseContent);

    // Validate positions are valid
    if (extractedData.priority_positions) {
      extractedData.priority_positions = extractedData.priority_positions
        .filter((pos: string) => validPositions.includes(pos))
        .slice(0, 5);
    }

    // Validate with Zod schema
    const validated = StrategyExtractionSchema.parse(extractedData);

    return NextResponse.json({
      success: true,
      data: validated,
      tokens_used: completion.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error("Strategy analysis error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data extracted", details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze strategy" },
      { status: 500 }
    );
  }
}
