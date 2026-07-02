import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, StatusBar,
  ActivityIndicator, Alert, ScrollView,
} from "react-native";
import {
  ShoppingBag, MapPin, Phone, Trash2,
  CheckCircle2, Plus, Minus, ArrowRight,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { BfProfile, BfRestaurant, CartItem } from "../../types";

interface Props { user: BfProfile; }

const MOMO_OPERATORS = ["MTN MoMo", "Moov Flooz"] as const;

export default function CommandeScreen({ user }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState(user.phone);
  const [operator, setOperator] = useState<typeof MOMO_OPERATORS[number]>("MTN MoMo");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Charger les plats du jour pour pouvoir commander
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<BfRestaurant[]>([]);

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

  const addItem = (item: any) => {
    const rest = restaurants.find(r => r.id === item.restaurant_id);
    if (!rest) return;
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) {
        return prev.map(c => c.menuItemId === item.id
          ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.dish_name,
        price: item.price,
        quantity: 1,
        image_url: item.image_url,
        restaurantId: rest.id,
        restaurantName: rest.name,
      }];
    });
  };

  const removeItem = (menuItemId: number) => {
    setCart(prev => {
      const item = prev.find(c => c.menuItemId === menuItemId);
      if (!item) return prev;
      if (item.quantity === 1) return prev.filter(c => c.menuItemId !== menuItemId);
      return prev.map(c => c.menuItemId === menuItemId
        ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Panier vide", "Ajoutez des plats avant de commander.");
      return;
    }
    if (!landmark.trim()) {
      Alert.alert("Adresse requise", "Précisez votre lieu de livraison.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Téléphone requis", "Entrez votre numéro pour la livraison.");
      return;
    }

    setLoading(true);

    const restaurantId = cart[0].restaurantId;
    const commission = Math.round(total * 0.10);
    const deliveryAmount = 1500;
    const restaurantAmount = total - commission - deliveryAmount;

    const { data, error } = await supabase
      .from("bf_orders")
      .insert({
        client_id: user.id,
        restaurant_id: restaurantId,
        total_amount: total,
        restaurant_amount: restaurantAmount,
        delivery_amount: deliveryAmount,
        commission_amount: commission,
        delivery_landmark: landmark.trim(),
        status: "pending",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      Alert.alert("Erreur", "Impossible de passer la commande. Réessayez.");
      return;
    }

    setOrderId(data.id);
    setSuccess(true);
    setCart([]);
  };

  // Écran de succès
  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0f0d] items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 items-center justify-center mb-5">
          <CheckCircle2 size={36} color="#34d399" />
        </View>
        <Text className="text-white text-xl font-black mb-2 text-center">
          Commande envoyée ! 🎉
        </Text>
        <Text className="text-white/50 text-sm text-center leading-relaxed mb-2">
          Un livreur va prendre en charge votre commande.
        </Text>
        <Text className="text-[#fcd116] font-mono text-xs mb-8">
          #{orderId.slice(0, 8).toUpperCase()}
        </Text>

        <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 w-full mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/40 text-xs">Total payé</Text>
            <Text className="text-[#fcd116] font-black text-sm">
              {total.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/40 text-xs">Livraison</Text>
            <Text className="text-white text-xs font-bold">1 500 FCFA</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-white/40 text-xs">Paiement</Text>
            <Text className="text-white text-xs font-bold">{operator}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => { setSuccess(false); setLandmark(""); }}
          className="w-full py-4 rounded-2xl items-center"
          style={{ backgroundColor: "#fcd116" }}
        >
          <Text className="text-[#0a0f0d] font-black text-base">
            Nouvelle commande
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
            Commander
          </Text>
          <Text className="text-lg font-black text-white mt-0.5">
            Mon panier {cartCount > 0 && (
              <Text className="text-[#fcd116]">({cartCount})</Text>
            )}
          </Text>
        </View>
        {cartCount > 0 && (
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
        {/* Plats disponibles */}
        {menuItems.length > 0 && (
          <View className="mb-5">
            <Text className="text-sm font-black text-white mb-3">
              Plats disponibles
            </Text>
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
                    {item.description && (
                      <Text className="text-white/40 text-xs mt-0.5" numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
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
        )}

        {/* Panier */}
        {cart.length > 0 && (
          <View className="bg-[#0d1a12] border border-[#1a2e1f] rounded-2xl p-4 mb-5">
            <Text className="text-sm font-black text-white mb-3">
              Récapitulatif
            </Text>
            {cart.map(item => (
              <View key={item.menuItemId} className="flex-row justify-between mb-2">
                <Text className="text-white/70 text-sm flex-1 mr-2" numberOfLines={1}>
                  {item.quantity}× {item.name}
                </Text>
                <Text className="text-white font-bold text-sm">
                  {(item.price * item.quantity).toLocaleString("fr-FR")} F
                </Text>
              </View>
            ))}
            <View className="border-t border-white/10 mt-2 pt-2 flex-row justify-between">
              <Text className="text-white/50 text-sm">Livraison</Text>
              <Text className="text-white text-sm font-bold">+ 1 500 F</Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-white font-black text-base">Total</Text>
              <Text className="font-black text-base" style={{ color: "#fcd116" }}>
                {(total + 1500).toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
          </View>
        )}

        {/* Livraison */}
        <View className="mb-4">
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Lieu de livraison *
          </Text>
          <View className="flex-row items-start bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-3">
            <MapPin size={16} color="#94A3B8" style={{ marginTop: 2 }} />
            <TextInput
              placeholder="Ex: Fidjrossè, face à la pharmacie, portail vert…"
              placeholderTextColor="#94A3B8"
              value={landmark}
              onChangeText={setLandmark}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className="flex-1 text-white text-sm font-medium"
              style={{ minHeight: 50 }}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Téléphone de livraison *
          </Text>
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-3">
            <Phone size={16} color="#94A3B8" />
            <Text className="text-white/40 font-black text-sm">+229</Text>
            <TextInput
              placeholder="61 00 00 00"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="flex-1 text-white text-sm font-medium"
            />
          </View>
        </View>

        {/* Opérateur MoMo */}
        <View className="mb-6">
          <Text className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            Paiement Mobile Money
          </Text>
          <View className="flex-row gap-3">
            {MOMO_OPERATORS.map(op => (
              <TouchableOpacity
                key={op}
                onPress={() => setOperator(op)}
                className="flex-1 py-3 rounded-xl border items-center"
                style={{
                  backgroundColor: operator === op
                    ? op === "MTN MoMo" ? "rgba(251,191,36,0.15)" : "rgba(96,165,250,0.15)"
                    : "rgba(255,255,255,0.05)",
                  borderColor: operator === op
                    ? op === "MTN MoMo" ? "#fbbf24" : "#60a5fa"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <Text className="text-sm font-black text-white">{op}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bouton commander */}
        <TouchableOpacity
          onPress={handleOrder}
          disabled={loading || cart.length === 0}
          className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
          style={{
            backgroundColor: cart.length > 0 ? "#fcd116" : "rgba(255,255,255,0.1)",
          }}
        >
          {loading
            ? <ActivityIndicator size="small" color="#0a0f0d" />
            : <>
                <ShoppingBag size={18} color={cart.length > 0 ? "#0a0f0d" : "rgba(255,255,255,0.3)"} />
                <Text
                  className="font-black text-base"
                  style={{ color: cart.length > 0 ? "#0a0f0d" : "rgba(255,255,255,0.3)" }}
                >
                  {cart.length === 0 ? "Ajoutez des plats" : `Commander • ${(total + 1500).toLocaleString("fr-FR")} F`}
                </Text>
              </>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
