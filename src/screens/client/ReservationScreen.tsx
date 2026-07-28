import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Calendar, Clock, Users, MapPin, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile } from "../../types";

interface Props {
  user: BfProfile;
}

interface RestaurantOption {
  id: string;
  name: string;
  address?: string;
}

const TIME_SLOTS = ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ReservationScreen({ user }: Props) {
  const [restaurantsList, setRestaurantsList] = useState<RestaurantOption[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOption | null>(null);
  const [isManualInput, setIsManualInput] = useState(false);
  const [customRestaurantName, setCustomRestaurantName] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 1. Récupération des restaurants actifs
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const { data, error } = await supabase
          .from("bf_restaurants")
          .select("id, name, address")
          .order("name", { ascending: true });

        if (!error && data) {
          setRestaurantsList(data);
          if (data.length > 0) {
            setSelectedRestaurant(data[0]);
          } else {
            setIsManualInput(true);
          }
        } else {
          setIsManualInput(true);
        }
      } catch (e) {
        setIsManualInput(true);
      } finally {
        setLoadingList(false);
      }
    }

    fetchRestaurants();
  }, []);

  const handleReserve = async () => {
    setError("");

    const targetRestaurantName = isManualInput ? customRestaurantName.trim() : selectedRestaurant?.name || "";
    const targetRestaurantId = isManualInput ? null : selectedRestaurant?.id || null;

    if (!targetRestaurantName) return setError("Précisez le nom du restaurant.");
    if (!date.trim()) return setError("Choisissez une date (ex: 15/07/2026).");
    if (!time) return setError("Choisissez une heure.");

    setLoading(true);

    const { error: err } = await supabase.from("bf_reservations").insert({
      client_id: user.id,
      restaurant_id: targetRestaurantId,
      restaurant_name_free: targetRestaurantName,
      date,
      time,
      guests,
      note: note.trim() || null,
      status: "pending",
    });

    setLoading(false);
    if (err) {
      console.error(err);
      return setError("Erreur lors de la réservation. Réessayez.");
    }
    setSuccess(true);
  };

  const currentDisplayName = isManualInput ? customRestaurantName : selectedRestaurant?.name;

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-bf-dark items-center justify-center p-6">
        <View className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 items-center justify-center mb-4">
          <CheckCircle2 size={32} color="#34d399" />
        </View>
        <Text className="text-white font-black text-xl mb-2">Réservation envoyée !</Text>
        <Text className="text-white/50 text-sm text-center leading-relaxed mb-6">
          Votre demande pour <Text className="text-white font-bold">{currentDisplayName}</Text> le{" "}
          <Text className="text-white font-bold">{date}</Text> à{" "}
          <Text className="text-white font-bold">{time}</Text> pour{" "}
          <Text className="text-white font-bold">{guests} personne{guests > 1 ? "s" : ""}</Text> a bien été transmise.
          Le gérant vous confirmera la réservation.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setSuccess(false);
            setDate("");
            setTime("");
            setNote("");
            setCustomRestaurantName("");
          }}
          className="px-8 py-3 rounded-2xl"
          style={{ backgroundColor: "#fcd116" }}
        >
          <Text className="text-bf-dark font-black">Nouvelle réservation</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      <View className="px-5 pt-4 pb-3 border-b border-bf-border">
        <Text className="text-xl font-black text-white">Réserver une table</Text>
        <Text className="text-white/40 text-xs mt-1">Réservation dans les maquis et restaurants BéninFood</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        {error ? (
          <View className="flex-row items-start gap-x-2 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
            <AlertCircle size={15} color="#f87171" style={{ marginTop: 1 }} />
            <Text className="text-red-300 text-xs font-semibold flex-1">{error}</Text>
          </View>
        ) : null}

        {/* Sélection du Restaurant */}
        <View>
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Restaurant / Maquis
          </Text>

          {loadingList ? (
            <ActivityIndicator size="small" color="#fcd116" className="py-2" />
          ) : (
            <>
              {/* Sélecteur sous forme de puces scrollables */}
              {restaurantsList.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  <View className="flex-row gap-x-2">
                    {restaurantsList.map((rest) => {
                      const isSelected = !isManualInput && selectedRestaurant?.id === rest.id;
                      return (
                        <TouchableOpacity
                          key={rest.id}
                          onPress={() => {
                            setSelectedRestaurant(rest);
                            setIsManualInput(false);
                          }}
                          className="px-3.5 py-2 rounded-xl border"
                          style={{
                            backgroundColor: isSelected ? "#fcd116" : "rgba(255,255,255,0.05)",
                            borderColor: isSelected ? "#fcd116" : "rgba(255,255,255,0.1)",
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: isSelected ? "#001f13" : "rgba(255,255,255,0.8)" }}
                          >
                            {rest.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    <TouchableOpacity
                      onPress={() => setIsManualInput(true)}
                      className="px-3.5 py-2 rounded-xl border"
                      style={{
                        backgroundColor: isManualInput ? "#fcd116" : "rgba(255,255,255,0.05)",
                        borderColor: isManualInput ? "#fcd116" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: isManualInput ? "#001f13" : "rgba(255,255,255,0.8)" }}
                      >
                        + Autre restaurant
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}

              {/* Champ texte libre si "Autre" est sélectionné ou si la liste est vide */}
              {isManualInput && (
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-x-3 mt-1">
                  <MapPin size={16} color="#94A3B8" />
                  <TextInput
                    placeholder="Ex: Chez Maman Bénin, Cotonou"
                    placeholderTextColor="#94A3B8"
                    value={customRestaurantName}
                    onChangeText={setCustomRestaurantName}
                    className="flex-1 text-white text-sm font-semibold"
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* Date */}
        <View>
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Date</Text>
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-x-3">
            <Calendar size={16} color="#94A3B8" />
            <TextInput
              placeholder="Ex: 15/07/2026"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
              className="flex-1 text-white text-sm font-semibold"
            />
          </View>
        </View>

        {/* Heure */}
        <View>
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Heure</Text>
          <View className="flex-row flex-wrap gap-2">
            {TIME_SLOTS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTime(t)}
                className="px-4 py-2 rounded-xl border"
                style={{
                  backgroundColor: time === t ? "#fcd116" : "rgba(255,255,255,0.05)",
                  borderColor: time === t ? "#fcd116" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  className="text-xs font-black"
                  style={{ color: time === t ? "#001f13" : "rgba(255,255,255,0.7)" }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nombre de personnes */}
        <View>
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Nombre de personnes
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {GUEST_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGuests(g)}
                className="w-10 h-10 rounded-xl border items-center justify-center"
                style={{
                  backgroundColor: guests === g ? "#fcd116" : "rgba(255,255,255,0.05)",
                  borderColor: guests === g ? "#fcd116" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  className="text-sm font-black"
                  style={{ color: guests === g ? "#001f13" : "rgba(255,255,255,0.7)" }}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View>
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Note / Demande spéciale (optionnel)
          </Text>
          <TextInput
            placeholder="Ex: Table en terrasse, anniversaire, régime alimentaire…"
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-medium"
            style={{ minHeight: 80 }}
          />
        </View>

        {/* Récapitulatif */}
        {date && time && (
          <View className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 gap-y-1.5">
            <Text className="text-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
              Récapitulatif
            </Text>
            <Text className="text-white text-sm">
              📍 <Text className="font-bold">{currentDisplayName || "—"}</Text>
            </Text>
            <Text className="text-white text-sm">
              📅 <Text className="font-bold">{date}</Text> à <Text className="font-bold">{time}</Text>
            </Text>
            <Text className="text-white text-sm">
              👥 <Text className="font-bold">{guests} personne{guests > 1 ? "s" : ""}</Text>
            </Text>
          </View>
        )}

        {/* Bouton */}
        <TouchableOpacity
          onPress={handleReserve}
          disabled={loading}
          activeOpacity={0.85}
          className="w-full py-4 rounded-2xl items-center justify-center mt-2"
          style={{ backgroundColor: "#fcd116" }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#001f13" />
          ) : (
            <Text className="text-bf-dark font-black text-base">Confirmer la réservation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
