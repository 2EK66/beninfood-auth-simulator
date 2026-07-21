import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";  // ← ajouter

const SUPABASE_URL = "https://jafhpkbtxcmzufznnbxc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmhwa2J0eGNtenVmem5uYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxNjcsImV4cCI6MjA5MDQzOTE2N30.PruNINSYGjCwhsiZhcIFVJRX6ix0zJKQMIJKta3YlEM";

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