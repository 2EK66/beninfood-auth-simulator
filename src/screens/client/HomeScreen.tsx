import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  TextInput, Image, ScrollView, SafeAreaView,
  StatusBar, RefreshControl, ActivityIndicator,
} from "react-native";
import {
  Search, MapPin, Star, ShoppingBag, Bell,
  LogOut, Utensils, Plus, SlidersHorizontal,
} from "lucide-react-native";
import { supabase, signOutUser } from "../../lib/supabase";
import { BfProfile, BfRestaurant, BfMenuItem, CartItem } from "../../types";

interface Props {
  user: BfProfile;
}

const CATEGORIES = ["Tous", "Maquis 🇧🇯", "Grillades", "Fast-Food", "Pâtisseries"];

const FALLBACK_RESTAURANTS: BfRestaurant[] = [
  { id: "1", owner_id: "", name: "Chez Maman Bénin", location: "Cotonou, Fidjrossè", phone: null, category: "Maquis 🇧🇯", rating: 4.8, image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60", description: "Le meilleur Atassi et friture de Cotonou.", created_at: "" },
  { id: "2", owner_id: "", name: "Le Choukouya National", location: "Parakou, Dépôt", phone: null, category: "Grillades", rating: 4.6, image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60", description: "Grillades tendres de mouton et poulet.", created_at: "" },
  { id: "3", owner_id: "", name: "Pâtisserie Royale", location: "Porto-Novo, Tokpota", phone: null, category: "Pâtisseries", rating: 4.5, image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60", description: "Douceurs sucrées et gâteaux béninois.", created_at: "" },
  { id: "4", owner_id: "", name: "Dany Fast-Food", location: "Cotonou, Zongo", phone: null, category: "Fast-Food", rating: 4.3, image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60", description: "Burgers avec frites d'igname locale.", created_at: "" },
];

export default function HomeScreen({ user }: Props) {
  const [restaurants, setRestaurants] = useState<BfRestaurant[]>(FALLBACK_RESTAURANTS);
  const [menuItems, setMenuItems] = useState<BfMenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [restRes, menuRes] = await Promise.all([
      supabase.from("bf_restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("bf_menu_du_jour").select("*").eq("is_available", true).order("created_at", { ascending: false }),
    ]);
    if (restRes.data && restRes.data.length > 0) setRestaurants(restRes.data);
    if (menuRes.data) setMenuItems(menuRes.data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addToCart = (item: BfMenuItem, restaurant: BfRestaurant) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, {
        menuItemId: item.id, name: item.dish_name, price: item.price,
        quantity: 1, image_url: item.image_url,
        restaurantId: restaurant.id, restaurantName: restaurant.name,
      }];
    });
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const filtered = restaurants.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tous" || r.category === category;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView className="flex-1 bg-bf-dark">
      <StatusBar barStyle="light-content" backgroundColor="#001f13" />

      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-bf-green/30 border-b border-bf-border flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3">
          <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: "#fcd116" }}>
            <Text className="text-bf-dark font-black text-sm">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-white/40 text-xs font-semibold">Akwaaba 👋</Text>
            <Text className="text-white font-black text-sm">{user.name}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity className="w-9 h-9 bg-white/5 border border-white/10 rounded-full items-center justify-center">
            <Bell size={16} color="#fcd116" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={signOutUser}
            className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-full items-center justify-center"
          >
            <LogOut size={15} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fcd116" />}
        contentContainerStyle={{ paddingBottom: cart.length > 0 ? 100 : 24 }}
      >
        {/* Barre de recherche */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 h-12 gap-x-3">
            <Search size={16} color="#94A3B8" />
            <TextInput
              placeholder="Atassi, Amiwo, Fufu, maquis…"
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-white text-sm font-medium"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text className="text-white/40 text-lg font-bold">×</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <SlidersHorizontal size={15} color="#fcd116" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Catégories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className="px-4 py-2 rounded-full border"
              style={{
                backgroundColor: category === cat ? "#fcd116" : "rgba(255,255,255,0.05)",
                borderColor: category === cat ? "#fcd116" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text className="text-xs font-black" style={{ color: category === cat ? "#001f13" : "rgba(255,255,255,0.7)" }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Plats du jour */}
        {menuItems.length > 0 && (
          <View className="mt-5">
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="text-white font-black text-sm">🔥 Plats du Jour</Text>
              <Text className="text-xs font-bold" style={{ color: "#fcd116" }}>Menu live 🇧🇯</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {menuItems.map(item => {
                const rest = restaurants.find(r => r.id === item.restaurant_id);
                return (
                  <View key={item.id} className="w-36 bg-bf-card border border-bf-border rounded-2xl overflow-hidden">
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} className="w-full h-20" resizeMode="cover" />
                    ) : (
                      <View className="w-full h-20 bg-white/5 items-center justify-center">
                        <Utensils size={24} color="#fcd116" />
                      </View>
                    )}
                    <View className="p-2">
                      <Text className="text-white font-black text-xs" numberOfLines={1}>{item.dish_name}</Text>
                      <Text className="text-white/40 text-[9px] mt-0.5" numberOfLines={1}>{item.description}</Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="font-black text-xs" style={{ color: "#fcd116" }}>{item.price.toLocaleString()} F</Text>
                        {rest && (
                          <TouchableOpacity
                            onPress={() => addToCart(item, rest)}
                            className="w-6 h-6 rounded-lg items-center justify-center"
                            style={{ backgroundColor: "#fcd116" }}
                          >
                            <Plus size={12} color="#001f13" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Restaurants */}
        <View className="mt-5 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-black text-sm">
              Maquis à proximité ({filtered.length})
            </Text>
            <Text className="text-white/30 text-[9px] font-mono">bf_restaurants</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#fcd116" className="mt-8" />
          ) : filtered.length === 0 ? (
            <View className="items-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <Utensils size={32} color="#94A3B8" />
              <Text className="text-white/40 text-sm mt-3">Aucun résultat pour "{search}"</Text>
            </View>
          ) : (
            filtered.map(r => (
              <View key={r.id} className="bg-bf-card border border-bf-border rounded-2xl overflow-hidden mb-4">
                {r.image_url ? (
                  <Image source={{ uri: r.image_url }} className="w-full h-36" resizeMode="cover" />
                ) : (
                  <View className="w-full h-36 bg-white/5 items-center justify-center">
                    <Utensils size={32} color="#fcd116" />
                  </View>
                )}
                {/* Badge note */}
                <View className="absolute top-3 right-3 flex-row items-center bg-black/60 px-2 py-1 rounded-lg gap-x-1">
                  <Star size={10} fill="#fcd116" color="#fcd116" />
                  <Text className="text-white font-black text-xs">{(r.rating || 4.5).toFixed(1)}</Text>
                </View>
                <View className="p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-black text-sm flex-1 mr-2" numberOfLines={1}>{r.name}</Text>
                    <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <Text className="text-emerald-400 text-[9px] font-black">{r.category || "Maquis 🇧🇯"}</Text>
                    </View>
                  </View>
                  <Text className="text-white/50 text-xs" numberOfLines={2}>{r.description}</Text>
                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <View className="flex-row items-center gap-x-1">
                      <MapPin size={10} color="#ef4444" />
                      <Text className="text-white/40 text-[10px] font-bold">{r.location}</Text>
                    </View>
                    <Text className="text-emerald-400 text-[9px] font-black">🛵 Livraison rapide</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <View className="absolute bottom-5 left-5 right-5 bg-bf-green border border-bf-gold/30 rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-2xl">
          <View className="flex-row items-center gap-x-3">
            <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: "rgba(252,209,22,0.15)" }}>
              <ShoppingBag size={14} color="#fcd116" />
            </View>
            <View>
              <Text className="text-white font-black text-xs">{cartCount} plat{cartCount > 1 ? "s" : ""}</Text>
              <Text className="text-white/50 text-[10px]">{cartTotal.toLocaleString()} FCFA</Text>
            </View>
          </View>
          <TouchableOpacity className="flex-row items-center px-4 py-2 rounded-xl gap-x-1.5" style={{ backgroundColor: "#fcd116" }}>
            <Text className="text-bf-dark font-black text-xs">Commander</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
