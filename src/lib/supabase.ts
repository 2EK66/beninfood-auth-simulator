import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/* ===========================
   CONFIGURATION SUPABASE
=========================== */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://jafhpkbtxcmzufznnbxc.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

/* ===========================
   SECURE STORAGE
=========================== */

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

/* ===========================
   CLIENT SUPABASE
=========================== */

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  global: {
    headers: {
      "X-Client-Info": `beninfood-mobile/${Platform.OS}`,
    },
  },
});

/* ===========================
   UTILITAIRES
=========================== */

/**
 * Nettoie un numéro de téléphone (extrait les chiffres).
 */
export function sanitizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  
  // Normalise les numéros avec l'indicatif +229
  if (clean.startsWith("229") && clean.length > 8) {
    clean = clean.slice(3);
  }

  return clean;
}

/**
 * Transforme un numéro en email technique.
 */
export function buildPhoneEmail(phone: string): string {
  const clean = sanitizePhone(phone);
  return `${clean}@beninfood.app`;
}

/* ===========================
   PROFIL BENINFOOD
=========================== */

export async function getBfProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("bf_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erreur getBfProfile :", error);
      return null;
    }

    return data;
  } catch (e) {
    console.error("Exception getBfProfile :", e);
    return null;
  }
}
