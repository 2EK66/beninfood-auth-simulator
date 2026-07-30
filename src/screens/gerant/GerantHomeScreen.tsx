import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator,
  RefreshControl, Image, Alert, Modal, StyleSheet
} from "react-native";
import {
  ShoppingBag, CheckCircle2, Clock, TrendingUp,
  LogOut, Store, AlertCircle, Camera, ChevronRight, QrCode, X, Check
} from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder, BfRestaurant } from "../../types";
import { useRouter } from "expo-router";

interface Props { user: BfProfile; }

interface RestaurantStats {
  total_delivered: number;
  total_pending: number;
  total_revenue: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "En attente", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  accepted:  { label: "Acceptée",   color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  preparing: { label: "En cuisine", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  ready:     { label: "Prête à être récupérée", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  scanned:   { label: "En route",   color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  delivered: { label: "Livrée ✓",  color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  cancelled: { label: "Annulée",   color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

export default function GerantHomeScreen({ user }: Props) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<BfRestaurant | null>(null);
  const [orders, setOrders] = useState<BfOrder[]>([]);
  const [stats, setStats] = useState<RestaurantStats>({ total_delivered: 0, total_pending: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // État pour la Modale QR Code
  const [selectedOrderForQR, setSelectedOrderForQR] = useState<BfOrder | null>(null);

  // 1. Chargement global des données
  const fetchData = useCallback(async () => {
    try {
      const { data: rest, error: restErr } = await supabase
        .from("bf_restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (restErr) throw restErr;
      setRestaurant(rest);

      if (rest) {
        const { data: ord } = await supabase
          .from("bf_orders")
          .select("*")
          .eq("restaurant_id", rest.id)
          .order("created_at", { ascending: false })
          .limit(20);

        setOrders(ord || []);

        const { data: st } = await supabase
          .from("bf_restaurant_stats")
          .select("*")
          .eq("restaurant_id", rest.id)
          .maybeSingle();

        if (st) {
          setStats({
            total_delivered: Number(st.total_delivered || 0),
            total_pending: Number(st.total_pending || 0),
            total_revenue: Number(st.total_revenue || 0),
          });
        }
      }
    } catch (err: any) {
      console.error("Erreur chargement dashboard:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Realtime Filtré par restaurant_id
  useEffect(() => {
    if (!restaurant) return;

    const channel = supabase
      .channel(`gerant_orders_${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bf_orders",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant, fetchData]);

  // 3. Modification du statut d'une commande
  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from("bf_orders")
        .update({ status: nextStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

      // Si la commande passe à "ready", on propose directement d'afficher le QR Code
      if (nextStatus === "ready") {
        const targetOrder = orders.find(o => o.id === orderId);
        if (targetOrder) {
          setSelectedOrderForQR({ ...targetOrder, status: "ready" });
        }
      }
    } catch (err: any) {
      Alert.alert("Erreur", "Impossible de modifier le statut de la commande.");
    }
  };

  // 4. Upload d'image du restaurant
  const pickAndUploadImage = async () => {
    if (!restaurant) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'accès aux photos est requis.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploadingImage(true);
      const asset = result.assets[0];

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const fileExt = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `restaurants/${restaurant.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("restaurant-images")
        .upload(filePath, arrayBuffer, {
          contentType: asset.type ? `${asset.type}/${fileExt}` : `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("restaurant-images")
        .getPublicUrl(filePath);

      const imageUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      await supabase
        .from("bf_restaurants")
        .update({ image_url: imageUrl })
        .eq("id", restaurant.id);

      setRestaurant(prev => prev ? { ...prev, image_url: imageUrl } : null);
      Alert.alert("Succès", "Logo mis à jour avec succès.");
    } catch (err: any) {
      console.error("Erreur upload:", err);
      Alert.alert("Erreur", "Échec de la mise à jour de l'image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
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

      {/* En-tête */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-[#1a2e1f]">
        <View>
          <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
            Gérant • BéninFood
          </Text>
          <Text className="text-lg font-black text-white mt-0.5">
            {user.name.split(" ")[0]} 👋
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20"
        >
          <LogOut size={18} color="#f87171" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#fcd116" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            {/* Infos du Restaurant */}
            {restaurant ? (
              <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-5">
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity onPress={pickAndUploadImage} disabled={uploadingImage} className="relative">
                    {uploadingImage ? (
                      <View className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center justify-center">
                        <ActivityIndicator size="small" color="#fcd116" />
                      </View>
                    ) : restaurant.image_url ? (
                      <Image source={{ uri: restaurant.image_url }} className="w-12 h-12 rounded-xl border border-emerald-500/30" />
                    ) : (
                      <View className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center justify-center">
                        <Store size={20} color="#34d399" />
                      </View>
                    )}
                    <View className="absolute -bottom-1 -right-1 bg-[#fcd116] rounded-full p-1 border border-[#0a0f0d]">
                      <Camera size={10} color="#0a0f0d" />
                    </View>
                  </TouchableOpacity>

                  <View className="flex-1">
                    <Text className="text-sm font-black text-white">{restaurant.name}</Text>
                    <Text className="text-xs text-white/40 mt-0.5">{restaurant.location}</Text>
                  </View>
                  <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <Text className="text-[10px] font-black text-emerald-400">Ouvert</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 flex-row gap-3">
                <AlertCircle size={18} color="#fbbf24" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-amber-300">Restaurant non configuré</Text>
                </View>
              </View>
            )}

            {/* Statistiques Réelles */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <TrendingUp size={16} color="#fcd116" />
                <Text className="text-xl font-black text-[#fcd116] mt-2">
                  {stats.total_revenue.toLocaleString("fr-FR")} F
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">Revenus Totaux</Text>
              </View>

              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <CheckCircle2 size={16} color="#34d399" />
                <Text className="text-xl font-black text-white mt-2">{stats.total_delivered}</Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">Livrées</Text>
              </View>

              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <Clock size={16} color="#fbbf24" />
                <Text className="text-xl font-black text-white mt-2">{stats.total_pending}</Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">En attente</Text>
              </View>
            </View>

            <Text className="text-sm font-black text-white mb-3">Commandes récentes</Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const isReadyOrScanned = order.status === "ready" || order.status === "scanned";

          return (
            <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-black text-white font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                <View style={{ backgroundColor: s.bg }} className="px-2.5 py-1 rounded-full">
                  <Text style={{ color: s.color }} className="text-[10px] font-bold">
                    {s.label}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs text-white/40">
                  {new Date(order.created_at).toLocaleString("fr-FR", {
                    day: "2-digit", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </Text>
                <Text className="text-sm font-black text-[#fcd116]">
                  {Number(order.restaurant_amount || 0).toLocaleString()} FCFA
                </Text>
              </View>

              {/* Actions du Gérant selon le Statut */}
              <View className="flex-row gap-2 pt-2 border-t border-white/5">
                {order.status === "pending" && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, "accepted")}
                    className="flex-1 bg-blue-500/20 border border-blue-500/40 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
                  >
                    <Text className="text-blue-400 font-bold text-xs">Accepter la commande</Text>
                    <ChevronRight size={14} color="#60a5fa" />
                  </TouchableOpacity>
                )}

                {order.status === "accepted" && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, "preparing")}
                    className="flex-1 bg-orange-500/20 border border-orange-500/40 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
                  >
                    <Text className="text-orange-400 font-bold text-xs">Lancer la préparation 🍳</Text>
                    <ChevronRight size={14} color="#fb923c" />
                  </TouchableOpacity>
                )}

                {order.status === "preparing" && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, "ready")}
                    className="flex-1 bg-purple-500/20 border border-purple-500/40 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
                  >
                    <Text className="text-purple-400 font-bold text-xs">Commande Prête ! 📦</Text>
                    <ChevronRight size={14} color="#c084fc" />
                  </TouchableOpacity>
                )}

                {/* BOUTON GENERATION DE QR CODE (disponible quand prête ou en route) */}
                {isReadyOrScanned && (
                  <TouchableOpacity
                    onPress={() => setSelectedOrderForQR(order)}
                    className="flex-1 bg-[#fcd116]/10 border border-[#fcd116]/40 py-2.5 rounded-xl items-center flex-row justify-center gap-2"
                  >
                    <QrCode size={16} color="#fcd116" />
                    <Text className="text-[#fcd116] font-black text-xs">Afficher le QR Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <ShoppingBag size={36} color="rgba(255,255,255,0.1)" />
            <Text className="text-sm text-white/30 mt-3">Aucune commande pour l'instant</Text>
          </View>
        }
      />

      {/* MODALE D'AFFICHAGE DU QR CODE POUR LE LIVREUR */}
      <Modal
        visible={!!selectedOrderForQR}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedOrderForQR(null)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center p-5">
          <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-3xl p-6 w-full max-w-sm items-center relative">
            
            {/* Bouton Fermer */}
            <TouchableOpacity
              onPress={() => setSelectedOrderForQR(null)}
              className="absolute top-4 right-4 bg-white/10 p-2 rounded-full"
            >
              <X size={18} color="#fff" />
            </TouchableOpacity>

            <Text className="text-white font-black text-lg mb-1">Scanner le Colis</Text>
            <Text className="text-white/40 text-xs text-center mb-6">
              Présentez ce code au livreur lors de la remise du sac.
            </Text>

            {/* Container Blanc du QR Code pour un contraste de scan maximal */}
            {selectedOrderForQR && (
              <View className="bg-white p-5 rounded-2xl items-center justify-center shadow-2xl mb-5">
                <QRCode
                  value={`bf://pickup/${selectedOrderForQR.id}`}
                  size={200}
                  color="#0a0f0d"
                  backgroundColor="#ffffff"
                />
              </View>
            )}

            <Text className="text-[#fcd116] font-mono font-black text-sm mb-1">
              #{selectedOrderForQR?.id.slice(0, 8).toUpperCase()}
            </Text>
            
            <View className="flex-row items-center gap-1.5 mt-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Check size={12} color="#34d399" />
              <Text className="text-xs font-bold text-white/70">
                Statut : {STATUS_CONFIG[selectedOrderForQR?.status || 'ready']?.label}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
