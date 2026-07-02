import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { Plus, Trash2, Check, ChefHat, RefreshCw, Store } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfRestaurant, BfMenuItem } from "../../types";

interface Props { user: BfProfile; }

const FOOD_PRESETS = [
  { name: "Amiwo", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=60" },
  { name: "Atassi", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=60" },
  { name: "Gboma", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&q=60" },
  { name: "Wagassi", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=60" },
];

export default function GerantMenuScreen({ user }: Props) {
  const [restaurant, setRestaurant] = useState<BfRestaurant | null>(null);
  const [menu, setMenu] = useState<BfMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulaire profil restaurant
  const [restForm, setRestForm] = useState({ name: "", location: "", phone: "" });
  const [creatingRest, setCreatingRest] = useState(false);

  // Formulaire plat
  const [form, setForm] = useState({ name: "", price: "", desc: "" });
  const [selectedImage, setSelectedImage] = useState(FOOD_PRESETS[0].url);

  const fetchData = async () => {
    const { data: rest } = await supabase
      .from("bf_restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .single();
    setRestaurant(rest);

    if (rest) {
      const { data: items } = await supabase
        .from("bf_menu_du_jour")
        .select("*")
        .eq("restaurant_id", rest.id)
        .eq("is_available", true)
        .order("created_at", { ascending: false });
      setMenu(items || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateRestaurant = async () => {
    if (!restForm.name.trim() || !restForm.location.trim()) {
      Alert.alert("Champs requis", "Nom et localisation sont obligatoires.");
      return;
    }
    setCreatingRest(true);
    const { error } = await supabase.from("bf_restaurants").insert({
      owner_id: user.id,
      name: restForm.name.trim(),
      location: restForm.location.trim(),
      phone: restForm.phone.trim() || null,
    });
    setCreatingRest(false);
    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }
    await fetchData();
  };

  const handleAddPlat = async () => {
    if (!restaurant) return;
    if (!form.name.trim()) { Alert.alert("Champ requis", "Nom du plat obligatoire."); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { Alert.alert("Prix invalide", "Entrez un prix valide."); return; }

    setSaving(true);
    const { error } = await supabase.from("bf_menu_du_jour").insert({
      restaurant_id: restaurant.id,
      dish_name: form.name.trim(),
      price,
      description: form.desc.trim() || null,
      image_url: selectedImage,
      is_available: true,
    });
    setSaving(false);
    if (error) { Alert.alert("Erreur", error.message); return; }
    setForm({ name: "", price: "", desc: "" });
    Alert.alert("✅ Plat publié !", `"${form.name}" est maintenant visible par les clients.`);
    await fetchData();
  };

  const handleRemovePlat = async (item: BfMenuItem) => {
    Alert.alert("Retirer ce plat ?", item.dish_name, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Retirer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("bf_menu_du_jour")
            .update({ is_available: false })
            .eq("id", item.id);
          setMenu(prev => prev.filter(m => m.id !== item.id));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0f0d] items-center justify-center">
        <ActivityIndicator color="#fcd116" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0f0d]">
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={menu}
          keyExtractor={m => String(m.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListHeaderComponent={
            <View>
              {/* Header */}
              <View className="mb-5">
                <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
                  Gestion du menu
                </Text>
                <Text className="text-2xl font-black text-white mt-1">Mon Menu</Text>
              </View>

              {/* Si pas de restaurant → formulaire création */}
              {!restaurant ? (
                <View className="bg-[#0d1a12] border border-[#fcd116]/20 rounded-2xl p-5 mb-5">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Store size={16} color="#fcd116" />
                    <Text className="text-sm font-black text-[#fcd116] uppercase tracking-wider">
                      Créer mon restaurant
                    </Text>
                  </View>
                  <Text className="text-xs text-white/40 mb-4">
                    Enregistrez votre établissement pour commencer à publier votre menu.
                  </Text>
                  {[
                    { label: "Nom du restaurant *", key: "name", placeholder: "ex: Chez Tanti Sika" },
                    { label: "Localisation *", key: "location", placeholder: "ex: Cotonou, Fidjrossè" },
                    { label: "Téléphone", key: "phone", placeholder: "+229 97 00 00 00" },
                  ].map(field => (
                    <View key={field.key} className="mb-3">
                      <Text className="text-[10px] font-bold text-white/40 uppercase mb-1.5">
                        {field.label}
                      </Text>
                      <TextInput
                        value={restForm[field.key as keyof typeof restForm]}
                        onChangeText={v => setRestForm(p => ({ ...p, [field.key]: v }))}
                        placeholder={field.placeholder}
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white"
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={handleCreateRestaurant}
                    disabled={creatingRest}
                    className="bg-[#fcd116] rounded-xl py-3 items-center mt-1"
                  >
                    <Text className="text-sm font-black text-[#0d1a12]">
                      {creatingRest ? "Création…" : "Créer mon restaurant 🚀"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Info restaurant */}
                  <View className="bg-[#0d1a12] border border-emerald-500/20 rounded-2xl p-4 mb-5 flex-row items-center gap-3">
                    <View className="w-9 h-9 bg-emerald-500/10 rounded-xl items-center justify-center">
                      <Store size={16} color="#34d399" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-black text-white">{restaurant.name}</Text>
                      <Text className="text-xs text-white/40">{restaurant.location}</Text>
                    </View>
                  </View>

                  {/* Formulaire ajout plat */}
                  <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-5 mb-5">
                    <View className="flex-row items-center gap-2 mb-4">
                      <ChefHat size={16} color="#fcd116" />
                      <Text className="text-sm font-black text-[#fcd116] uppercase tracking-wider">
                        Publier un plat
                      </Text>
                    </View>

                    <View className="mb-3">
                      <Text className="text-[10px] font-bold text-white/40 uppercase mb-1.5">Nom du plat *</Text>
                      <TextInput
                        value={form.name}
                        onChangeText={v => setForm(p => ({ ...p, name: v }))}
                        placeholder="ex: Amiwo au poulet, Atassi complet…"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white"
                      />
                    </View>

                    <View className="mb-3">
                      <Text className="text-[10px] font-bold text-white/40 uppercase mb-1.5">Prix (FCFA) *</Text>
                      <TextInput
                        value={form.price}
                        onChangeText={v => setForm(p => ({ ...p, price: v }))}
                        placeholder="ex: 2500"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType="numeric"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-[10px] font-bold text-white/40 uppercase mb-1.5">Description</Text>
                      <TextInput
                        value={form.desc}
                        onChangeText={v => setForm(p => ({ ...p, desc: v }))}
                        placeholder="Accompagnements, sauce, cuisson…"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        multiline
                        numberOfLines={2}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white"
                      />
                    </View>

                    {/* Presets images */}
                    <View className="mb-4">
                      <Text className="text-[10px] font-bold text-white/40 uppercase mb-2">Photo du plat</Text>
                      <View className="flex-row gap-2">
                        {FOOD_PRESETS.map(p => (
                          <TouchableOpacity
                            key={p.name}
                            onPress={() => setSelectedImage(p.url)}
                            className={`flex-1 rounded-xl overflow-hidden border-2 ${
                              selectedImage === p.url ? "border-[#fcd116]" : "border-transparent"
                            }`}
                          >
                            <Image
                              source={{ uri: p.url }}
                              className="w-full h-14"
                              resizeMode="cover"
                            />
                            <Text className="text-[9px] text-center text-white/60 py-1 bg-[#0d1a12]">
                              {p.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleAddPlat}
                      disabled={saving}
                      className="bg-emerald-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
                    >
                      <Plus size={16} color="white" />
                      <Text className="text-sm font-black text-white">
                        {saving ? "Publication…" : "Publier au menu du jour"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Titre liste */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm font-black text-white">
                      Menu actif ({menu.length})
                    </Text>
                    <TouchableOpacity onPress={fetchData}>
                      <RefreshCw size={16} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-3 flex-row gap-3">
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  className="w-14 h-14 rounded-xl"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-bold text-white" numberOfLines={1}>
                  {item.dish_name}
                </Text>
                {item.description && (
                  <Text className="text-xs text-white/40 mt-0.5" numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
                <Text className="text-sm font-black text-[#fcd116] mt-1">
                  {Number(item.price).toLocaleString("fr-FR")} FCFA
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemovePlat(item)}
                className="p-2 bg-red-500/10 rounded-xl border border-red-500/20 self-center"
              >
                <Trash2 size={16} color="#f87171" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            restaurant ? (
              <View className="items-center py-8">
                <ChefHat size={32} color="rgba(255,255,255,0.1)" />
                <Text className="text-sm text-white/30 mt-3">Aucun plat publié</Text>
                <Text className="text-xs text-white/20 mt-1">Utilisez le formulaire ci-dessus</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
