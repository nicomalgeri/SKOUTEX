import { NextRequest, NextResponse } from "next/server";
import { formatCurrency } from "@/lib/utils";

// WhatsApp Webhook Handler for player analysis
// This endpoint receives messages from WhatsApp Business API (via Twilio or Meta)

interface WhatsAppMessage {
  from: string;
  body: string;
  profileName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle different webhook formats (Twilio vs Meta)
    let message: WhatsAppMessage;

    if (body.Body && body.From) {
      // Twilio format
      message = {
        from: body.From,
        body: body.Body,
        profileName: body.ProfileName,
      };
    } else if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      // Meta/WhatsApp Business API format
      const waMessage = body.entry[0].changes[0].value.messages[0];
      const contact = body.entry[0].changes[0].value.contacts?.[0];
      message = {
        from: waMessage.from,
        body: waMessage.text?.body || "",
        profileName: contact?.profile?.name,
      };
    } else {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    // Extract player information from the message
    const playerInfo = extractPlayerInfo(message.body);

    if (!playerInfo) {
      return NextResponse.json({
        reply: `👋 Hi${message.profileName ? ` ${message.profileName}` : ""}!\n\nI couldn't identify a player from your message. Please send me a player name.\n\nExample:\n- "Check Kylian Mbappe"\n- "Analyse Jude Bellingham"`,
      });
    }

    // Return guidance to use the platform for detailed analysis
    return NextResponse.json({
      reply: generateSearchGuidance(playerInfo.name, message.profileName),
      action: "search_player",
      playerInfo,
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// Webhook verification for Meta WhatsApp Business API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

function extractPlayerInfo(text: string): { name: string; club?: string } | null {
  // Check for Transfermarkt links
  const transfermarktRegex = /transfermarkt\.[a-z]+\/([^\/]+)\/profil\/spieler\/(\d+)/i;
  const tmMatch = text.match(transfermarktRegex);

  if (tmMatch) {
    // Extract player name from URL (replace hyphens with spaces)
    const name = tmMatch[1].replace(/-/g, " ");
    return { name };
  }

  // Check for "Check [player] from [club]" pattern
  const checkPattern = /check\s+([A-Za-z\s]+?)(?:\s+from\s+([A-Za-z\s]+))?$/i;
  const checkMatch = text.match(checkPattern);

  if (checkMatch) {
    return {
      name: checkMatch[1].trim(),
      club: checkMatch[2]?.trim(),
    };
  }

  // Check for "Analyse [player]" pattern
  const analysePattern = /analy[sz]e\s+([A-Za-z\s]+?)(?:\s+from\s+([A-Za-z\s]+))?$/i;
  const analyseMatch = text.match(analysePattern);

  if (analyseMatch) {
    return {
      name: analyseMatch[1].trim(),
      club: analyseMatch[2]?.trim(),
    };
  }

  // Check for just a name (at least 2 words)
  const words = text.trim().split(/\s+/);
  if (words.length >= 2 && words.every((w) => /^[A-Za-z]+$/.test(w))) {
    return { name: text.trim() };
  }

  return null;
}

function generateSearchGuidance(playerName: string, profileName?: string): string {
  return `👋 Hi${profileName ? ` ${profileName}` : ""}!

🔍 *Searching for: ${playerName}*

To get detailed player analysis with:
• Full statistics breakdown
• Fit score for your club
• Career history
• Transfer insights

Please visit SKOUTEX platform:
🔗 https://skoutex.com/dashboard/search

Search for "${playerName}" to view:
• Complete player profile
• Statistical comparisons
• AI-powered analysis
• Market value trends

━━━━━━━━━━━━━━━━

_Using Sportmonks for live data_
_Updated in real-time_`;
}
