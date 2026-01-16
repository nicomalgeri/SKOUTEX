import { NextResponse } from "next/server";
import { getClubBranding } from "@/lib/club/getClubBranding";

export async function GET() {
  try {
    const branding = await getClubBranding();
    return NextResponse.json(branding);
  } catch (error) {
    return NextResponse.json(
      { name: "SKOUTEX", logoUrl: null },
      { status: 200 }
    );
  }
}
