import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";

type ClubBranding = {
  name: string;
  logoUrl: string | null;
};

export async function getClubBranding(): Promise<ClubBranding> {
  const { club } = await getClubForUserOrCreate();
  const name = club?.name?.trim() || "SKOUTEX";
  const logoUrl = club?.logo_url ?? null;
  return { name, logoUrl };
}
