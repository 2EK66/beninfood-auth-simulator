import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
// ✅ Import SafeAreaView depuis le bon package pour éviter le Warning
import { SafeAreaView } from "react-native-safe-area-context"; 
// ✅ Tous les imports d'icônes sont regroupés proprement ici
import {
  Phone, Lock, User, ArrowRight, ShoppingBag,
  Utensils, Check, Bike, Eye, EyeOff
} from "lucide-react-native";
import { signUp } from "../../lib/auth";
import { UserRole } from "../../types";

interface Props {
  onToggle: () => void;
}

const ROLES: { id: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "Client",
    label: "Client gourmand",
    desc: "Commander Atassi, Amiwo, Kpessé…",
    icon: <ShoppingBag size={18} color="#fcd116" />,
    color: "#fcd116",
  },
  {
    id: "Gérant",
    label: "Gérant de Maquis",
    desc: "Publier votre menu et gérer les commandes",
    icon: <Utensils size={18} color="#34d399" />,
    color: "#34d399",
  },
];

export default function RegisterScreen({ onToggle }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Client");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!name.trim()) return setError("Le nom complet est requis.");
    if (!phone.trim()) return setError("Le numéro de téléphone est requis.");
    if (password.length < 6) return setError("Mot de passe : minimum 6 caractères.");

    setLoading(true);
    const result = await signUp({ name, phone, password, role });
    setLoading(false);

    if (!result.success) setError(result.error || "Échec de l'inscription.");
  };

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      <View className="absolute top-0 right-0 w-72 h-72 rounded-full bg-emerald-500 opacity-5 translate-x-1/2 -translate-y-1/2" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo compact */}
          <View className="items-center mb-8">
            <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: "#fcd116" }}>
              <ShoppingBag size={22} color="#001f13" />
            </View>
            <Text className="text-2xl font-black text-white">
              Bénin<Text style={{ color: "#fcd116" }}>Food</Text>
            </Text>
          </View>

          <View className="bg-bf-card border border-bf-border rounded-3xl p-6">
            <Text className="text-lg font-black text-white mb-5">Créer un compte</Text>

            {/* Erreur */}
            {error ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4">
                <Text className="text-red-300 text-xs font-semibold">{error}</Text>
              </View>
            ) : null}

            {/* Sélecteur de rôle */}
            <View className="mb-5">
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
                Votre rôle sur BéninFood
              </Text>
              <View className="gap-y-2">
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    activeOpacity={0.8}
                    className="flex-row items-center p-4 rounded-2xl border-2"
                    style={{
                      borderColor: role === r.id ? r.color : "rgba(255,255,255,0.1)",
                      backgroundColor: role === r.id ? "rgba(255,255,255,0.05)" : "transparent",
                    }}
                  >
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: role === r.id ? `${r.color}20` : "rgba(255,255,255,0.05)" }}
                    >
                      {r.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm">{r.label}</Text>
                      <Text className="text-white/40 text-xs mt-0.5">{r.desc}</Text>
                    </View>
                    {role === r.id && (
                      <View
                        className="w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: r.color }}
                      >
                        <Check size={11} color="#001f13" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note livreur */}
              <View className="flex-row items-start mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl gap-x-2">
                <Bike size={14} color="#60a5fa" style={{ marginTop: 1 }} />
                <Text className="text-blue-200 text-xs font-medium flex-1 leading-relaxed">
                  <Text className="font-bold">Livreurs :</Text> les comptes sont créés
                  exclusivement par l'administrateur BéninFood.
                </Text>
              </View>
            </View>

            {/* Nom */}
            <View className="mb-4">
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
                Nom complet
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <User size={16} color="#94A3B8" />
                <TextInput
                  placeholder="Ex: Sylvain Kodjo"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  className="flex-1 text-white text-sm font-semibold ml-3"
                  autoComplete="name"
                />
              </View>
            </View>

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
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
                Mot de passe
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  placeholder="Min. 6 caractères"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-white text-sm font-semibold mx-3"
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
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={{ backgroundColor: "#fcd116" }}
              className="w-full py-4 rounded-2xl flex-row items-center justify-center"
            >
              {loading
                ? <ActivityIndicator size="small" color="#001f13" />
                : <>
                    <Text className="text-bf-dark font-black text-base mr-2">
                      S'inscrire sur BéninFood
                    </Text>
                    <ArrowRight size={16} color="#001f13" />
                  </>
              }
            </TouchableOpacity>
          </View>

          {/* Lien connexion */}
          <View className="flex-row justify-center mt-6 mb-4">
            <Text className="text-white/50 text-sm">Déjà un compte ? </Text>
            <TouchableOpacity onPress={onToggle}>
              <Text style={{ color: "#fcd116" }} className="text-sm font-black">
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>

          {/* Drapeau du Bénin miniature en bas, magnifique 🇧🇯 */}
          <View className="flex-row mx-auto w-20 h-1 rounded-full overflow-hidden">
            <View className="flex-1 bg-emerald-500" />
            <View style={{ flex: 1, backgroundColor: "#fcd116" }} />
            <View className="flex-1 bg-red-500" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}