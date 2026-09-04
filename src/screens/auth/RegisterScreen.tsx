import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import {
  Phone, Lock, User, ArrowRight, ShoppingBag,
  Utensils, Bike, Eye, EyeOff, CheckCircle2, LogIn
} from "lucide-react-native";
import { signUp } from "../../lib/auth";
import { UserRole } from "../../types";

interface Props {
  onToggle: () => void;
}

// Un seul rôle s'inscrit lui-même désormais : le Gérant.
// Les Clients commandent en invité, les Livreurs sont créés par l'administrateur.
const FIXED_ROLE: UserRole = "Gérant";

export default function RegisterScreen({ onToggle }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess(false);

    if (!name.trim()) return setError("Le nom complet est requis.");
    if (!phone.trim()) return setError("Le numéro de téléphone est requis.");
    if (password.length < 6) return setError("Mot de passe : minimum 6 caractères.");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");

    setLoading(true);
    const result = await signUp({ name, phone, password, role: FIXED_ROLE });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onToggle();
      }, 2500);
    } else {
      setError(result.error || "Échec de l'inscription.");
    }
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
            <Text className="text-lg font-black text-white mb-1">Créer un compte Gérant</Text>
            <Text className="text-white/40 text-xs font-medium mb-5">
              Publiez votre menu et gérez vos commandes sur BéninFood.
            </Text>

            {/* Message de succès */}
            {success && (
              <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex-row items-start gap-x-3">
                <CheckCircle2 size={20} color="#34d399" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-emerald-400 font-bold text-sm mb-1">
                    Compte créé avec succès !
                  </Text>
                  <Text className="text-emerald-200/80 text-xs leading-relaxed">
                    Veuillez maintenant <Text className="font-bold underline">vous connecter</Text> avec vos identifiants. Redirection en cours...
                  </Text>
                </View>
              </View>
            )}

            {/* Message d'erreur */}
            {error ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4">
                <Text className="text-red-300 text-xs font-semibold">{error}</Text>
              </View>
            ) : null}

            {/* Badge de rôle fixe (plus de sélecteur, il n'y a qu'un seul cas d'inscription) */}
            <View className="mb-5">
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
                Votre rôle sur BéninFood
              </Text>

              <View
                className="flex-row items-center p-4 rounded-2xl border-2"
                style={{
                  borderColor: "#34d399",
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: "#34d39920" }}
                >
                  <Utensils size={18} color="#34d399" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">Gérant de Maquis</Text>
                  <Text className="text-white/40 text-xs mt-0.5">
                    Publier votre menu et gérer les commandes
                  </Text>
                </View>
                <CheckCircle2 size={18} color="#34d399" />
              </View>

              {/* Note client */}
              <View className="flex-row items-start mt-3 p-3 bg-bf-yellow/10 border border-bf-yellow/20 rounded-xl gap-x-2">
                <ShoppingBag size={14} color="#fcd116" style={{ marginTop: 1 }} />
                <Text className="text-yellow-100 text-xs font-medium flex-1 leading-relaxed">
                  <Text className="font-bold">Client :</Text> aucune inscription
                  nécessaire, vous pouvez commander directement en mode invité.
                </Text>
              </View>

              {/* Note livreur */}
              <View className="flex-row items-start mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl gap-x-2">
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
                  editable={!success}
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
                  editable={!success}
                  className="flex-1 text-white text-sm font-semibold"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View className="mb-4">
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
                  editable={!success}
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

            {/* Confirmer le mot de passe */}
            <View className="mb-6">
              <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
                Confirmer le mot de passe
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  placeholder="Répétez le mot de passe"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPw}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!success}
                  className="flex-1 text-white text-sm font-semibold mx-3"
                />
                <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)}>
                  {showConfirmPw
                    ? <EyeOff size={16} color="#94A3B8" />
                    : <Eye size={16} color="#94A3B8" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton d'action */}
            {success ? (
              <TouchableOpacity
                onPress={onToggle}
                activeOpacity={0.85}
                className="w-full py-4 rounded-2xl flex-row items-center justify-center bg-emerald-500"
              >
                <LogIn size={18} color="#001f13" />
                <Text className="text-bf-dark font-black text-base ml-2">
                  Passer à la connexion
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
                style={{ backgroundColor: "#fcd116" }}
                className="w-full py-4 rounded-2xl flex-row items-center justify-center"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#001f13" />
                ) : (
                  <>
                    <Text className="text-bf-dark font-black text-base mr-2">
                      S'inscrire sur BéninFood
                    </Text>
                    <ArrowRight size={16} color="#001f13" />
                  </>
                )}
              </TouchableOpacity>
            )}
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

          {/* Drapeau du Bénin miniature */}
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
