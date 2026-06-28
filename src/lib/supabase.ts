import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jafhpkbtxcmzufznnbxc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmhwa2J0eGNtenVmem5uYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxNjcsImV4cCI6MjA5MDQzOTE2N30.PruNINSYGjCwhsiZhcIFVJRX6ix0zJKQMIJKta3YlEM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "bf_supabase_session",
  },
});

/** Récupère le profil BéninFood de l'utilisateur connecté */
export async function getBfProfile(userId: string) {
  const { data, error } = await supabase
    .from("bf_profiles")
    .select("id, name, phone, role")
    .eq("id", userId)
    .single();
  if (error) console.error("getBfProfile error:", error.message);
  return data;
}

/** Déconnexion propre (Supabase + localStorage) */
export async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem("bf_supabase_session");
  localStorage.removeItem("bf_mobile_session");
  localStorage.removeItem("bf_restaurant_profile");
}

/** Récupère la session stockée */
export function getStoredSession() {
  try {
    const raw = localStorage.getItem("bf_supabase_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
