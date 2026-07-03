import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, SafeAreaView,
  StatusBar, ActivityIndicator, RefreshControl,
} from "react-native";
import { TrendingUp, Wallet, CheckCircle2, Bike, Clock } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder } from "../../types";

interface Props { user: BfProfile; }

const GAIN_PAR_COURSE = 1500;

export default function LivreurGainsScreen({ user }: Props) {
  const [historique, setHistorique] = useState<BfOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGains = async () => {
    const { data } = await supabase
      .from("bf_orders")
      .select("*")
      .eq("delivery_person_id", user.id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    setHistorique(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchGains(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGains();
  };

  // Calculs
  const totalCourses = historique.length;
  const totalGains = totalCourses * GAIN_PAR_COURSE;
  const gainsSemaine = historique
    .filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    })
    .length * GAIN_PAR_COURSE;

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

      <FlatList
        data={historique}
        keyExtractor={o => o.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fcd116" />
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="mb-5">
              <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
                Portefeuille
              </Text>
              <Text className="text-2xl font-black text-white mt-1">Mes Gains</Text>
            </View>

            {/* Total gains card */}
            <View
              className="rounded-2xl p-5 mb-4 border border-[#fcd116]/20"
              style={{ backgroundColor: "#0d1a12" }}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Wallet size={16} color="#fcd116" />
                <Text className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Total accumulé
                </Text>
              </View>
              <Text className="text-4xl font-black text-[#fcd116]">
                {totalGains.toLocaleString("fr-FR")} F
              </Text>
              <Text className="text-xs text-white/30 mt-1">
                {totalCourses} course{totalCourses > 1 ? "s" : ""} livrée{totalCourses > 1 ? "s" : ""}
              </Text>
            </View>

            {/* Stats rapides */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <TrendingUp size={16} color="#34d399" />
                <Text className="text-lg font-black text-white mt-2">
                  {gainsSemaine.toLocaleString("fr-FR")} F
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">
                  Cette semaine
                </Text>
              </View>
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <Bike size={16} color="#60a5fa" />
                <Text className="text-lg font-black text-white mt-2">
                  {totalCourses}
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">
                  Courses totales
                </Text>
              </View>
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <CheckCircle2 size={16} color="#a78bfa" />
                <Text className="text-lg font-black text-white mt-2">
                  {GAIN_PAR_COURSE.toLocaleString()} F
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">
                  Par course
                </Text>
              </View>
            </View>

            {/* Titre historique */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-black text-white">
                Historique ({totalCourses})
              </Text>
              <Text className="text-[10px] text-white/30 font-mono">
                bf_orders
              </Text>
            </View>
          </View>
        }
        renderItem={({ item: order }) => (
          <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center justify-center">
                  <CheckCircle2 size={14} color="#34d399" />
                </View>
                <Text className="text-xs font-mono text-white/40">
                  #{order.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <Text className="text-base font-black text-[#fcd116]">
                +{GAIN_PAR_COURSE.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Clock size={11} color="rgba(255,255,255,0.3)" />
              <Text className="text-xs text-white/30">
                {new Date(order.created_at).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {order.delivery_landmark && (
              <View className="flex-row items-start gap-1.5 mt-2">
                <View className="mt-0.5">
                  <View className="w-2 h-2 rounded-full bg-red-400" />
                </View>
                <Text className="text-xs text-white/40 flex-1" numberOfLines={1}>
                  {order.delivery_landmark}
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4">
              <Wallet size={28} color="rgba(255,255,255,0.1)" />
            </View>
            <Text className="text-sm font-bold text-white/30">
              Aucune livraison effectuée
            </Text>
            <Text className="text-xs text-white/20 mt-1.5 text-center px-8">
              Vos gains apparaîtront ici après chaque livraison terminée
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
