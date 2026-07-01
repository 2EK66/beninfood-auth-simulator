import { createClient } from "@supabase/supabase-js";
import * as SecureStore from 'expo-secure-store';

// Configuration de l'adaptateur de stockage pour Expo
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const SUPABASE_URL = "https://jafhpkbtxcmzufznnbxc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmhwa2J0eGNtenVmem5uYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxNjcsImV4cCI6MjA5MDQzOTE2N30.PruNINSYGjCwhsiZhcIFVJRX6ix0zJKQMIJKta3YlEM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any, // Gère la session mobile automatiquement
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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

/** Déconnexion propre (Supabase + SecureStore) */
export async function signOut() {
  await supabase.auth.signOut();
  // Nettoyage asynchrone sur mobile
  await SecureStore.deleteItemAsync("bf_mobile_session");
  await SecureStore.deleteItemAsync("bf_restaurant_profile");
}

/** Récupère manuellement la session stockée (si besoin) */
export async function getStoredSession() {
  try {
    const raw = await SecureStore.getItemAsync("bf_mobile_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
