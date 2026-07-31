import "../src/global.css";
// ✅ Importation du polyfill d'URL au TOUT DÉBUT pour corriger le "Network request failed"
import 'react-native-url-polyfill/auto'; 

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context"; // 👈 1. Import requis

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Le SplashScreen se cache dès que le layout est monté
    SplashScreen.hideAsync();
  }, []);

  return (
    // 👈 2. Wrap de toute l'application avec SafeAreaProvider
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0a0f0d" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(gerant)" />
        <Stack.Screen name="(livreur)" />
      </Stack>
    </SafeAreaProvider>
  );
}
