import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/* ===========================
   CONFIGURATION SUPABASE
=========================== */

const SUPABASE_URL = "https://jafhpkbtxcmzufznnbxc.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmhwa2J0eGNtenVmem5uYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxNjcsImV4cCI6MjA5MDQzOTE2N30.PruNINSYGjCwhsiZhcIFVJRX6ix0zJKQMIJKta3YlEM";

/* ===========================
   SECURE STORAGE
=========================== */

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),

  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),

  removeItem: (key: string) =>
    SecureStore.deleteItemAsync(key),
};

/* ===========================
   CLIENT SUPABASE
=========================== */

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
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
  }
);

/* ===========================
   UTILITAIRES
=========================== */

/**
 * Nettoie un numéro de téléphone.
 * Exemple :
 * +229 61 22 33 44
 * devient
 * 61223344
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Transforme un numéro en email technique.
 * Supabase exige un email.
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
    console.log("Recherche du profil :", userId);

    const { data, error } = await supabase
      .from("bf_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erreur getBfProfile :", error);
      return null;
    }

    if (!data) {
      console.log("Aucun profil trouvé.");
      return null;
    }

    console.log("Profil trouvé :", data);

    return data;
  } catch (e) {
    console.error("Exception getBfProfile :", e);
    return null;
  }
}
