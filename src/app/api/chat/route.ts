import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { formatCurrency } from "@/lib/utils";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { getClubContextForUser } from "@/lib/club/contextStore";
import { getAuthedUserOrThrow } from "@/lib/auth/getUserAndClub";

// Initialize OpenAI client lazily to avoid build errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are SKOUTEX AI, an advanced football intelligence assistant for professional clubs. You help sporting directors, scouts, and analysts with:

1. **Player Analysis**: Provide detailed insights on players including stats, fit scores, strengths, weaknesses, and tactical fit.
2. **Search & Discovery**: Help find players matching specific criteria (position, age, stats, playing style).
3. **Comparisons**: Compare players across multiple dimensions.
4. **Market Intelligence**: Discuss market values, contract situations, and transfer opportunities.
5. **Tactical Fit**: Analyze how players would fit into specific formations and playing styles.

Return responses in JSON format. When recommending specific players with data you have, use:
{
  "text": "Brief summary text",
  "players": [
    {
      "id": "sportmonks_player_id",
      "name": "Player Name",
      "age": 25,
      "position": "RW",
      "club": "Club Name",
      "nationality": "Country",
      "marketValue": 15000000,
      "goals": 10,
      "assists": 5,
      "appearances": 30,
      "fitScore": 85,
      "highlight": "why this player is recommended"
    }
  ],
  "type": "recommendation" | "analysis" | "comparison"
}

For general questions without specific player data, return:
{
  "text": "Your response here",
  "type": "general"
}

Note: You have access to the Sportmonks football database. When discussing players, be as helpful as possible with general football knowledge, formations, tactics, and scouting advice.`;

const LOCK_REMINDER = "Complete profile to see fit score";

function isFitScoreRequest(message: string) {
  const text = message.toLowerCase();
  const lockKeywords = [
    "fit score",
    "fit",
    "shortlist",
    "short list",
    "target",
    "compare",
    "comparison",
    "rank",
    "ranking",
    "analysis",
    "analyze",
    "evaluate",
    "suitability",
    "recommend",
    "recommendation",
    "report",
    "dossier",
  ];
  const hasPlayerLink =
    text.includes("http://") ||
    text.includes("https://") ||
    text.includes("www.") ||
    text.includes("player link") ||
    text.includes("transfermarkt");

  return lockKeywords.some((keyword) => text.includes(keyword)) || hasPlayerLink;
}

function appendReminder(text?: string, message?: string) {
  if (text && text.trim()) {
    return { text: `${text}\n\n${LOCK_REMINDER}` };
  }
  if (message && message.trim()) {
    return { message: `${message}\n\n${LOCK_REMINDER}` };
  }
  return { text: LOCK_REMINDER };
}

function stripFitScores(payload: Record<string, unknown>) {
  if (!Array.isArray(payload.players)) return payload;
  return { ...payload, players: [] };
}

export async function POST(request: NextRequest) {
  try {
    await getAuthedUserOrThrow();
    const { messages } = await request.json();
    const clubContext = await getClubContextForUser();
    const gate = getFitScoreGate(clubContext ?? null);
    const lastMessage = Array.isArray(messages)
      ? messages[messages.length - 1]?.content || ""
      : "";
    const shouldLock = isFitScoreRequest(lastMessage);

    if (!gate.unlocked && shouldLock) {
      return NextResponse.json({
        type: "locked",
        message: LOCK_REMINDER,
        missing_required_fields: gate.missing_required_fields,
        blocking_missing_fields: gate.blocking_missing_fields,
        actionUrl: "/onboarding",
      });
    }

    const openai = getOpenAIClient();

    if (!openai) {
      // Fallback response when API key is not configured
      const fallback = generateFallbackResponse(lastMessage || "");
      if (!gate.unlocked && !shouldLock) {
        const reminder = appendReminder(fallback.text);
        return NextResponse.json({
          ...fallback,
          ...reminder,
          type: "general",
        });
      }
      return NextResponse.json(fallback);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    try {
      const parsed = JSON.parse(content || "{}") as Record<string, unknown>;
      if (!gate.unlocked && !shouldLock) {
        const reminder = appendReminder(
          typeof parsed.text === "string" ? parsed.text : undefined,
          typeof parsed.message === "string" ? parsed.message : undefined
        );
        const sanitized = stripFitScores(parsed);
        return NextResponse.json({
          ...sanitized,
          ...reminder,
          type: "general",
        });
      }
      return NextResponse.json(parsed);
    } catch {
      if (!gate.unlocked && !shouldLock) {
        const reminder = appendReminder(content || "");
        return NextResponse.json({
          ...reminder,
          type: "general",
        });
      }
      return NextResponse.json({
        text: content || "I couldn't generate a response.",
        type: "general",
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

// Fallback responses when OpenAI is not configured
function generateFallbackResponse(query: string): { text: string; type: string } {
  const lowerQuery = query.toLowerCase();

  // Position-based queries
  if (lowerQuery.includes("right back") || lowerQuery.includes("rb") || lowerQuery.includes("full back")) {
    return {
      text: `When scouting for a right-back, key attributes to look for include:

**Defensive Skills:**
- Tackling ability and positioning
- Aerial presence for crosses
- Recovery speed

**Attacking Contribution:**
- Crossing accuracy
- Ability to overlap and create width
- Ball progression up the flank

**Modern Requirements:**
- Comfort receiving under pressure
- Ability to play as inverted full-back if needed

Use the Search tab to find right-backs matching specific criteria like age, league, or playing style.`,
      type: "general"
    };
  }

  if (lowerQuery.includes("right winger") || lowerQuery.includes("rw") || lowerQuery.includes("winger")) {
    return {
      text: `For scouting wingers, consider these key metrics:

**Technical Skills:**
- Dribble success rate (aim for 55%+)
- Key passes per game
- Shot accuracy

**Physical Attributes:**
- Pace and acceleration
- Agility for quick direction changes

**Production:**
- Goals and assists contribution
- xG and xA metrics

Search for wingers in the Search tab by filtering by position and age range.`,
      type: "general"
    };
  }

  if (lowerQuery.includes("cdm") || lowerQuery.includes("defensive mid") || lowerQuery.includes("midfielder")) {
    return {
      text: `Defensive midfielders are crucial for controlling the game. Look for:

**Defensive Metrics:**
- Tackles and interceptions per game
- Duels won percentage
- Aerial ability

**Ball Distribution:**
- Pass accuracy (especially under pressure)
- Progressive passes
- Long ball accuracy

**Tactical Awareness:**
- Positional discipline
- Ability to read the game
- Cover for advancing full-backs

Use the Search feature to find CDMs with specific statistical profiles.`,
      type: "general"
    };
  }

  if (lowerQuery.includes("striker") || lowerQuery.includes("forward") || lowerQuery.includes("st") || lowerQuery.includes("cf")) {
    return {
      text: `When evaluating strikers, focus on:

**Finishing:**
- Conversion rate
- Goals per 90 minutes
- xG over/underperformance

**Link-up Play:**
- Hold-up ability
- Key passes and assists
- Press resistance

**Movement:**
- Runs in behind
- Movement in the box
- Aerial threat

Search for strikers matching your team's playing style in the Search tab.`,
      type: "general"
    };
  }

  if (lowerQuery.includes("undervalued") || lowerQuery.includes("market") || lowerQuery.includes("value") || lowerQuery.includes("bargain")) {
    return {
      text: `Finding undervalued players requires looking at:

**Performance vs Value Gap:**
- Players performing above their market value
- Young players with high potential
- Contract situations (expiring deals)

**Key Indicators:**
- Advanced metrics exceeding price bracket
- Playing for less prominent clubs
- Recent breakout performances

**Tactical Fit:**
- Players whose style matches your system
- Versatile players who can fill multiple roles

Use filters in the Search tab to find players by contract expiry and market value range.`,
      type: "general"
    };
  }

  if (lowerQuery.includes("contract") || lowerQuery.includes("expir") || lowerQuery.includes("free")) {
    return {
      text: `Contract situations create opportunities:

**Expiring Contracts (< 12 months):**
- Negotiate reduced transfer fees
- Sign pre-contracts with foreign clubs
- Higher wage expectations

**Strategy:**
- Monitor players in final contract year
- Consider loan-to-buy options
- Factor in agent fees and signing bonuses

Use the Search tab to filter by contract expiry date and find players whose deals are ending soon.`,
      type: "general"
    };
  }

  // Default response
  return {
    text: `I'm SKOUTEX AI, your football intelligence assistant. I can help with:

**Player Scouting:**
- Position-specific advice
- Statistical analysis
- Tactical fit assessment

**Market Intelligence:**
- Value analysis
- Contract situations
- Transfer opportunities

**Try asking:**
- "What makes a good right back?"
- "How should I evaluate strikers?"
- "What to look for in undervalued players?"

For specific player searches, use the Search tab with filters for position, age, league, and more.`,
    type: "general"
  };
}
