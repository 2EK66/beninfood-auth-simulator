import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator,
  Alert, RefreshControl, Linking, Platform, Image
} from "react-native";
import {
  Bike, MapPin, Package, LogOut,
  Wifi, WifiOff, CheckCircle2, Navigation, Utensils, Clock, AlertTriangle, ShieldCheck, Compass
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder } from "../../types";
import { useRouter } from "expo-router";

interface Props { user: BfProfile; }

// Fonction utilitaire pour calculer la distance à vol d'oiseau (Formule d'Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

export default function LivreurCoursesScreen({ user }: Props) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"Connecting..." | "Live" | "Offline" | "Reconnexion...">("Connecting...");

  // Stocke le temps restant calculé basé sur reserved_until
  const [activeReservation, setActiveReservation] = useState<{ orderId: string; secondsLeft: number } | null>(null);

  const fetchCourses = async () => {
    const nowIso = new Date().toISOString();

    // Filtre : status pending ET (non réservée OU réservation expirée OU réservée PAR MOI)
    const { data, error } = await supabase
      .from("bf_orders")
      .select(`
        id,
        total_amount,
        delivery_landmark,
        delivery_lat,
        delivery_lng,
        created_at,
        restaurant_name,
        restaurant_address,
        restaurant_logo_url,
        restaurant_lat,
        restaurant_lng,
        reserved_by,
        reserved_until
      `)
      .eq("status", "pending")
      .or(`reserved_until.is.null,reserved_until.lt.${nowIso},reserved_by.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCourses(data);

      // Vérifier si une commande est actuellement réservée par ce livreur
      const myReservedOrder = data.find(
        (o) => o.reserved_by === user.id && o.reserved_until && new Date(o.reserved_until) > new Date()
      );

      if (myReservedOrder) {
        const secondsLeft = Math.max(0, Math.floor((new Date(myReservedOrder.reserved_until).getTime() - Date.now()) / 1000));
        setActiveReservation({ orderId: myReservedOrder.id, secondsLeft });
      } else {
        setActiveReservation(null);
      }
    }
    setLoading(false);
  };

  // Compte à rebours basé sur la date serveur
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeReservation && activeReservation.secondsLeft > 0) {
      timer = setInterval(() => {
        setActiveReservation((prev) => {
          if (!prev || prev.secondsLeft <= 1) {
            fetchCourses(); // Recharger quand le temps expire
            return null;
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeReservation?.orderId]);

  useEffect(() => {
    fetchCourses();

    let debounceTimer: NodeJS.Timeout;
    const channel = supabase
      .channel("livreur_courses_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bf_orders" },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => fetchCourses(), 300);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionStatus("Live");
        else if (status === "CLOSED") setConnectionStatus("Offline");
        else if (status === "CHANNEL_ERROR") setConnectionStatus("Reconnexion...");
        else setConnectionStatus("Connecting...");
      });

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  // 1. Réservation Atomique via la fonction PostgreSQL
  const handleReserve = async (orderId: string) => {
    setActionLoading(true);

    const { data: isSuccess, error } = await supabase.rpc("reserve_order", {
      p_order_id: orderId,
      p_delivery_person_id: user.id,
    });

    setActionLoading(false);

    if (error || !isSuccess) {
      Alert.alert("Course indisponible", "Un autre livreur vient d'être plus rapide ou la commande n'est plus libre.");
      await fetchCourses();
      return;
    }

    await fetchCourses();
  };

  // 2. Confirmation Définitive via la fonction PostgreSQL
  const handleConfirmOrder = async (orderId: string) => {
    setActionLoading(true);

    const { data: isSuccess, error } = await supabase.rpc("confirm_order_assignment", {
      p_order_id: orderId,
      p_delivery_person_id: user.id,
    });

    setActionLoading(false);

    if (error || !isSuccess) {
      Alert.alert("Délai expiré", "Le temps de réservation de 30 secondes s'est écoulé.");
      setActiveReservation(null);
      await fetchCourses();
      return;
    }

    // Redirection directe vers l'écran de livraison active
    router.replace({
      pathname: "/(livreur)/livraison",
      params: { orderId },
    });
  };

  const openGPS = async (lat?: number | null, lng?: number | null, label?: string) => {
    if (lat == null || lng == null) {
      Alert.alert("GPS", "Coordonnées GPS non disponibles.");
      return;
    }
    const latLng = `${lat},${lng}`;
    const encodedLabel = encodeURIComponent(label || "Destination");
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
    const nativeUrl = Platform.select({
      ios: `maps:0,0?q=${encodedLabel}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${encodedLabel})`,
    });

    try {
      if (nativeUrl && (await Linking.canOpenURL(nativeUrl))) {
        await Linking.openURL(nativeUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      await Linking.openURL(webUrl);
    }
  };

  const renderTimeBadge = (createdAt: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);

    if (elapsedMinutes > 15) {
      return (
        <View className="bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <AlertTriangle size={10} color="#f87171" />
          <Text className="text-[10px] font-black text-red-400">🚨 Urgente • {elapsedMinutes} min</Text>
        </View>
      );
    }

    if (elapsedMinutes >= 5) {
      return (
        <View className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Clock size={10} color="#fbbf24" />
          <Text className="text-[10px] font-black text-amber-400">🔥 Prioritaire • {elapsedMinutes} min</Text>
        </View>
      );
    }

    return (
      <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex-row items-center gap-1">
        <Text className="text-[10px] font-black text-emerald-400">🟢 Nouvelle • {elapsedMinutes <= 0 ? "À l'instant" : `${elapsedMinutes} min`}</Text>
      </View>
    );
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

      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-[#1a2e1f] flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
            Livreur • BéninFood
          </Text>
          <Text className="text-lg font-black text-white mt-0.5">
            {user.name.split(" ")[0]} 🏍️
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${
            connectionStatus === "Live" 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-amber-500/10 border-amber-500/20"
          }`}>
            {connectionStatus === "Live" ? <Wifi size={11} color="#34d399" /> : <WifiOff size={11} color="#fbbf24" />}
            <Text className={`text-[10px] font-black ${connectionStatus === "Live" ? "text-emerald-400" : "text-amber-400"}`}>
              {connectionStatus}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <LogOut size={16} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(o) => o.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fcd116" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-black text-white">Courses disponibles</Text>
              <View className="bg-[#fcd116]/10 border border-[#fcd116]/20 px-3 py-1 rounded-full">
                <Text className="text-[11px] font-black text-[#fcd116]">
                  {courses.length} course{courses.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-white/30 mt-1">
              Réservation atomique sécurisée (30s)
            </Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const isReservedByMe = activeReservation?.orderId === order.id;

          // Calcul de la distance du restaurant au client si les GPS sont disponibles
          const distanceText =
            order.restaurant_lat && order.restaurant_lng && order.delivery_lat && order.delivery_lng
              ? calculateDistance(order.restaurant_lat, order.restaurant_lng, order.delivery_lat, order.delivery_lng)
              : null;

          return (
            <View className={`border rounded-2xl p-4 mb-4 ${
              isReservedByMe ? "bg-[#16271a] border-[#fcd116]" : "bg-[#0d1a12] border-[#1a2e1f]"
            }`}>
              {/* Header Carte */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[10px] font-mono font-bold text-white/30">
                  📦 #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                {renderTimeBadge(order.created_at)}
              </View>

              {/* Trajet / Distance du parcours */}
              {distanceText && (
                <View className="flex-row items-center gap-1.5 mb-3 bg-[#fcd116]/10 border border-[#fcd116]/20 px-3 py-1.5 rounded-xl self-start">
                  <Compass size={12} color="#fcd116" />
                  <Text className="text-[11px] font-bold text-[#fcd116]">
                    Trajet estimé : {distanceText}
                  </Text>
                </View>
              )}

              {/* Restaurant */}
              <View className="flex-row items-center gap-3 mb-3 bg-white/5 p-3 rounded-xl">
                {order.restaurant_logo_url ? (
                  <Image source={{ uri: order.restaurant_logo_url }} className="w-12 h-12 rounded-xl bg-black/20" resizeMode="cover" />
                ) : (
                  <View className="w-12 h-12 rounded-xl bg-[#fcd116]/10 border border-[#fcd116]/20 items-center justify-center">
                    <Utensils size={20} color="#fcd116" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-[10px] text-white/40 uppercase font-bold">Restaurant</Text>
                  <Text className="text-sm font-bold text-white" numberOfLines={1}>
                    {order.restaurant_name ?? "Partenaire BéninFood"}
                  </Text>
                  {order.restaurant_address && (
                    <Text className="text-[11px] text-white/50 mt-0.5" numberOfLines={1}>
                      📍 {order.restaurant_address}
                    </Text>
                  )}
                </View>
              </View>

              {/* Arrivée client + GPS */}
              <View className="flex-row items-center justify-between mb-3 bg-white/5 p-3 rounded-xl">
                <View className="flex-row items-start gap-2 flex-1 mr-2">
                  <MapPin size={16} color="#f87171" style={{ marginTop: 2 }} />
                  <View className="flex-1">
                    <Text className="text-[10px] text-white/40 uppercase font-bold">Arrivée client</Text>
                    <Text className="text-xs font-semibold text-white/90">
                      {order.delivery_landmark ?? "Adresse non précisée"}
                    </Text>
                  </View>
                </View>
                {order.delivery_lat != null && order.delivery_lng != null && (
                  <TouchableOpacity
                    onPress={() => openGPS(order.delivery_lat, order.delivery_lng, order.delivery_landmark)}
                    className="bg-red-500/20 border border-red-500/30 px-3 py-2 rounded-xl flex-row items-center gap-1.5"
                  >
                    <Navigation size={12} color="#f87171" />
                    <Text className="text-[11px] font-bold text-red-300">GPS</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Valeur & Gain */}
              <View className="flex-row items-center gap-3 mb-4 bg-white/5 rounded-xl p-3">
                <Package size={16} color="rgba(255,255,255,0.4)" />
                <View className="flex-1">
                  <Text className="text-xs text-white/40">Valeur commande</Text>
                  <Text className="text-sm font-black text-white">
                    {Number(order.total_amount).toLocaleString("fr-FR")} FCFA
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-white/40">Votre gain</Text>
                  <Text className="text-base font-black text-[#fcd116]">1 500 F</Text>
                </View>
              </View>

              {/* ACTION : Réservation vs Confirmation */}
              {isReservedByMe ? (
                <View className="bg-[#fcd116]/10 border border-[#fcd116]/30 p-3 rounded-xl">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-bold text-[#fcd116]">
                      🔒 Course réservée temporairement
                    </Text>
                    <Text className="text-xs font-black text-white bg-red-500/80 px-2 py-0.5 rounded-md">
                      ⏱ {activeReservation?.secondsLeft}s
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleConfirmOrder(order.id)}
                    disabled={actionLoading}
                    className="bg-[#fcd116] py-3.5 rounded-xl items-center flex-row justify-center gap-2"
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#0d1a12" size="small" />
                    ) : (
                      <ShieldCheck size={18} color="#0d1a12" />
                    )}
                    <Text className="text-sm font-black text-[#0d1a12]">
                      Confirmer la livraison
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleReserve(order.id)}
                  disabled={actionLoading || activeReservation !== null}
                  className={`rounded-xl py-3.5 flex-row items-center justify-center gap-2 ${
                    activeReservation !== null ? "bg-white/10 opacity-40" : "bg-[#fcd116]"
                  }`}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#0d1a12" size="small" />
                  ) : (
                    <Bike size={18} color="#0d1a12" />
                  )}
                  <Text className="text-sm font-black text-[#0d1a12]">
                    Réserver la course
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4">
              <CheckCircle2 size={28} color="rgba(255,255,255,0.15)" />
            </View>
            <Text className="text-sm font-bold text-white/30">
              Aucune course disponible
            </Text>
            <Text className="text-xs text-white/20 mt-1.5 text-center px-8">
              Tirez vers le bas pour actualiser ou attendez une nouvelle commande
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
