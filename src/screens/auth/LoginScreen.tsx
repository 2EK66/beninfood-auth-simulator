import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShoppingBag,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { signIn } from "../../lib/auth";

interface Props {
  onToggle: () => void;
}

export default function LoginScreen({ onToggle }: Props) {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");

      const cleanPhone = phone.replace(/\s+/g, "").trim();

      if (!cleanPhone) {
        setError("Le numéro de téléphone est requis.");
        return;
      }

      if (password.length < 6) {
        setError("Mot de passe : minimum 6 caractères.");
        return;
      }

      setLoading(true);

      const result = await signIn({
        phone: cleanPhone,
        password,
      });

      if (!result.success || !result.user) {
        setError(result.error || "Échec de la connexion.");
        return;
      }

      console.log("Connexion réussie :", result.user);

      switch (result.user.role) {
        case "Gérant":
          router.replace("/(gerant)/home");
          break;

        case "Livreur":
          router.replace("/(livreur)/courses");
          break;

        default:
          router.replace("/(client)/home");
          break;
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      {/* Decorative Blur Orbs */}
      <View className="absolute top-0 left-0 w-72 h-72 rounded-full bg-bf-yellow opacity-5 -translate-x-1/2 -translate-y-1/2" />
      <View className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-red-500 opacity-5 translate-x-1/3 translate-y-1/3" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header & Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-bf-yellow rounded-2xl items-center justify-center shadow-lg mb-4">
              <ShoppingBag size={28} color="#001f13" />
            </View>

            <Text className="text-3xl font-black text-white tracking-tight">
              Bénin<Text className="text-bf-yellow">Food</Text>
            </Text>

            <Text className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-1">
              Savourez le meilleur du Bénin
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-bf-card border border-bf-border rounded-3xl p-6">
            <Text className="text-lg font-black text-white mb-6">
              Se connecter
            </Text>

            {error ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4">
                <Text className="text-red-300 text-xs font-semibold">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Field: Phone */}
            <View className="mb-4">
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
                Téléphone
              </Text>

              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Phone size={16} color="#94A3B8" />

                <Text className="text-white/40 font-black text-sm mx-2">
                  +229
                </Text>

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

            {/* Field: Password */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  Mot de passe
                </Text>

                <TouchableOpacity>
                  <Text className="text-bf-yellow text-xs font-bold">
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
                  {showPw ? (
                    <EyeOff size={16} color="#94A3B8" />
                  ) : (
                    <Eye size={16} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className="w-full py-4 rounded-2xl flex-row items-center justify-center bg-bf-yellow"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#001f13" />
              ) : (
                <>
                  <Text className="text-bf-dark font-black text-base mr-2">
                    Se connecter
                  </Text>
                  <ArrowRight size={16} color="#001f13" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle Screen */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-white/50 text-sm">
              Pas encore de compte ?
            </Text>

            <TouchableOpacity onPress={onToggle}>
              <Text className="text-bf-yellow text-sm font-black ml-1">
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Benin Flag Bar */}
          <View className="flex-row mx-auto w-20 h-1 rounded-full overflow-hidden mt-8">
            <View className="flex-1 bg-emerald-500" />
            <View className="flex-1 bg-bf-yellow" />
            <View className="flex-1 bg-red-500" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
