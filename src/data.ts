import { PresetTheme } from "./types";

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: "frosted-glass",
    name: "Verre Givré (Vert/Jaune Bénin)",
    primary: "bg-[#fcd116]",
    text: "text-[#fcd116]",
    border: "border-[#fcd116]",
    hex: "#fcd116"
  },
  {
    id: "orange",
    name: "Orange BéninFood",
    primary: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-600",
    hex: "#D97706"
  },
  {
    id: "red-green-yellow",
    name: "Patriote Béninois (Vert/Jaune/Rouge)",
    primary: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-600",
    hex: "#059669"
  },
  {
    id: "dark-gold",
    name: "Or Royal Abomey",
    primary: "bg-yellow-600",
    text: "text-yellow-600",
    border: "border-yellow-600",
    hex: "#CA8A04"
  },
  {
    id: "cotonou-blue",
    name: "Cotonou Océan Blue",
    primary: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-600",
    hex: "#2563EB"
  }
];

export const SUGGESTIONS = [
  {
    label: "Ajouter l'authentification OTP / SMS",
    instructions: "Ajoute un écran intermédiaire de validation de code OTP reçu par SMS (avec compte à rebours de 60s) après l'inscription pour authentifier le numéro béninois."
  },
  {
    label: "Traduction complète en Fon & Yoruba",
    instructions: "Traduis tous les textes de l'interface en langue locale Fon et Yoruba avec un sélecteur de langue en haut de l'écran."
  },
  {
    label: "Ajouter un champ Email & Photo de profil",
    instructions: "Modifie le formulaire pour inclure une saisie d'adresse e-mail (facultatif) et un bouton d'upload de photo de profil pour les livreurs et restaurateurs."
  },
  {
    label: "Connexion Sociale (Google & Apple)",
    instructions: "Ajoute des boutons modernes en bas pour se connecter rapidement avec Google ou Apple, intégrant une séparation stylisée 'Ou se connecter avec'."
  }
];

export const INITIAL_EXPO_CODE_BOTH = `import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Image,
  Alert
} from 'react-native';
// Note: Utilise lucide-react-native pour les icônes sur Expo
import { Phone, User, Lock, ArrowRight, Check, Eye, EyeOff, Utensils, Bike, ShoppingBag } from 'lucide-react-native';

export type Role = 'Client' | 'Gérant de Restaurant/Maquis' | 'Livreur';

export default function BeninFoodAuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('Client');
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};
    
    if (!phone) {
      tempErrors.phone = 'Le numéro de téléphone est requis';
    } else if (phone.length < 8) {
      tempErrors.phone = 'Le numéro béninois doit contenir au moins 8 chiffres';
    }
    
    if (!password) {
      tempErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      tempErrors.password = 'Le mot de passe doit faire au moins 6 caractères';
    }

    if (!isLogin && !name) {
      tempErrors.name = 'Le nom complet est requis';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simulation d'une requête API réseau
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        Alert.alert(
          "Connexion réussie !", 
          \`Bienvenue sur BeninFood, ravi de vous revoir !\`,
          [{ text: "Découvrir la carte", onPress: () => console.log("OK pressed") }]
        );
      } else {
        Alert.alert(
          "Inscription réussie !", 
          \`Votre compte BeninFood avec le rôle \${role} a bien été créé !\`,
          [{ text: "Commencer", onPress: () => setIsLogin(true) }]
        );
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          className="px-6 py-8"
        >
          {/* Section d'En-tête */}
          <View className="items-center mt-6 mb-8">
            <View className="w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
              <ShoppingBag size={32} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-slate-800 tracking-tight">
              Bénin<Text className="text-amber-600">Food</Text>
            </Text>
            <Text className="text-slate-500 text-center mt-2 text-sm px-4">
              {isLogin 
                ? "Savourez les meilleurs plats du Bénin, livrés chez vous en un clic" 
                : "Créez votre compte et rejoignez la plus grande communauté de gourmands au Bénin"
              }
            </Text>
          </View>

          {/* Formulaire Principal */}
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <Text className="text-xl font-bold text-slate-800 mb-6">
              {isLogin ? 'Se connecter' : 'Créer un compte'}
            </Text>

            {/* Sélecteur de Rôle (Uniquement à l'inscription) */}
            {!isLogin && (
              <View className="mb-6">
                <Text className="text-slate-600 font-semibold mb-3 text-sm">
                  Choisissez votre rôle :
                </Text>
                
                <View className="space-y-3">
                  {/* Option Client */}
                  <TouchableOpacity 
                    onPress={() => setRole('Client')}
                    activeOpacity={0.8}
                    className={\`flex-row items-center p-4 rounded-2xl border-2 transition-all \${
                      role === 'Client' 
                        ? 'border-amber-600 bg-amber-50/40' 
                        : 'border-slate-100 bg-slate-50/50'
                    }\`}
                  >
                    <View className={\`w-10 h-10 rounded-xl items-center justify-center \${
                      role === 'Client' ? 'bg-amber-100' : 'bg-slate-200/60'
                    }\`}>
                      <ShoppingBag size={20} color={role === 'Client' ? '#D97706' : '#64748B'} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className={\`font-bold text-sm \${role === 'Client' ? 'text-amber-900' : 'text-slate-700'}\`}>
                        Client gourmand
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        Pour commander Atassi, Aloko, Igname pilée...
                      </Text>
                    </View>
                    {role === 'Client' && (
                      <View className="w-5 h-5 rounded-full bg-amber-600 items-center justify-center">
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Option Restaurateur */}
                  <TouchableOpacity 
                    onPress={() => setRole('Gérant de Restaurant/Maquis')}
                    activeOpacity={0.8}
                    className={\`flex-row items-center p-4 rounded-2xl border-2 transition-all \${
                      role === 'Gérant de Restaurant/Maquis' 
                        ? 'border-amber-600 bg-amber-50/40' 
                        : 'border-slate-100 bg-slate-50/50'
                    }\`}
                  >
                    <View className={\`w-10 h-10 rounded-xl items-center justify-center \${
                      role === 'Gérant de Restaurant/Maquis' ? 'bg-amber-100' : 'bg-slate-200/60'
                    }\`}>
                      <Utensils size={20} color={role === 'Gérant de Restaurant/Maquis' ? '#D97706' : '#64748B'} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className={\`font-bold text-sm \${role === 'Gérant de Restaurant/Maquis' ? 'text-amber-900' : 'text-slate-700'}\`}>
                        Gérant de Restaurant / Maquis
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        Vendre vos spécialités béninoises en ligne
                      </Text>
                    </View>
                    {role === 'Gérant de Restaurant/Maquis' && (
                      <View className="w-5 h-5 rounded-full bg-amber-600 items-center justify-center">
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Option Livreur */}
                  <TouchableOpacity 
                    onPress={() => setRole('Livreur')}
                    activeOpacity={0.8}
                    className={\`flex-row items-center p-4 rounded-2xl border-2 transition-all \${
                      role === 'Livreur' 
                        ? 'border-amber-600 bg-amber-50/40' 
                        : 'border-slate-100 bg-slate-50/50'
                    }\`}
                  >
                    <View className={\`w-10 h-10 rounded-xl items-center justify-center \${
                      role === 'Livreur' ? 'bg-amber-100' : 'bg-slate-200/60'
                    }\`}>
                      <Bike size={20} color={role === 'Livreur' ? '#D97706' : '#64748B'} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className={\`font-bold text-sm \${role === 'Livreur' ? 'text-amber-900' : 'text-slate-700'}\`}>
                        Livreur dynamique
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        Livrer des plats chauds à moto ou à vélo
                      </Text>
                    </View>
                    {role === 'Livreur' && (
                      <View className="w-5 h-5 rounded-full bg-amber-600 items-center justify-center">
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Input Nom complet (Seulement inscription) */}
            {!isLogin && (
              <View className="mb-4">
                <Text className="text-slate-600 font-semibold mb-2 text-sm">Nom Complet</Text>
                <View className={\`flex-row items-center px-4 py-3.5 bg-slate-50 border rounded-2xl \${
                  errors.name ? 'border-red-500' : 'border-slate-200'
                }\`}>
                  <User size={18} color="#94A3B8" />
                  <TextInput 
                    placeholder="Ex: Sylvain Kodjo"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    className="flex-1 ml-3 text-slate-800 text-sm font-medium"
                  />
                </View>
                {errors.name && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.name}</Text>}
              </View>
            )}

            {/* Input Téléphone */}
            <View className="mb-4">
              <Text className="text-slate-600 font-semibold mb-2 text-sm">Numéro de Téléphone</Text>
              <View className={\`flex-row items-center px-4 py-3.5 bg-slate-50 border rounded-2xl \${
                errors.phone ? 'border-red-500' : 'border-slate-200'
              }\`}>
                <Phone size={18} color="#94A3B8" />
                <Text className="ml-2 text-slate-500 font-bold text-sm">+229</Text>
                <View className="w-[1px] h-5 bg-slate-300 mx-2" />
                <TextInput 
                  placeholder="61 00 00 00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  className="flex-1 text-slate-800 text-sm font-medium"
                />
              </View>
              {errors.phone && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</Text>}
            </View>

            {/* Input Mot de passe */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600 font-semibold text-sm">Mot de passe</Text>
                {isLogin && (
                  <TouchableOpacity>
                    <Text className="text-amber-600 text-xs font-bold">Oublié ?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className={\`flex-row items-center px-4 py-3.5 bg-slate-50 border rounded-2xl \${
                errors.password ? 'border-red-500' : 'border-slate-200'
              }\`}>
                <Lock size={18} color="#94A3B8" />
                <TextInput 
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-slate-800 text-sm font-medium"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
            </View>

            {/* Bouton de Validation */}
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
              className={\`w-full py-4 rounded-2xl flex-row items-center justify-center bg-amber-600 shadow-lg shadow-amber-600/20 \${
                loading ? 'opacity-80' : ''
              }\`}
            >
              <Text className="text-white font-bold text-base mr-2">
                {loading 
                  ? 'Chargement...' 
                  : isLogin ? 'Se connecter' : "S'inscrire sur BeninFood"
                }
              </Text>
              {!loading && <ArrowRight size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          {/* Bouton Toggle Login / Register */}
          <View className="flex-row items-center justify-center mt-8 mb-6">
            <Text className="text-slate-500 text-sm">
              {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="ml-2">
              <Text className="text-amber-600 font-bold text-sm">
                {isLogin ? "S'inscrire" : "Se connecter"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
`;

export const INITIAL_EXPO_CODE_LOGIN = `import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Phone, Lock, ArrowRight, Eye, EyeOff, ShoppingBag } from 'lucide-react-native';

export default function BeninFoodLoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};
    if (!phone) tempErrors.phone = 'Le numéro de téléphone est requis';
    if (!password) tempErrors.password = 'Le mot de passe est requis';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Connexion réussie !", "Heureux de vous revoir sur BeninFood.");
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
            <ShoppingBag size={32} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-slate-800">Bénin<Text className="text-amber-600">Food</Text></Text>
          <Text className="text-slate-500 text-center mt-1 text-sm">Savourez les meilleurs repas béninois</Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <Text className="text-xl font-bold text-slate-800 mb-6">Se connecter</Text>

          <View className="mb-4">
            <Text className="text-slate-600 font-semibold mb-2 text-sm">Téléphone</Text>
            <View className="flex-row items-center px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <Phone size={18} color="#94A3B8" />
              <Text className="ml-2 text-slate-500 font-bold text-sm">+229</Text>
              <TextInput 
                placeholder="61000000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="flex-1 ml-2 text-slate-800 text-sm font-medium"
              />
            </View>
            {errors.phone && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</Text>}
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-600 font-semibold text-sm">Mot de passe</Text>
              <TouchableOpacity><Text className="text-amber-600 text-xs font-bold">Oublié ?</Text></TouchableOpacity>
            </View>
            <View className="flex-row items-center px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <Lock size={18} color="#94A3B8" />
              <TextInput 
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                className="flex-1 ml-3 text-slate-800 text-sm font-medium"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>
            {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-amber-600 flex-row items-center justify-center"
          >
            <Text className="text-white font-bold text-base mr-2">{loading ? 'Chargement...' : 'Se connecter'}</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
`;

export const INITIAL_EXPO_CODE_SIGNUP = `import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Alert
} from 'react-native';
import { Phone, User, Lock, ArrowRight, Check, Utensils, Bike, ShoppingBag } from 'lucide-react-native';

export type Role = 'Client' | 'Gérant de Restaurant/Maquis' | 'Livreur';

export default function BeninFoodSignupScreen() {
  const [role, setRole] = useState<Role>('Client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};
    if (!name) tempErrors.name = 'Le nom complet est requis';
    if (!phone) tempErrors.phone = 'Le numéro est requis';
    if (!password) tempErrors.password = 'Le mot de passe est requis';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Succès !", \`Compte créé avec succès en tant que \${role} !\`);
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center shadow-md mb-4">
            <ShoppingBag size={32} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-slate-800">Bénin<Text className="text-amber-600">Food</Text></Text>
          <Text className="text-slate-500 text-center mt-1 text-sm">Créez votre compte en quelques secondes</Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <Text className="text-xl font-bold text-slate-800 mb-4">Inscription</Text>

          {/* Rôle Selector */}
          <View className="mb-4">
            <Text className="text-slate-600 font-semibold mb-2 text-xs">VOTRE RÔLE SUR LA PLATEFORME</Text>
            <View className="space-y-2">
              {(['Client', 'Gérant de Restaurant/Maquis', 'Livreur'] as Role[]).map((r) => (
                <TouchableOpacity 
                  key={r}
                  onPress={() => setRole(r)}
                  className={\`p-3 rounded-xl border flex-row items-center justify-between \${
                    role === r ? 'border-amber-600 bg-amber-50/20' : 'border-slate-200 bg-slate-50'
                  }\`}
                >
                  <Text className={\`font-bold text-sm \${role === r ? 'text-amber-700' : 'text-slate-700'}\`}>{r}</Text>
                  {role === r && <View className="w-4 h-4 rounded-full bg-amber-600 items-center justify-center"><Check size={10} color="#fff" /></View>}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-600 font-semibold mb-2 text-sm">Nom complet</Text>
            <View className="flex-row items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <User size={18} color="#94A3B8" />
              <TextInput 
                placeholder="Ex: Sylvain Kodjo"
                value={name}
                onChangeText={setName}
                className="flex-1 ml-2 text-slate-800 text-sm font-medium"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-600 font-semibold mb-2 text-sm">Téléphone (+229)</Text>
            <View className="flex-row items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <Phone size={18} color="#94A3B8" />
              <TextInput 
                placeholder="61000000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="flex-1 ml-2 text-slate-800 text-sm font-medium"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-semibold mb-2 text-sm">Mot de passe</Text>
            <View className="flex-row items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <Lock size={18} color="#94A3B8" />
              <TextInput 
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="flex-1 ml-2 text-slate-800 text-sm"
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSignup}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-amber-600 items-center justify-center"
          >
            <Text className="text-white font-bold text-base">{loading ? 'Création...' : "S'inscrire sur BeninFood"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
`;

export const INITIAL_EXPO_CODE_HOME = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Alert
} from 'react-native';
// Note: Utilise lucide-react-native pour les icônes sur Expo
import { 
  Search, 
  Plus, 
  LogOut, 
  SlidersHorizontal, 
  Building, 
  ShoppingBag, 
  ChefHat, 
  User, 
  Utensils, 
  Star, 
  MapPin, 
  Bell, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react-native';

// Types pour notre application
export interface PlatDuJour {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  image?: string;
  etablissement_id?: string;
  created_at?: string;
}

export interface Etablissement {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  description: string;
  location: string;
}

interface HomeScreenProps {
  userRole?: 'Client' | 'Gérant' | 'Livreur' | string;
  userName?: string;
}

export default function HomeScreen({ userRole = 'Gérant', userName = 'Sèmako' }: HomeScreenProps) {
  // Mode actif de l'application pour les gérants hybrides ('client' ou 'gerant')
  const [activeMode, setActiveMode] = useState<'client' | 'gerant'>('client');
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour le formulaire Gérant (Ajout de menu du jour)
  const [platName, setPlatName] = useState('');
  const [platPrice, setPlatPrice] = useState('');
  const [platDesc, setPlatDesc] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Profil du Restaurant/Maquis (ÉTAPE 1)
  const [restaurantProfile, setRestaurantProfile] = useState<{ name: string; location: string; phone: string } | null>(null);
  const [restName, setRestName] = useState('');
  const [restLocation, setRestLocation] = useState('');
  const [restPhone, setRestPhone] = useState('');

  // Données simulées pour bf_etablissements (les maquis aux alentours)
  const [etablissements, setEtablissements] = useState<Etablissement[]>([
    {
      id: '1',
      name: 'Maquis Chez Maman Bénin',
      category: 'Maquis 🇧🇯',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60',
      description: 'Atassi royal, friture de tomate locale avec poisson braisé ou Wagassi frit.',
      location: 'Cotonou, Fidjrossè'
    },
    {
      id: '2',
      name: 'Choukouya Le National',
      category: 'Grillades/Choukouya',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60',
      description: 'Choukouya de mouton tendre épicé et poulet braisé fumé au feu de bois.',
      location: 'Parakou, Quartier dépôt'
    },
    {
      id: '3',
      name: 'Le Gouter Béninois',
      category: 'Pâtisseries',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60',
      description: 'Douceurs traditionnelles, beignets d\\\\'igname (Yovo Doko) et jus d\\\\'ananas frais.',
      location: 'Porto-Novo, Tokpota'
    },
    {
      id: '4',
      name: 'Dany Fast-Food',
      category: 'Fast-Food',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60',
      description: 'Burgers revisités avec frites d\\\\'ignames locales croustillantes sauce piment.',
      location: 'Cotonou, Zongo'
    }
  ]);

  // Liste des plats du jour enregistrés pour le Gérant (bf_plats_du_jour)
  const EXPO_FOOD_PRESETS = [
    { name: "Amiwo 🍗", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60" },
    { name: "Atassi 🍛", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60" },
    { name: "Gboma 🥬", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60" },
    { name: "Wagassi 🧀", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=60" },
  ];
  const [selectedImage, setSelectedImage] = useState(EXPO_FOOD_PRESETS[0].url);

  const [platsDuJour, setPlatsDuJour] = useState<PlatDuJour[]>([
    {
      id: '101',
      name: 'Amiwo au Poulet Bicyclette',
      price: 2500,
      description: 'Pâte de maïs rouge assaisonnée servie avec poulet fermier frit et piment vert.',
      available: true,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: '102',
      name: 'Atassi complet avec fromage Wagassi',
      price: 1500,
      description: 'Mélange de riz et haricot rouge, accompagné de sa friture parfumée.',
      available: true,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60'
    }
  ]);

  // Définir par défaut le mode Gérant si l'utilisateur est connecté comme Gérant
  useEffect(() => {
    if (userRole === 'Gérant' || userRole === 'Gérant de Restaurant/Maquis') {
      setActiveMode('gerant');
    } else {
      setActiveMode('client');
    }
  }, [userRole]);

  // Action de déconnexion via Supabase
  const handleSignOut = async () => {
    try {
      Alert.alert(
        "Déconnexion",
        "Voulez-vous vraiment vous déconnecter de BeninFood ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Oui, déconnexion", 
            style: "destructive",
            onPress: async () => {
              Alert.alert("Simulation", "Déconnexion de l'application mobile simulée !");
            } 
          }
        ]
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProfile = () => {
    if (!restName.trim() || !restLocation.trim() || !restPhone.trim()) {
      Alert.alert("Profil incomplet", "Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    
    const profile = {
      name: restName.trim(),
      location: restLocation.trim(),
      phone: restPhone.trim()
    };
    
    setRestaurantProfile(profile);
    
    // Ajouter l'établissement localement pour l'affichage Client
    const newEtab: Etablissement = {
      id: 'etab_expo_' + Date.now().toString(),
      name: profile.name,
      category: 'Maquis 🇧🇯',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60',
      description: 'Authentique spécialité locale. Contact: ' + profile.phone,
      location: profile.location
    };
    
    setEtablissements([newEtab, ...etablissements]);
    Alert.alert("Maquis créé !", 'Le profil de "' + profile.name + '" a bien été enregistré dans la table bf_restaurants. Étape 2 débloquée !');
  };

  // Publier un nouveau plat du jour (côté Gérant)
  const handlePublishPlat = () => {
    if (!platName.trim()) {
      Alert.alert("Champ requis", "Veuillez entrer le nom du plat.");
      return;
    }
    const priceNum = parseFloat(platPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Prix invalide", "Veuillez spécifier un prix supérieur à 0 FCFA.");
      return;
    }

    setIsPublishing(true);

    // Simulation de l'insertion dans la table Supabase 'bf_plats_du_jour'
    setTimeout(() => {
      const newPlat: PlatDuJour = {
        id: Date.now().toString(),
        name: platName,
        price: priceNum,
        description: platDesc || 'Accompagnement classique et sauce.',
        available: true,
        image: selectedImage
      };

      setPlatsDuJour([newPlat, ...platsDuJour]);
      setPlatName('');
      setPlatPrice('');
      setPlatDesc('');
      setIsPublishing(false);

      Alert.alert(
        "Plat publié ! 🥘",
        \`Le plat "\${newPlat.name}" est maintenant affiché au menu de votre établissement.\`
      );
    }, 800);
  };

  // Filtrer les maquis / plats côté Client
  const filteredEtablissements = etablissements.filter(etab => 
    etab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etab.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F13" />
      
      {/* 1. HEADER DYNAMIQUE */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeSub}>BéninFood • {activeMode === 'gerant' ? 'Professionnel' : 'Gourmand'}</Text>
            <Text style={styles.welcomeTitle}>
              {activeMode === 'gerant' ? 'Mon Maquis 🏢' : \`Akwaaba, \${userName} 👋\`}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Bouton de notifications */}
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.badgeIndicator} />
            <Bell size={20} color="#FBBF24" />
          </TouchableOpacity>
          
          {/* Bouton de Déconnexion */}
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. BOUTON DE BASCULE (Visible uniquement pour le rôle Gérant) */}
      {(userRole === 'Gérant' || userRole === 'Gérant de Restaurant/Maquis') && (
        <View style={styles.toggleContainer}>
          <View style={styles.toggleBackground}>
            <TouchableOpacity 
              onPress={() => setActiveMode('client')} 
              style={[styles.toggleBtn, activeMode === 'client' && styles.toggleBtnActive]}
            >
              <ShoppingBag size={14} color={activeMode === 'client' ? '#001F13' : '#FFFFFF'} />
              <Text style={[styles.toggleText, activeMode === 'client' && styles.toggleTextActive]}>
                Mode Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveMode('gerant')} 
              style={[styles.toggleBtn, activeMode === 'gerant' && styles.toggleBtnActive]}
            >
              <ChefHat size={14} color={activeMode === 'gerant' ? '#001F13' : '#FFFFFF'} />
              <Text style={[styles.toggleText, activeMode === 'gerant' && styles.toggleTextActive]}>
                Mode Gérant
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ZONE CONTENU DE L'ÉCRAN */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {activeMode === 'client' ? (
          /* =========================================
             3. VUE CLIENT : RECHERCHE + FLATLIST
             ========================================= */
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {/* Barre de recherche */}
            <View style={styles.searchBarContainer}>
              <Search size={18} color="#94A3B8" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Chercher Amiwo, Fufu, Atassi ou un maquis..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              <TouchableOpacity style={styles.filterButton}>
                <SlidersHorizontal size={16} color="#FBBF24" />
              </TouchableOpacity>
            </View>

            {/* Plats du Jour du Maquis avec photos */}
            {platsDuJour.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🔥 Plats du Jour Live</Text>
                  <Text style={styles.sectionSubtitle}>Menu publié en direct par le gérant</Text>
                </View>
                <FlatList
                  horizontal
                  data={platsDuJour}
                  keyExtractor={item => 'client_plat_' + item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4 }}
                  renderItem={({ item }) => (
                    <View style={{ width: 130, backgroundColor: '#002A1A', borderRadius: 12, overflow: 'hidden', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                      <View style={{ position: 'relative', height: 70, width: '100%' }}>
                        <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' }} style={{ width: '100%', height: '100%' }} />
                        <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 8, fontWeight: '900', color: '#FBBF24' }}>{item.price} F</Text>
                        </View>
                      </View>
                      <View style={{ padding: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }} numberOfLines={1}>{item.description}</Text>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Titre de Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Maquis &amp; Restaurants à proximité</Text>
              <Text style={styles.sectionSubtitle}>Données table: bf_etablissements</Text>
            </View>

            {/* Liste des Établissements */}
            <FlatList
              data={filteredEtablissements}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.maquisCard} activeOpacity={0.95}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  
                  {/* Badge de note */}
                  <View style={styles.ratingBadge}>
                    <Star size={11} color="#FBBF24" fill="#FBBF24" />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    
                    <View style={styles.cardFooter}>
                      <View style={styles.locationContainer}>
                        <MapPin size={12} color="#EF4444" style={{ marginRight: 4 }} />
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                      <Text style={styles.deliveryIndicator}>🛵 Livraison Rapide</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ChefHat size={40} color="#94A3B8" />
                  <Text style={styles.emptyText}>Aucun maquis ou plat trouvé pour "{searchQuery}"</Text>
                </View>
              }
            />
          </View>
        ) : (
          /* =========================================
             4. VUE GÉRANT : FORMULAIRE MENU DU JOUR + FLATLIST
             ========================================= */
          <FlatList
            data={platsDuJour}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
            ListHeaderComponent={
              <View>
                {restaurantProfile === null ? (
                  /* ÉTAPE 1 : PROFIL DU RESTAURANT */
                  <View style={styles.formCard}>
                    <View style={styles.formHeader}>
                      <ChefHat size={18} color="#FBBF24" style={{ marginRight: 8 }} />
                      <Text style={styles.formTitle}>ÉTAPE 1 : PROFIL DE MON MAQUIS</Text>
                    </View>
                    <Text style={styles.formSubtitle}>Veuillez enregistrer votre établissement (table bf_restaurants) pour débloquer le menu.</Text>

                    {/* Champ Nom du Maquis */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nom du Maquis *</Text>
                      <TextInput
                        value={restName}
                        onChangeText={setRestName}
                        placeholder="Ex: Chez Tanti Sika, Le Régal du Centre"
                        placeholderTextColor="#94A3B8"
                        style={styles.formInput}
                      />
                    </View>

                    {/* Champ Emplacement */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Emplacement / Quartier *</Text>
                      <TextInput
                        value={restLocation}
                        onChangeText={setRestLocation}
                        placeholder="Ex: Cotonou - Fidjrossè, Abomey-Calavi"
                        placeholderTextColor="#94A3B8"
                        style={styles.formInput}
                      />
                    </View>

                    {/* Champ Téléphone */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Numéro de Téléphone *</Text>
                      <TextInput
                        value={restPhone}
                        onChangeText={setRestPhone}
                        placeholder="Ex: +229 97 00 00 00"
                        placeholderTextColor="#94A3B8"
                        style={styles.formInput}
                      />
                    </View>

                    {/* Bouton de Validation */}
                    <TouchableOpacity 
                      onPress={handleCreateProfile}
                      style={[styles.publishButton, { backgroundColor: '#FBBF24' }]}
                      activeOpacity={0.9}
                    >
                      <CheckCircle2 size={16} color="#001F13" style={{ marginRight: 6 }} />
                      <Text style={[styles.publishButtonText, { color: '#001F13' }]}>
                        Créer le Profil du Maquis 🚀
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* ÉTAPE 2 : GESTION DU MENU DU JOUR */
                  <View>
                    {/* Bannière du Maquis créé */}
                    <View style={{ backgroundColor: '#002518', borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>🏢 {restaurantProfile.name}</Text>
                        <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>📍 {restaurantProfile.location} • 📞 {restaurantProfile.phone}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => {
                          setRestName(restaurantProfile.name);
                          setRestLocation(restaurantProfile.location);
                          setRestPhone(restaurantProfile.phone);
                          setRestaurantProfile(null);
                        }}
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                      >
                        <Text style={{ fontSize: 9, color: '#FBBF24', fontWeight: 'bold' }}>Modifier</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Formulaire complet pour ajouter un plat */}
                    <View style={styles.formCard}>
                      <View style={styles.formHeader}>
                        <ChefHat size={18} color="#FBBF24" style={{ marginRight: 8 }} />
                        <Text style={styles.formTitle}>ÉTAPE 2 : Publier le Menu du Jour</Text>
                      </View>
                      <Text style={styles.formSubtitle}>Ajouter un plat visible instantanément par les clients (bf_plats)</Text>
                      
                      {/* Champ Nom du Plat */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nom du plat *</Text>
                        <TextInput
                          value={platName}
                          onChangeText={setPlatName}
                          placeholder="Ex: Amiwo au Poulet, Atassi, Fufu"
                          placeholderTextColor="#94A3B8"
                          style={styles.formInput}
                        />
                      </View>

                      {/* Champ Prix en FCFA */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Prix (FCFA) *</Text>
                        <View style={styles.priceInputWrapper}>
                          <TextInput
                            value={platPrice}
                            onChangeText={setPlatPrice}
                            placeholder="Ex: 2000"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            style={styles.priceInput}
                          />
                          <View style={styles.currencyBadge}>
                            <Text style={styles.currencyText}>FCFA</Text>
                          </View>
                        </View>
                      </View>

                      {/* Champ Description */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Accompagnement / Description courte</Text>
                        <TextInput
                          value={platDesc}
                          onChangeText={setPlatDesc}
                          placeholder="Ex: Servi chaud avec sauce pimentée et oignons"
                          placeholderTextColor="#94A3B8"
                          style={styles.formInput}
                        />
                      </View>

                      {/* Photo du Plat / Menu */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Photo du menu / Plat</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#001A10', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                          <Image source={{ uri: selectedImage }} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 4, fontWeight: 'bold' }}>PRESETS OU CAMÉRA :</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                              {EXPO_FOOD_PRESETS.map((preset) => (
                                <TouchableOpacity 
                                  key={preset.name}
                                  onPress={() => setSelectedImage(preset.url)}
                                  style={{ 
                                    paddingHorizontal: 6, 
                                    paddingVertical: 4, 
                                    backgroundColor: selectedImage === preset.url ? '#FBBF24' : 'rgba(255,255,255,0.05)', 
                                    borderRadius: 6, 
                                    marginRight: 4,
                                    marginBottom: 4 
                                  }}
                                >
                                  <Text style={{ fontSize: 9, color: selectedImage === preset.url ? '#001F13' : '#FFFFFF', fontWeight: 'bold' }}>{preset.name}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <TouchableOpacity 
                              onPress={() => Alert.alert("Sélection de fichier", "Simulé: Importation d'une photo depuis l'appareil photo ou la galerie d'Expo.")}
                              style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 2, alignSelf: 'flex-start' }}
                            >
                              <Text style={{ fontSize: 8, color: '#FFFFFF', fontWeight: 'bold' }}>📸 Prendre une photo / Galerie</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Bouton de Publication */}
                      <TouchableOpacity 
                        onPress={handlePublishPlat}
                        disabled={isPublishing}
                        style={styles.publishButton}
                        activeOpacity={0.9}
                      >
                        <Plus size={16} color="#001F13" style={{ marginRight: 6 }} />
                        <Text style={styles.publishButtonText}>
                          {isPublishing ? 'Publication...' : 'Publier le plat du jour'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Section List Header */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Plats publiés aujourd'hui</Text>
                      <Text style={styles.sectionSubtitle}>Total : {platsDuJour.length} plats enregistrés (bf_plats_du_jour)</Text>
                    </View>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.platListItem}>
                <View style={styles.platLeft}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={{ width: 40, height: 40, borderRadius: 8 }} />
                  ) : (
                    <View style={styles.platIconBg}>
                      <Utensils size={16} color="#FBBF24" />
                    </View>
                  )}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.platName}>{item.name}</Text>
                    <Text style={styles.platDesc} numberOfLines={1}>{item.description}</Text>
                  </View>
                </View>
                
                <View style={styles.platRight}>
                  <Text style={styles.platPrice}>{item.price} FCFA</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Actif</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={[styles.emptyContainer, { backgroundColor: '#002A1A', borderColor: '#003F27' }]}>
                <Utensils size={32} color="#94A3B8" />
                <Text style={styles.emptyText}>Aucun plat du jour publié pour le moment.</Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F13', // Vert foncé béninois
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#002A1A', // Vert forêt
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.15)', // Jaune Or discret
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBBF24', // Jaune Or
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#001F13',
  },
  welcomeTextContainer: {
    marginLeft: 12,
  },
  welcomeSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444', // Rouge accent
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  toggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: '#002A1A',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FBBF24', // Actif Jaune Or
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  toggleTextActive: {
    color: '#001F13',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 46,
    marginTop: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#FBBF24',
    fontWeight: '700',
    marginTop: 1,
    opacity: 0.8,
  },
  maquisCard: {
    backgroundColor: '#002A1A',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 31, 19, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  cardContent: {
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)', // Émeraude léger
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10B981', // Émeraude
  },
  cardDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
  },
  deliveryIndicator: {
    fontSize: 9,
    color: '#10B981', // Émeraude
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#002A1A',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  formSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: '#001F13',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001F13',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  priceInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  currencyBadge: {
    backgroundColor: '#002A1A',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
  },
  currencyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FBBF24',
  },
  publishButton: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    height: 42,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  publishButtonText: {
    color: '#001F13',
    fontWeight: '900',
    fontSize: 12,
  },
  platListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#002A1A',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  platLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  platName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  platDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
  platRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  platPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FBBF24',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  statusBadgeText: {
    fontSize: 8,
    color: '#10B981',
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#002A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '600',
  }
});
`;

