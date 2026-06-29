import { useState, useEffect, useCallback } from "react";
import { supabase, BfProfile, BfRestaurant, BfOrder, BfPayoutRequest } from "../lib/supabase";

export function useAdminData() {
  const [profiles, setProfiles] = useState<BfProfile[]>([]);
  const [restaurants, setRestaurants] = useState<BfRestaurant[]>([]);
  const [orders, setOrders] = useState<BfOrder[]>([]);
  const [payouts, setPayouts] = useState<BfPayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [p, r, o, pay] = await Promise.all([
      supabase.from("bf_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("bf_restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("bf_orders").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("bf_payout_requests").select("*").order("requested_at", { ascending: false }),
    ]);
    if (p.data) setProfiles(p.data);
    if (r.data) setRestaurants(r.data);
    if (o.data) setOrders(o.data);
    if (pay.data) setPayouts(pay.data);
    setLoading(false);
  }, []);

  // ── Livreurs : créer depuis l'admin ───────────────────────────────────────
  const createDeliverer = useCallback(async (name: string, phone: string, password: string) => {
    const email = `${phone.replace(/\s/g, "")}@beninfood.bj`;
    const res = await fetch("/api/admin/create-deliverer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password, email }),
    });
    return res.json();
  }, []);

  // ── Restaurants : supprimer ────────────────────────────────────────────────
  const deleteRestaurant = useCallback(async (id: string) => {
    const { error } = await supabase.from("bf_restaurants").delete().eq("id", id);
    if (!error) setRestaurants(prev => prev.filter(r => r.id !== id));
    return !error;
  }, []);

  // ── Payouts : valider ou rejeter ──────────────────────────────────────────
  const updatePayoutStatus = useCallback(async (
    id: string,
    status: "valide" | "rejete"
  ) => {
    const { error } = await supabase
      .from("bf_payout_requests")
      .update({ status, processed_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }
    return !error;
  }, []);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();

    const ordersChannel = supabase
      .channel("admin_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "bf_orders" },
        payload => {
          if (payload.eventType === "INSERT") {
            setOrders(prev => [payload.new as BfOrder, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders(prev => prev.map(o => o.id === (payload.new as BfOrder).id ? payload.new as BfOrder : o));
          }
        }
      ).subscribe();

    const payoutsChannel = supabase
      .channel("admin_payouts")
      .on("postgres_changes", { event: "*", schema: "public", table: "bf_payout_requests" },
        payload => {
          if (payload.eventType === "INSERT") {
            setPayouts(prev => [payload.new as BfPayoutRequest, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setPayouts(prev => prev.map(p => p.id === (payload.new as BfPayoutRequest).id ? payload.new as BfPayoutRequest : p));
          }
        }
      ).subscribe();

    const profilesChannel = supabase
      .channel("admin_profiles")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bf_profiles" },
        payload => setProfiles(prev => [payload.new as BfProfile, ...prev])
      ).subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(payoutsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [fetchAll]);

  // ── Stats calculées ────────────────────────────────────────────────────────
  const stats = {
    totalRevenue: orders
      .filter(o => o.status === "delivered")
      .reduce((s, o) => s + Number(o.total_amount), 0),
    totalCommission: orders
      .filter(o => o.status === "delivered")
      .reduce((s, o) => s + Number(o.commission_amount), 0),
    totalDelivered: orders.filter(o => o.status === "delivered").length,
    pendingPayouts: payouts.filter(p => p.status === "en_cours").reduce((s, p) => s + Number(p.amount), 0),
    activeRestaurants: restaurants.length,
    totalClients: profiles.filter(p => p.role === "Client").length,
    totalGerants: profiles.filter(p => p.role === "Gérant").length,
    totalLivreurs: profiles.filter(p => p.role === "Livreur").length,
  };

  return {
    profiles, restaurants, orders, payouts, stats, loading,
    fetchAll, createDeliverer, deleteRestaurant, updatePayoutStatus,
  };
}
