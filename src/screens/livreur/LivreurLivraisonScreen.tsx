import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, SafeAreaView,
  StatusBar, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import {
  MapPin, Phone, Package, CheckCircle2,
  Navigation, Bike, Clock, AlertCircle,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfOrder } from "../../types";
import { useRouter } from "expo-router";

interface Props { user: BfProfile; }

type OrderStatus = "accepted" | "scanned" | "arrived" | "delivered";

const STEPS = [
  { key: "accepted", label: "Course acceptée",     icon: Bike,          color: "#60a5fa" },
  { key: "scanned",  label: "Plat collecté",       icon: Package,       color: "#a78bfa" },
  { key: "arrived",  label: "Arrivé chez le client", icon: MapPin,      color: "#fbbf24" },
  { key: "delivered",label: "Livraison confirmée", icon: CheckCircle2,  color: "#34d399" },
] as const;

const STEP_INDEX: Record<string, number> = {
  accepted: 0, scanned: 1, arrived: 2, delivered: 3,
};

export default function LivreurLivraisonScreen({ user }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<BfOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchActiveOrder = async () => {
    const { data } = await supabase
      .from("bf_orders")
      .select("*")
      .eq("delivery_person_id", user.id)
      .in("status", ["accepted", "scanned", "arrived"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setOrder(data || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveOrder();

    // Realtime — mise à jour si statut change
    const channel = supabase
      .channel("livraison_active")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bf_orders" },
        (payload) => {
          if (payload.new.delivery_person_id === user.id) {
            setOrder(payload.new as BfOrder);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleNextStep = async () => {
    if (!order) return;

    const nextStatus: Record<string, OrderStatus> = {
      accepted: "scanned",
      scanned:  "arrived",
      arrived:  "delivered",
    };

    const next = nextStatus[order.status];
    if (!next) return;

    const confirmMessages: Record<string, string> = {
      accepted: "Confirmer que vous avez récupéré le plat au restaurant ?",
      scanned:  "Confirmer que vous êtes arrivé chez le client ?",
      arrived:  "Confirmer que la livraison est effectuée et le paiement reçu ?",
    };

    Alert.alert("Étape suivante", confirmMessages[order.status], [
      { text: "Annuler", style: "cancel" },
      {
        text: "Confirmer ✓",
        onPress: async () => {
          setUpdating(true);
          const { error } = await supabase
            .from("bf_orders")
            .update({ status: next })
            .eq("id", order.id)
            .eq("delivery_person_id", user.id);
          setUpdating(false);

          if (error) {
            Alert.alert("Erreur", error.message);
            return;
          }

          if (next === "delivered") {
            // Livraison terminée → aller aux gains
            Alert.alert(
              "🎉 Livraison terminée !",
              `Vous avez gagné 1 500 FCFA pour cette course.`,
              [{ text: "Voir mes gains", onPress: () => router.replace("/(livreur)/gains") }]
            );
          } else {
            setOrder({ ...order, status: next });
          }
        },
      },
    ]);
  };

  const currentStepIndex = order ? STEP_INDEX[order.status] ?? 0 : 0;

  const nextButtonLabel: Record<string, string> = {
    accepted: "✓ J'ai récupéré le plat",
    scanned:  "📍 Je suis arrivé chez le client",
    arrived:  "💵 Livraison confirmée & payée",
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0f0d] items-center justify-center">
        <ActivityIndicator color="#fcd116" size="large" />
      </View>
    );
  }

  // Aucune livraison active
  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0f0d] items-center justify-center px-6">
        <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4">
          <Bike size={28} color="rgba(255,255,255,0.15)" />
        </View>
        <Text className="text-white font-black text-base mb-2">
          Aucune livraison en cours
        </Text>
        <Text className="text-white/30 text-sm text-center mb-6">
          Acceptez une course dans l'onglet Courses pour commencer.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(livreur)/courses")}
          className="px-6 py-3 rounded-2xl"
          style={{ backgroundColor: "#fcd116" }}
        >
          <Text className="text-[#0a0f0d] font-black">Voir les courses</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0f0d]">
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-[#1a2e1f]">
        <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
          Livraison en cours
        </Text>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-lg font-black text-white">
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
          <View className="bg-[#fcd116]/10 border border-[#fcd116]/20 px-3 py-1 rounded-full">
            <Text className="text-[#fcd116] text-[10px] font-black">
              +1 500 FCFA
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        {/* Barre de progression */}
        <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-4">
          <Text className="text-xs font-bold text-white/40 uppercase mb-3">
            Progression
          </Text>
          <View className="flex-row items-center">
            {STEPS.map((step, idx) => {
              const done = idx <= currentStepIndex;
              const active = idx === currentStepIndex;
              const Icon = step.icon;
              return (
                <React.Fragment key={step.key}>
                  <View className="items-center">
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center border-2"
                      style={{
                        backgroundColor: done ? `${step.color}20` : "rgba(255,255,255,0.05)",
                        borderColor: done ? step.color : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Icon
                        size={16}
                        color={done ? step.color : "rgba(255,255,255,0.2)"}
                      />
                    </View>
                    {active && (
                      <View
                        className="w-1.5 h-1.5 rounded-full mt-1"
                        style={{ backgroundColor: step.color }}
                      />
                    )}
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View
                      className="flex-1 h-0.5 mx-1"
                      style={{
                        backgroundColor: idx < currentStepIndex
                          ? STEPS[idx].color
                          : "rgba(255,255,255,0.08)",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
          <Text className="text-xs font-bold text-white mt-3">
            {STEPS[currentStepIndex]?.label}
          </Text>
        </View>

        {/* Infos livraison */}
        <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-4">
          <Text className="text-xs font-bold text-white/40 uppercase mb-3">
            Détails de la course
          </Text>

          {/* Lieu */}
          <View className="flex-row items-start gap-3 mb-3">
            <View className="w-8 h-8 bg-red-500/10 rounded-xl items-center justify-center mt-0.5">
              <MapPin size={14} color="#f87171" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-white/40 font-bold uppercase mb-0.5">
                Destination
              </Text>
              <Text className="text-sm font-semibold text-white leading-relaxed">
                {order.delivery_landmark ?? "Adresse non précisée"}
              </Text>
            </View>
          </View>

          {/* Montant commande */}
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-8 h-8 bg-[#fcd116]/10 rounded-xl items-center justify-center">
              <Package size={14} color="#fcd116" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-white/40 font-bold uppercase mb-0.5">
                Valeur commande
              </Text>
              <Text className="text-sm font-bold text-white">
                {Number(order.total_amount).toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
          </View>

          {/* Heure */}
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 bg-blue-500/10 rounded-xl items-center justify-center">
              <Clock size={14} color="#60a5fa" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-white/40 font-bold uppercase mb-0.5">
                Acceptée à
              </Text>
              <Text className="text-sm font-bold text-white">
                {new Date(order.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Consignes selon l'étape */}
        <View className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4 flex-row gap-3">
          <AlertCircle size={16} color="#fbbf24" style={{ marginTop: 1 }} />
          <View className="flex-1">
            <Text className="text-amber-300 text-xs font-black mb-1">
              {order.status === "accepted" && "À faire maintenant"}
              {order.status === "scanned"  && "En route vers le client"}
              {order.status === "arrived"  && "Finaliser la livraison"}
            </Text>
            <Text className="text-white/60 text-xs leading-relaxed">
              {order.status === "accepted" &&
                "Rendez-vous au restaurant pour récupérer la commande. Appuyez sur le bouton ci-dessous une fois le plat en main."}
              {order.status === "scanned" &&
                "Suivez les indications pour rejoindre le client. Respectez le point de repère indiqué."}
              {order.status === "arrived" &&
                "Remettez la commande au client et collectez le paiement Mobile Money avant de confirmer."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton action */}
      {order.status !== "delivered" && (
        <View className="absolute bottom-6 left-5 right-5">
          <TouchableOpacity
            onPress={handleNextStep}
            disabled={updating}
            className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
            style={{ backgroundColor: "#fcd116" }}
          >
            {updating
              ? <ActivityIndicator color="#0a0f0d" size="small" />
              : <Text className="text-[#0a0f0d] font-black text-base">
                  {nextButtonLabel[order.status]}
                </Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
