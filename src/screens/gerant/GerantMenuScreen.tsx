import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image, Modal, ScrollView, Switch,
} from "react-native";
import {
  Plus, Trash2, ChefHat, RefreshCw, Store, Camera, Clock, Edit3, X,
  Flame, Star, AlertTriangle, ShoppingBag, ShieldCheck, ShieldAlert,
  FileText, CheckCircle2, Award
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfRestaurant, BfMenuItem } from "../../types";

type BfMenuItemWithStats = BfMenuItem & {
  order_count?: number;
};

interface Props { user: BfProfile; }

const LOGO_PRESETS = [
  { name: "Grill", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80" },
  { name: "Tradition", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80" },
  { name: "FastFood", url: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&q=80" },
];

const FOOD_PRESETS = [
  { name: "Amiwo", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=60" },
  { name: "Atassi", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=60" },
  { name: "Gboma", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&q=60" },
  { name: "Wagassi", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=60" },
];

export default function GerantMenuScreen({ user }: Props) {
  const [restaurant, setRestaurant] = useState<BfRestaurant | null>(null);
  const [menu, setMenu] = useState<BfMenuItemWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Édition d'un plat
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<BfMenuItemWithStats | null>(null);

  // Formulaires Restaurant & Plats
  const [restForm, setRestForm] = useState({ name: "", location: "", phone: "" });
  const [selectedLogo, setSelectedLogo] = useState(LOGO_PRESETS[0].url);
  const [creatingRest, setCreatingRest] = useState(false);

  const [form, setForm] = useState({ name: "", price: "", desc: "" });
  const [selectedImage, setSelectedImage] = useState(FOOD_PRESETS[0].url);

  // Modale de vérification
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [submittingKYC, setSubmittingKYC] = useState(false);
  const [kycFrontImage, setKycFrontImage] = useState<string | null>(null);
  const [kycIdCardImage, setKycIdCardImage] = useState<string | null>(null);
  const [kycRegistryImage, setKycRegistryImage] = useState<string | null>(null);

  // 1. Chargement initial
  const fetchData = async () => {
    try {
      const { data: rest } = await supabase
        .from("bf_restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      setRestaurant(rest);

      if (rest) {
        await fetchMenuItems(rest.id);
      }
    } catch (err: any) {
      console.error("Erreur chargement:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId: string | number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: items, error } = await supabase
      .from("bf_menu_du_jour")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur fetch menu:", error.message);
      return;
    }

    const { data: orders } = await supabase
      .from("bf_order_items")
      .select("menu_item_id, quantity")
      .gte("created_at", today.toISOString());

    const orderCounts: Record<string | number, number> = {};
    orders?.forEach((o: any) => {
      orderCounts[o.menu_item_id] = (orderCounts[o.menu_item_id] || 0) + (o.quantity || 1);
    });

    const menuWithStats = (items || []).map(item => ({
      ...item,
      order_count: orderCounts[item.id] || 0,
    }));

    setMenu(menuWithStats);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Realtime Supabase Sync
  useEffect(() => {
    if (!restaurant) return;

    const channel = supabase
      .channel(`menu-du-jour-${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bf_menu_du_jour",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchMenuItems(restaurant.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id]);

  const handleToggleAvailability = async (item: BfMenuItemWithStats, value: boolean) => {
    setMenu(prev => prev.map(m => m.id === item.id ? { ...m, is_available: value } : m));

    const { error } = await supabase
      .from("bf_menu_du_jour")
      .update({ is_available: value })
      .eq("id", item.id);

    if (error) {
      Alert.alert("Erreur", "Impossible de modifier la disponibilité.");
      fetchMenuItems(restaurant!.id);
    }
  };

  // Upload d'image Plat / Logo
  const handlePickImage = async (onSelected: (url: string) => void, bucket: string, pathPrefix: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Accès à la galerie requis.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const fileExt = uri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${pathPrefix}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        onSelected(publicUrlData.publicUrl);
      } catch (err: any) {
        Alert.alert("Erreur d'envoi", err.message || "Impossible d'uploader le fichier.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCreateRestaurant = async () => {
    if (!restForm.name.trim() || !restForm.location.trim()) {
      Alert.alert("Champs requis", "Le nom et la localisation sont obligatoires.");
      return;
    }
    setCreatingRest(true);
    const { error } = await supabase.from("bf_restaurants").insert({
      owner_id: user.id,
      name: restForm.name.trim(),
      location: restForm.location.trim(),
      phone: restForm.phone.trim() || null,
      logo_url: selectedLogo,
      verification_status: "unverified",
    });
    setCreatingRest(false);
    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }
    await fetchData();
  };

  const handleSavePlat = async () => {
    if (!restaurant) return;
    if (!form.name.trim()) { Alert.alert("Champ requis", "Nom du plat obligatoire."); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { Alert.alert("Prix invalide", "Entrez un prix valide."); return; }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("bf_menu_du_jour")
        .update({
          dish_name: form.name.trim(),
          price,
          description: form.desc.trim() || null,
          image_url: selectedImage,
        })
        .eq("id", editingId);

      setSaving(false);
      if (error) { Alert.alert("Erreur", error.message); return; }
    } else {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from("bf_menu_du_jour").insert({
        restaurant_id: restaurant.id,
        dish_name: form.name.trim(),
        price,
        description: form.desc.trim() || null,
        image_url: selectedImage,
        is_available: true,
        expires_at: expiresAt,
      });

      setSaving(false);
      if (error) { Alert.alert("Erreur", error.message); return; }
    }

    resetForm();
  };

  const handleEditClick = (item: BfMenuItemWithStats) => {
    setEditingId(item.id);
    setForm({
      name: item.dish_name,
      price: String(item.price),
      desc: item.description || "",
    });
    if (item.image_url) setSelectedImage(item.image_url);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", price: "", desc: "" });
    setSelectedImage(FOOD_PRESETS[0].url);
  };

  const handleRemovePlat = async (item: BfMenuItemWithStats) => {
    Alert.alert("Supprimer définitivement ?", item.dish_name, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("bf_menu_du_jour").delete().eq("id", item.id);
        },
      },
    ]);
  };

  // Traitement Soumission KYC
  const handleUploadKycFile = async (uri: string, filename: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const path = `${restaurant!.id}/${filename}`;
    const { error } = await supabase.storage
      .from("verification-docs")
      .upload(path, arrayBuffer, { contentType: "image/jpeg", upsert: true });

    if (error) throw error;
    const { data } = supabase.storage.from("verification-docs").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmitVerification = async () => {
    if (!kycFrontImage || !kycIdCardImage) {
      Alert.alert("Pièces manquantes", "La photo de devanture et la pièce d'identité sont obligatoires.");
      return;
    }

    setSubmittingKYC(true);
    try {
      const time = Date.now();
      const frontUrl = await handleUploadKycFile(kycFrontImage, `front_${time}.jpg`);
      const idCardUrl = await handleUploadKycFile(kycIdCardImage, `id_${time}.jpg`);
      
      let registryUrl = null;
      if (kycRegistryImage) {
        registryUrl = await handleUploadKycFile(kycRegistryImage, `registry_${time}.jpg`);
      }

      const { error } = await supabase
        .from("bf_restaurants")
        .update({
          verification_status: "pending",
          front_image_url: frontUrl,
          id_card_url: idCardUrl,
          commerce_registry_url: registryUrl,
        })
        .eq("id", restaurant!.id);

      if (error) throw error;

      Alert.alert(
        "Dossier transmis ! 🚀",
        "Votre demande de vérification est en cours d'examen par notre équipe. Vous serez notifié rapidement."
      );
      setVerificationModalVisible(false);
      await fetchData();
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Échec de l'envoi du dossier.");
    } finally {
      setSubmittingKYC(false);
    }
  };

  const renderVerificationBanner = () => {
    if (!restaurant) return null;

    const status = restaurant.verification_status || "unverified";

    if (status === "verified") {
      return (
        <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
              <ShieldCheck size={20} color="#34d399" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-black text-white">Établissement Vérifié</Text>
                <Award size={14} color="#fcd116" />
              </View>
              <Text className="text-xs text-emerald-400 font-medium mt-0.5">
                Priorité maximale activée sur les recherches
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (status === "pending") {
      return (
        <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-5 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center">
            <Clock size={20} color="#fcd116" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black text-white">Vérification en cours</Text>
            <Text className="text-xs text-amber-300/80 mt-0.5">
              Nos équipes vérifient vos justificatifs. Validation sous 24h.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="bg-[#121c15] border border-[#fcd116]/40 rounded-2xl p-4 mb-5">
        <View className="flex-row items-start gap-3">
          <View className="w-10 h-10 rounded-full bg-[#fcd116]/20 items-center justify-center mt-0.5">
            <ShieldAlert size={20} color="#fcd116" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black text-white">Obtenez le badge ✅ Vérifié</Text>
            <Text className="text-xs text-white/60 mt-1 leading-relaxed">
              Multipliez votre visibilité par 3 et gagnez la confiance de tous les clients BéninFood.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setVerificationStep(1);
                setVerificationModalVisible(true);
              }}
              className="bg-[#fcd116] rounded-xl py-2.5 px-4 mt-3 self-start flex-row items-center gap-2"
            >
              <ShieldCheck size={16} color="#0d1a12" />
              <Text className="text-xs font-black text-[#0d1a12]">Faire vérifier mon restaurant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderBadges = (item: BfMenuItemWithStats) => {
    if (!item.is_available) {
      return (
        <View className="flex-row items-center gap-1 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-full">
          <AlertTriangle size={10} color="#f87171" />
          <Text className="text-[10px] font-bold text-red-400">Rupture</Text>
        </View>
      );
    }

    const createdTime = new Date(item.created_at).getTime();
    const isNew = Date.now() - createdTime < 2 * 60 * 60 * 1000;
    const expiresTime = item.expires_at ? new Date(item.expires_at).getTime() : 0;
    const isExpiringSoon = expiresTime && (expiresTime - Date.now() < 2 * 60 * 60 * 1000);
    const isPopular = (item.order_count || 0) >= 10;

    return (
      <View className="flex-row flex-wrap gap-1 mt-1">
        {isPopular && (
          <View className="flex-row items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
            <Flame size={10} color="#fcd116" />
            <Text className="text-[10px] font-bold text-[#fcd116]">🔥 Populaire</Text>
          </View>
        )}
        {isNew && (
          <View className="flex-row items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <Star size={10} color="#34d399" />
            <Text className="text-[10px] font-bold text-emerald-400">Nouveau</Text>
          </View>
        )}
        {isExpiringSoon && (
          <View className="flex-row items-center gap-1 bg-orange-500/20 border border-orange-500/40 px-2 py-0.5 rounded-full">
            <Clock size={10} color="#fb923c" />
            <Text className="text-[10px] font-bold text-orange-400">⏰ Expire bientôt</Text>
          </View>
        )}
      </View>
    );
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
              <View className="mb-5 flex-row justify-between items-center">
                <View>
                  <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
                    Espace Partenaire
                  </Text>
                  <Text className="text-2xl font-black text-white mt-1">Gestion Restaurant</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-emerald-400" />
                  <Text className="text-[10px] font-bold text-emerald-400 uppercase">En direct</Text>
                </View>
              </View>

              {!restaurant ? (
                /* FORMULAIRE CRÉATION INITIALE */
                <View className="bg-[#0d1a12] border border-[#fcd116]/20 rounded-2xl p-5 mb-5">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Store size={16} color="#fcd116" />
                    <Text className="text-sm font-black text-[#fcd116] uppercase tracking-wider">
                      Créer mon restaurant
                    </Text>
                  </View>
                  <Text className="text-xs text-white/40 mb-4">
                    Enregistrez votre établissement en quelques secondes.
                  </Text>

                  {[
                    { label: "Nom du restaurant *", key: "name", placeholder: "ex: Chez Tanti Sika" },
                    { label: "Localisation *", key: "location", placeholder: "ex: Cotonou, Fidjrossè" },
                    { label: "Téléphone *", key: "phone", placeholder: "+229 97 00 00 00" },
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

                  {/* SÉLECTION DU LOGO */}
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-[10px] font-bold text-white/40 uppercase">Logo / Image Enseigne</Text>
                      <TouchableOpacity
                        onPress={() => handlePickImage((url) => setSelectedLogo(url), "menu-images", "logos")}
                        disabled={uploading}
                        className="flex-row items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg"
                      >
                        {uploading ? (
                          <ActivityIndicator size="small" color="#fcd116" />
                        ) : (
                          <>
                            <Camera size={12} color="#fcd116" />
                            <Text className="text-[#fcd116] text-[10px] font-bold">Uploader mon logo</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-2">
                      {LOGO_PRESETS.map(p => (
                        <TouchableOpacity
                          key={p.name}
                          onPress={() => setSelectedLogo(p.url)}
                          className={`flex-1 rounded-xl overflow-hidden border-2 ${
                            selectedLogo === p.url ? "border-[#fcd116]" : "border-transparent"
                          }`}
                        >
                          <Image source={{ uri: p.url }} className="w-full h-14" resizeMode="cover" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleCreateRestaurant}
                    disabled={creatingRest}
                    className="bg-[#fcd116] rounded-xl py-3.5 items-center mt-1"
                  >
                    <Text className="text-sm font-black text-[#0d1a12]">
                      {creatingRest ? "Création en cours…" : "Créer mon restaurant 🚀"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* CARTE D'EN-TÊTE RESTAURANT */}
                  <View className="bg-[#0d1a12] border border-emerald-500/20 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
                    {restaurant.logo_url ? (
                      <Image source={{ uri: restaurant.logo_url }} className="w-12 h-12 rounded-xl" resizeMode="cover" />
                    ) : (
                      <View className="w-12 h-12 bg-emerald-500/10 rounded-xl items-center justify-center">
                        <Store size={20} color="#34d399" />
                      </View>
                    )}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-base font-black text-white">{restaurant.name}</Text>
                        {restaurant.is_verified && <ShieldCheck size={16} color="#fcd116" />}
                      </View>
                      <Text className="text-xs text-white/40 mt-0.5">{restaurant.location}</Text>
                    </View>
                  </View>

                  {/* BANNIÈRE DE VÉRIFICATION */}
                  {renderVerificationBanner()}

                  {/* FORMULAIRE DE PUBLICATION / ÉDITION DE PLAT */}
                  <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-5 mb-5">
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-2">
                        <ChefHat size={16} color="#fcd116" />
                        <Text className="text-sm font-black text-[#fcd116] uppercase tracking-wider">
                          {editingId ? "Modifier le plat" : "Publier un plat (24h)"}
                        </Text>
                      </View>
                      {editingId && (
                        <TouchableOpacity onPress={resetForm} className="p-1">
                          <X size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                      )}
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

                    <View className="mb-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-[10px] font-bold text-white/40 uppercase">Photo du plat</Text>
                        <TouchableOpacity
                          onPress={() => handlePickImage((url) => setSelectedImage(url), "menu-images", `dishes/${restaurant.id}`)}
                          disabled={uploading}
                          className="flex-row items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg"
                        >
                          {uploading ? (
                            <ActivityIndicator size="small" color="#fcd116" />
                          ) : (
                            <>
                              <Camera size={12} color="#fcd116" />
                              <Text className="text-[#fcd116] text-[10px] font-bold">Choisir une photo</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row gap-2">
                        {FOOD_PRESETS.map(p => (
                          <TouchableOpacity
                            key={p.name}
                            onPress={() => setSelectedImage(p.url)}
                            className={`flex-1 rounded-xl overflow-hidden border-2 ${
                              selectedImage === p.url ? "border-[#fcd116]" : "border-transparent"
                            }`}
                          >
                            <Image source={{ uri: p.url }} className="w-full h-14" resizeMode="cover" />
                            <Text className="text-[9px] text-center text-white/60 py-1 bg-[#0d1a12]">
                              {p.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleSavePlat}
                      disabled={saving}
                      className={`${editingId ? "bg-amber-500" : "bg-emerald-500"} rounded-xl py-3.5 flex-row items-center justify-center gap-2`}
                    >
                      <Plus size={16} color="white" />
                      <Text className="text-sm font-black text-white">
                        {saving ? "Sauvegarde..." : editingId ? "Enregistrer les modifications" : "Publier au menu du jour"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm font-black text-white">
                      Plats actuellement en ligne ({menu.length})
                    </Text>
                    <TouchableOpacity onPress={() => fetchMenuItems(restaurant.id)}>
                      <RefreshCw size={16} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedItemForDetails(item)}
              className={`bg-[#0d1a12] border rounded-2xl p-4 mb-3 ${
                item.is_available ? "border-[#1a2e1f]" : "border-red-500/30 opacity-75"
              }`}
            >
              <View className="flex-row gap-3 items-start">
                {item.image_url && (
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-16 h-16 rounded-xl"
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

                  {renderBadges(item)}

                  <View className="flex-row items-center gap-1.5 mt-2 bg-white/5 border border-white/10 self-start px-2 py-1 rounded-lg">
                    <ShoppingBag size={12} color="#34d399" />
                    <Text className="text-[11px] font-bold text-emerald-400">
                      Commandé {item.order_count || 0} fois aujourd'hui
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-white/5">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-bold text-white/60">Disponible :</Text>
                  <Switch
                    value={item.is_available}
                    onValueChange={(val) => handleToggleAvailability(item, val)}
                    trackColor={{ false: "#374151", true: "#059669" }}
                    thumbColor={item.is_available ? "#34d399" : "#9ca3af"}
                  />
                  <Text className={`text-xs font-black ${item.is_available ? "text-emerald-400" : "text-red-400"}`}>
                    {item.is_available ? "OUI" : "NON"}
                  </Text>
                </View>

                <View className="flex-row gap-2 items-center">
                  <TouchableOpacity
                    onPress={() => handleEditClick(item)}
                    className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20"
                  >
                    <Edit3 size={15} color="#fcd116" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRemovePlat(item)}
                    className="p-2 bg-red-500/10 rounded-xl border border-red-500/20"
                  >
                    <Trash2 size={15} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            restaurant ? (
              <View className="items-center py-8">
                <ChefHat size={32} color="rgba(255,255,255,0.1)" />
                <Text className="text-sm text-white/30 mt-3">Aucun plat enregistré au menu</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>

      {/* MODAL DÉTAILS DU PLAT */}
      <Modal
        visible={!!selectedItemForDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedItemForDetails(null)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#0d1a12] border-t border-[#1a2e1f] rounded-t-3xl overflow-hidden max-h-[85%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedItemForDetails?.image_url ? (
                <View className="relative">
                  <Image
                    source={{ uri: selectedItemForDetails.image_url }}
                    className="w-full h-64"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setSelectedItemForDetails(null)}
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full border border-white/20"
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="w-full h-32 bg-white/5 items-center justify-center relative">
                  <ChefHat size={40} color="rgba(255,255,255,0.2)" />
                  <TouchableOpacity
                    onPress={() => setSelectedItemForDetails(null)}
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full border border-white/20"
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              <View className="p-6">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-2xl font-black text-white flex-1 mr-2">
                    {selectedItemForDetails?.dish_name}
                  </Text>
                  <Text className="text-xl font-black text-[#fcd116]">
                    {Number(selectedItemForDetails?.price || 0).toLocaleString("fr-FR")} FCFA
                  </Text>
                </View>

                {selectedItemForDetails && renderBadges(selectedItemForDetails)}

                <View className="bg-white/5 rounded-2xl p-4 my-4 border border-white/10">
                  <Text className="text-[10px] font-bold text-white/40 uppercase mb-1">
                    Description & Details
                  </Text>
                  <Text className="text-sm text-white/80 leading-relaxed">
                    {selectedItemForDetails?.description || "Aucune description fournie."}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedItemForDetails(null)}
                  className="bg-[#fcd116] rounded-xl py-3.5 items-center"
                >
                  <Text className="text-sm font-black text-[#0d1a12]">Fermer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL SOUMISSION VÉRIFICATION (KYC) */}
      <Modal
        visible={verificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <View className="flex-1 bg-black/85 justify-end">
          <View className="bg-[#0d1a12] border-t border-[#1a2e1f] rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <ShieldCheck size={20} color="#fcd116" />
                <Text className="text-lg font-black text-white">Vérification de l'Établissement</Text>
              </View>
              <TouchableOpacity onPress={() => setVerificationModalVisible(false)} className="p-1">
                <X size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            {/* BARRE DE PROGRESSION ÉTAPES */}
            <View className="flex-row gap-2 mb-6">
              {[1, 2, 3].map(step => (
                <View
                  key={step}
                  className={`flex-1 h-1 rounded-full ${
                    step <= verificationStep ? "bg-[#fcd116]" : "bg-white/10"
                  }`}
                />
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {verificationStep === 1 && (
                <View>
                  <Text className="text-sm font-bold text-white mb-1">Étape 1 : Photo de la devanture</Text>
                  <Text className="text-xs text-white/50 mb-4 leading-relaxed">
                    Ajoutez une photo claire de l'enseigne ou une photo du propriétaire devant l'établissement.
                  </Text>

                  <TouchableOpacity
                    onPress={() => handlePickImage((url) => setKycFrontImage(url), "verification-docs", `${restaurant?.id}`)}
                    className="bg-white/5 border border-dashed border-white/20 rounded-2xl h-44 items-center justify-center mb-5 overflow-hidden"
                  >
                    {kycFrontImage ? (
                      <Image source={{ uri: kycFrontImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="items-center">
                        <Camera size={28} color="#fcd116" />
                        <Text className="text-xs text-white/60 mt-2">Appuyez pour importer la photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setVerificationStep(2)}
                    disabled={!kycFrontImage}
                    className={`rounded-xl py-3.5 items-center ${
                      kycFrontImage ? "bg-[#fcd116]" : "bg-white/10"
                    }`}
                  >
                    <Text className={`text-sm font-black ${kycFrontImage ? "text-[#0d1a12]" : "text-white/30"}`}>
                      Suivant ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {verificationStep === 2 && (
                <View>
                  <Text className="text-sm font-bold text-white mb-1">Étape 2 : Pièce d'identité du gérant</Text>
                  <Text className="text-xs text-white/50 mb-4 leading-relaxed">
                    Importez une photo lisible de votre Carte CIP, CNIB, Passeport ou Permis.
                  </Text>

                  <TouchableOpacity
                    onPress={() => handlePickImage((url) => setKycIdCardImage(url), "verification-docs", `${restaurant?.id}`)}
                    className="bg-white/5 border border-dashed border-white/20 rounded-2xl h-44 items-center justify-center mb-5 overflow-hidden"
                  >
                    {kycIdCardImage ? (
                      <Image source={{ uri: kycIdCardImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="items-center">
                        <FileText size={28} color="#fcd116" />
                        <Text className="text-xs text-white/60 mt-2">Appuyez pour importer la pièce d'identité</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setVerificationStep(1)}
                      className="flex-1 bg-white/10 rounded-xl py-3.5 items-center"
                    >
                      <Text className="text-sm font-bold text-white">Retour</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setVerificationStep(3)}
                      disabled={!kycIdCardImage}
                      className={`flex-1 rounded-xl py-3.5 items-center ${
                        kycIdCardImage ? "bg-[#fcd116]" : "bg-white/10"
                      }`}
                    >
                      <Text className={`text-sm font-black ${kycIdCardImage ? "text-[#0d1a12]" : "text-white/30"}`}>
                        Suivant ➔
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {verificationStep === 3 && (
                <View>
                  <Text className="text-sm font-bold text-white mb-1">Étape 3 : Registre de Commerce (Facultatif)</Text>
                  <Text className="text-xs text-white/50 mb-4 leading-relaxed">
                    Document officiel (IFU / RCCM) permettant d'accélérer la validation du dossier.
                  </Text>

                  <TouchableOpacity
                    onPress={() => handlePickImage((url) => setKycRegistryImage(url), "verification-docs", `${restaurant?.id}`)}
                    className="bg-white/5 border border-dashed border-white/20 rounded-2xl h-36 items-center justify-center mb-6 overflow-hidden"
                  >
                    {kycRegistryImage ? (
                      <Image source={{ uri: kycRegistryImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="items-center">
                        <FileText size={24} color="rgba(255,255,255,0.4)" />
                        <Text className="text-xs text-white/40 mt-2">Ajouter un document (Optionnel)</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSubmitVerification}
                    disabled={submittingKYC}
                    className="bg-emerald-500 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
                  >
                    {submittingKYC ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} color="white" />
                        <Text className="text-sm font-black text-white">Soumettre le dossier</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
