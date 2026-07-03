import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShoppingBag } from "lucide-react-native";
import { signIn } from "../../lib/auth";

interface Props {
  onToggle: () => void;
}

export default function LoginScreen({ onToggle }: Props) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!phone.trim()) return setError("Le numéro de téléphone est requis.");
    if (password.length < 6) return setError("Mot de passe : minimum 6 caractères.");

    setLoading(true);
    const result = await signIn({ phone, password });
    setLoading(false);

    if (!result.success) setError(result.error || "Échec de la connexion.");
    // Si success → useAuth détecte le changement de session automatiquement
  };

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      {/* Orbes décoratifs */}
      <View className="absolute top-0 left-0 w-72 h-72 rounded-full bg-bf-gold opacity-5 -translate-x-1/2 -translate-y-1/2" />
      <View className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-bf-red opacity-5 translate-x-1/3 translate-y-1/3" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-bf-gold rounded-2xl items-center justify-center shadow-lg mb-4">
              <ShoppingBag size={28} color="#001f13" />
            </View>
            <Text className="text-3xl font-black text-white tracking-tight">
              Bénin<Text style={{ color: "#fcd116" }}>Food</Text>
            </Text>
            <Text className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-1">
              Savourez le meilleur du Bénin
            </Text>
          </View>

          {/* Carte formulaire */}
          <View className="bg-bf-card border border-bf-border rounded-3xl p-6">
            <Text className="text-lg font-black text-white mb-6">Se connecter</Text>

            {/* Erreur */}
            {error ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4">
                <Text className="text-red-300 text-xs font-semibold">{error}</Text>
              </View>
            ) : null}

            {/* Téléphone */}
            <View className="mb-4">
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
                Téléphone
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Phone size={16} color="#94A3B8" />
                <Text className="text-white/40 font-black text-sm mx-2">+229</Text>
                <View className="w-px h-4 bg-white/20 mr-2" />
                <TextInput
                  placeholder="61 00 00 00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  className="flex-1 text-white text-sm font-semibold"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  Mot de passe
                </Text>
                <TouchableOpacity>
                  <Text style={{ color: "#fcd116" }} className="text-xs font-bold">
                    Oublié ?
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-white text-sm font-semibold mx-3"
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  {showPw
                    ? <EyeOff size={16} color="#94A3B8" />
                    : <Eye size={16} color="#94A3B8" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{ backgroundColor: "#fcd116" }}
              className="w-full py-4 rounded-2xl flex-row items-center justify-center"
            >
              {loading
                ? <ActivityIndicator size="small" color="#001f13" />
                : <>
                    <Text className="text-bf-dark font-black text-base mr-2">
                      Se connecter
                    </Text>
                    <ArrowRight size={16} color="#001f13" />
                  </>
              }
            </TouchableOpacity>
          </View>

          {/* Lien inscription */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-white/50 text-sm">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={onToggle}>
              <Text style={{ color: "#fcd116" }} className="text-sm font-black">
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ruban drapeau béninois */}
          <View className="flex-row mx-auto w-20 h-1 rounded-full overflow-hidden mt-8">
            <View className="flex-1 bg-emerald-500" />
            <View style={{ flex: 1, backgroundColor: "#fcd116" }} />
            <View className="flex-1 bg-red-500" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
