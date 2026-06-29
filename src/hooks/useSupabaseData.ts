/**
 * useSupabaseData.ts
 * Remplace tous les useState + localStorage de App.tsx et PhoneSimulator.tsx
 * par des appels Supabase réels (bf_restaurants, bf_menu_du_jour,
 * bf_orders, bf_payout_requests).
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BfRestaurant {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  phone: string | null;
  created_at: string;
}

export interface BfMenuItem {
  id: number;
  restaurant_id: string;
  dish_name: string;
  price: number;
  description: string | null;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
}

export interface BfOrder {
  id: string;
  client_id: string;
  restaurant_id: string;
  delivery_person_id: string | null;
  status: "pending" | "accepted" | "scanned" | "arrived" | "delivered" | "cancelled";
  total_amount: number;
  restaurant_amount: number;
  delivery_amount: number;
  commission_amount: number;
  delivery_landmark: string | null;
  created_at: string;
}

export interface BfPayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  momo_number: string;
  status: "en_cours" | "valide" | "rejete";
  requested_at: string;
  processed_at: string | null;
}

// ─── Calcul des montants d'une commande (règle métier BeninFood) ──────────────
export function computeOrderAmounts(totalAmount: number) {
  const deliveryAmount = 1500;                                    // frais fixes livreur
  const commissionAmount = Math.round((totalAmount - deliveryAmount) * 0.10); // 10% BeninFood
  const restaurantAmount = totalAmount - deliveryAmount - commissionAmount;   // 75-80% resto
  return { restaurantAmount, deliveryAmount, commissionAmount };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useSupabaseData(userId: string | null) {

  // ── Restaurants / Établissements ──────────────────────────────────────────
  const [restaurants, setRestaurants] = useState<BfRestaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setRestaurantsLoading(true);
    const { data, error } = await supabase
      .from("bf_restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRestaurants(data);
    else console.error("fetchRestaurants:", error?.message);
    setRestaurantsLoading(false);
  }, []);

  const createRestaurant = useCallback(async (
    name: string,
    location: string,
    phone: string
  ): Promise<BfRestaurant | null> => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("bf_restaurants")
      .upsert({ owner_id: userId, name, location, phone }, { onConflict: "owner_id" })
      .select()
      .single();

    if (error) { console.error("createRestaurant:", error.message); return null; }
    await fetchRestaurants();
    return data;
  }, [userId, fetchRestaurants]);

  const deleteRestaurant = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("bf_restaurants")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId ?? "");

    if (error) { console.error("deleteRestaurant:", error.message); return false; }
    setRestaurants(prev => prev.filter(r => r.id !== id));
    return true;
  }, [userId]);

  // ── Menu du jour ──────────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState<BfMenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const fetchMenu = useCallback(async (restaurantId?: string) => {
    setMenuLoading(true);
    let query = supabase
      .from("bf_menu_du_jour")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (restaurantId) query = query.eq("restaurant_id", restaurantId);

    const { data, error } = await query;
    if (!error && data) setMenuItems(data);
    else console.error("fetchMenu:", error?.message);
    setMenuLoading(false);
  }, []);

  const addMenuItem = useCallback(async (
    restaurantId: string,
    dishName: string,
    price: number,
    description: string,
    imageUrl?: string
  ): Promise<BfMenuItem | null> => {
    const { data, error } = await supabase
      .from("bf_menu_du_jour")
      .insert({
        restaurant_id: restaurantId,
        dish_name: dishName,
        price: Math.round(price),
        description: description || null,
        image_url: imageUrl || null,
        is_available: true,
      })
      .select()
      .single();

    if (error) { console.error("addMenuItem:", error.message); return null; }
    setMenuItems(prev => [data, ...prev]);
    return data;
  }, []);

  const removeMenuItem = useCallback(async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from("bf_menu_du_jour")
      .update({ is_available: false })
      .eq("id", id);

    if (error) { console.error("removeMenuItem:", error.message); return false; }
    setMenuItems(prev => prev.filter(item => item.id !== id));
    return true;
  }, []);

  // ── Commandes ─────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<BfOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("bf_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) setOrders(data);
    else console.error("fetchOrders:", error?.message);
    setOrdersLoading(false);
  }, [userId]);

  const createOrder = useCallback(async (
    restaurantId: string,
    totalAmount: number,
    deliveryLandmark: string,
    items: { name: string; price: number; quantity: number }[]
  ): Promise<BfOrder | null> => {
    if (!userId) return null;

    const { restaurantAmount, deliveryAmount, commissionAmount } =
      computeOrderAmounts(totalAmount);

    const { data, error } = await supabase
      .from("bf_orders")
      .insert({
        client_id: userId,
        restaurant_id: restaurantId,
        total_amount: totalAmount,
        restaurant_amount: restaurantAmount,
        delivery_amount: deliveryAmount,
        commission_amount: commissionAmount,
        delivery_landmark: deliveryLandmark,
        status: "pending",
      })
      .select()
      .single();

    if (error) { console.error("createOrder:", error.message); return null; }
    setOrders(prev => [data, ...prev]);
    return data;
  }, [userId]);

  const updateOrderStatus = useCallback(async (
    orderId: string,
    status: BfOrder["status"],
    deliveryPersonId?: string
  ): Promise<boolean> => {
    const updateData: Partial<BfOrder> = { status };
    if (deliveryPersonId) updateData.delivery_person_id = deliveryPersonId;

    const { error } = await supabase
      .from("bf_orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) { console.error("updateOrderStatus:", error.message); return false; }
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, ...updateData } : o)
    );
    return true;
  }, []);

  // ── Demandes de reversement MoMo ─────────────────────────────────────────
  const [payoutRequests, setPayoutRequests] = useState<BfPayoutRequest[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  const fetchPayouts = useCallback(async () => {
    if (!userId) return;
    setPayoutsLoading(true);
    const { data, error } = await supabase
      .from("bf_payout_requests")
      .select("*")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false });

    if (!error && data) setPayoutRequests(data);
    else console.error("fetchPayouts:", error?.message);
    setPayoutsLoading(false);
  }, [userId]);

  const createPayoutRequest = useCallback(async (
    amount: number,
    momoNumber: string
  ): Promise<BfPayoutRequest | null> => {
    if (!userId) return null;

    // Vérifier qu'il n'y a pas déjà une demande en cours
    const hasPending = payoutRequests.some(p => p.status === "en_cours");
    if (hasPending) {
      console.warn("Une demande de reversement est déjà en cours.");
      return null;
    }

    const { data, error } = await supabase
      .from("bf_payout_requests")
      .insert({
        user_id: userId,
        amount,
        momo_number: momoNumber,
        status: "en_cours",
      })
      .select()
      .single();

    if (error) { console.error("createPayoutRequest:", error.message); return null; }
    setPayoutRequests(prev => [data, ...prev]);
    return data;
  }, [userId, payoutRequests]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Écouter les nouvelles commandes en temps réel (pour les livreurs)
    const ordersChannel = supabase
      .channel("bf_orders_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bf_orders" },
        (payload) => {
          const newOrder = payload.new as BfOrder;
          setOrders(prev => {
            // Éviter les doublons
            if (prev.some(o => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bf_orders" },
        (payload) => {
          const updated = payload.new as BfOrder;
          setOrders(prev =>
            prev.map(o => o.id === updated.id ? updated : o)
          );
        }
      )
      .subscribe();

    // Écouter les nouveaux plats du menu en temps réel (pour les clients)
    const menuChannel = supabase
      .channel("bf_menu_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bf_menu_du_jour" },
        (payload) => {
          const newItem = payload.new as BfMenuItem;
          setMenuItems(prev => {
            if (prev.some(m => m.id === newItem.id)) return prev;
            return [newItem, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(menuChannel);
    };
  }, [userId]);

  // ── Chargement initial ────────────────────────────────────────────────────
  useEffect(() => {
    fetchRestaurants();
    fetchMenu();
    if (userId) {
      fetchOrders();
      fetchPayouts();
    }
  }, [userId]);

  return {
    // Restaurants
    restaurants, restaurantsLoading,
    fetchRestaurants, createRestaurant, deleteRestaurant,

    // Menu du jour
    menuItems, menuLoading,
    fetchMenu, addMenuItem, removeMenuItem,

    // Commandes
    orders, ordersLoading,
    fetchOrders, createOrder, updateOrderStatus,

    // Reversements
    payoutRequests, payoutsLoading,
    fetchPayouts, createPayoutRequest,
  };
}
