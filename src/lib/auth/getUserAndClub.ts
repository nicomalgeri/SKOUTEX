import { createClient } from "@/lib/supabase/server";

type ClubRow = {
  id: string;
  owner_user_id: string;
  name: string;
  logo_url: string | null;
  club_context: unknown;
  created_at: string;
  updated_at: string;
};

export async function getAuthedUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export async function getClubForUserOrCreate() {
  const { supabase, user } = await getAuthedUserOrThrow();

  const { data: existing, error } = await supabase
    .from("clubs")
    .select("id, owner_user_id, name, logo_url, club_context, created_at, updated_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existing) {
    return { supabase, user, club: existing as ClubRow };
  }

  const { data: created, error: insertError } = await supabase
    .from("clubs")
    .insert({ owner_user_id: user.id, name: "My Club" })
    .select("id, owner_user_id, name, logo_url, club_context, created_at, updated_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existingAfter, error: selectError } = await supabase
        .from("clubs")
        .select("id, owner_user_id, name, logo_url, club_context, created_at, updated_at")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (selectError || !existingAfter) {
        throw selectError || new Error("Failed to fetch club after conflict");
      }

      return { supabase, user, club: existingAfter as ClubRow };
    }

    throw insertError;
  }

  if (!created) {
    throw new Error("Failed to create club");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[clubs] Created club for user", user.id, created.id);
  }

  return { supabase, user, club: created as ClubRow };
}
