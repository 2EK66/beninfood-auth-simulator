// ─── Rôles utilisateur ────────────────────────────────────────────────────────
export type UserRole = "Client" | "Gérant" | "Livreur";

// ─── Profil BéninFood ─────────────────────────────────────────────────────────
export interface BfProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

// ─── Restaurant / Maquis ─────────────────────────────────────────────────────
export interface BfRestaurant {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  phone: string | null;
  category?: string;
  rating?: number;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
}

// ─── Plat du menu ────────────────────────────────────────────────────────────
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

// ─── Commande ────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "accepted"
  | "scanned"
  | "arrived"
  | "delivered"
  | "cancelled";

export interface BfOrder {
  id: string;
  client_id: string;
  restaurant_id: string;
  delivery_person_id: string | null;
  status: OrderStatus;
  total_amount: number;
  restaurant_amount: number;
  delivery_amount: number;
  commission_amount: number;
  delivery_landmark: string | null;
  delivery_gps_lat: number | null;
  delivery_gps_lng: number | null;
  created_at: string;
}

// ─── Item de commande ────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

// ─── Panier local ────────────────────────────────────────────────────────────
export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  restaurantId: string;
  restaurantName: string;
}

// ─── Reversement MoMo ────────────────────────────────────────────────────────
export type PayoutStatus = "en_cours" | "valide" | "rejete";
export type MomoOperator = "MTN MoMo" | "Moov Flooz";

export interface BfPayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  momo_number: string;
  operator: MomoOperator;
  status: PayoutStatus;
  requested_at: string;
  processed_at: string | null;
}

// ─── Réservation de table ─────────────────────────────────────────────────────
export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface BfReservation {
  id: string;
  client_id: string;
  restaurant_id: string;
  date: string;
  time: string;
  guests: number;
  note: string | null;
  status: ReservationStatus;
  created_at: string;
}

// ─── Session auth ────────────────────────────────────────────────────────────
export interface AuthSession {
  user: BfProfile;
  access_token: string;
  refresh_token: string;
}

// ─── Navigation params ────────────────────────────────────────────────────────
export type RootStackParamList = {
  "(auth)": undefined;
  "(client)": undefined;
  "(gerant)": undefined;
  "(livreur)": undefined;
};
