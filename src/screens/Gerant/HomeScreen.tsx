import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  LayoutDashboard, ShoppingBag, CheckCircle2,
  Clock, TrendingUp, LogOut, Store, AlertCircle,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder, BfRestaurant } from "../../types";
import { useRouter } from "expo-router";

interface Props { user: BfProfile; }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "En attente",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  accepted:  { label: "Acceptée",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  scanned:   { label: "En route",    color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  arrived:   { label: "Arrivé",      color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  delivered: { label: "Livrée ✓",   color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  cancelled: { label: "Annulée",    color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

export default function GerantHomeScreen({ user }: Props) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<BfRestaurant | null>(null);
  const [orders, setOrders] = useState<BfOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    // Récupérer le restaurant du gérant
    const { data: rest } = await supabase
      .from("bf_restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .single();
    setRestaurant(rest);

    if (rest) {
      // Commandes du restaurant
      const { data: ord } = await supabase
        .from("bf_orders")
        .select("*")
        .eq("restaurant_id", rest.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders(ord || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Realtime commandes
    const channel = supabase
      .channel("gerant_orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bf_orders" },
        (payload) => setOrders(prev => [payload.new as BfOrder, ...prev])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  // Stats
  const delivered = orders.filter(o => o.status === "delivered").length;
  const pending = orders.filter(o => o.status === "pending").length;
  const revenue = orders
    .filter(o => o.status === "delivered")
    .reduce((s, o) => s + Number(o.restaurant_amount), 0);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fcd116" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            {/* Restaurant info */}
            {restaurant ? (
              <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-5">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center justify-center">
                    <Store size={18} color="#34d399" />
                  </View>
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
                  <Text className="text-xs text-white/50 mt-0.5">
                    Configurez votre restaurant dans l'onglet Menu.
                  </Text>
                </View>
              </View>
            )}

            {/* KPIs */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <TrendingUp size={16} color="#fcd116" />
                <Text className="text-xl font-black text-[#fcd116] mt-2">
                  {revenue.toLocaleString("fr-FR")} F
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">Revenus</Text>
              </View>
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <CheckCircle2 size={16} color="#34d399" />
                <Text className="text-xl font-black text-white mt-2">{delivered}</Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">Livrées</Text>
              </View>
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <Clock size={16} color="#fbbf24" />
                <Text className="text-xl font-black text-white mt-2">{pending}</Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">En attente</Text>
              </View>
            </View>

            {/* Section titre */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-black text-white">Commandes récentes</Text>
              <Text className="text-[10px] text-white/30 font-mono">bf_orders</Text>
            </View>
          </View>
        }
        renderItem={({ item: order }) => {
          const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          return (
            <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-black text-white font-mono">
                  #{order.id.slice(0, 8)}
                </Text>
                <View style={{ backgroundColor: s.bg }} className="px-2.5 py-1 rounded-full">
                  <Text style={{ color: s.color }} className="text-[10px] font-bold">
                    {s.label}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-white/40">
                  {new Date(order.created_at).toLocaleString("fr-FR", {
                    day: "2-digit", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </Text>
                <Text className="text-sm font-black text-[#fcd116]">
                  {Number(order.restaurant_amount).toLocaleString()} F
                </Text>
              </View>
              {order.delivery_landmark && (
                <Text className="text-[10px] text-white/30 mt-1.5" numberOfLines={1}>
                  📍 {order.delivery_landmark}
                </Text>
              )}
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
    </SafeAreaView>
  );
}
