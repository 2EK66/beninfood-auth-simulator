import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  SafeAreaView, StatusBar, ActivityIndicator,
  Alert, Modal, TextInput,
} from "react-native";
import { Wallet, TrendingUp, Clock, Check, X, Coins } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfPayoutRequest, BfRestaurant, MomoOperator } from "../../types";

interface Props { user: BfProfile; }

export default function GerantPortefeuilleScreen({ user }: Props) {
  const [restaurant, setRestaurant] = useState<BfRestaurant | null>(null);
  const [payouts, setPayouts] = useState<BfPayoutRequest[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [operator, setOperator] = useState<MomoOperator>("MTN MoMo");
  const [momoNumber, setMomoNumber] = useState(user.phone);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const { data: rest } = await supabase
      .from("bf_restaurants").select("*").eq("owner_id", user.id).single();
    setRestaurant(rest);

    const { data: pay } = await supabase
      .from("bf_payout_requests").select("*")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });
    setPayouts(pay || []);

    if (rest) {
      const { data: orders } = await supabase
        .from("bf_orders").select("restaurant_amount")
        .eq("restaurant_id", rest.id)
        .eq("status", "delivered");
      const total = (orders || []).reduce((s, o) => s + Number(o.restaurant_amount), 0);
      setTotalRevenue(total);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const pendingAmount = payouts
    .filter(p => p.status === "en_cours")
    .reduce((s, p) => s + Number(p.amount), 0);
  const availableBalance = Math.max(0, totalRevenue - pendingAmount);

  const handleRequestPayout = async () => {
    if (availableBalance <= 0) {
      Alert.alert("Solde insuffisant", "Vous n'avez pas de solde disponible.");
      return;
    }
    if (!momoNumber.trim()) {
      Alert.alert("Champ requis", "Entrez votre numéro Mobile Money.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bf_payout_requests").insert({
      user_id: user.id,
      amount: availableBalance,
      momo_number: momoNumber.trim(),
      operator,
      status: "en_cours",
    });
    setSubmitting(false);
    if (error) { Alert.alert("Erreur", error.message); return; }
    setShowModal(false);
    Alert.alert("✅ Demande envoyée !", `Votre reversement de ${availableBalance.toLocaleString()} FCFA a été transmis à l'administrateur.`);
    await fetchData();
  };

  const statusConfig = {
    en_cours: { label: "En cours", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    valide:   { label: "Validé ✓", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    rejete:   { label: "Rejeté",   color: "#f87171", bg: "rgba(248,113,113,0.1)" },
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

      <FlatList
        data={payouts}
        keyExtractor={p => p.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            <View className="mb-5">
              <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
                Compte BéninFood
              </Text>
              <Text className="text-2xl font-black text-white mt-1">Mon Portefeuille</Text>
            </View>

            {/* Solde card */}
            <View className="bg-[#0d1a12] border border-[#fcd116]/20 rounded-2xl p-5 mb-4">
              <Text className="text-[10px] font-bold text-white/40 uppercase mb-1">
                Solde disponible
              </Text>
              <Text className="text-3xl font-black text-[#fcd116] mb-1">
                {availableBalance.toLocaleString("fr-FR")} FCFA
              </Text>
              <Text className="text-xs text-white/30">
                Revenu total : {totalRevenue.toLocaleString("fr-FR")} F •
                En attente : {pendingAmount.toLocaleString("fr-FR")} F
              </Text>

              <TouchableOpacity
                onPress={() => setShowModal(true)}
                disabled={availableBalance <= 0}
                className={`mt-4 py-3 rounded-xl flex-row items-center justify-center gap-2 ${
                  availableBalance > 0 ? "bg-[#fcd116]" : "bg-white/10"
                }`}
              >
                <Wallet size={16} color={availableBalance > 0 ? "#0d1a12" : "rgba(255,255,255,0.3)"} />
                <Text className={`text-sm font-black ${availableBalance > 0 ? "text-[#0d1a12]" : "text-white/30"}`}>
                  Demander le reversement MoMo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats rapides */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <TrendingUp size={16} color="#34d399" />
                <Text className="text-lg font-black text-white mt-2">
                  {totalRevenue.toLocaleString("fr-FR")} F
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">Total gagné</Text>
              </View>
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <Clock size={16} color="#fbbf24" />
                <Text className="text-lg font-black text-white mt-2">
                  {payouts.filter(p => p.status === "en_cours").length}
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">En attente</Text>
              </View>
              <View className="flex-1 bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4">
                <Coins size={16} color="#a78bfa" />
                <Text className="text-lg font-black text-white mt-2">
                  {payouts.filter(p => p.status === "valide").length}
                </Text>
                <Text className="text-[10px] text-white/40 font-bold mt-0.5">Validés</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-black text-white">Historique</Text>
              <Text className="text-[10px] text-white/30 font-mono">bf_payout_requests</Text>
            </View>
          </View>
        }
        renderItem={({ item: payout }) => {
          const s = statusConfig[payout.status];
          return (
            <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-black text-[#fcd116]">
                    -{Number(payout.amount).toLocaleString("fr-FR")} FCFA
                  </Text>
                  <Text className="text-xs text-white/40 mt-0.5">
                    {payout.operator} • +229 {payout.momo_number}
                  </Text>
                  <Text className="text-[10px] text-white/20 mt-0.5 font-mono">
                    {new Date(payout.requested_at).toLocaleDateString("fr-FR")}
                  </Text>
                </View>
                <View style={{ backgroundColor: s.bg }} className="px-3 py-1.5 rounded-full">
                  <Text style={{ color: s.color }} className="text-[10px] font-bold">
                    {s.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Wallet size={32} color="rgba(255,255,255,0.1)" />
            <Text className="text-sm text-white/30 mt-3">Aucun reversement effectué</Text>
          </View>
        }
      />

      {/* Modal demande MoMo */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-[#0d1a12] border-t-2 border-[#fcd116] rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <Text className="text-base font-black text-white mb-1">
              Demande de reversement
            </Text>
            <Text className="text-xs text-white/40 mb-5">
              Montant : {availableBalance.toLocaleString("fr-FR")} FCFA
            </Text>

            {/* Choix opérateur */}
            <Text className="text-[10px] font-bold text-white/40 uppercase mb-2">Opérateur</Text>
            <View className="flex-row gap-3 mb-4">
              {(["MTN MoMo", "Moov Flooz"] as MomoOperator[]).map(op => (
                <TouchableOpacity
                  key={op}
                  onPress={() => setOperator(op)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    operator === op
                      ? op === "MTN MoMo" ? "bg-amber-500/20 border-amber-400" : "bg-blue-500/20 border-blue-400"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <Text className="text-sm font-black text-white">{op}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Numéro MoMo */}
            <Text className="text-[10px] font-bold text-white/40 uppercase mb-2">
              Numéro Mobile Money
            </Text>
            <TextInput
              value={momoNumber}
              onChangeText={setMomoNumber}
              keyboardType="phone-pad"
              placeholder="ex: 97 00 00 00"
              placeholderTextColor="rgba(255,255,255,0.2)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-5"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="flex-1 py-3 bg-white/10 rounded-xl items-center"
              >
                <Text className="text-sm font-bold text-white">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestPayout}
                disabled={submitting}
                className="flex-1 py-3 bg-[#fcd116] rounded-xl items-center"
              >
                <Text className="text-sm font-black text-[#0d1a12]">
                  {submitting ? "Envoi…" : "Confirmer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
