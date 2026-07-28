import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar,
  ActivityIndicator, Alert, ScrollView,
} from "react-native";
import {
  ShoppingBag, MapPin, Phone, Trash2,
  CheckCircle2, Plus, Minus, ArrowRight, User, Navigation, Clock
} from "lucide-react-native";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfRestaurant, CartItem } from "../../types";

interface Props {
  user: BfProfile;
  route?: any;
  navigation?: any;
}

const MOMO_OPERATORS = ["MTN MoMo", "Moov Flooz"] as const;

export default function CommandeScreen({ user, route, navigation }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Champs du formulaire de livraison
  const [fullName, setFullName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [landmark, setLandmark] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [operator, setOperator] = useState<typeof MOMO_OPERATORS[number]>("MTN MoMo");

  // États du flux
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<BfRestaurant[]>([]);

  useEffect(() => {
    if (route?.params?.initialCart) {
      setCart(route.params.initialCart);
    }
    if (route?.params?.initialStep) {
      setStep(route.params.initialStep);
    }
  }, [route?.params]);

  useEffect(() => {
    const fetch = async () => {
      const [menuRes, restRes] = await Promise.all([
        supabase.from("bf_menu_du_jour").select("*").eq("is_available", true).limit(10),
        supabase.from("bf_restaurants").select("*").limit(10),
      ]);
      setMenuItems(menuRes.data || []);
      setRestaurants(restRes.data || []);
    };
    fetch();
  }, []);

  // Gestion des ajouts au panier avec vérification d'unicité du restaurant
  const addItem = (item: any) => {
    const rest = restaurants.find(r => r.id === item.restaurant_id) || restaurants[0];
    if (!rest) {
      Alert.alert("Erreur", "Aucun restaurant associé à ce plat.");
      return;
    }

    // Vérification multi-restaurant : le panier ne peut contenir que les plats d'un seul restaurant à la fois
    if (cart.length > 0 && cart[0].restaurantId !== rest.id) {
      Alert.alert(
        "Changer de restaurant ?",
        `Votre panier contient déjà des plats de "${cart[0].restaurantName}". Souhaitez-vous vider le panier pour commander chez "${rest.name}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Vider et ajouter",
            style: "destructive",
            onPress: () => {
              setCart([{
                menuItemId: item.id,
                name: item.dish_name,
                price: Number(item.price),
                quantity: 1,
                image_url: item.image_url,
                restaurantId: rest.id,
                restaurantName: rest.name,
              }]);
            }
          }
        ]
      );
      return;
    }

    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) {
        return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.dish_name,
        price: Number(item.price),
        quantity: 1,
        image_url: item.image_url,
        restaurantId: rest.id,
        restaurantName: rest.name,
      }];
    });
  };

  const removeItem = (menuItemId: string | number) => {
    setCart(prev => {
      const item = prev.find(c => c.menuItemId === menuItemId);
      if (!item) return prev;
      if (item.quantity === 1) return prev.filter(c => c.menuItemId !== menuItemId);
      return prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  // Géolocalisation GPS
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Autorisez l'accès à la position pour être géolocalisé.");
        setGettingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoordinates({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      Alert.alert("Position capturée", "Votre position GPS a été ajoutée à la commande.");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de récupérer la position GPS.");
    } finally {
      setGettingLocation(false);
    }
  };

  const totalDishes = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const deliveryFee = 1500;
  const grandTotal = totalDishes + deliveryFee;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  // Validation finale de la commande vers Supabase
  const handleFinalSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert("Nom requis", "Veuillez indiquer votre nom complet.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Téléphone requis", "Veuillez indiquer votre numéro de téléphone.");
      return;
    }
    if (!landmark.trim()) {
      Alert.alert("Adresse requise", "Précisez votre lieu ou repère de livraison.");
      return;
    }

    setLoading(true);

    try {
      const restaurantId = cart[0]?.restaurantId || restaurants[0]?.id;
      const commission = Math.round(totalDishes * 0.10);
      const restaurantAmount = totalDishes - commission;

      // 1. Insertion dans la table des commandes (bf_orders) avec champs structurés
      const { data: orderData, error: orderError } = await supabase
        .from("bf_orders")
        .insert({
          client_id: user.id,
          restaurant_id: restaurantId,
          total_amount: grandTotal,
          restaurant_amount: restaurantAmount,
          delivery_amount: deliveryFee,
          commission_amount: commission,
          delivery_name: fullName.trim(),
          delivery_phone: phone.trim(),
          delivery_landmark: landmark.trim(),
          delivery_latitude: coordinates?.latitude || null,
          delivery_longitude: coordinates?.longitude || null,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insertion des détails des plats dans la table bf_order_items
      const orderItemsToInsert = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        dish_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("bf_order_items")
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      setOrderId(orderData.id);
      setStep("success");
      setCart([]);
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de passer la commande. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // Écran 3 : Confirmation & Succès
  if (step === "success") {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0f0d] items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 items-center justify-center mb-5">
          <CheckCircle2 size={36} color="#34d399" />
        </View>
        <Text className="text-white text-xl font-black mb-2 text-center">
          Commande transmise ! 🎉
        </Text>
        <Text className="text-white/50 text-sm text-center leading-relaxed mb-2">
          Un livreur va prendre en charge votre repas.
        </Text>
        <Text className="text-[#fcd116] font-mono text-xs mb-8">
          #{orderId.slice(0, 8).toUpperCase()}
        </Text>

        <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/40 text-xs">Total à payer</Text>
            <Text className="text-[#fcd116] font-black text-sm">
              {grandTotal.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/40 text-xs">Client</Text>
            <Text className="text-white text-xs font-bold">{fullName}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-white/40 text-xs">Paiement</Text>
            <Text className="text-white text-xs font-bold">{operator}</Text>
          </View>
        </View>

        {/* Bouton Suivre ma commande */}
        <TouchableOpacity
          onPress={() => {
            if (navigation) {
              navigation.navigate("OrderTracking", { orderId });
            } else {
              Alert.alert("Suivi", `Redirection vers le suivi de la commande #${orderId.slice(0, 8)}`);
            }
          }}
          className="w-full py-4 rounded-2xl items-center flex-row justify-center gap-2 mb-3"
          style={{ backgroundColor: "#fcd116" }}
        >
          <Clock size={18} color="#0a0f0d" />
          <Text className="text-[#0a0f0d] font-black text-base">
            Suivre ma commande
          </Text>
        </TouchableOpacity>

        {/* Bouton Retour au menu */}
        <TouchableOpacity
          onPress={() => { setStep("cart"); setLandmark(""); }}
          className="w-full py-3 rounded-2xl items-center bg-white/10"
        >
          <Text className="text-white font-bold text-sm">
            Retour au menu
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0f0d]">
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />

      {/* Header */}
      <View className="px-5 pt-4 pb-3 border-b border-[#1a2e1f] flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-bold text-[#fcd116] uppercase tracking-widest">
            {step === "checkout" ? "Étape 2 / 2" : "Étape 1 / 2"}
          </Text>
          <Text className="text-lg font-black text-white mt-0.5">
            {step === "checkout" ? "Informations de Livraison" : `Mon Panier (${cartCount})`}
          </Text>
        </View>
        {cartCount > 0 && step === "cart" && (
          <TouchableOpacity
            onPress={() => setCart([])}
            className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <Trash2 size={16} color="#f87171" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* ÉTAPE 1 : Choix des plats */}
        {step === "cart" && (
          <>
            <Text className="text-sm font-black text-white mb-3">
              Plats disponibles au menu
            </Text>
            <View className="mb-5">
              {menuItems.map(item => {
                const inCart = cart.find(c => c.menuItemId === item.id);
                return (
                  <View
                    key={item.id}
                    className="flex-row items-center bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-3 mb-2"
                  >
                    <View className="flex-1 mr-3">
                      <Text className="text-white font-bold text-sm" numberOfLines={1}>
                        {item.dish_name}
                      </Text>
                      <Text className="text-[#fcd116] font-black text-sm mt-1">
                        {Number(item.price).toLocaleString("fr-FR")} FCFA
                      </Text>
                    </View>

                    {inCart ? (
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-lg bg-white/10 items-center justify-center"
                        >
                          <Minus size={12} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-black text-sm w-4 text-center">
                          {inCart.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => addItem(item)}
                          className="w-7 h-7 rounded-lg items-center justify-center"
                          style={{ backgroundColor: "#fcd116" }}
                        >
                          <Plus size={12} color="#0a0f0d" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => addItem(item)}
                        className="w-8 h-8 rounded-xl items-center justify-center"
                        style={{ backgroundColor: "#fcd116" }}
                      >
                        <Plus size={16} color="#0a0f0d" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            {cart.length > 0 && (
              <TouchableOpacity
                onPress={() => setStep("checkout")}
                className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-4"
                style={{ backgroundColor: "#fcd116" }}
              >
                <Text className="font-black text-base text-[#0a0f0d]">
                  Continuer vers la livraison ({grandTotal.toLocaleString("fr-FR")} F)
                </Text>
                <ArrowRight size={18} color="#0a0f0d" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ÉTAPE 2 : Formulaire complet de Livraison */}
        {step === "checkout" && (
          <>
            {/* Récapitulatif Panier */}
            <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-5">
              <Text className="text-xs font-bold text-[#fcd116] uppercase mb-2">
                Restaurant: {cart[0]?.restaurantName || "Sélectionné"}
              </Text>
              {cart.map(item => (
                <View key={item.menuItemId} className="flex-row justify-between mb-1">
                  <Text className="text-white/70 text-sm">{item.quantity}x {item.name}</Text>
                  <Text className="text-white font-bold text-sm">{(item.price * item.quantity).toLocaleString("fr-FR")} F</Text>
                </View>
              ))}
              <View className="border-t border-white/10 mt-2 pt-2 flex-row justify-between">
                <Text className="text-white/50 text-sm">Frais de Livraison</Text>
                <Text className="text-white font-bold text-sm">+ 1 500 F</Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-white font-black text-base">Total à régler</Text>
                <Text className="font-black text-base text-[#fcd116]">
                  {grandTotal.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>
            </View>

            {/* Formulaire des coordonnées */}
            <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
              Nom complet pour la réception *
            </Text>
            <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-3 mb-4">
              <User size={16} color="#94A3B8" />
              <TextInput
                placeholder="Ex: Jean Dupont"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
                className="flex-1 text-white text-sm font-medium"
              />
            </View>

            <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
              Numéro de téléphone direct *
            </Text>
            <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-3 mb-4">
              <Phone size={16} color="#94A3B8" />
              <TextInput
                placeholder="Ex: 61 00 00 00"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className="flex-1 text-white text-sm font-medium"
              />
            </View>

            <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
              Lieu / Repère précis de livraison *
            </Text>
            <View className="flex-row items-start bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-3 mb-3">
              <MapPin size={16} color="#94A3B8" style={{ marginTop: 2 }} />
              <TextInput
                placeholder="Ex: Cadjehoun, derrière le Collège Père Aupiais, maison portail bleu"
                placeholderTextColor="#94A3B8"
                value={landmark}
                onChangeText={setLandmark}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                className="flex-1 text-white text-sm font-medium"
                style={{ minHeight: 45 }}
              />
            </View>

            {/* Bouton Partager Position GPS */}
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={gettingLocation}
              className="flex-row items-center justify-center gap-2 bg-white/5 border border-emerald-500/30 rounded-xl py-3 mb-6"
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#34d399" />
              ) : (
                <>
                  <Navigation size={15} color="#34d399" />
                  <Text className="text-emerald-400 font-bold text-xs">
                    {coordinates ? "Position GPS ajoutée ✓" : "Ajouter ma position GPS actuelle"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Choix Opérateur MoMo */}
            <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
              Moyen de paiement
            </Text>
            <View className="flex-row gap-3 mb-6">
              {MOMO_OPERATORS.map(op => (
                <TouchableOpacity
                  key={op}
                  onPress={() => setOperator(op)}
                  className="flex-1 py-3 rounded-xl border items-center"
                  style={{
                    backgroundColor: operator === op ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                    borderColor: operator === op ? "#fbbf24" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text className="text-sm font-black text-white">{op}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setStep("cart")}
                className="py-4 px-5 rounded-2xl bg-white/10"
              >
                <Text className="text-white font-bold">Retour</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinalSubmit}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl items-center justify-center flex-row gap-2"
                style={{ backgroundColor: "#fcd116" }}
              >
                {loading ? (
                  <ActivityIndicator color="#0a0f0d" />
                ) : (
                  <>
                    <ShoppingBag size={18} color="#0a0f0d" />
                    <Text className="font-black text-base text-[#0a0f0d]">
                      Confirmer & Payer
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
