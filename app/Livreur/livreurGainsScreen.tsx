import React, { useState, useEffect } from "react";
import { View, Text, FlatList, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from "react-native";
import { TrendingUp, Coins, Award, CheckCircle2 } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder } from "../../types";

interface Props { user: BfProfile; }

export default function LivreurGainsScreen({ user }: Props) {
  const [historique, setHistorique] = useState<BfOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const GAIN_PAR_COURSE = 1500; // 1 500 FCFA par livraison au Bénin

  const fetchGains = async () => {
    const { data } = await supabase
      .from("bf_orders")
      .select("*")
      .eq("delivery_person_id", user.id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    setHistorique(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchGains(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGains();
    setRefreshing(false);
  };

  const totalGains = historique.length * GAIN_PAR_COURSE;

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

      {/* Header Statistique */}
      <View className="p-5 border-b border-[#1a2e1f] bg-[#0d1a12]">
        <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">Mon Portefeuille</Text>
        <Text className="text-2xl font-black text-white mt-1">Mes Gains</Text>

        {/* Carte Solde Global */}
        <View className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 mt-4 flex-row items-center justify-between border border-emerald-500/20">
          <View>
            <Text className="text-xs text-white/60 font-medium">Solde disponible</Text>
            <Text className="text-3xl font-black text-[#fcd116] mt-1">
              {totalGains.toLocaleString("fr-FR")} F cfa
            </Text>
          </View>
          <View className="w-12 h-12 bg-[#fcd116]/10 rounded-full items-center justify-center">
            <Coins size={24} color="#fcd116" />
          </View>
        </View>

        {/* Mini stats */}
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 bg-white/5 rounded-xl p-3 flex-row items-center gap-2">
            <TrendingUp size={16} color="#34d399" />
            <Text className="text-xs text-white/70 font-bold">{historique.length} Courses</Text>
          </View>
          <View className="flex-1 bg-white/5 rounded-xl p-3 flex-row items-center gap-2">
            <Award size={16} color="#fcd116" />
            <Text className="text-xs text-white/70 font-bold">Top Coursier</Text>
          </View>
        </View>
      </View>

      {/* Liste des courses payées */}
      <FlatList
        data={historique}
        keyExtractor={o => o.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fcd116" />}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={<Text className="text-sm font-black text-white mb-4">Historique des Livraisons</Text>}
        renderItem={({ item: order }) => (
          <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-xl p-4 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-mono text-white/40">#{order.id.slice(0, 8).toUpperCase()}</Text>
              <Text className="text-sm font-bold text-white mt-1">{order.delivery_landmark || "Cotonou"}</Text>
              <Text className="text-[10px] text-white/20 mt-0.5">
                {new Date(order.created_at).toLocaleDateString("fr-FR")} à {new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
            <Text className="text-base font-black text-emerald-400">+{GAIN_PAR_COURSE} F</Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <CheckCircle2 size={32} color="rgba(255,255,255,0.1)" />
            <Text className="text-sm text-white/30 mt-3">Aucun gain accumulé</Text>
            <Text className="text-xs text-white/20 mt-1">Livrez votre première commande pour commencer !</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
