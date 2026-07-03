import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator,
  Alert, RefreshControl,
} from "react-native";
import {
  Bike, MapPin, Package, LogOut,
  Wifi, WifiOff, CheckCircle2,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder } from "../../types";
import { useRouter } from "expo-router";

interface Props { user: BfProfile; }

export default function LivreurCoursesScreen({ user }: Props) {
  const router = useRouter();
  const [courses, setCourses] = useState<BfOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchCourses = async () => {
    // Commandes pending non encore assignées
    const { data } = await supabase
      .from("bf_orders")
      .select("*")
      .eq("status", "pending")
      .is("delivery_person_id", null)
      .order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();

    // Realtime : nouvelles commandes disponibles
    const channel = supabase
      .channel("livreur_courses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bf_orders" },
        () => fetchCourses()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleAccept = async (order: BfOrder) => {
    Alert.alert(
      "Accepter cette course ?",
      `Destination : ${order.delivery_landmark ?? "Non précisée"}\nGain : 1 500 FCFA`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Accepter 🏍️",
          onPress: async () => {
            setAccepting(order.id);
            const { error } = await supabase
              .from("bf_orders")
              .update({
                status: "accepted",
                delivery_person_id: user.id,
              })
              .eq("id", order.id)
              .eq("status", "pending"); // sécurité : pas de double accept

            setAccepting(null);

            if (error) {
              Alert.alert("Erreur", "Cette course vient d'être prise par un autre livreur.");
              await fetchCourses();
              return;
            }

            // Naviguer vers l'écran de livraison active
            router.replace("/(livreur)/livraison");
          },
        },
      ]
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
          {/* Indicateur Realtime */}
          <View className="flex-row items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-full">
            <Wifi size={11} color="#34d399" />
            <Text className="text-[10px] font-black text-emerald-400">Live</Text>
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
        keyExtractor={o => o.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fcd116"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-black text-white">
                Courses disponibles
              </Text>
              <View className="bg-[#fcd116]/10 border border-[#fcd116]/20 px-3 py-1 rounded-full">
                <Text className="text-[11px] font-black text-[#fcd116]">
                  {courses.length} course{courses.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-white/30 mt-1">
              Mises à jour en temps réel • Appuyez pour accepter
            </Text>
          </View>
        }
        renderItem={({ item: order }) => (
          <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-4">
            {/* ID + badge */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[10px] font-mono font-bold text-white/30">
                #{order.id.slice(0, 8).toUpperCase()}
              </Text>
              <View className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <Text className="text-[10px] font-black text-amber-400">Nouvelle</Text>
              </View>
            </View>

            {/* Lieu de livraison */}
            <View className="flex-row items-start gap-2 mb-3">
              <MapPin size={14} color="#f87171" style={{ marginTop: 1 }} />
              <Text className="text-sm font-semibold text-white/80 flex-1">
                {order.delivery_landmark ?? "Adresse non précisée"}
              </Text>
            </View>

            {/* Montant + gain */}
            <View className="flex-row items-center gap-3 mb-4 bg-white/5 rounded-xl p-3">
              <Package size={14} color="rgba(255,255,255,0.3)" />
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

            {/* Date */}
            <Text className="text-[10px] text-white/20 mb-3">
              Publiée {new Date(order.created_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>

            {/* Bouton accepter */}
            <TouchableOpacity
              onPress={() => handleAccept(order)}
              disabled={accepting === order.id}
              className="bg-[#fcd116] rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              {accepting === order.id
                ? <ActivityIndicator color="#0d1a12" size="small" />
                : <Bike size={16} color="#0d1a12" />
              }
              <Text className="text-sm font-black text-[#0d1a12]">
                {accepting === order.id ? "Acceptation…" : "Accepter la course"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
