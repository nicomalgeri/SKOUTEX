import type { ClubContext } from "@/lib/club/context";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";

export async function getClubContextForUser(): Promise<ClubContext | null> {
  const { club } = await getClubForUserOrCreate();
  return (club.club_context as ClubContext) ?? null;
}

export async function upsertClubContextForUser(
  context: ClubContext
): Promise<ClubContext> {
  const { supabase, club } = await getClubForUserOrCreate();

  const { data, error } = await supabase
    .from("clubs")
    .update({ club_context: context })
    .eq("id", club.id)
    .select("club_context")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to update club context");
  }

  return data.club_context as ClubContext;
}
