import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import {
  Calendar,
  Clock,
  Users,
  Check,
  X,
  Phone,
  FileText,
  AlertCircle,
  CheckCheck,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile } from "../../types";

interface Props {
  user: BfProfile;
}

interface Reservation {
  id: string;
  created_at: string;
  client_id: string;
  restaurant_id: string | null;
  date: string;
  time: string;
  guests: number;
  note: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  client?: {
    full_name: string | null;
    phone: string | null;
  };
}

export default function GerantReservationsScreen({ user }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "completed">("pending");

  // Identifiant du restaurant du gérant (ex: user.restaurant_id)
  const restaurantId = user.restaurant_id;

  // 1. Chargement des données avec jointure Client
  const fetchReservations = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from("bf_reservations")
        .select(`
          *,
          client:client_id (
            full_name,
            phone
          )
        `)
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReservations((data as unknown as Reservation[]) || []);
    } catch (err: any) {
      console.error("Erreur chargement réservations:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId, filter]);

  // 2. Abonnements en Temps Réel (Supabase Realtime)
  useEffect(() => {
    fetchReservations();

    if (!restaurantId) return;

    const channel = supabase
      .channel("gerant_reservations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bf_reservations",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          // Recharge la liste en direct lorsqu'une réservation change/arrive
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, fetchReservations]);

  // 3. Action de modification avec confirmation (Alert)
  const handleUpdateStatus = (id: string, newStatus: "confirmed" | "cancelled" | "completed", label: string) => {
    Alert.alert(
      "Confirmation",
      `Voulez-vous vraiment passer cette réservation au statut "${label}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Valider",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("bf_reservations")
                .update({ status: newStatus })
                .eq("id", id);

              if (error) throw error;

              setReservations((prev) =>
                prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
              );
            } catch (err: any) {
              Alert.alert("Erreur", "Impossible de modifier la réservation.");
            }
          },
        },
      ]
    );
  };

  // 4. Lancer l'appel téléphonique
  const makePhoneCall = (phoneNumber?: string | null) => {
    if (!phoneNumber) {
      Alert.alert("Information", "Le numéro de téléphone n'est pas renseigné par le client.");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Calcul des statistiques rapides
  const stats = {
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    completed: reservations.filter((r) => r.status === "completed").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmée", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" };
      case "cancelled":
        return { label: "Annulée", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" };
      case "completed":
        return { label: "Honorée", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" };
      default:
        return { label: "En attente", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" };
    }
  };

  const renderItem = ({ item }: { item: Reservation }) => {
    const badge = getStatusBadge(item.status);
    const clientName = item.client?.full_name || "Client anonyme";
    const clientPhone = item.client?.phone;

    return (
      <View className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3">
        {/* Infos Client & Statut */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1 pr-2">
            <Text className="text-white font-black text-base" numberOfLines={1}>
              {clientName}
            </Text>
            {clientPhone ? (
              <Text className="text-white/40 text-xs font-semibold">{clientPhone}</Text>
            ) : null}
          </View>
          <View className={`px-2.5 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
            <Text className={`text-xs font-bold ${badge.text}`}>{badge.label}</Text>
          </View>
        </View>

        {/* Détails Date, Heure & Nombre de Personnes */}
        <View className="flex-row items-center gap-x-4 mb-3 flex-wrap gap-y-1">
          <View className="flex-row items-center gap-x-1.5">
            <Calendar size={14} color="#94A3B8" />
            <Text className="text-white/80 text-xs font-semibold">{item.date}</Text>
          </View>
          <View className="flex-row items-center gap-x-1.5">
            <Clock size={14} color="#94A3B8" />
            <Text className="text-white/80 text-xs font-semibold">{item.time}</Text>
          </View>
          <View className="flex-row items-center gap-x-1.5">
            <Users size={14} color="#94A3B8" />
            <Text className="text-white/80 text-xs font-semibold">{item.guests} pers.</Text>
          </View>
        </View>

        {/* Note particulière du client */}
        {item.note ? (
          <View className="bg-black/20 p-2.5 rounded-xl mb-3 flex-row items-start gap-x-2">
            <FileText size={14} color="#94A3B8" style={{ marginTop: 2 }} />
            <Text className="text-white/60 text-xs italic flex-1">{item.note}</Text>
          </View>
        ) : null}

        {/* Actions Rapides */}
        <View className="flex-row gap-x-2 mt-1">
          {/* Bouton Appeler toujours disponible si un téléphone est configuré */}
          <TouchableOpacity
            onPress={() => makePhoneCall(clientPhone)}
            className="bg-white/10 border border-white/10 p-2.5 rounded-xl items-center justify-center"
          >
            <Phone size={16} color="#ffffff" />
          </TouchableOpacity>

          {/* Actions conditionnelles selon statut */}
          {item.status === "pending" && (
            <>
              <TouchableOpacity
                onPress={() => handleUpdateStatus(item.id, "confirmed", "Confirmée")}
                className="flex-1 bg-emerald-500/20 border border-emerald-500/50 py-2.5 rounded-xl flex-row items-center justify-center gap-x-1.5"
              >
                <Check size={16} color="#34d399" />
                <Text className="text-emerald-400 font-bold text-xs">Accepter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleUpdateStatus(item.id, "cancelled", "Refusée")}
                className="flex-1 bg-red-500/20 border border-red-500/50 py-2.5 rounded-xl flex-row items-center justify-center gap-x-1.5"
              >
                <X size={16} color="#f87171" />
                <Text className="text-red-400 font-bold text-xs">Refuser</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === "confirmed" && (
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item.id, "completed", "Honorée")}
              className="flex-1 bg-blue-500/20 border border-blue-500/50 py-2.5 rounded-xl flex-row items-center justify-center gap-x-1.5"
            >
              <CheckCheck size={16} color="#60a5fa" />
              <Text className="text-blue-400 font-bold text-xs">Marquer comme honorée</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      {/* Titre */}
      <View className="px-5 pt-4 pb-3 border-b border-bf-border">
        <Text className="text-xl font-black text-white">Réservations du Restaurant</Text>
        <Text className="text-white/40 text-xs mt-0.5">Suivi en direct des tables réservées</Text>
      </View>

      {/* Dashboard Statistiques en Haut */}
      <View className="flex-row px-5 py-3 gap-x-2">
        <View className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 items-center">
          <Text className="text-amber-400 font-black text-base">{stats.pending}</Text>
          <Text className="text-white/50 text-[10px] font-bold uppercase">Attente</Text>
        </View>
        <View className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 items-center">
          <Text className="text-emerald-400 font-black text-base">{stats.confirmed}</Text>
          <Text className="text-white/50 text-[10px] font-bold uppercase">Confirmées</Text>
        </View>
        <View className="flex-1 bg-red-500/10 border border-red-500/20 rounded-2xl p-2.5 items-center">
          <Text className="text-red-400 font-black text-base">{stats.cancelled}</Text>
          <Text className="text-white/50 text-[10px] font-bold uppercase">Annulées</Text>
        </View>
      </View>

      {/* Filtres de liste */}
      <View className="flex-row px-5 pb-3 gap-x-2">
        {[
          { key: "pending", label: "En attente" },
          { key: "confirmed", label: "Confirmées" },
          { key: "completed", label: "Honorées" },
          { key: "all", label: "Toutes" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key as any)}
            className="px-3 py-1.5 rounded-xl border"
            style={{
              backgroundColor: filter === f.key ? "#fcd116" : "rgba(255,255,255,0.05)",
              borderColor: filter === f.key ? "#fcd116" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: filter === f.key ? "#001f13" : "rgba(255,255,255,0.7)" }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste principale */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fcd116" />
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchReservations();
              }}
              tintColor="#fcd116"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <AlertCircle size={36} color="#94A3B8" />
              <Text className="text-white/50 text-sm mt-2">Aucune réservation dans cette catégorie</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
