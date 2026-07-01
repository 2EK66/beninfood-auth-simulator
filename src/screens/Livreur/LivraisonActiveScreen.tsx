import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, SafeAreaView, 
  StatusBar, ActivityIndicator, Alert, Linking
} from "react-native";
import { MapPin, Phone, CheckCircle, Navigation, Bike } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder } from "../../types";
import { useRouter } from "expo-router";

interface Props { user: BfProfile; }

export default function LivraisonActiveScreen({ user }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<BfOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchActiveOrder = async () => {
    // Récupérer la commande acceptée par ce livreur qui n'est pas encore livrée
    const { data, error } = await supabase
      .from("bf_orders")
      .select("*")
      .eq("delivery_person_id", user.id)
      .in("status", ["accepted", "preparing", "delivering"])
      .maybeSingle();

    if (data) {
      setOrder(data);
    } else {
      // Si aucune course active, on réoriente vers la liste des courses
      router.replace("/(livreur)/courses");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveOrder();
  }, []);

  const handleCall = () => {
    if (order?.delivery_phone) {
      Linking.openURL(`tel:${order.delivery_phone}`);
    } else {
      Alert.alert("Introuvable", "Aucun numéro de téléphone associé à cette livraison.");
    }
  };

  const handleCompleteDelivery = async () => {
    if (!order) return;

    Alert.alert(
      "Confirmer la livraison ?",
      "Assurez-vous d'avoir remis le colis et encaissé le montant s'il s'agit d'un paiement à la livraison.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Livré ✅",
          onPress: async () => {
            setUpdating(true);
            const { error } = await supabase
              .from("bf_orders")
              .update({ status: "delivered" })
              .eq("id", order.id);

            setUpdating(false);

            if (error) {
              Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
              return;
            }

            Alert.alert("Félicitations !", "Course terminée avec succès. Votre gain de 1 500 F a été comptabilisé.");
            router.replace("/(livreur)/courses");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0f0d] items-center justify-center">
        <ActivityIndicator color="#fcd116" size="large" />
      </View>
    );
  }

  if (!order) return null;

  return (
    <SafeAreaView className="flex-1 bg-[#0a0f0d]">
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Top Bar */}
      <View className="px-5 py-4 border-b border-[#1a2e1f] flex-row items-center gap-3">
        <Bike size={20} color="#fcd116" />
        <Text className="text-base font-black text-white">Course en cours</Text>
      </View>

      <View className="flex-1 p-5 justify-between">
        {/* Infos de Livraison */}
        <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-5">
          <Text className="text-[10px] font-mono font-bold text-white/30 mb-4">
            ID COMMANDE : #{order.id.slice(0, 8).toUpperCase()}
          </Text>

          {/* Destination */}
          <View className="flex-row items-start gap-3 mb-5">
            <MapPin size={18} color="#f87171" style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-xs text-white/40 uppercase font-bold tracking-wider">Lieu de livraison</Text>
              <Text className="text-base font-semibold text-white mt-0.5">
                {order.delivery_landmark ?? "Adresse non renseignée"}
              </Text>
            </View>
          </View>

          {/* Encaissement Client */}
          <View className="bg-white/5 rounded-xl p-4 mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-white/40">À encaisser au client</Text>
              <Text className="text-xl font-black text-white mt-0.5">
                {Number(order.total_amount).toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View className="bg-[#fcd116]/10 px-3 py-1 rounded-full border border-[#fcd116]/20">
              <Text className="text-xs font-bold text-[#fcd116]">+ 1 500 F</Text>
            </View>
          </View>
        </View>

        {/* Actions Client & Clôture */}
        <View className="gap-3">
          {/* Bouton Appeler le client */}
          <TouchableOpacity
            onPress={handleCall}
            className="bg-white/5 border border-white/10 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
          >
            <Phone size={16} color="white" />
            <Text className="text-sm font-bold text-white">Appeler le client</Text>
          </TouchableOpacity>

          {/* Bouton Terminer la livraison */}
          <TouchableOpacity
            onPress={handleCompleteDelivery}
            disabled={updating}
            className="bg-emerald-500 rounded-xl py-4 flex-row items-center justify-center gap-2"
          >
            {updating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <CheckCircle size={18} color="white" />
            )}
            <Text className="text-sm font-black text-white">
              {updating ? "Validation…" : "Marquer comme livré ✅"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
