import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag, Utensils, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const CLIENT_CHOICE_KEY = "bf_has_chosen_client";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleClientPress = async () => {
    // On mémorise le choix pour ne plus jamais réafficher cet écran à ce visiteur
    await SecureStore.setItemAsync(CLIENT_CHOICE_KEY, "true");
    router.replace("/(client)/home");
  };

  const handleGerantPress = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      {/* Decorative Blur Orbs */}
      <View className="absolute top-0 left-0 w-72 h-72 rounded-full bg-bf-yellow opacity-5 -translate-x-1/2 -translate-y-1/2" />
      <View className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-red-500 opacity-5 translate-x-1/3 translate-y-1/3" />

      <View className="flex-1 justify-center px-6">
        {/* Logo & Header */}
        <View className="items-center mb-12">
          <View className="w-16 h-16 bg-bf-yellow rounded-2xl items-center justify-center shadow-lg mb-4">
            <ShoppingBag size={28} color="#001f13" />
          </View>
          <Text className="text-3xl font-black text-white tracking-tight">
            Bénin<Text className="text-bf-yellow">Food</Text>
          </Text>
          <Text className="text-white/50 text-sm mt-2 text-center px-6 leading-relaxed">
            Dites-nous qui vous êtes pour commencer
          </Text>
        </View>

        {/* Card Client */}
        <TouchableOpacity
          onPress={handleClientPress}
          activeOpacity={0.85}
          className="bg-bf-card border-2 border-bf-yellow rounded-3xl p-5 mb-4 flex-row items-center"
        >
          <View className="w-12 h-12 rounded-2xl bg-bf-yellow/20 items-center justify-center mr-4">
            <ShoppingBag size={22} color="#fcd116" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-base">Je suis Client</Text>
            <Text className="text-white/50 text-xs mt-0.5">
              Commander directement, sans créer de compte
            </Text>
          </View>
          <ArrowRight size={18} color="#fcd116" />
        </TouchableOpacity>

        {/* Card Gérant */}
        <TouchableOpacity
          onPress={handleGerantPress}
          activeOpacity={0.85}
          className="bg-bf-card border border-white/10 rounded-3xl p-5 flex-row items-center"
        >
          <View className="w-12 h-12 rounded-2xl bg-emerald-500/20 items-center justify-center mr-4">
            <Utensils size={22} color="#34d399" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-base">Je suis Restaurateur / Maquis</Text>
            <Text className="text-white/50 text-xs mt-0.5">
              Se connecter ou créer mon compte Gérant
            </Text>
          </View>
          <ArrowRight size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Note Livreur */}
        <Text className="text-white/30 text-[10px] text-center mt-6 px-8 leading-relaxed">
          Les comptes Livreur sont créés exclusivement par l'administrateur BéninFood.
        </Text>
      </View>

      {/* Benin Flag Bar */}
      <View className="flex-row mx-auto w-20 h-1 rounded-full overflow-hidden mb-8">
        <View className="flex-1 bg-emerald-500" />
        <View className="flex-1 bg-bf-yellow" />
        <View className="flex-1 bg-red-500" />
      </View>
    </SafeAreaView>
  );
}
