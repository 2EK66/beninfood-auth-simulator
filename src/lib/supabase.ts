import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const SUPABASE_URL = "https://jafhpkbtxcmzufznnbxc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmhwa2J0eGNtenVmem5uYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxNjcsImV4cCI6MjA5MDQzOTE2N30.PruNINSYGjCwhsiZhcIFVJRX6ix0zJKQMIJKta3YlEM";

// Stockage sécurisé (Keychain iOS / Keystore Android)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // désactivé sur mobile
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function buildPhoneEmail(phone: string): string {
  const clean = phone.replace(/[\s\-\+\(\)]/g, "").replace(/^229/, "");
  return `${clean}@beninfood.bj`;
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-\+\(\)]/g, "").replace(/^229/, "");
}

export async function getBfProfile(userId: string) {
  const { data, error } = await supabase
    .from("bf_profiles")
    .select("id, name, phone, role")
    .eq("id", userId)
    .single();
  if (error) console.error("getBfProfile:", error.message);
  return data;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}
