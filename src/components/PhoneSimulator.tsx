import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, 
  Utensils, 
  Bike, 
  Phone, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  Wifi, 
  Battery, 
  Signal, 
  ChevronRight, 
  LogOut, 
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bell,
  Star,
  Search,
  Plus,
  Coins,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  ArrowUpRight,
  Wallet,
  WifiOff,
  Database,
  Map,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone
} from "lucide-react";
import { UserRole, CustomizationOptions, AuthState } from "../types";

// Base de données des établissements BéninFood (bf_etablissements)
export const bf_etablissements = [
  {
    id: "1",
    name: "Chez Maman Bénin",
    category: "Maquis 🇧🇯",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60",
    description: "Le meilleur Atassi et friture de Cotonou avec du poisson frit ou fromage Wagassi."
  },
  {
    id: "2",
    name: "Le Choukouya National",
    category: "Grillades/Choukouya",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60",
    description: "Grillades tendres de mouton et poulet assaisonnées aux épices locales du septentrion."
  },
  {
    id: "3",
    name: "Pâtisserie Royale Porto-Novo",
    category: "Pâtisseries",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60",
    description: "Croissants croustillants, gâteaux traditionnels et douceurs sucrées béninoises."
  },
  {
    id: "4",
    name: "Cotonou Burgers & Fast-Food",
    category: "Fast-Food",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60",
    description: "Burgers savoureux servis avec des frites d'igname locale croustillantes."
  },
  {
    id: "5",
    name: "Maquis l'Épice Béninoise",
    category: "Maquis 🇧🇯",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60",
    description: "Ignames pilées authentiques servies avec une délicieuse sauce d'arachide ou de gombo."
  },
  {
    id: "6",
    name: "Kini-Kini Grillades",
    category: "Grillades/Choukouya",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=60",
    description: "Brochettes de dinde épicées, aloko chaud et frites de patates douces maison."
  }
];

const DRIVER_MOCK_DELIVERIES = [
  {
    id: "CMD-1024",
    maquisName: "Maquis Maman Bénin",
    items: [{ id: "m1", name: "Amiwo au Poulet d'Afrique", price: 3500, quantity: 1 }],
    total: 3500,
    deliveryPhone: "97 12 34 56",
    deliveryLandmark: "Zogbadjè, deuxième rue après l'antenne, maison barrière verte",
    deliveryFee: 1500,
    destination: "Zogbadjè",
    gps: { lat: 6.4212, lng: 2.3411 }
  },
  {
    id: "CMD-3091",
    maquisName: "Le Choukouya National",
    items: [{ id: "m2", name: "Atassi Complet de Parakou", price: 2000, quantity: 1 }],
    total: 2000,
    deliveryPhone: "95 88 99 00",
    deliveryLandmark: "Fidjrossè, pavé de l'église St Jean, portail noir à gauche",
    deliveryFee: 1800,
    destination: "Fidjrossè",
    gps: { lat: 6.3556, lng: 2.3789 }
  },
  {
    id: "CMD-4120",
    maquisName: "Chez Tantie la Royale",
    items: [{ id: "m3", name: "Dakouin d'Abomey-Calavi", price: 4000, quantity: 1 }],
    total: 4000,
    deliveryPhone: "61 00 22 33",
    deliveryLandmark: "Abomey-Calavi, quartier face au restaurant universitaire",
    deliveryFee: 2200,
    destination: "Abomey-Calavi",
    gps: { lat: 6.4422, lng: 2.3556 }
  }
];

const BENIN_CITIES = {
  Cotonou: {
    lat: 6.3654,
    lng: 2.4333,
    landmarks: [
      { name: "Carrefour Fidjrossè (Près de l'Église St Jean, pharmacie de garde)", lat: 6.3688, lng: 2.3789, x: 25, y: 75 },
      { name: "Marché Dantokpa (Près des vendeurs de poissons et friture)", lat: 6.3712, lng: 2.4365, x: 75, y: 35 },
      { name: "Place de l'Étoile Rouge (Face au monument, à côté du kiosque MTN)", lat: 6.3762, lng: 2.4182, x: 55, y: 25 },
      { name: "Stade Général Mathieu Kérékou (Entrée principale, quartier Kouhounou)", lat: 6.3908, lng: 2.3985, x: 38, y: 15 },
      { name: "Aéroport de Cadjehoun (Face à la clôture de la piste de décollage)", lat: 6.3585, lng: 2.3912, x: 15, y: 50 },
      { name: "Port de Cotonou (Près du grand portail d'accès douane)", lat: 6.3521, lng: 2.4312, x: 80, y: 80 }
    ]
  },
  "Abomey-Calavi": {
    lat: 6.4489,
    lng: 2.3486,
    landmarks: [
      { name: "Université d'Abomey-Calavi (Guérite principale, face au campus)", lat: 6.4172, lng: 2.3418, x: 35, y: 85 },
      { name: "Zogbadjè (Près de la Pharmacie des Écoles, deuxième rue à droite)", lat: 6.4255, lng: 2.3385, x: 25, y: 65 },
      { name: "Carrefour Kpota (Près du commissariat et des conducteurs de Zémidjan)", lat: 6.4452, lng: 2.3521, x: 55, y: 45 },
      { name: "Mairie de Calavi (Face au grand monument de la paix)", lat: 6.4528, lng: 2.3499, x: 75, y: 25 },
      { name: "Quartier Arconville (Près de l'école primaire publique, barrière noire)", lat: 6.4612, lng: 2.3556, x: 80, y: 15 }
    ]
  },
  "Porto-Novo": {
    lat: 6.4969,
    lng: 2.6289,
    landmarks: [
      { name: "Chambre de Commerce Porto-Novo (Grand bâtiment à l'angle)", lat: 6.4905, lng: 2.6268, x: 25, y: 70 },
      { name: "Carrefour Catchi (Près de la station service JNP, face au rond-point)", lat: 6.4988, lng: 2.6315, x: 60, y: 40 },
      { name: "Jardin des Plantes (Près du portail principal d'accès botanique)", lat: 6.4852, lng: 2.6225, x: 35, y: 80 },
      { name: "Musée Honmè (Devant le monument historique de l'ancien palais)", lat: 6.4875, lng: 2.6242, x: 45, y: 55 },
      { name: "Marché Ouando (Près de la pharmacie Ouando, zone de friture de poissons)", lat: 6.5120, lng: 2.6395, x: 85, y: 20 }
    ]
  }
};

interface PhoneSimulatorProps {
  customization: CustomizationOptions;
  onSimulateSubmit: (action: "login" | "register", data: any) => Promise<any>;
  usersDb?: { [phone: string]: { name: string; role: UserRole } };
  setUsersDb?: React.Dispatch<React.SetStateAction<{ [phone: string]: { name: string; role: UserRole } }>>;
  versementRequests?: any[];
  setVersementRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  etablissements?: any[];
  setEtablissements?: React.Dispatch<React.SetStateAction<any[]>>;
  keystrokeLogs?: any[];
  setKeystrokeLogs?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function PhoneSimulator({ 
  customization, 
  onSimulateSubmit,
  usersDb: propsUsersDb,
  setUsersDb: propsSetUsersDb,
  versementRequests: propsVersementRequests,
  setVersementRequests: propsSetVersementRequests,
  etablissements: propsEtablissements,
  setEtablissements: propsSetEtablissements,
  keystrokeLogs,
  setKeystrokeLogs
}: PhoneSimulatorProps) {
  const [isLogin, setIsLogin] = useState(customization.screenType !== "signup");
  const [role, setRole] = useState<UserRole>("Client");
  
  // Inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Interaction State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [session, setSession] = useState<AuthState>(() => {
    const saved = localStorage.getItem("bf_mobile_session");
    return saved ? JSON.parse(saved) : { isLoggedIn: false, user: null };
  });

  useEffect(() => {
    localStorage.setItem("bf_mobile_session", JSON.stringify(session));
  }, [session]);

  // Keystroke dynamics tracking ref for behavioral biometrics
  const keystrokeTimingsRef = useRef<{
    keyTimes: { [key: string]: number };
    dwellTimes: number[];
    flightTimes: number[];
    lastKeyReleaseTime: number | null;
  }>({
    keyTimes: {},
    dwellTimes: [],
    flightTimes: [],
    lastKeyReleaseTime: null
  });
  
  const [localUsersDb, localSetUsersDb] = useState<{ [phone: string]: { name: string; role: UserRole } }>({
    "61000000": { name: "M. Sylvain Kodjo", role: "Gérant de Restaurant/Maquis" },
    "62000000": { name: "Mme. Sika Sessi", role: "Client" },
    "63000000": { name: "Léon le Rapide", role: "Livreur" },
  });
  const usersDb = propsUsersDb || localUsersDb;
  const setUsersDb = propsSetUsersDb || localSetUsersDb;

  const [localVersementRequests, localSetVersementRequests] = useState<any[]>([
    { id: "V-102", restaurantName: "Chez Maman Bénin", amount: 45000, status: "En cours...", date: "Aujourd'hui à 11:20", phone: "61000000", operator: "MTN MoMo" },
    { id: "V-101", restaurantName: "Chez Maman Bénin", amount: 30000, status: "Validé", date: "Hier à 21:45", phone: "61000000", operator: "Moov Flooz" },
    { id: "V-100", restaurantName: "Choukouya National", amount: 25000, status: "Validé", date: "24 Juin, 18:30", phone: "97123456", operator: "MTN MoMo" }
  ]);
  const versementRequests = propsVersementRequests || localVersementRequests;
  const setVersementRequests = propsSetVersementRequests || localSetVersementRequests;

  // Sub-tab inside Gérant Mode: "menu" | "portefeuille"
  const [gerantSubTab, setGerantSubTab] = useState<"menu" | "portefeuille">("menu");
  // Portefeuille modal/sheet state
  const [isVersementModalOpen, setIsVersementModalOpen] = useState(false);
  const [momoOperator, setMomoOperator] = useState<"MTN MoMo" | "Moov Flooz">("MTN MoMo");
  const [showGerantComments, setShowGerantComments] = useState(false);

  const [currentTime, setCurrentTime] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  
  // Base de données locale d'établissements mutable pour la simulation
  const [localEtablissements, localSetEtablissements] = useState(bf_etablissements);
  const etablissements = propsEtablissements || localEtablissements;
  const setEtablissements = propsSetEtablissements || localSetEtablissements;
  
  // Hybrid Gérant States
  const [activeMode, setActiveMode] = useState<"client" | "gerant">("client");
  const [platName, setPlatName] = useState("");
  const [platPrice, setPlatPrice] = useState("");
  const [platDesc, setPlatDesc] = useState("");

  // Profil du Restaurant/Maquis (ÉTAPE 1)
  const [restaurantProfile, setRestaurantProfile] = useState<{ name: string; location: string; phone: string } | null>(() => {
    const saved = localStorage.getItem("bf_restaurant_profile");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("bf_restaurant_profile", JSON.stringify(restaurantProfile));
  }, [restaurantProfile]);
  const [restName, setRestName] = useState("");
  const [restLocation, setRestLocation] = useState("");
  const [restPhone, setRestPhone] = useState("");

  // Cart & Delivery States (Client)
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [sharedGPS, setSharedGPS] = useState<{ lat: number; lng: number } | null>(null);
  const [isGPSSimulating, setIsGPSSimulating] = useState(false);
  const [selectedMapCity, setSelectedMapCity] = useState<"Cotonou" | "Abomey-Calavi" | "Porto-Novo">("Cotonou");
  const [customMapPin, setCustomMapPin] = useState<{ x: number; y: number } | null>({ x: 25, y: 75 }); // starts on Fidjrossè preset position

  // FCM Push Notifications & Background Alerts (Vibration, Ringtone & Audio Context)
  const [fcmEnabled, setFcmEnabled] = useState<boolean>(() => {
    return localStorage.getItem("bf_fcm_enabled") !== "false";
  });
  const [fcmVibrationEnabled, setFcmVibrationEnabled] = useState<boolean>(true);
  const [fcmSoundEnabled, setFcmSoundEnabled] = useState<boolean>(true);
  const [fcmPermission, setFcmPermission] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [backgroundTimer, setBackgroundTimer] = useState<number | null>(null);
  const [incomingFCMOrder, setIncomingFCMOrder] = useState<any | null>(null);
  const [isRinging, setIsRinging] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("bf_fcm_enabled", String(fcmEnabled));
  }, [fcmEnabled]);

  // Audio tone generator for BeninFood Order Alert
  const playAlerteSonore = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      playTone(698.46, now, 0.2, "sine");       // F5
      playTone(880.00, now + 0.15, 0.2, "sine");  // A5
      playTone(1046.50, now + 0.3, 0.2, "sine"); // C6
      playTone(1396.91, now + 0.45, 0.4, "triangle"); // F6 (louder accent)
    } catch (err) {
      console.error("Audio synthesis failed:", err);
    }
  };

  const triggerVibration = () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([150, 100, 150, 100, 300]);
      } catch (e) {
        console.warn("Vibration not supported or blocked:", e);
      }
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          const notif = new Notification(title, {
            body,
            icon: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop",
            tag: "beninfood-alert",
            requireInteraction: true
          });
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch (err) {
          console.error("Notification creation failed:", err);
        }
      }
    }
  };

  const handleRequestFcmPermission = async () => {
    if (!("Notification" in window)) {
      setAlertMessage({
        type: "error",
        text: "Les notifications de bureau ne sont pas prises en charge par votre navigateur."
      });
      return;
    }
    const permission = await Notification.requestPermission();
    setFcmPermission(permission);
    if (permission === "granted") {
      setAlertMessage({
        type: "success",
        text: "Notifications de secours activées ! Le téléphone vibrera et sonnera pour chaque commande. 🔔🔊"
      });
      sendBrowserNotification(
        "BéninFood FCM Actif ! 🚀",
        "Votre terminal de réception est connecté avec succès au réseau de notification push."
      );
    } else {
      setAlertMessage({
        type: "error",
        text: "Permission de notification refusée. Veuillez l'autoriser dans les paramètres de votre navigateur."
      });
    }
  };

  const triggerFCMPushNotification = () => {
    // Pick a mock delivery to simulate incoming notification
    const randomId = "CMD_FCM_" + Math.floor(1000 + Math.random() * 9000);
    const mockOrder = {
      id: randomId,
      maquisName: "Maquis La Lagune 🇧🇯",
      items: [{ id: "fcm_p1", name: "Dassa complet (Amiwo + Pintade rôtie)", price: 3500, quantity: 1 }],
      total: 3500,
      deliveryPhone: "97 99 88 77",
      deliveryLandmark: "Fidjrossè Calvaire, à côté de l'agence Moov, maison portail jaune",
      gps: { lat: 6.3688, lng: 2.3789 },
      deliveryFee: 1500
    };

    setIncomingFCMOrder(mockOrder);
    setIsRinging(true);

    if (fcmPermission === "granted") {
      sendBrowserNotification(
        "🔥 Nouvelle commande disponible !",
        `Un client demande : 1x Dassa complet à destination de Fidjrossè Calvaire. Gains: 1 500 FCFA`
      );
    }
  };

  useEffect(() => {
    if (backgroundTimer === null) return;
    if (backgroundTimer <= 0) {
      setBackgroundTimer(null);
      triggerFCMPushNotification();
      return;
    }
    const interval = setInterval(() => {
      setBackgroundTimer(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [backgroundTimer]);

  useEffect(() => {
    if (!isRinging || !incomingFCMOrder) return;
    
    if (fcmSoundEnabled) playAlerteSonore();
    if (fcmVibrationEnabled) triggerVibration();

    const interval = setInterval(() => {
      if (fcmSoundEnabled) playAlerteSonore();
      if (fcmVibrationEnabled) triggerVibration();
    }, 4000);

    return () => clearInterval(interval);
  }, [isRinging, incomingFCMOrder, fcmSoundEnabled, fcmVibrationEnabled]);

  // States for Benin Internet flakiness simulation and offline local caching
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return localStorage.getItem("bf_is_offline") === "true";
  });

  const [offlineCache, setOfflineCache] = useState<{ [id: string]: any }>(() => {
    const saved = localStorage.getItem("bf_offline_cache");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    // Pre-cache mock deliveries
    const initialCache: { [id: string]: any } = {};
    DRIVER_MOCK_DELIVERIES.forEach(d => {
      initialCache[d.id] = {
        ...d,
        cachedAt: "Pré-chargé 💾"
      };
    });
    return initialCache;
  });

  // Sync offline state to localstorage
  useEffect(() => {
    localStorage.setItem("bf_is_offline", String(isOffline));
  }, [isOffline]);

  useEffect(() => {
    localStorage.setItem("bf_offline_cache", JSON.stringify(offlineCache));
  }, [offlineCache]);

  const cacheOrder = (order: any) => {
    if (!order) return;
    setOfflineCache(prev => {
      const updated = {
        ...prev,
        [order.id]: {
          ...order,
          cachedAt: new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })
        }
      };
      return updated;
    });
  };
  
  // Shared Order State (Accessible by Livreur)
  const [activeOrder, setActiveOrder] = useState<{
    id: string;
    items: { id: string; name: string; price: number; quantity: number }[];
    total: number;
    deliveryPhone: string;
    deliveryLandmark: string;
    gps: { lat: number; lng: number } | null;
    maquisName: string;
    status: "pending" | "accepted" | "scanned" | "arrived" | "delivered";
    deliveryFee: number;
  } | null>(null);

  useEffect(() => {
    if (activeOrder) {
      cacheOrder(activeOrder);
    }
  }, [activeOrder]);

  // Livreur Action Simulation States
  const [isCallingClient, setIsCallingClient] = useState(false);
  
  // Client Rating & Tipping States after delivery
  const [clientRating, setClientRating] = useState<number>(0);
  const [clientTip, setClientTip] = useState<number | null>(null);
  const [isTipBlessed, setIsTipBlessed] = useState(false);

  // Client scanning & MoMo payment simulation states
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<"mtn" | "moov">("mtn");
  const [momoPin, setMomoPin] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleAddToCart = (plat: any) => {
    const existing = cart.find(item => item.id === plat.id);
    const cleanPrice = String(plat.price || "0").replace(/[^\d]/g, "");
    const priceNum = Number(cleanPrice) || 0;

    if (existing) {
      setCart(cart.map(item => item.id === plat.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: plat.id, name: plat.name, price: priceNum, quantity: 1 }]);
    }
    setAlertMessage({
      type: "success",
      text: `${plat.name} ajouté au panier ! 🛒`
    });
  };

  const handleSimulateGPS = () => {
    setIsGPSSimulating(true);
    setErrors(prev => ({ ...prev, delivery: "" }));
    setTimeout(() => {
      // Simulate Cotonou Fidjrossè coordinates
      const randomShiftLat = (Math.random() - 0.5) * 0.005;
      const randomShiftLng = (Math.random() - 0.5) * 0.005;
      setSharedGPS({
        lat: 6.3703 + randomShiftLat,
        lng: 2.4252 + randomShiftLng
      });
      setIsGPSSimulating(false);
      setAlertMessage({
        type: "success",
        text: "Géolocalisation réussie ! Signal satellite verrouillé avec précision. 📡"
      });
    }, 1200);
  };

  const handleConfirmOrder = () => {
    if (!deliveryPhone.trim()) {
      setErrors(prev => ({ ...prev, delivery: "Veuillez renseigner votre numéro de téléphone pour la livraison." }));
      return;
    }
    if (!deliveryLandmark.trim()) {
      setErrors(prev => ({ ...prev, delivery: "Veuillez fournir des indications précises du lieu pour aider le livreur." }));
      return;
    }

    const selectedMaquis = restaurantProfile ? restaurantProfile.name : "Chez Maman Bénin";

    const orderData = {
      id: "CMD_" + Math.floor(1000 + Math.random() * 9000),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      deliveryPhone: deliveryPhone,
      deliveryLandmark: deliveryLandmark,
      gps: sharedGPS || { lat: 6.3703, lng: 2.4252 }, // auto fallback if not manually shared
      maquisName: selectedMaquis,
      status: "pending" as const,
      deliveryFee: 1500
    };

    setActiveOrder(orderData);
    setCart([]);
    setIsCheckoutOpen(false);
    
    // Play alert sound, vibrate and trigger push notification to simulate live delivery receipt via FCM
    if (fcmSoundEnabled) {
      playAlerteSonore();
    }
    if (fcmVibrationEnabled) {
      triggerVibration();
    }
    if (fcmPermission === "granted") {
      sendBrowserNotification(
        `🚨 Nouvelle commande reçue (${orderData.id})`,
        `De ${orderData.maquisName} pour ${orderData.deliveryLandmark}. Gains de course : 1 500 FCFA`
      );
    }

    setAlertMessage({
      type: "success",
      text: `Commande ${orderData.id} transmise avec succès ! Alerte Push FCM diffusée aux livreurs. 🏍️`
    });
  };
  
  // Preset images for local gastronomy
  const FOOD_PRESETS = [
    { name: "Amiwo 🍗", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60" },
    { name: "Atassi 🍛", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60" },
    { name: "Gboma 🥬", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60" },
    { name: "Wagassi 🧀", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=60" },
  ];
  
  const [platImage, setPlatImage] = useState(FOOD_PRESETS[0].url);

  const [platsDuJour, setPlatsDuJour] = useState<any[]>(() => {
    const saved = localStorage.getItem("bf_plats_du_jour");
    return saved ? JSON.parse(saved) : [
      {
        id: "p1",
        name: "Amiwo au Poulet Bicyclette 🍗",
        price: "3500",
        description: "Pâte de maïs rouge parfumée aux épices locales avec poulet grillé ou frit.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60"
      },
      {
        id: "p2",
        name: "Atassi complet au Fromage Wagassi 🧀",
        price: "1800",
        description: "Mélange haricot-riz traditionnel servi avec friture parfumée et piment vert.",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60"
      },
      {
        id: "p3",
        name: "Gboma Dessi & Fromage 🥬",
        price: "2200",
        description: "Sauce gboma (épinards sauvages) mijotée au fromage local Wagassi.",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("bf_plats_du_jour", JSON.stringify(platsDuJour));
  }, [platsDuJour]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPlatImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platName.trim() || !platPrice.trim()) {
      setAlertMessage({
        type: "error",
        text: "Veuillez saisir au moins le nom et le prix du plat."
      });
      return;
    }
    const newPlat = {
      id: "p_" + Date.now().toString(),
      name: platName.trim(),
      price: platPrice.trim(),
      description: platDesc.trim() || "Spécialité culinaire béninoise préparée avec passion.",
      image: platImage || FOOD_PRESETS[0].url
    };
    setPlatsDuJour([newPlat, ...platsDuJour]);
    setPlatName("");
    setPlatPrice("");
    setPlatDesc("");
    // Keep the current image selected as a default for next add, or reset to first preset
    setAlertMessage({
      type: "success",
      text: `"${newPlat.name}" a été ajouté avec sa photo au Menu du jour ! 🇧🇯`
    });
  };

  const handleRemovePlat = (id: string) => {
    setPlatsDuJour(platsDuJour.filter(p => p.id !== id));
    setAlertMessage({
      type: "success",
      text: "Plat retiré du menu du jour."
    });
  };

  // Filter establishments based on search query and category
  const filteredEtablissements = etablissements.filter((etab) => {
    const matchesSearch = etab.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
                          etab.category.toLowerCase().includes(clientSearch.toLowerCase()) || 
                          etab.description.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || etab.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sync isLogin with configuration panel screenType changes
  useEffect(() => {
    if (customization.screenType === "login") {
      setIsLogin(true);
    } else if (customization.screenType === "signup") {
      setIsLogin(false);
    }
  }, [customization.screenType]);

  // Clock for the smartphone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, "0");
      let minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!phone) {
      newErrors.phone = "Numéro requis";
    } else if (phone.replace(/\s+/g, "").length < 8) {
      newErrors.phone = "Min. 8 chiffres";
    }

    if (!password) {
      newErrors.password = "Mot de passe requis";
    } else if (password.length < 6) {
      newErrors.password = "Min. 6 caractères";
    }

    if (!isLogin && !name) {
      newErrors.name = "Nom complet requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = performance.now();
    const key = e.key;

    if (!keystrokeTimingsRef.current.keyTimes[key]) {
      keystrokeTimingsRef.current.keyTimes[key] = now;

      if (keystrokeTimingsRef.current.lastKeyReleaseTime !== null) {
        const flightTime = now - keystrokeTimingsRef.current.lastKeyReleaseTime;
        if (flightTime < 1000) {
          keystrokeTimingsRef.current.flightTimes.push(flightTime);
        }
      }
    }
  };

  const handlePasswordKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = performance.now();
    const key = e.key;

    const pressTime = keystrokeTimingsRef.current.keyTimes[key];
    if (pressTime) {
      const dwellTime = now - pressTime;
      if (dwellTime < 1000) {
        keystrokeTimingsRef.current.dwellTimes.push(dwellTime);
      }
      delete keystrokeTimingsRef.current.keyTimes[key];
    }
    keystrokeTimingsRef.current.lastKeyReleaseTime = now;
  };

  const handleAction = async () => {
    if (!validate()) return;
    setLoading(true);
    setAlertMessage(null);

    try {
      const payload = isLogin 
        ? { action: "login", phone, password }
        : { action: "register", name, phone, password, role };

      const response = await onSimulateSubmit(payload.action as "login" | "register", payload);
      
      setLoading(false);
      if (response.success) {
        setAlertMessage({
          type: "success",
          text: response.message
        });

        const cleanPhone = phone.replace(/\s+/g, "");

        // If register, save the new user in database
        if (!isLogin) {
          setUsersDb(prev => ({
            ...prev,
            [cleanPhone]: { name, role }
          }));
        }

        // Lookup user profile
        const matchedUser = usersDb[cleanPhone] || {
          name: isLogin ? "M. Sylvain Kodjo" : name,
          role: isLogin ? "Client" : role
        };

        // Keystroke analysis on login
        if (isLogin && setKeystrokeLogs) {
          const dTimes = keystrokeTimingsRef.current.dwellTimes;
          const fTimes = keystrokeTimingsRef.current.flightTimes;
          
          const dwellVal = dTimes.length > 0 
            ? Math.round(dTimes.reduce((a, b) => a + b, 0) / dTimes.length) 
            : Math.floor(Math.random() * 20) + 85;
            
          const flightVal = fTimes.length > 0 
            ? Math.round(fTimes.reduce((a, b) => a + b, 0) / fTimes.length) 
            : Math.floor(Math.random() * 30) + 110;
            
          const similarityScore = Math.min(99.8, 93 + Math.random() * 6.5).toFixed(1);
          
          const newLog = {
            id: `K-${Math.floor(100 + Math.random() * 900)}`,
            user: `${matchedUser.name} (${matchedUser.role})`,
            dwellTime: `${dwellVal}ms (Normal)`,
            flightTime: `${flightVal}ms (Normal)`,
            similarity: `${similarityScore}%`,
            status: "Authentifié ✅",
            time: "À l'instant"
          };
          
          setKeystrokeLogs(prev => [newLog, ...prev]);
          
          // Reset timings
          keystrokeTimingsRef.current = {
            keyTimes: {},
            dwellTimes: [],
            flightTimes: [],
            lastKeyReleaseTime: null
          };
        }

        // Reset activeMode for Gérant
        if (matchedUser.role === "Gérant" || matchedUser.role === "Gérant de Restaurant/Maquis") {
          setActiveMode("client");
        }
        
        // Log user in
        setSession({
          isLoggedIn: true,
          user: {
            name: matchedUser.name,
            phone,
            role: matchedUser.role
          },
          token: response.data.token
        });
      } else {
        setAlertMessage({
          type: "error",
          text: response.message || "Échec de l'opération."
        });
      }
    } catch (err: any) {
      setLoading(false);
      setAlertMessage({
        type: "error",
        text: err.message || "Erreur de connexion au serveur de simulation."
      });
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restName.trim() || !restLocation.trim() || !restPhone.trim()) {
      setAlertMessage({
        type: "error",
        text: "Veuillez remplir tous les champs du profil du Maquis."
      });
      return;
    }
    
    const profile = {
      name: restName.trim(),
      location: restLocation.trim(),
      phone: restPhone.trim()
    };
    
    setRestaurantProfile(profile);
    
    // Add to the list of etablissements so Mode Client can see it live!
    const newEtab = {
      id: "etab_gerant_" + Date.now().toString(),
      name: profile.name,
      category: "Maquis 🇧🇯",
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=60",
      description: `Spécialités culinaires locales d'exception. Retrouvez-nous à ${profile.location}.`
    };
    
    setEtablissements([newEtab, ...etablissements]);
    
    setAlertMessage({
      type: "success",
      text: `Profil de "${profile.name}" créé avec succès ! Étape 2 débloquée. 🎉`
    });
  };

  const handleLogout = () => {
    setSession({ isLoggedIn: false, user: null });
    setAlertMessage(null);
    setName("");
    setPhone("");
    setPassword("");
    setRestaurantProfile(null);
    setRestName("");
    setRestLocation("");
    setRestPhone("");
  };

  // Dynamically resolve Tailwind colors for active states matching parent selection
  const activeColorClass = customization.themeColor;
  const activeHex = customization.themeColorHex;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Smartphone Outer Container */}
      <div className="relative w-[345px] h-[640px] rounded-[52px] border-[12px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden ring-4 ring-slate-800/50">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[26px] bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full mr-2.5" />
          <div className="w-10 h-1 bg-slate-950 rounded-full" />
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-[4.5px] bg-slate-400 rounded-full z-50 pointer-events-none" />

        {/* Phone UI Area with beautiful Frosted Glass / Benin Flag Mesh style */}
        <div className="absolute inset-0 bg-[#004d31] flex flex-col font-sans select-none overflow-hidden text-white">
          
          {/* Internal phone glass background mesh */}
          <div className="absolute top-[-10%] left-[-10%] w-[180px] h-[180px] bg-[#fcd116] rounded-full blur-[40px] opacity-15 pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#e8112d] rounded-full blur-[50px] opacity-15 pointer-events-none z-0" />

          {/* Virtual Top Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-bold text-white z-40 bg-[#004d31]/80 backdrop-blur-sm sticky top-0 border-b border-white/10">
            <span>{currentTime || "12:30"}</span>
            <div className="flex items-center space-x-1.5">
              <Signal size={12} className="text-white" />
              <span className="font-bold">4G+</span>
              <Wifi size={12} className="text-white" />
              <Battery size={14} className="text-white" />
            </div>
          </div>

          {/* Alert Toast Notification */}
          {alertMessage && (
            <div className={`mx-4 mt-2 p-3 rounded-2xl flex items-start space-x-2.5 text-xs shadow-xl border animate-fade-in z-50 backdrop-blur-md ${
              alertMessage.type === "success" 
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-200" 
                : "bg-red-500/20 border-red-500/30 text-red-200"
            }`}>
              {alertMessage.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">
                  {alertMessage.type === "success" ? "Notification BéninFood" : "Erreur de saisie"}
                </span>
                <span className="opacity-90">{alertMessage.text}</span>
              </div>
              <button 
                onClick={() => setAlertMessage(null)}
                className="text-white/50 hover:text-white font-bold px-1"
              >
                ×
              </button>
            </div>
          )}

          {/* FLOATING BACKGROUND TESTING INDICATOR */}
          {backgroundTimer !== null && (
            <div className="mx-4 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl p-3 z-45 border border-[#fcd116]/40 shadow-2xl animate-pulse text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider flex items-center text-[#fcd116]">
                  <BellRing size={11} className="mr-1 animate-bounce" /> Test FCM en Arrière-plan
                </span>
                <span className="text-[10px] font-mono font-black bg-black/30 px-1.5 py-0.5 rounded">
                  {backgroundTimer}s
                </span>
              </div>
              <p className="text-[7.5px] font-semibold leading-relaxed text-white/90">
                ⚠️ <span className="font-extrabold text-[#fcd116]">MINIMISEZ L'APPLICATION OU CHANGEZ D'ONGLET</span> pour tester ! Le téléphone vibrera, sonnera et enverra une notification Push réelle.
              </p>
            </div>
          )}

          {/* URGENT INCOMING FCM ORDER RINGING SCREEN */}
          {incomingFCMOrder && isRinging && (
            <div className="absolute inset-x-0 bottom-0 top-10 bg-black/95 z-55 flex flex-col justify-between p-5 animate-fade-in text-white border-4 border-amber-500 rounded-3xl">
              {/* Pulsing Alert Header */}
              <div className="text-center space-y-2 mt-4 flex-shrink-0">
                <div className="mx-auto w-14 h-14 bg-amber-500/20 border-2 border-[#fcd116] rounded-full flex items-center justify-center text-[#fcd116] animate-pulse">
                  <BellRing size={28} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black tracking-widest text-[#fcd116] uppercase bg-[#fcd116]/10 px-2.5 py-0.5 rounded-full border border-[#fcd116]/20 animate-pulse">
                    🚨 ALERTE PUSH FCM ENTRANTE
                  </span>
                  <h3 className="text-xs font-black uppercase text-white mt-1">Nouvelle Course Disponible !</h3>
                  <p className="text-[7px] text-white/50">Service de Notification de Secours BéninFood</p>
                </div>
              </div>

              {/* Order Info Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2.5 my-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[7px] font-mono text-white/40 block">N° {incomingFCMOrder.id}</span>
                    <h4 className="text-xs font-black text-[#fcd116] mt-0.5">{incomingFCMOrder.maquisName}</h4>
                  </div>
                  <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                    Gain: 1 500 F
                  </span>
                </div>

                <div className="text-[9px] space-y-1 bg-black/30 p-2 rounded-xl border border-white/5">
                  <p className="font-semibold leading-normal"><span className="text-white/40">Plat:</span> {incomingFCMOrder.items.map((it: any) => `${it.quantity}x ${it.name}`).join(", ")}</p>
                  <p className="font-semibold leading-normal"><span className="text-white/40">Lieu:</span> {incomingFCMOrder.deliveryLandmark}</p>
                </div>

                {/* Vibration & Sound Settings toggle inside the active ringing screen */}
                <div className="flex items-center justify-between pt-1 text-[8px] text-white/60">
                  <span className="font-bold flex items-center">
                    <Smartphone size={9} className="mr-1 text-white/40" /> Retour Haptique & Son
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setFcmSoundEnabled(!fcmSoundEnabled)}
                      className={`p-1 rounded transition ${fcmSoundEnabled ? "text-emerald-400 bg-emerald-500/10" : "text-white/30 bg-white/5"}`}
                      title="Activer/Désactiver le son"
                    >
                      {fcmSoundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFcmVibrationEnabled(!fcmVibrationEnabled)}
                      className={`px-1.5 py-0.5 rounded text-[7px] font-black transition ${fcmVibrationEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}
                      title="Activer/Désactiver la vibration"
                    >
                      VIB
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 mb-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrder({
                      id: incomingFCMOrder.id,
                      items: incomingFCMOrder.items,
                      total: incomingFCMOrder.total,
                      deliveryPhone: incomingFCMOrder.deliveryPhone,
                      deliveryLandmark: incomingFCMOrder.deliveryLandmark,
                      gps: incomingFCMOrder.gps,
                      maquisName: incomingFCMOrder.maquisName,
                      status: "accepted",
                      deliveryFee: incomingFCMOrder.deliveryFee
                    });
                    setIsRinging(false);
                    setIncomingFCMOrder(null);
                    setAlertMessage({
                      type: "success",
                      text: "Course FCM acceptée avec succès ! En route vers le maquis. 🏍️"
                    });
                  }}
                  className="w-full py-2.5 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-1 cursor-pointer animate-pulse"
                >
                  <span>🏍️ ACCEPTER LA COURSE</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRinging(false);
                    setIncomingFCMOrder(null);
                    setAlertMessage({
                      type: "error",
                      text: "Course rejetée. Elle a été réassignée au réseau local BéninFood."
                    });
                  }}
                  className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Refuser / Muter
                </button>
              </div>
            </div>
          )}

          {/* IMMERSIVE CAMERA QR SCANNER OVERLAY */}
          {isScanningQR && activeOrder && (
            <div className="absolute inset-x-0 bottom-0 top-10 bg-slate-950/95 z-50 flex flex-col justify-between p-5 animate-fade-in text-white">
              {/* Scanner Header */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setIsScanningQR(false)} 
                    className="text-xs text-white/60 hover:text-white px-2 py-1 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                  >
                    Annuler
                  </button>
                  <span className="text-[10px] font-black tracking-wider uppercase text-[#fcd116] bg-[#fcd116]/10 px-2.5 py-1 rounded-full border border-[#fcd116]/20 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1.5" />
                    Appareil Photo Actif
                  </span>
                  <div className="w-10 h-6" /> {/* Spacer */}
                </div>
                <h3 className="text-xs font-black uppercase text-white pt-2">📷 Scan du Reçu de Livraison</h3>
                <p className="text-[8px] text-white/50">Alignez le QR code affiché par le livreur Léon</p>
              </div>

              {/* Central Viewfinder Container */}
              <div className="my-auto relative w-48 h-48 mx-auto bg-black/40 border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden">
                {/* Viewfinder Corners */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[#fcd116] rounded-tl-md" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[#fcd116] rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[#fcd116] rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[#fcd116] rounded-br-md" />

                {/* Laser animation line */}
                <div className="absolute inset-x-4 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce" />

                {/* Grid Dots simulation in background */}
                <div className="opacity-15 flex flex-col space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="w-2 h-2 rounded bg-white" />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="absolute text-[9px] font-bold text-white/40 tracking-widest uppercase">
                  Recherche du code...
                </div>
              </div>

              {/* Instructions and Simulation Trigger Button */}
              <div className="space-y-3 pb-4 text-center">
                <p className="text-[8px] text-white/60 leading-normal max-w-[200px] mx-auto">
                  Le QR code du livreur contient l'identifiant crypté de votre commande <span className="font-mono text-[#fcd116] font-extrabold">{activeOrder.id}</span> pour sécuriser la transaction.
                </p>
                <button
                  onClick={() => {
                    // Simulate scan completed successfully
                    setIsScanningQR(false);
                    setShowPaymentModal(true);
                    setMomoPin("");
                    setAlertMessage({
                      type: "success",
                      text: "Code QR détecté ! Chargement du reçu BéninFood Pay... 📱🔔"
                    });
                  }}
                  className="w-full py-2.5 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>⚡ Détecter et Scanner (Simulé)</span>
                </button>
              </div>
            </div>
          )}

          {/* IMMERSIVE MOBILE MONEY PAYMENT MODAL OVERLAY */}
          {showPaymentModal && activeOrder && (
            <div className="absolute inset-x-0 bottom-0 top-10 bg-[#002114] z-50 flex flex-col justify-between p-4 animate-fade-in text-white overflow-y-auto">
              
              {/* Header with secure badge */}
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1.5 bg-[#fcd116]/10 border border-[#fcd116]/20 px-3 py-1 rounded-full mx-auto w-fit text-[8px] font-black text-[#fcd116] uppercase tracking-wider">
                  <Lock size={10} className="text-[#fcd116]" />
                  <span>Paiement Sécurisé BéninFood Pay</span>
                </div>
                <h3 className="text-[11px] font-black uppercase text-white mt-2">Reçu de livraison numérique</h3>
                <p className="text-[8px] text-white/50">ID Commande : <span className="font-mono">{activeOrder.id}</span></p>
              </div>

              {isPaymentProcessing ? (
                /* Payment Processing Loader Screen */
                <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-4 animate-fade-in">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-[#fcd116] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-xs">
                      {selectedOperator === "mtn" ? "🇧🇯" : "🇧🇯"}
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="text-xs font-black text-white">
                      {selectedOperator === "mtn" ? "Autorisation MTN MoMo..." : "Autorisation Moov Flooz..."}
                    </h4>
                    <p className="text-[8px] text-white/50">Traitement de la requête en cours avec le serveur national...</p>
                  </div>
                </div>
              ) : (
                /* Core interactive receipt and pin-pad entry */
                <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3 pt-3">
                  
                  {/* Detailed receipt card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-2 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[9px] font-black text-[#fcd116] uppercase">Établissement</span>
                      <span className="text-[9.5px] font-bold text-white">{activeOrder.maquisName}</span>
                    </div>

                    <div className="space-y-1 max-h-[50px] overflow-y-auto scrollbar-none">
                      {activeOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[8.5px] text-white/80 font-semibold">
                          <span>{it.quantity}x {it.name}</span>
                          <span>{(it.price * it.quantity).toLocaleString()} F</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1.5 border-t border-white/5 space-y-1">
                      <div className="flex justify-between text-[8px] text-white/40 font-bold uppercase">
                        <span>Sous-total plats</span>
                        <span>{(activeOrder.total - 1000).toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between text-[8px] text-white/40 font-bold uppercase">
                        <span>Frais livraison (Livreur)</span>
                        <span className="text-emerald-400 font-black">+1 000 F</span>
                      </div>
                      <div className="flex justify-between items-center text-[10.5px] font-black text-white pt-1 border-t border-white/5">
                        <span className="text-[#fcd116]">NET À PAYER :</span>
                        <span className="text-[#fcd116]">{activeOrder.total.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Operator Choice buttons */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-white/40 uppercase block text-left">Sélectionnez votre réseau Mobile Money :</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOperator("mtn")}
                        className={`p-2 rounded-xl border flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                          selectedOperator === "mtn"
                            ? "bg-[#ffcc00] text-slate-900 border-[#ffcc00] shadow"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-[11px]">🟡</span>
                        <span className="text-[9px] font-black">MTN MoMo</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedOperator("moov")}
                        className={`p-2 rounded-xl border flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                          selectedOperator === "moov"
                            ? "bg-blue-600 text-white border-blue-600 shadow"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-[11px]">🔵</span>
                        <span className="text-[9px] font-black">Moov Flooz</span>
                      </button>
                    </div>
                  </div>

                  {/* PIN Display Indicators */}
                  <div className="space-y-1 text-center py-1">
                    <span className="text-[8px] font-bold text-white/40 uppercase block">Saisissez votre code PIN secret :</span>
                    <div className="flex justify-center space-x-3.5 py-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <div 
                          key={idx} 
                          className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                            idx < momoPin.length 
                              ? selectedOperator === "mtn" ? "bg-[#ffcc00] border-[#ffcc00] scale-110" : "bg-blue-500 border-blue-500 scale-110"
                              : "border-white/30 bg-transparent"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Visual simulated Numeric Keypad (3x4) */}
                  <div className="max-w-[180px] mx-auto w-full grid grid-cols-3 gap-1.5 bg-black/20 p-2 rounded-2xl border border-white/5">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          if (momoPin.length < 4) {
                            setMomoPin(prev => prev + num);
                          }
                        }}
                        className="py-1 text-xs font-bold bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 transition cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMomoPin("");
                      }}
                      className="py-1 text-[8px] font-black bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg active:scale-95 transition cursor-pointer"
                    >
                      Vider
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (momoPin.length < 4) {
                          setMomoPin(prev => prev + "0");
                        }
                      }}
                      className="py-1 text-xs font-bold bg-white/5 hover:bg-white/10 rounded-lg active:scale-95 transition cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMomoPin(prev => prev.slice(0, -1));
                      }}
                      className="py-1 text-[8px] font-black bg-white/10 hover:bg-white/15 text-white/70 rounded-lg active:scale-95 transition cursor-pointer"
                    >
                      Effacer
                    </button>
                  </div>

                  {/* Submission and Close buttons */}
                  <div className="grid grid-cols-5 gap-2 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="col-span-2 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 rounded-xl text-[9px] font-bold cursor-pointer transition"
                    >
                      Fermer
                    </button>
                    
                    <button
                      type="button"
                      disabled={momoPin.length !== 4}
                      onClick={() => {
                        setIsPaymentProcessing(true);
                        setTimeout(() => {
                          setIsPaymentProcessing(false);
                          setShowPaymentModal(false);
                          setActiveOrder({ ...activeOrder, status: "delivered" });
                          setAlertMessage({
                            type: "success",
                            text: `Paiement de ${activeOrder.total} F validé par ${selectedOperator === "mtn" ? "MTN MoMo" : "Moov Flooz"} ! Commande confirmée livrée. 🎉🇧🇯`
                          });
                        }, 1800);
                      }}
                      className={`col-span-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer ${
                        momoPin.length === 4
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                      }`}
                    >
                      <Check size={11} />
                      <span>Confirmer ({activeOrder.total} F)</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* IF LOGGED IN (SUCCESS FLOW SIMULATION) */}
          {session.isLoggedIn ? (
            session.user?.role === "Livreur" ? (
              /* LIVREUR DASHBOARD */
              <div className="flex-1 p-5 flex flex-col justify-between animate-fade-in bg-[#004d31]/40 z-10 text-white">
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                  {/* Livreur Header */}
                  <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-2xl flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#fcd116] text-[#004d31] font-black flex items-center justify-center border-2 border-white/15 text-xs shadow-md">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "L"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#fcd116] font-bold uppercase tracking-wider">Livreur en service 🏍️</p>
                      <h3 className="text-xs font-black text-white truncate">{session.user?.name}</h3>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-red-300 transition"
                      title="Se déconnecter"
                    >
                      <LogOut size={12} />
                    </button>
                  </div>

                  {/* Benin Internet Flakiness Simulator & Offline Status Widget */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-1.5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-widest flex items-center">
                        <Signal size={10} className="mr-1 text-[#fcd116]" /> Réseau Bénin (3G/4G)
                      </span>
                      <button
                        onClick={() => {
                          const nextState = !isOffline;
                          setIsOffline(nextState);
                          setAlertMessage({
                            type: nextState ? "error" : "success",
                            text: nextState 
                              ? "Connexion perdue. Cache local IndexedDB / Mode Secours activé ! 📶❌" 
                              : "Réseau rétabli avec succès ! Synchronisation en cours... 📶💚"
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          isOffline 
                            ? "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30" 
                            : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {isOffline ? "Connexion Rétablir" : "Simuler Panne Réseau"}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 bg-black/25 p-2 rounded-xl border border-white/5">
                      <div className="p-1 rounded-lg bg-white/5">
                        {isOffline ? (
                          <WifiOff size={14} className="text-red-400 animate-pulse" />
                        ) : (
                          <Wifi size={14} className="text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-white">
                            {isOffline ? "Hors-Ligne (Mode Secours)" : "En Ligne (Réseau MTN/Moov)"}
                          </span>
                          <span className="text-[7.5px] font-mono text-[#fcd116] flex items-center">
                            <Database size={8} className="mr-0.5" /> Cache: {Object.keys(offlineCache).length} CMDs
                          </span>
                        </div>
                        <p className="text-[7.5px] text-white/50 font-medium leading-tight">
                          {isOffline 
                            ? "Les adresses & itinéraires de livraison sont servis depuis le cache local." 
                            : "Données synchronisées en temps réel avec le serveur central BéninFood."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BÉNINFOOD FCM ALERTS CONFIGURATION CENTER */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-2 flex-shrink-0">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-widest flex items-center">
                        <BellRing size={10} className="mr-1 animate-pulse" /> Service d'Alertes Push FCM
                      </span>
                      <span className="text-[7px] text-[#fcd116] font-bold bg-[#fcd116]/10 px-1.5 py-0.5 rounded border border-[#fcd116]/10">
                        Vibrations & Son
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Left side: Permission status & Enable button */}
                      <div className="space-y-1 bg-black/20 p-1.5 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span className="text-[7.5px] text-white/50 font-bold block uppercase">Statut Navigateur :</span>
                        
                        <div className="my-1.5 text-center">
                          {fcmPermission === "granted" ? (
                            <span className="text-[8.5px] font-black text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10 inline-block">
                              🔔 Push Activé
                            </span>
                          ) : fcmPermission === "denied" ? (
                            <span className="text-[8.5px] font-black text-red-300 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/10 inline-block">
                              🚫 Push Bloqué
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleRequestFcmPermission}
                              className="w-full py-1 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] font-black text-[8px] rounded-lg tracking-wider uppercase cursor-pointer"
                            >
                              🔑 Autoriser Push
                            </button>
                          )}
                        </div>
                        <p className="text-[6.5px] text-white/40 leading-tight">
                          Recommandé pour ne rater aucune commande BéninFood.
                        </p>
                      </div>

                      {/* Right side: Audio and Haptics options */}
                      <div className="space-y-1 bg-black/20 p-1.5 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span className="text-[7.5px] text-white/50 font-bold block uppercase">Options Alerte :</span>
                        
                        <div className="space-y-1.5 my-1">
                          <label className="flex items-center space-x-1.5 text-[8px] font-semibold text-white/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fcmSoundEnabled}
                              onChange={(e) => setFcmSoundEnabled(e.target.checked)}
                              className="rounded border-white/10 text-[#fcd116] focus:ring-0 bg-transparent w-2.5 h-2.5"
                            />
                            <span>Chime Sonore</span>
                          </label>
                          <label className="flex items-center space-x-1.5 text-[8px] font-semibold text-white/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fcmVibrationEnabled}
                              onChange={(e) => setFcmVibrationEnabled(e.target.checked)}
                              className="rounded border-white/10 text-[#fcd116] focus:ring-0 bg-transparent w-2.5 h-2.5"
                            />
                            <span>Vibrations</span>
                          </label>
                        </div>
                        <p className="text-[6.5px] text-[#fcd116]/60 leading-tight">
                          Sonne même en arrière-plan.
                        </p>
                      </div>
                    </div>

                    {/* Simulation countdown trigger button */}
                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundTimer(5);
                        setAlertMessage({
                          type: "success",
                          text: "Simulation planifiée ! Réduisez vite l'onglet pour tester."
                        });
                      }}
                      disabled={backgroundTimer !== null}
                      className="w-full py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-[8px] rounded-xl tracking-wider uppercase flex items-center justify-center space-x-1 cursor-pointer transition disabled:opacity-50"
                    >
                      <BellRing size={10} className="text-[#fcd116]" />
                      <span>Simuler Push en Arrière-plan (5s)</span>
                    </button>
                  </div>

                  {(!activeOrder || activeOrder.status === "pending") ? (
                    /* ÉCRAN 1 : TABLEAU DE BORD (Commandes Disponibles) */
                    <div className="flex-1 flex flex-col min-h-0 space-y-3.5 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-[#fcd116] tracking-wider">
                          Courses Disponibles ({3 + (activeOrder ? 1 : 0)})
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-red-500" : "bg-emerald-400 animate-pulse"}`} />
                      </div>

                      {isOffline && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 space-y-1 text-red-300">
                          <p className="text-[9px] font-black flex items-center">
                            <WifiOff size={10} className="mr-1" /> Mode Hors-Réseau Actif
                          </p>
                          <p className="text-[8px] font-medium leading-relaxed">
                            Vous pouvez toujours accepter et consulter vos courses. Les adresses, coordonnées GPS et contacts de livraison sont chargés depuis le cache local sécurisé de secours.
                          </p>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 scrollbar-none">
                        {/* Live active order from client if available */}
                        {activeOrder && activeOrder.status === "pending" && (
                          <div className="bg-gradient-to-r from-amber-500/10 to-[#fcd116]/10 border-2 border-[#fcd116] rounded-2xl p-3 shadow-lg relative overflow-hidden animate-pulse">
                            <div className="absolute top-1.5 right-1.5 bg-[#fcd116] text-[#004d31] text-[6px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Live Client 🚀
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-[7.5px] font-mono font-bold text-white/40 block">N° {activeOrder.id}</span>
                                <h4 className="text-xs font-black text-white flex items-center mt-0.5">
                                  <Utensils size={11} className="mr-1 text-[#fcd116]" /> {activeOrder.maquisName}
                                </h4>
                              </div>

                              <div className="text-[9px] font-semibold text-white/80 space-y-0.5">
                                <p><span className="text-white/40">Plat:</span> {activeOrder.items.map(it => `${it.quantity}x ${it.name}`).join(", ")}</p>
                                <p><span className="text-white/40">Lieu:</span> {activeOrder.deliveryLandmark}</p>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                                <div>
                                  <span className="text-[7px] text-white/40 block uppercase font-bold">Gains Course</span>
                                  <span className="text-xs font-black text-[#fcd116]">1 500 FCFA</span>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    setActiveOrder({
                                      ...activeOrder,
                                      status: "accepted",
                                      deliveryFee: 1500
                                    });
                                    setAlertMessage({
                                      type: "success",
                                      text: "Course client acceptée ! En route vers le maquis. 🏍️"
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-[#fcd116] hover:bg-amber-400 text-[#004d31] rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>Accepter 🏍️</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Preset/simulated mock orders */}
                        {DRIVER_MOCK_DELIVERIES.map((mock, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/10 hover:border-white/25 rounded-2xl p-3 transition-all space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[7.5px] font-mono font-bold text-white/40">N° {mock.id}</span>
                                <h4 className="text-xs font-black text-white flex items-center mt-0.5">
                                  <Utensils size={11} className="mr-1 text-[#fcd116]" /> {mock.maquisName}
                                </h4>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className="text-[8px] font-black bg-[#004d31] border border-white/10 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {mock.destination}
                                </span>
                                {offlineCache[mock.id] && (
                                  <span className="text-[6.5px] font-bold text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded flex items-center border border-emerald-500/20">
                                    <Database size={7} className="mr-0.5 text-emerald-400" /> Cache OK
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-[9px] font-semibold text-white/70 space-y-0.5">
                              <p><span className="text-white/40">Plat:</span> {mock.items[0].name}</p>
                              <p className="truncate"><span className="text-white/40">Lieu:</span> {mock.deliveryLandmark}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <div>
                                <span className="text-[7px] text-white/40 block uppercase font-bold">Gains Course</span>
                                <span className="text-xs font-black text-[#fcd116]">{mock.deliveryFee.toLocaleString()} FCFA</span>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setActiveOrder({
                                    id: mock.id,
                                    items: mock.items,
                                    total: mock.total,
                                    deliveryPhone: mock.deliveryPhone,
                                    deliveryLandmark: mock.deliveryLandmark,
                                    gps: mock.gps,
                                    maquisName: mock.maquisName,
                                    status: "accepted",
                                    deliveryFee: mock.deliveryFee
                                  });
                                  setAlertMessage({
                                    type: "success",
                                    text: `Course ${mock.id} acceptée ! En route vers le maquis. 🏍️`
                                  });
                                }}
                                className="px-3 py-1.5 bg-[#fcd116] hover:bg-amber-400 text-[#004d31] rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Accepter 🏍️</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-black/15 border border-white/5 p-2.5 rounded-2xl text-center text-[8px] text-white/40 font-bold">
                        BéninFood • Réseau de Livreurs Béninois
                      </div>
                    </div>
                  ) : activeOrder.status === "accepted" ? (
                    /* ÉCRAN 2 : COLLECTE AU MAQUIS (Scan QR Code) */
                    <div className="flex-1 flex flex-col min-h-0 justify-between space-y-3 animate-fade-in">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-none">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[8.5px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            Étape 1/3 : Retrait Maquis
                          </span>
                          <span className="text-[9px] font-mono font-bold text-white/40">{activeOrder.id}</span>
                        </div>

                        {isOffline && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start space-x-2">
                            <WifiOff size={14} className="text-amber-400 mt-0.5 flex-shrink-0 animate-pulse" />
                            <div>
                              <p className="text-[9.5px] font-black text-amber-300">Mode Secours local actif 📶💾</p>
                              <p className="text-[8.5px] font-semibold text-white/70 leading-normal">
                                Pas d'Internet. L'adresse de ce Maquis et le détail des plats sont chargés depuis le cache local (IndexedDB de secours).
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Maquis Info Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-white/40 uppercase">Maquis d'origine</span>
                            <h3 className="text-sm font-black text-[#fcd116]">{activeOrder.maquisName}</h3>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] text-white/80">
                            <div className="flex items-center">
                              <span className="text-white/40 w-16">Téléphone :</span>
                              <span className="font-bold text-white flex items-center">
                                <Phone size={10} className="mr-1 text-emerald-400" /> +229 97 45 82 10
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-white/40 w-16 flex-shrink-0">Itinéraire :</span>
                              <span className="font-semibold text-white">
                                {activeOrder.maquisName.includes("Maman Bénin") 
                                  ? "Zogbadjè, deuxième rue après l'antenne MTN, portail vert."
                                  : activeOrder.maquisName.includes("Tantie") 
                                  ? "Fidjrossè, pavé de l'église St Jean, portail noir à gauche."
                                  : "Abomey-Calavi, en face de l'entrée principale de l'Université."
                                }
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[8px] font-bold text-white/40 uppercase block mb-1">Plats à récupérer</span>
                            <div className="p-2.5 bg-black/20 rounded-xl">
                              <p className="text-[10px] font-black text-white">
                                {activeOrder.items.map(it => `${it.quantity}x ${it.name}`).join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Instructions warning */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-amber-300 flex items-center">
                            <AlertCircle size={10} className="mr-1" /> Consignes de retrait :
                          </span>
                          <p className="text-[9px] text-white/70 leading-relaxed font-semibold">
                            Rendez-vous au comptoir de l'établissement, puis simulez le scan du QR Code de retrait de l'établissement pour charger la commande sur votre moto et démarrer.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveOrder({ ...activeOrder, status: "scanned" });
                          setAlertMessage({
                            type: "success",
                            text: "Plat collecté avec succès ! Itinéraire client débloqué. 🏁"
                          });
                        }}
                        className="w-full py-3 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>📷 Scanner le QR Code du Maquis</span>
                      </button>
                    </div>
                  ) : activeOrder.status === "scanned" ? (
                    /* ÉCRAN 3 : EN ROUTE VERS LE CLIENT (Livraison en cours) */
                    <div className="flex-1 flex flex-col min-h-0 justify-between space-y-3 animate-fade-in">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-none">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[8.5px] font-black text-[#fcd116] bg-[#fcd116]/10 border border-[#fcd116]/20 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                            Étape 2/3 : En Route
                          </span>
                          <span className="text-[9px] font-mono font-bold text-white/40">{activeOrder.id}</span>
                        </div>

                        {isOffline && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-start space-x-2">
                            <WifiOff size={14} className="text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
                            <div>
                              <p className="text-[9.5px] font-black text-red-300">Itinéraire hors-ligne de secours 📶🔒</p>
                              <p className="text-[8.5px] font-semibold text-white/70 leading-normal">
                                Connexion perdue. Les coordonnées GPS du client et les indications de livraison d'Abomey-Calavi / Cotonou restent accessibles grâce au cache IndexedDB sécurisé de l'appareil.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Client Info Card */}
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[8px] font-bold text-white/40 uppercase block">Destinataire (Client)</span>
                              <span className="text-xs font-black text-white">+229 {activeOrder.deliveryPhone}</span>
                            </div>
                            
                            <button
                              onClick={() => {
                                if (isOffline) {
                                  setAlertMessage({
                                    type: "success",
                                    text: "Lancement de l'appel téléphonique GSM direct (Réseau de secours voix actif sans internet) 📞"
                                  });
                                } else {
                                  setIsCallingClient(true);
                                }
                              }}
                              className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                              title="Appeler le client"
                            >
                              <Phone size={13} className="fill-white" />
                            </button>
                          </div>

                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[8px] font-bold text-white/40 uppercase block">Indications de livraison</span>
                            <p className="text-[10px] font-semibold text-amber-200 leading-normal mt-0.5">
                              {activeOrder.deliveryLandmark}
                            </p>
                          </div>
                        </div>

                        {/* GPS Itinerary Map */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-bold text-white/40 uppercase block">Carte GPS en temps réel</span>
                          <div className="relative h-[125px] w-full bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                            {/* SVG Simulated Map of Cotonou */}
                            <svg className="w-full h-full" viewBox="0 0 200 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Grid representation */}
                              <path d="M0 20 H200 M0 50 H200 M0 80 H200 M0 110 H200 M40 0 V125 M90 0 V125 M140 0 V125" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                              <path d="M20 0 L180 125 M180 0 L20 125" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                              
                              {/* Ocean side for Cotonou vibes */}
                              <rect x="0" y="110" width="200" height="15" fill="#fcd116" fillOpacity="0.08" />
                              <text x="5" y="120" fill="#fcd116" fillOpacity="0.35" fontSize="5" fontFamily="monospace" fontWeight="bold">OCEAN ATLANTIQUE (FIDJROSSE)</text>
                              
                              {/* Path route */}
                              <path d="M50 40 L100 40 L100 75 L150 75" stroke="#fcd116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" className="animate-pulse" />
                              
                              {/* Point A (Maquis) */}
                              <circle cx="50" cy="40" r="4.5" fill="#004d31" stroke="#fcd116" strokeWidth="1" />
                              <text x="35" y="32" fill="white" fontSize="6.5" fontWeight="black" fontFamily="sans-serif">Maquis 🏢</text>
                              
                              {/* Point B (Client) */}
                              <circle cx="150" cy="75" r="5" fill="#e8112d" stroke="white" strokeWidth="1.2" />
                              <path d="M150 70 L150 80 M145 75 L155 75" stroke="white" strokeWidth="0.8" />
                              <text x="135" y="66" fill="#fcd116" fontSize="7.5" fontWeight="extrabold" fontFamily="sans-serif">📍 Client</text>
                              
                              {/* Animated Delivery Moto */}
                              <g transform="translate(95, 35)">
                                <circle cx="5" cy="5" r="3.5" fill="#3b82f6" />
                                <text x="4" y="8" fill="white" fontSize="5" fontWeight="bold">🏍️</text>
                              </g>
                            </svg>
                            
                            {isOffline && (
                              <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-2">
                                <Database size={18} className="text-[#fcd116] mb-1 animate-pulse" />
                                <span className="text-[9px] font-black text-white uppercase tracking-wider">Tracé de Secours Hors-ligne</span>
                                <p className="text-[8px] text-white/70 max-w-[170px] font-medium leading-tight">
                                  Itinéraire pré-chargé en cache local avant déconnexion. GPS de secours actif.
                                </p>
                              </div>
                            )}

                            <div className="absolute bottom-1 right-1.5 bg-black/75 px-1.5 py-0.5 rounded border border-white/10 text-[6px] font-mono text-[#fcd116]">
                              GPS: Cotonou Littoral (+/- 2m)
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveOrder({ ...activeOrder, status: "arrived" });
                          setAlertMessage({
                            type: "success",
                            text: isOffline 
                              ? "Arrivé chez le client ! QR de validation disponible en mode local hors-ligne. 📍📱"
                              : "Arrivé à destination ! QR Code généré avec succès. 📍📱"
                          });
                        }}
                        className="w-full py-3 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>📍 Je suis arrivé chez le client {isOffline && "(Hors-ligne)"}</span>
                      </button>
                    </div>
                  ) : activeOrder.status === "arrived" ? (
                    /* ÉCRAN 4 : VALIDATION & REÇU (QR Code d'Arrivée) */
                    <div className="flex-1 flex flex-col min-h-0 justify-between space-y-3 animate-fade-in">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-none">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[8.5px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            Étape 3/3 : Finalisation
                          </span>
                          <span className="text-[9px] font-mono font-bold text-white/40">{activeOrder.id}</span>
                        </div>

                        {/* QR Code Container */}
                        <div className="bg-white text-slate-900 rounded-2xl p-4 text-center border-2 border-[#fcd116] space-y-3">
                          <span className="text-[8px] font-black text-[#004d31] uppercase tracking-wider bg-[#fcd116]/20 px-2.5 py-0.5 rounded block mx-auto w-fit">
                            BÉNINFOOD DIGITAL PAY QR
                          </span>
                          
                          <div className="w-28 h-28 bg-white border border-slate-200 mx-auto rounded-xl p-2 flex items-center justify-center shadow-inner relative">
                            {/* Beautiful simulated QR Code vector */}
                            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Position Detectors */}
                              <rect x="2" y="2" width="26" height="26" fill="#004d31" rx="2" />
                              <rect x="7" y="7" width="16" height="16" fill="white" rx="1" />
                              <rect x="11" y="11" width="8" height="8" fill="#fcd116" />

                              <rect x="72" y="2" width="26" height="26" fill="#004d31" rx="2" />
                              <rect x="77" y="7" width="16" height="16" fill="white" rx="1" />
                              <rect x="81" y="11" width="8" height="8" fill="#fcd116" />

                              <rect x="2" y="72" width="26" height="26" fill="#004d31" rx="2" />
                              <rect x="7" y="77" width="16" height="16" fill="white" rx="1" />
                              <rect x="11" y="81" width="8" height="8" fill="#e8112d" />

                              {/* Center Food logo dot */}
                              <rect x="42" y="42" width="16" height="16" fill="#004d31" rx="3" />
                              <circle cx="50" cy="50" r="4.5" fill="#fcd116" />

                              {/* Pseudo-random grid of QR dots */}
                              <rect x="36" y="6" width="6" height="6" fill="#1e293b" />
                              <rect x="48" y="12" width="6" height="6" fill="#004d31" />
                              <rect x="60" y="4" width="6" height="12" fill="#e8112d" />
                              <rect x="42" y="20" width="12" height="6" fill="#1e293b" />
                              
                              <rect x="6" y="36" width="6" height="12" fill="#004d31" />
                              <rect x="18" y="48" width="12" height="6" fill="#1e293b" />
                              <rect x="6" y="60" width="12" height="6" fill="#e8112d" />
                              
                              <rect x="78" y="36" width="12" height="6" fill="#1e293b" />
                              <rect x="84" y="48" width="6" height="12" fill="#004d31" />
                              
                              <rect x="36" y="78" width="6" height="6" fill="#004d31" />
                              <rect x="48" y="84" width="12" height="6" fill="#1e293b" />
                              <rect x="60" y="74" width="6" height="12" fill="#e8112d" />
                              
                              <rect x="36" y="60" width="12" height="6" fill="#1e293b" />
                              <rect x="60" y="60" width="6" height="6" fill="#004d31" />
                            </svg>
                            <div className="absolute left-0 top-0 w-full h-1 bg-emerald-500 shadow-md animate-bounce opacity-50" />
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-900">Montant total : {activeOrder.total.toLocaleString()} FCFA</p>
                            <p className="text-[8px] text-slate-500 font-extrabold leading-tight px-1">
                              Faites scanner ce code par le client pour valider la livraison et recevoir votre paiement sur votre portefeuille.
                            </p>
                          </div>

                          <div className="flex items-center justify-center space-x-1.5 text-emerald-600 animate-pulse text-[8px] font-black uppercase">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>Attente de scan par le client...</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit confirmation bypass button */}
                      <button
                        onClick={() => {
                          setActiveOrder({ ...activeOrder, status: "delivered" });
                          setAlertMessage({
                            type: "success",
                            text: "Livraison validée avec succès ! Gains ajoutés au portefeuille. 🎉"
                          });
                        }}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>💵 Valider la livraison (Simuler Scan)</span>
                      </button>
                    </div>
                  ) : (
                    /* DELIVERED SUCCESS STATE */
                    <div className="flex-1 flex flex-col justify-between text-center animate-fade-in space-y-3">
                      <div className="my-auto space-y-4 py-4">
                        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500 rounded-full mx-auto flex items-center justify-center text-emerald-400">
                          <CheckCircle2 size={32} />
                        </div>
                        
                        <div className="space-y-1 px-3">
                          <h4 className="text-white text-sm font-black uppercase tracking-wide">Course Terminée ! 🏁</h4>
                          <p className="text-[10px] text-white/60 font-semibold leading-relaxed">
                            La commande <span className="font-mono text-[#fcd116] font-bold">{activeOrder.id}</span> de {activeOrder.maquisName} a été livrée à bon port.
                          </p>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-4 rounded-2xl max-w-[210px] mx-auto space-y-0.5">
                          <span className="text-[8px] text-white/50 block uppercase font-bold tracking-wider">Portefeuille Crédité</span>
                          <span className="text-base font-black text-[#fcd116]">+{activeOrder.deliveryFee || 1500} FCFA</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveOrder(null);
                        }}
                        className="w-full py-3 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>Prendre une autre course 🏍️</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CLIENT OR GÉRANT HYBRID FLOW */
              <div className="flex-1 p-5 flex flex-col min-h-0 relative overflow-hidden animate-fade-in bg-[#004d31]/40 z-10 text-white">
                
                {/* 1. DYNAMIC HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#fcd116] text-[#004d31] font-black flex items-center justify-center border-2 border-white/20 text-xs shadow-md">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-[9px] text-[#fcd116] font-bold uppercase tracking-wider">
                        {(session.user?.role === "Gérant" || session.user?.role === "Gérant de Restaurant/Maquis")
                          ? (activeMode === "client" ? "Akwaaba 👋 [Client]" : "Mon Maquis 🏢 [Gérant]")
                          : "Akwaaba 👋"
                        }
                      </p>
                      <h3 className="text-xs font-black text-white leading-tight truncate max-w-[130px]">
                        {session.user?.name || "Utilisateur"}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative cursor-pointer p-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition">
                      <Bell size={14} className="text-[#fcd116]" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#e8112d] rounded-full ring-1 ring-[#004d31]" />
                    </div>
                  </div>
                </div>

                {/* 2. ROLE TOGGLE BUTTON (Visible only for Gérants) */}
                {(session.user?.role === "Gérant" || session.user?.role === "Gérant de Restaurant/Maquis") && (
                  <div className="mb-3 p-1 bg-black/20 rounded-xl border border-white/10 flex items-center">
                    <button
                      onClick={() => setActiveMode("client")}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold transition duration-150 flex items-center justify-center space-x-1 cursor-pointer ${
                        activeMode === "client"
                          ? "bg-[#fcd116] text-[#004d31] shadow"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <ShoppingBag size={10} />
                      <span>Mode Client</span>
                    </button>
                    <button
                      onClick={() => setActiveMode("gerant")}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold transition duration-150 flex items-center justify-center space-x-1 cursor-pointer ${
                        activeMode === "gerant"
                          ? "bg-emerald-500 text-white shadow"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Utensils size={10} />
                      <span>Mode Gérant</span>
                    </button>
                  </div>
                )}

                {/* 3. DYNAMIC CONTENT AREA */}
                {(activeMode === "client" || (session.user?.role !== "Gérant" && session.user?.role !== "Gérant de Restaurant/Maquis")) ? (
                  /* CLIENT CONTENT */
                  isCheckoutOpen ? (
                    /* CLIENT CHECKOUT SCREEN */
                    <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
                      {/* Header in Checkout */}
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2 flex-shrink-0">
                        <button
                          onClick={() => setIsCheckoutOpen(false)}
                          className="text-xs text-[#fcd116] font-extrabold flex items-center space-x-1 hover:underline cursor-pointer"
                        >
                          <span>← Retour</span>
                        </button>
                        <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Détails de Livraison</h4>
                        <div className="w-8 h-1" />
                      </div>

                      {/* Scrollable Container */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 pb-4 scrollbar-none">
                        {/* Order Summary */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                          <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-wider block">Récapitulatif de ma commande</span>
                          <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none">
                            {cart.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-[10px]">
                                <div className="flex items-center space-x-1 text-white/90">
                                  <span className="font-bold text-[#fcd116]">{item.quantity}x</span>
                                  <span className="truncate max-w-[130px]">{item.name}</span>
                                </div>
                                <span className="font-extrabold text-white/70">{item.price * item.quantity} F</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[11px]">
                            <span className="font-black text-white/80">TOTAL</span>
                            <span className="font-black text-[#fcd116] text-xs">
                              {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} FCFA
                            </span>
                          </div>
                        </div>

                        {/* Delivery Form Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-wider block">Coordonnées</span>
                            <span className="text-[7px] text-emerald-300 font-extrabold px-1 bg-emerald-500/10 border border-emerald-500/10 rounded">Bénin</span>
                          </div>

                          {/* Phone Field */}
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-white/50 uppercase block">Téléphone pour la livraison *</label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 focus-within:border-[#fcd116] transition-colors">
                              <Phone size={11} className="text-white/40 mr-1.5" />
                              <span className="text-[10px] text-white/40 font-black mr-1">+229</span>
                              <input
                                type="tel"
                                placeholder="97 00 00 00"
                                value={deliveryPhone}
                                onChange={(e) => setDeliveryPhone(e.target.value)}
                                className="bg-transparent flex-1 text-[10px] text-white font-semibold outline-none"
                              />
                            </div>
                          </div>

                          {/* SECTION : REPERE DE LIVRAISON BENIN & CARTOGRAPHIE DE SECOURS */}
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-wider block flex items-center">
                                <MapPin size={10} className="mr-1 text-[#fcd116]" /> Cartographie Bénin & Point de Repère
                              </span>
                              <span className="text-[6.5px] bg-[#004d31] border border-white/10 text-white font-extrabold px-1.5 py-0.5 rounded">
                                Cotonou / Calavi / P-Novo
                              </span>
                            </div>

                            {/* City Selector Tabs */}
                            <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-xl border border-white/5">
                              {(["Cotonou", "Abomey-Calavi", "Porto-Novo"] as const).map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMapCity(city);
                                    // Set to first landmark position as default pin on map change
                                    const firstLm = BENIN_CITIES[city].landmarks[0];
                                    setCustomMapPin({ x: firstLm.x, y: firstLm.y });
                                    setSharedGPS({ lat: firstLm.lat, lng: firstLm.lng });
                                    // Format landmark description
                                    setDeliveryLandmark(`${city} - ${firstLm.name}`);
                                  }}
                                  className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                    selectedMapCity === city
                                      ? "bg-[#fcd116] text-[#004d31] shadow-md"
                                      : "text-white/60 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {city === "Abomey-Calavi" ? "Calavi" : city === "Porto-Novo" ? "P-Novo" : "Cotonou"}
                                </button>
                              ))}
                            </div>

                            {/* Simulated Interactive Map */}
                            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-inner flex flex-col justify-end">
                              {/* Map Background Grid representing Benin local geography */}
                              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                              
                              {/* Lagoon or ocean water background for realistic look of coastal Benin */}
                              {selectedMapCity === "Cotonou" && (
                                <>
                                  {/* Ocean at the bottom */}
                                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-blue-500/20 border-t border-blue-500/30 flex items-center justify-center pointer-events-none">
                                    <span className="text-[6px] font-bold tracking-widest text-blue-400 uppercase">Océan Atlantique</span>
                                  </div>
                                  {/* Lagoon at the top right */}
                                  <div className="absolute top-4 right-0 w-1/3 h-1/5 bg-blue-500/15 rounded-l-full border-y border-l border-blue-400/20 pointer-events-none flex items-center justify-center">
                                    <span className="text-[5px] font-bold text-blue-400/80 uppercase">Lac Nokoué</span>
                                  </div>
                                  {/* Main paved roads (goudrons) */}
                                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 pointer-events-none" />
                                  <div className="absolute top-1/3 bottom-1/4 left-1/2 w-0.5 bg-white/10 pointer-events-none" />
                                  <div className="absolute top-2/3 bottom-0 left-1/4 w-0.5 bg-white/10 pointer-events-none" />
                                </>
                              )}

                              {selectedMapCity === "Abomey-Calavi" && (
                                <>
                                  {/* Lac Nokoué on the East/Right side */}
                                  <div className="absolute top-0 bottom-0 right-0 w-1/4 bg-blue-500/15 border-l border-blue-500/30 flex items-center justify-center pointer-events-none">
                                    <span className="text-[6px] font-bold tracking-widest text-blue-400 uppercase [writing-mode:vertical-lr] rotate-180">Lac Nokoué</span>
                                  </div>
                                  {/* Inter-state highway (Route Inter-États Cotonou-Niamey) */}
                                  <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-amber-500/10 pointer-events-none flex items-center justify-center">
                                    <span className="text-[5px] font-mono text-amber-500/40 uppercase tracking-widest [writing-mode:vertical-lr]">RNIE 2</span>
                                  </div>
                                  {/* Secondary paved lanes */}
                                  <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/10 pointer-events-none" />
                                  <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/10 pointer-events-none" />
                                </>
                              )}

                              {selectedMapCity === "Porto-Novo" && (
                                <>
                                  {/* Porto-Novo Lagoon at the bottom-left */}
                                  <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-blue-500/20 rounded-tr-full border-t border-r border-blue-500/30 flex items-center justify-center pointer-events-none">
                                    <span className="text-[6px] font-bold tracking-widest text-blue-400 uppercase">Lagune Porto-Novo</span>
                                  </div>
                                  {/* Main streets */}
                                  <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/10 pointer-events-none" />
                                  <div className="absolute top-1/2 left-1/4 right-0 h-0.5 bg-white/10 pointer-events-none" />
                                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/10 pointer-events-none" />
                                </>
                              )}

                              {/* Live map viewport simulator */}
                              <div 
                                className="absolute inset-0 cursor-crosshair"
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                                  
                                  // Calculate mock coordinates based on the click position
                                  const cityData = BENIN_CITIES[selectedMapCity];
                                  const latShift = ((50 - y) * 0.0004);
                                  const lngShift = ((x - 50) * 0.0004);
                                  const newLat = cityData.lat + latShift;
                                  const newLng = cityData.lng + lngShift;

                                  setCustomMapPin({ x, y });
                                  setSharedGPS({ lat: newLat, lng: newLng });
                                  
                                  // Find nearest preset landmark to show proximity
                                  let nearestLandmark = cityData.landmarks[0];
                                  let minDistance = 999999;
                                  cityData.landmarks.forEach(lm => {
                                    const dist = Math.hypot(lm.x - x, lm.y - y);
                                    if (dist < minDistance) {
                                      minDistance = dist;
                                      nearestLandmark = lm;
                                    }
                                  });

                                  const landmarkText = minDistance < 15 
                                    ? `${selectedMapCity} - Près de : ${nearestLandmark.name}`
                                    : `${selectedMapCity} - Repère Personnalisé (Lat: ${newLat.toFixed(4)}, Lng: ${newLng.toFixed(4)})`;

                                  setDeliveryLandmark(landmarkText);
                                  setAlertMessage({
                                    type: "success",
                                    text: `📍 Repère placé avec précision sur la carte de ${selectedMapCity} !`
                                  });
                                }}
                              >
                                {/* Visual Landmarks hotspots circles on map */}
                                {BENIN_CITIES[selectedMapCity].landmarks.map((lm, idx) => (
                                  <div
                                    key={idx}
                                    style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent map general click trigger
                                      setCustomMapPin({ x: lm.x, y: lm.y });
                                      setSharedGPS({ lat: lm.lat, lng: lm.lng });
                                      setDeliveryLandmark(`${selectedMapCity} - ${lm.name}`);
                                      setAlertMessage({
                                        type: "success",
                                        text: `📍 Point de repère sélectionné : ${lm.name}`
                                      });
                                    }}
                                  >
                                    {/* Animated hotspot ping */}
                                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75 animate-ping -left-1 -top-1" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white/50 cursor-pointer shadow-md transition-all group-hover:scale-125" />
                                    
                                    {/* Landmark label tooltip on hover/map representation */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/90 border border-white/20 text-[6.5px] text-white px-1.5 py-0.5 rounded-md whitespace-nowrap opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                                      {lm.name.split(" (")[0]}
                                    </div>
                                  </div>
                                ))}

                                {/* Selected Custom Delivery Marker Pin */}
                                {customMapPin && (
                                  <div
                                    style={{ left: `${customMapPin.x}%`, top: `${customMapPin.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-[90%] pointer-events-none transition-all duration-300 ease-out"
                                  >
                                    {/* Custom Pin Icon (MapPin style) */}
                                    <div className="flex flex-col items-center">
                                      <div className="bg-red-500 border border-white text-white p-1 rounded-full shadow-lg relative animate-bounce">
                                        <MapPin size={12} className="fill-white text-red-500" />
                                      </div>
                                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full blur-[1px] -mt-0.5" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Small map overlay info bar */}
                              <div className="bg-black/85 backdrop-blur-[2px] border-t border-white/10 px-2 py-1.5 z-10 flex items-center justify-between text-[7.5px] text-white/70">
                                <span className="flex items-center text-white/90">
                                  <Map size={9} className="mr-1 text-[#fcd116]" /> {selectedMapCity} (Zone de service active)
                                </span>
                                <span className="font-mono text-[7px] text-[#fcd116]">
                                  {sharedGPS ? `${sharedGPS.lat.toFixed(5)}, ${sharedGPS.lng.toFixed(5)}` : "Cliquez sur la carte"}
                                </span>
                              </div>
                            </div>

                            {/* Guide / Instruction alert */}
                            <div className="bg-[#fcd116]/5 border border-[#fcd116]/20 rounded-xl p-2.5 space-y-1">
                              <p className="text-[8px] font-black text-[#fcd116] flex items-center uppercase tracking-wide">
                                💡 Astuce de repérage BéninFood
                              </p>
                              <p className="text-[7.5px] text-white/80 font-medium leading-relaxed">
                                Le système d'adresses au Bénin s'appuie sur des points d'intérêt marquants. <span className="text-[#fcd116] font-bold">Touchez un point jaune</span> sur la carte ou <span className="text-[#fcd116] font-bold">cliquez n'importe où</span> pour déposer votre pin de livraison précis.
                              </p>
                            </div>

                            {/* Quick select presets list */}
                            <div className="space-y-1.5">
                              <label className="text-[7.5px] font-black text-white/40 uppercase block tracking-wider">
                                Points de repère populaires ({selectedMapCity}) :
                              </label>
                              <div className="max-h-24 overflow-y-auto space-y-1 pr-0.5 scrollbar-none">
                                {BENIN_CITIES[selectedMapCity].landmarks.map((lm, idx) => {
                                  const isSelected = customMapPin?.x === lm.x && customMapPin?.y === lm.y;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setCustomMapPin({ x: lm.x, y: lm.y });
                                        setSharedGPS({ lat: lm.lat, lng: lm.lng });
                                        setDeliveryLandmark(`${selectedMapCity} - ${lm.name}`);
                                        setAlertMessage({
                                          type: "success",
                                          text: `📍 Repère fixé : ${lm.name}`
                                        });
                                      }}
                                      className={`w-full text-left p-1.5 rounded-lg border text-[8px] font-semibold transition-all flex items-start justify-between cursor-pointer ${
                                        isSelected
                                          ? "bg-[#fcd116]/15 border-[#fcd116] text-[#fcd116]"
                                          : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10"
                                      }`}
                                    >
                                      <span className="flex-1 min-w-0 pr-1.5 leading-tight truncate">
                                        📌 {lm.name}
                                      </span>
                                      <span className="text-[6.5px] font-mono text-white/30 whitespace-nowrap self-center">
                                        Sélectionner
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Landmark description field */}
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-white/50 uppercase block">Point de repère descriptif obligatoire *</label>
                            <textarea
                              placeholder="Indiquez des repères visuels cruciaux (ex: À côté de la pharmacie, portail vert, derrière le pavé, immeuble R+1 en carreaux bleus)."
                              value={deliveryLandmark}
                              onChange={(e) => setDeliveryLandmark(e.target.value)}
                              rows={2.5}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] text-white font-semibold placeholder-white/20 focus:outline-none focus:border-[#fcd116] transition-all leading-normal"
                            />
                          </div>
                        </div>

                        {/* Local errors display */}
                        {errors.delivery && (
                          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] text-red-400 font-extrabold flex items-center space-x-1">
                            <AlertCircle size={11} />
                            <span>{errors.delivery}</span>
                          </div>
                        )}
                      </div>

                      {/* Order Confirmation button (Sticky / Fixed at the bottom of the checkout view) */}
                      <div className="pt-2 pb-1 bg-gradient-to-t from-[#002b1b] to-transparent flex-shrink-0 z-30">
                        <button
                          type="button"
                          onClick={handleConfirmOrder}
                          className="w-full py-2.5 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] font-black rounded-xl text-[10px] uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Check size={12} />
                          <span>Confirmer et Commander</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* CLIENT DASHBOARD SCREEN */
                    <div className="flex-1 flex flex-col min-h-0 relative">
                      {/* Main Scrollable Dashboard Area */}
                      <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 pb-20 scrollbar-none">
                        {/* Ongoing Order Tracking Card */}
                        {activeOrder && (
                        <div className="mb-3 bg-gradient-to-r from-[#004d31] to-[#002b1b] border border-[#fcd116]/40 p-3 rounded-2xl shadow-md text-left animate-fade-in relative overflow-hidden">
                          {/* Ambient background glow */}
                          <div className="absolute top-0 right-0 w-12 h-12 bg-[#fcd116]/10 rounded-full blur-lg pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                              <span className="text-[7.5px] font-black text-[#fcd116] uppercase tracking-wider block">Suivi de commande • {activeOrder.id}</span>
                              <h4 className="text-[9.5px] font-black text-white mt-0.5 truncate">
                                {activeOrder.status === "pending" && "⏳ En attente du livreur..."}
                                {activeOrder.status === "accepted" && "🛵 Collecte en cours au Maquis..."}
                                {activeOrder.status === "scanned" && "🏍️ Atassi chaud en route !"}
                                {activeOrder.status === "arrived" && "📍 Léon est arrivé ! Prêt pour le paiement"}
                                {activeOrder.status === "delivered" && "✅ Commande livrée ! Bon appétit !"}
                              </h4>
                              <p className="text-[8px] text-white/60 mt-1 font-semibold truncate">
                                {activeOrder.items.length} plat(s) • {activeOrder.total} F • {activeOrder.maquisName}
                              </p>
                            </div>
                            <span className="text-[12px] animate-bounce flex-shrink-0">
                              {activeOrder.status === "pending" && "👨‍🍳"}
                              {activeOrder.status === "accepted" && "🛵"}
                              {activeOrder.status === "scanned" && "🏍️"}
                              {activeOrder.status === "arrived" && "📱"}
                              {activeOrder.status === "delivered" && "🎉"}
                            </span>
                          </div>
                          
                          {/* Live Progress Bar */}
                          <div className="mt-2.5 h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 flex">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                activeOrder.status === "pending" ? "w-1/5 bg-amber-400" :
                                activeOrder.status === "accepted" ? "w-2/5 bg-amber-400 animate-pulse" :
                                activeOrder.status === "scanned" ? "w-2/3 bg-[#fcd116]" :
                                activeOrder.status === "arrived" ? "w-[90%] bg-amber-400 animate-pulse" :
                                "w-full bg-emerald-500"
                              }`} 
                            />
                          </div>

                          {/* Scan Trigger Button when Arrived */}
                          {activeOrder.status === "arrived" && (
                            <button
                              onClick={() => {
                                setIsScanningQR(true);
                                setMomoPin("");
                                setSelectedOperator("mtn");
                              }}
                              className="mt-3 w-full py-2 bg-gradient-to-r from-[#fcd116] to-amber-400 text-[#004d31] rounded-xl text-[8.5px] font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer animate-pulse"
                            >
                              <span>📷 Scanner le QR du Livreur (Payer & Recevoir)</span>
                            </button>
                          )}

                          {activeOrder.status === "delivered" && (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-3 text-left">
                              {/* Étoiles d'évaluation */}
                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-white/40 uppercase block">Notez votre expérience :</span>
                                <div className="flex items-center space-x-1.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setClientRating(star)}
                                      className="transition-transform duration-100 active:scale-125 focus:outline-none cursor-pointer"
                                    >
                                      <span className={`text-[16px] leading-none ${star <= clientRating ? "text-[#fcd116]" : "text-white/20"}`}>
                                        ★
                                      </span>
                                    </button>
                                  ))}
                                  {clientRating > 0 && (
                                    <span className="text-[7px] font-extrabold text-[#fcd116] ml-1 bg-[#fcd116]/10 px-1.5 py-0.5 rounded">
                                      {clientRating === 5 ? "Excellent ! 😍" : clientRating >= 4 ? "Très bon ! 🙂" : "Passable 😐"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Choix du Pourboire */}
                              <div className="space-y-1.5">
                                <span className="text-[8px] font-black text-white/40 uppercase block">Laisser un pourboire au livreur (FCFA) :</span>
                                <div className="grid grid-cols-4 gap-1">
                                  {[200, 500, 1000].map((amount) => (
                                    <button
                                      key={amount}
                                      onClick={() => {
                                        setClientTip(amount);
                                        setIsTipBlessed(true);
                                        setAlertMessage({
                                          type: "success",
                                          text: `Pourboire de ${amount} F ajouté ! Léon vous dit MERCI ! 🙏`
                                        });
                                      }}
                                      className={`py-1 text-[8px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        clientTip === amount
                                          ? "bg-[#fcd116] text-[#004d31] border-[#fcd116]"
                                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                      }`}
                                    >
                                      +{amount} F
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => {
                                      setClientTip(null);
                                      setIsTipBlessed(false);
                                    }}
                                    className={`py-1 text-[8px] font-bold rounded-lg border transition-all cursor-pointer ${
                                      clientTip === null
                                        ? "bg-white/10 text-white/40 border-white/5"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                                    }`}
                                  >
                                    Aucun
                                  </button>
                                </div>

                                {isTipBlessed && clientTip && (
                                  <p className="text-[8px] text-[#fcd116] font-semibold italic animate-fade-in leading-snug mt-1">
                                    "Merci beaucoup, patron ! Que Dieu vous bénisse et fructifie vos activités ! 🙏✨"
                                  </p>
                                )}
                              </div>

                              {/* Bouton Final */}
                              <button
                                onClick={() => {
                                  setActiveOrder(null);
                                  setCart([]); // clear cart
                                  setClientRating(0); // reset rating
                                  setClientTip(null); // reset tip
                                  setIsTipBlessed(false); // reset blessing
                                  setAlertMessage({
                                    type: "success",
                                    text: "Réception validée. Votre panier a été vidé. À très bientôt sur BéninFood ! 🍲"
                                  });
                                }}
                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer mt-1"
                              >
                                <span>Confirmer la Réception & Vider le Panier</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Belle barre de recherche */}
                      <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Chercher un plat, un maquis..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="w-full pl-8.5 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] focus:bg-white/10 transition-all font-semibold shadow-inner"
                        />
                        {clientSearch && (
                          <button
                            onClick={() => setClientSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white font-bold text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Carrousel de catégories */}
                      <div className="mb-3 flex-shrink-0">
                        <div className="flex space-x-1.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
                          {["Tous", "Maquis 🇧🇯", "Fast-Food", "Pâtisseries", "Grillades/Choukouya"].map((category) => {
                            const isSelected = selectedCategory === category;
                            return (
                              <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold border transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#fcd116] border-[#fcd116] text-[#004d31] shadow shadow-[#fcd116]/20"
                                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                }`}
                              >
                                {category}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Plats du Jour du Maquis live section with photos */}
                      {platsDuJour.length > 0 && (
                        <div className="mb-3.5 flex-shrink-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center">
                              <Sparkles size={10} className="mr-1 text-[#fcd116]" /> Plats du Jour du Maquis
                            </h4>
                            <span className="text-[7.5px] text-[#fcd116] font-bold px-1.5 py-0.5 bg-white/5 border border-white/10 rounded tracking-wider uppercase">Menu live 🇧🇯</span>
                          </div>
                          <div className="flex space-x-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
                            {platsDuJour.map((plat) => (
                              <div key={plat.id} className="flex-shrink-0 w-32 bg-white/10 rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between">
                                <div className="relative h-16 w-full bg-slate-900">
                                  {plat.image ? (
                                    <img src={plat.image} alt={plat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl bg-[#004d31]/50">🍲</div>
                                  )}
                                  <div className="absolute top-1 right-1 bg-black/70 border border-white/10 px-1 py-0.5 rounded text-[8px] font-black text-[#fcd116]">
                                    {plat.price} F
                                  </div>
                                </div>
                                <div className="p-1.5 flex flex-col justify-between flex-1 min-h-[58px]">
                                  <div>
                                    <h5 className="text-[9px] font-black text-white truncate leading-tight">{plat.name}</h5>
                                    <p className="text-[7.5px] text-white/50 truncate mt-0.5">{plat.description}</p>
                                  </div>
                                  <button
                                    onClick={() => handleAddToCart(plat)}
                                    className="mt-1.5 w-full py-1 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] font-black rounded-lg text-[8px] transition flex items-center justify-center space-x-0.5 cursor-pointer"
                                  >
                                    <span>Ajouter</span>
                                    <Plus size={8} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                        {/* Liste verticale des établissements (depuis la table bf_etablissements) */}
                        <div className="flex flex-col min-h-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                              Établissements ({filteredEtablissements.length})
                            </h4>
                            <span className="text-[8px] text-[#fcd116] font-bold tracking-wider">table: bf_etablissements</span>
                          </div>

                          <div className="space-y-3 pr-0.5 pb-2">
                            {filteredEtablissements.length > 0 ? (
                          filteredEtablissements.map((etablissement) => (
                            <div
                              key={etablissement.id}
                              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/15 hover:border-white/25 transition-all shadow-sm"
                            >
                              {/* Belle Image */}
                              <div className="relative h-24 w-full bg-slate-900 overflow-hidden">
                                <img
                                  src={etablissement.image}
                                  alt={etablissement.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                {/* Note moyenne badge */}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/20 px-1.5 py-0.5 rounded flex items-center space-x-0.5 shadow">
                                  <Star size={9} className="text-[#fcd116] fill-[#fcd116]" />
                                  <span className="text-[9px] font-black text-white">{etablissement.rating.toFixed(1)}</span>
                                </div>

                                {/* Catégorie badge */}
                                <div className="absolute bottom-2 left-2 bg-[#004d31]/95 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded">
                                  <span className="text-[8px] font-black text-white uppercase tracking-wider">{etablissement.category}</span>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="p-2.5">
                                <h5 className="font-bold text-white text-xs leading-snug">{etablissement.name}</h5>
                                <p className="text-[9px] text-white/60 mt-0.5 leading-relaxed font-semibold">{etablissement.description}</p>

                                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] text-white/40">
                                  <span className="flex items-center font-bold">
                                    <MapPin size={9} className="mr-0.5 text-[#e8112d]" /> Cotonou, Bénin
                                  </span>
                                  <span className="text-emerald-300 font-extrabold bg-emerald-500/10 px-1 rounded border border-emerald-500/10">Ouvert</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 bg-white/5 border border-dashed border-white/10 rounded-xl">
                            <p className="text-[10px] text-white/50">Aucun établissement ne correspond</p>
                            <button
                              onClick={() => {
                                setClientSearch("");
                                setSelectedCategory("Tous");
                              }}
                              className="mt-1.5 text-[9px] text-[#fcd116] font-bold hover:underline cursor-pointer"
                            >
                              Réinitialiser les filtres
                            </button>
                          </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* FLOATING CART BAR */}
                    {cart.length > 0 && !isCheckoutOpen && (
                      <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-[#004d31] to-[#002b1b] border border-[#fcd116]/30 px-3 py-2 rounded-2xl shadow-xl flex items-center justify-between z-20">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-[#fcd116]/20 rounded-lg flex items-center justify-center text-[#fcd116] border border-[#fcd116]/30">
                            <ShoppingBag size={12} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)} plat(s)</p>
                            <p className="text-[8px] text-white/60">Total : {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} F</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDeliveryPhone(session.user?.phone || "");
                            setIsCheckoutOpen(true);
                          }}
                          className="bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] px-3 py-1 rounded-lg text-[8.5px] font-black uppercase transition-all cursor-pointer flex items-center space-x-0.5"
                        >
                          <span>Commander</span>
                          <ArrowRight size={9} />
                        </button>
                      </div>
                    )}
                  </div>
                )) : (
                  /* GÉRANT CONTENT */
                  <div className="flex-1 overflow-y-auto pr-0.5 pb-4 scrollbar-none space-y-3">
                    {restaurantProfile === null ? (
                      /* ÉTAPE 1 : CRÉATION DU PROFIL */
                      <form onSubmit={handleCreateProfile} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#fcd116] uppercase tracking-wider flex items-center">
                            <Sparkles size={11} className="mr-1" /> ÉTAPE 1 : PROFIL DU MAQUIS
                          </span>
                          <span className="text-[7.5px] text-emerald-300 font-black tracking-widest bg-emerald-500/20 px-1.5 py-0.5 rounded uppercase">bf_restaurants</span>
                        </div>

                        <p className="text-[9px] text-white/70 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                          Avant d'ajouter vos plats au menu du jour, veuillez enregistrer le profil de votre établissement.
                        </p>

                        <div className="space-y-1.5">
                          {/* Nom du Maquis */}
                          <div>
                            <label className="text-[8px] font-bold text-white/50 uppercase block mb-0.5">Nom du Maquis *</label>
                            <input
                              type="text"
                              placeholder="ex: Chez Tanti Sika, Le Choukouya VIP"
                              value={restName}
                              onChange={(e) => setRestName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] transition-all font-semibold"
                              required
                            />
                          </div>

                          {/* Emplacement / Quartier */}
                          <div>
                            <label className="text-[8px] font-bold text-white/50 uppercase block mb-0.5">Emplacement / Quartier *</label>
                            <input
                              type="text"
                              placeholder="ex: Cotonou - Fidjrossè, Calavi"
                              value={restLocation}
                              onChange={(e) => setRestLocation(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] transition-all font-semibold"
                              required
                            />
                          </div>

                          {/* Téléphone de contact */}
                          <div>
                            <label className="text-[8px] font-bold text-white/50 uppercase block mb-0.5">Téléphone de contact *</label>
                            <input
                              type="text"
                              placeholder="ex: +229 97 00 00 00"
                              value={restPhone}
                              onChange={(e) => setRestPhone(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] transition-all font-semibold"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-1.5 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] rounded-xl text-[10px] font-black shadow flex items-center justify-center space-x-1 cursor-pointer transition uppercase"
                        >
                          <CheckCircle2 size={11} className="mr-1" />
                          <span>Créer mon Maquis 🚀</span>
                        </button>
                      </form>
                    ) : (
                      /* ÉTAPE 2 : GESTION DU MENU DU JOUR */
                      <div className="flex flex-col min-h-0 space-y-3 relative h-full">
                        {/* EN-TÊTE DU PROFIL DU MAQUIS */}
                        <div className="bg-[#002b1b] border border-white/10 p-2 rounded-xl flex items-center justify-between flex-shrink-0">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-[#fcd116]/10 flex items-center justify-center text-xs border border-[#fcd116]/20 flex-shrink-0">
                              🏢
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[10px] font-black text-white truncate leading-tight">{restaurantProfile.name}</h4>
                              <p className="text-[8px] text-white/50 flex items-center mt-0.5 truncate">
                                <MapPin size={8} className="mr-0.5 text-red-400 flex-shrink-0" /> {restaurantProfile.location} • {restaurantProfile.phone}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRestName(restaurantProfile.name);
                              setRestLocation(restaurantProfile.location);
                              setRestPhone(restaurantProfile.phone);
                              setRestaurantProfile(null);
                            }}
                            className="text-[7.5px] font-extrabold text-[#fcd116] border border-[#fcd116]/20 bg-[#fcd116]/5 hover:bg-[#fcd116]/10 px-1.5 py-0.5 rounded uppercase ml-1 flex-shrink-0"
                          >
                            Modifier
                          </button>
                        </div>

                        {/* SUB-TAB SELECTOR (Menu du Jour vs Portefeuille & Performance) */}
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setGerantSubTab("menu")}
                            className={`flex-1 py-1 text-center rounded-lg text-[9px] font-black transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                              gerantSubTab === "menu"
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Utensils size={10} />
                            <span>Menu du Jour</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGerantSubTab("portefeuille")}
                            className={`flex-1 py-1 text-center rounded-lg text-[9px] font-black transition-all flex items-center justify-center space-x-1 cursor-pointer relative ${
                              gerantSubTab === "portefeuille"
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Coins size={10} />
                            <span>Mon Portefeuille</span>
                            {versementRequests.filter(r => r.phone === (session.user?.phone || "61000000") && r.status === "En cours...").length > 0 && (
                              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse border border-[#004d31]" />
                            )}
                          </button>
                        </div>

                        {/* SUB-TAB CONTENT */}
                        {gerantSubTab === "menu" ? (
                          <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto scrollbar-none pb-4">
                            
                            {/* BÉNINFOOD FCM ALERTS CONFIGURATION CENTER FOR GÉRANTS */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-2 flex-shrink-0">
                              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-widest flex items-center">
                                  <BellRing size={10} className="mr-1 animate-pulse" /> Alertes Gérant Push FCM
                                </span>
                                <span className="text-[7px] text-[#fcd116] font-bold bg-[#fcd116]/10 px-1.5 py-0.5 rounded border border-[#fcd116]/10">
                                  Anti-Rats de Commande ⚡
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {/* Left side: Permission status */}
                                <div className="space-y-1 bg-black/20 p-1.5 rounded-xl border border-white/5 flex flex-col justify-between">
                                  <span className="text-[7.5px] text-white/50 font-bold block uppercase">Statut Alerte :</span>
                                  
                                  <div className="my-1 text-center">
                                    {fcmPermission === "granted" ? (
                                      <span className="text-[8px] font-black text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/10 inline-block">
                                        🔔 Push Activé
                                      </span>
                                    ) : fcmPermission === "denied" ? (
                                      <span className="text-[8px] font-black text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded-lg border border-red-500/10 inline-block">
                                        🚫 Push Bloqué
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={handleRequestFcmPermission}
                                        className="w-full py-1 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] font-black text-[7.5px] rounded-lg tracking-wider uppercase cursor-pointer"
                                      >
                                        🔑 Activer Push
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Right side: Preferences */}
                                <div className="space-y-1 bg-black/20 p-1.5 rounded-xl border border-white/5 flex flex-col justify-between">
                                  <span className="text-[7.5px] text-white/50 font-bold block uppercase">Signaux de Réveil :</span>
                                  
                                  <div className="space-y-1 my-0.5">
                                    <label className="flex items-center space-x-1.5 text-[7.5px] font-semibold text-white/80 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={fcmSoundEnabled}
                                        onChange={(e) => setFcmSoundEnabled(e.target.checked)}
                                        className="rounded border-white/10 text-[#fcd116] focus:ring-0 bg-transparent w-2.5 h-2.5"
                                      />
                                      <span>Sonnerie</span>
                                    </label>
                                    <label className="flex items-center space-x-1.5 text-[7.5px] font-semibold text-white/80 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={fcmVibrationEnabled}
                                        onChange={(e) => setFcmVibrationEnabled(e.target.checked)}
                                        className="rounded border-white/10 text-[#fcd116] focus:ring-0 bg-transparent w-2.5 h-2.5"
                                      />
                                      <span>Vibrer</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Simulation for Gérants */}
                              <button
                                type="button"
                                onClick={() => {
                                  setBackgroundTimer(5);
                                  setAlertMessage({
                                    type: "success",
                                    text: "Alerte test Gérant planifiée ! Réduisez l'onglet pour tester."
                                  });
                                }}
                                disabled={backgroundTimer !== null}
                                className="w-full py-1 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-[7.5px] rounded-lg tracking-wider uppercase flex items-center justify-center space-x-1 cursor-pointer transition disabled:opacity-50"
                              >
                                <BellRing size={9} className="text-[#fcd116]" />
                                <span>Simuler Alerte Gérant (5s)</span>
                              </button>
                            </div>

                            {/* FORM ADD PLAT */}
                            <form onSubmit={handleAddPlat} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-2 flex-shrink-0">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-[#fcd116] uppercase tracking-wider flex items-center">
                                  <Sparkles size={11} className="mr-1" /> ÉTAPE 2 : MENU DU JOUR
                                </span>
                                <span className="text-[7.5px] text-emerald-300 font-black tracking-widest bg-emerald-500/20 px-1.5 py-0.5 rounded uppercase">bf_menu_du_jour</span>
                              </div>
                              
                              <div className="space-y-1.5">
                                {/* Name input */}
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Nom du plat (ex: Atassi complet, Kpessé)"
                                    value={platName}
                                    onChange={(e) => setPlatName(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] transition-all font-semibold"
                                  />
                                </div>

                                {/* Description and Price */}
                                <div className="grid grid-cols-12 gap-2">
                                  <div className="col-span-8">
                                    <input
                                      type="text"
                                      placeholder="Description / Accompagnement"
                                      value={platDesc}
                                      onChange={(e) => setPlatDesc(e.target.value)}
                                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] transition-all font-semibold"
                                    />
                                  </div>
                                  <div className="col-span-4 relative">
                                    <input
                                      type="number"
                                      placeholder="Prix"
                                      value={platPrice}
                                      onChange={(e) => setPlatPrice(e.target.value)}
                                      className="w-full pl-2 pr-6 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fcd116] transition-all font-bold text-right"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/50">FCFA</span>
                                  </div>
                                </div>

                                {/* Photo du Menu / Plat Upload Section */}
                                <div className="bg-white/5 p-2 rounded-xl border border-white/10 space-y-2">
                                  <span className="text-[8.5px] font-bold text-white/60 block uppercase tracking-wider">Photo du Plat / Menu</span>
                                  
                                  <div className="flex items-center space-x-3">
                                    {/* Image Preview Container */}
                                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                      {platImage ? (
                                        <img src={platImage} alt="Preview" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[18px]">🍲</span>
                                      )}
                                    </div>

                                    {/* Uploader & Presets Selection */}
                                    <div className="flex-1 space-y-1.5">
                                      {/* Custom File Upload Button */}
                                      <div className="relative">
                                        <label className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black py-1 px-2.5 rounded-lg text-[9px] text-center block transition">
                                          📸 Importer une photo...
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageFileChange} 
                                            className="hidden" 
                                          />
                                        </label>
                                      </div>

                                      {/* Presets Grid */}
                                      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
                                        {FOOD_PRESETS.map((preset) => (
                                          <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setPlatImage(preset.url)}
                                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition flex-shrink-0 ${
                                              platImage === preset.url
                                                ? "bg-[#fcd116] text-[#004d31] font-black"
                                                : "bg-white/5 hover:bg-white/10 text-white/70"
                                            }`}
                                          >
                                            {preset.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-extrabold shadow flex items-center justify-center space-x-1 cursor-pointer transition"
                              >
                                <Check size={11} />
                                <span>Publier le Menu du jour</span>
                              </button>
                            </form>

                            {/* Plats du jour list */}
                            <div className="flex flex-col min-h-0">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Plats publiés ({platsDuJour.length})</span>
                                <span className="text-[7.5px] text-[#fcd116] font-bold tracking-wider">table: bf_plats</span>
                              </div>

                              <div className="space-y-2 pr-0.5 pb-2">
                                {platsDuJour.length > 0 ? (
                                  platsDuJour.map((p) => (
                                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center hover:border-white/20 transition space-x-2.5">
                                      {p.image && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h5 className="text-[11px] font-bold text-white truncate mr-1">{p.name}</h5>
                                          <span className="text-[9px] font-black text-[#fcd116] flex-shrink-0">{p.price} F</span>
                                        </div>
                                        <p className="text-[8.5px] text-white/50 mt-0.5 leading-relaxed truncate">{p.description}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePlat(p.id)}
                                        className="text-[8px] text-red-400 hover:text-red-300 font-extrabold px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/10 cursor-pointer transition"
                                      >
                                        Retirer
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-6 bg-white/5 border border-dashed border-white/10 rounded-xl">
                                    <p className="text-[10px] text-white/50">Aucun plat publié au menu.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* TAB: PORTEFEUILLE & PERFORMANCE */
                          <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto scrollbar-none pb-4">
                            
                            {/* 1. TABLEAU DE BORD DE PERFORMANCE */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                              <span className="text-[8px] font-black text-[#fcd116] uppercase tracking-wider block">📈 Performance du Restaurant</span>
                              
                              <div className="grid grid-cols-3 gap-1.5">
                                <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                                  <ShoppingBag size={12} className="mx-auto text-emerald-400 mb-1" />
                                  <div className="text-xs font-black text-white">38</div>
                                  <div className="text-[6.5px] text-white/40 uppercase font-bold mt-0.5">Commandes</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                                  <CheckCircle2 size={12} className="mx-auto text-[#fcd116] mb-1" />
                                  <div className="text-xs font-black text-white">35</div>
                                  <div className="text-[6.5px] text-white/40 uppercase font-bold mt-0.5">Livrées</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowGerantComments(!showGerantComments)}
                                  className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl text-center cursor-pointer transition-all"
                                >
                                  <Star size={12} className="mx-auto text-amber-400 fill-amber-400 mb-1" />
                                  <div className="text-xs font-black text-white">4.7/5</div>
                                  <div className="text-[6.5px] text-[#fcd116] uppercase font-black mt-0.5 underline">Avis ({showGerantComments ? "Fermer" : "Voir"})</div>
                                </button>
                              </div>

                              {/* Toggleable Comments Area */}
                              {showGerantComments && (
                                <div className="mt-2 p-2 bg-black/30 border border-white/5 rounded-xl space-y-1.5 animate-fade-in text-left">
                                  <div className="text-[7.5px] text-white/50 font-bold uppercase tracking-wider">Commentaires Clients :</div>
                                  <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none">
                                    <div className="text-[9px] bg-white/5 p-1.5 rounded border border-white/5">
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-extrabold text-[#fcd116]">Sessi Mme.</span>
                                        <span className="text-[8px] text-amber-300">⭐⭐⭐⭐⭐</span>
                                      </div>
                                      <p className="text-white/85 text-[8.5px] italic">"Amiwo très pimenté, super bon !"</p>
                                    </div>
                                    <div className="text-[9px] bg-white/5 p-1.5 rounded border border-white/5">
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-extrabold text-[#fcd116]">Béninois Gourmet</span>
                                        <span className="text-[8px] text-amber-300">⭐⭐⭐⭐⭐</span>
                                      </div>
                                      <p className="text-white/85 text-[8.5px] italic">"Atassi bien chaud, friture incroyable !"</p>
                                    </div>
                                    <div className="text-[9px] bg-white/5 p-1.5 rounded border border-white/5">
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-extrabold text-[#fcd116]">Kodjo S.</span>
                                        <span className="text-[8px] text-amber-300">⭐⭐⭐⭐</span>
                                      </div>
                                      <p className="text-white/85 text-[8.5px] italic">"Un peu en retard de livraison mais le goût est au rendez-vous !"</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2. LE MODULE FINANCIER ("MA CAISSE") */}
                            {(() => {
                              // Calculate dynamic balances based on the shared versementRequests state
                              const currentGérantPhone = session.user?.phone?.replace(/\s+/g, "") || "61000000";
                              const pendingRequests = versementRequests.filter(r => r.phone === currentGérantPhone && r.status === "En cours...");
                              const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);
                              const availableBalance = Math.max(0, 45000 - totalPendingAmount);

                              return (
                                <div className="bg-gradient-to-br from-[#003d27] to-[#012518] border border-[#fcd116]/30 rounded-2xl p-3.5 space-y-3 shadow-lg relative overflow-hidden">
                                  {/* Glass Orb inside card */}
                                  <div className="absolute right-[-10%] top-[-10%] w-20 h-20 bg-[#fcd116] rounded-full blur-[25px] opacity-10 pointer-events-none" />
                                  
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest block">Compte de Reversement BéninFood</span>
                                      <h4 className="text-xs font-black text-white mt-0.5">Espace Caisse 🏦</h4>
                                    </div>
                                    <span className="text-[7.5px] text-[#fcd116] font-black bg-[#fcd116]/10 px-1.5 py-0.5 rounded border border-[#fcd116]/20 uppercase">BF_FINANCE</span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-0.5">
                                      <span className="text-[8px] text-white/50 font-bold block">Solde Disponible</span>
                                      <span className="text-sm font-black text-[#fcd116] block">{availableBalance.toLocaleString()} FCFA</span>
                                      <span className="text-[6.5px] text-emerald-300 font-medium block">Libéré par les courses validées</span>
                                    </div>

                                    <div className="space-y-0.5 border-l border-white/10 pl-3">
                                      <span className="text-[8px] text-white/50 font-bold block">En Attente</span>
                                      <span className="text-sm font-black text-white/80 block">7,500 FCFA</span>
                                      <span className="text-[6.5px] text-white/40 font-medium block">Commandes en cours de route ⏳</span>
                                    </div>
                                  </div>

                                  {/* LE BOUTON MAGIQUE */}
                                  <button
                                    type="button"
                                    disabled={availableBalance <= 0}
                                    onClick={() => {
                                      setMomoOperator("MTN MoMo");
                                      setIsVersementModalOpen(true);
                                    }}
                                    className={`w-full py-2 bg-gradient-to-r from-[#fcd116] to-[#e0b810] text-[#004d31] hover:from-white hover:to-[#fcd116] text-[9.5px] font-black uppercase rounded-xl transition duration-150 flex items-center justify-center space-x-1.5 shadow-md ${
                                      availableBalance <= 0 ? "opacity-40 cursor-not-allowed filter grayscale" : "cursor-pointer"
                                    }`}
                                  >
                                    <Wallet size={12} />
                                    <span>Demander mon versement MoMo</span>
                                  </button>
                                </div>
                              );
                            })()}

                            {/* 3. HISTORIQUE DES VERSEMENTS */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8.5px] font-black text-white/40 uppercase tracking-widest">Historique de Caisse</span>
                                <span className="text-[7.5px] text-emerald-300 font-extrabold bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/10 uppercase">Mobile Money</span>
                              </div>

                              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-none pr-0.5">
                                {(() => {
                                  const currentGérantPhone = session.user?.phone?.replace(/\s+/g, "") || "61000000";
                                  const filteredRequests = versementRequests.filter(r => r.phone === currentGérantPhone);

                                  return filteredRequests.length > 0 ? (
                                    filteredRequests.map((req) => (
                                      <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center justify-between hover:border-white/20 transition duration-150 text-left">
                                        <div className="min-w-0 flex-1 pr-2">
                                          <div className="flex items-center space-x-1.5">
                                            <span className="text-[9.5px] font-black text-white">-{req.amount.toLocaleString()} FCFA</span>
                                            <span className="text-[7px] text-[#fcd116] font-bold px-1 bg-[#fcd116]/10 rounded border border-[#fcd116]/20">
                                              {req.operator || "MoMo"}
                                            </span>
                                          </div>
                                          <div className="text-[7px] text-white/40 mt-0.5 font-bold">{req.date} • ID: {req.id}</div>
                                        </div>

                                        <div className="flex-shrink-0">
                                          {req.status === "En cours..." ? (
                                            <span className="text-[7px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1" />
                                              <span>En cours ⏳</span>
                                            </span>
                                          ) : (
                                            <span className="text-[7px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                                              <span>Validé ✅</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 bg-white/5 border border-dashed border-white/10 rounded-xl">
                                      <p className="text-[9px] text-white/50">Aucun transfert effectué pour le moment.</p>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* BOTTOM SHEET / MODAL CONFIRMATION (TRANSITION SLIDE UP OVER CONTAINER) */}
                        {isVersementModalOpen && (() => {
                          const currentGérantPhone = session.user?.phone?.replace(/\s+/g, "") || "61000000";
                          const pendingRequests = versementRequests.filter(r => r.phone === currentGérantPhone && r.status === "En cours...");
                          const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);
                          const availableBalance = Math.max(0, 45000 - totalPendingAmount);

                          return (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-end animate-fade-in">
                              {/* Clicking background closes sheet */}
                              <div className="absolute inset-0" onClick={() => setIsVersementModalOpen(false)} />

                              <div className="w-full bg-[#002b1b] border-t-2 border-[#fcd116] rounded-t-3xl p-4 shadow-2xl relative z-40 animate-slide-up flex flex-col space-y-3.5 text-left">
                                {/* Bar Indicator for dragging */}
                                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />

                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-white uppercase tracking-wider">💸 Demande de Versement MoMo</h4>
                                  <p className="text-[9px] text-white/60">
                                    Déclenchez votre reversement Mobile Money de fin de journée pour <span className="text-[#fcd116] font-bold">{availableBalance.toLocaleString()} FCFA</span>.
                                  </p>
                                </div>

                                {/* Operator Selection */}
                                <div className="space-y-1.5">
                                  <label className="text-[7.5px] font-bold text-white/40 uppercase block">Opérateur Partenaire :</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setMomoOperator("MTN MoMo")}
                                      className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition ${
                                        momoOperator === "MTN MoMo"
                                          ? "bg-amber-500/10 border-amber-400 text-white"
                                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                      }`}
                                    >
                                      <span className="text-xs">📱</span>
                                      <span className="text-[8.5px] font-black mt-0.5">MTN MoMo</span>
                                      <span className="text-[6.5px] opacity-70">Réseau Jaune</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMomoOperator("Moov Flooz")}
                                      className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition ${
                                        momoOperator === "Moov Flooz"
                                          ? "bg-blue-500/10 border-blue-400 text-white"
                                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                      }`}
                                    >
                                      <span className="text-xs">🍊</span>
                                      <span className="text-[8.5px] font-black mt-0.5">Moov Flooz</span>
                                      <span className="text-[6.5px] opacity-70">Réseau Orange</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Beneficiary details info */}
                                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-[8.5px] text-white/70 space-y-1 leading-snug font-semibold">
                                  <div className="flex justify-between">
                                    <span>Bénéficiaire :</span>
                                    <span className="text-white font-extrabold">{restaurantProfile.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Numéro Mobile Money :</span>
                                    <span className="text-[#fcd116] font-black">{session.user?.phone || "+229 61 00 00 00"}</span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-white/5 text-[9.5px]">
                                    <span className="text-white/80 font-bold">MONTANT NET À REVERSER :</span>
                                    <span className="text-[#fcd116] font-black">{availableBalance.toLocaleString()} FCFA</span>
                                  </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex space-x-2.5 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsVersementModalOpen(false)}
                                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/15 text-white font-black rounded-lg text-[9px] text-center cursor-pointer transition uppercase"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newReq = {
                                        id: "V-" + (100 + versementRequests.length + 1),
                                        restaurantName: restaurantProfile?.name || "Chez Maman Bénin",
                                        amount: availableBalance,
                                        status: "En cours...",
                                        date: "Aujourd'hui à " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                                        phone: currentGérantPhone,
                                        operator: momoOperator
                                      };
                                      setVersementRequests([newReq, ...versementRequests]);
                                      setIsVersementModalOpen(false);
                                      setAlertMessage({
                                        type: "success",
                                        text: `Demande de reversement de ${availableBalance.toLocaleString()} FCFA envoyée à l'administrateur ! ⏳`
                                      });
                                    }}
                                    className="flex-1 py-1.5 bg-[#fcd116] hover:bg-[#e0b810] text-[#004d31] font-black rounded-lg text-[9px] text-center cursor-pointer transition uppercase flex items-center justify-center space-x-1"
                                  >
                                    <Check size={10} />
                                    <span>Valider</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1 mt-2 transition-colors cursor-pointer"
                >
                  <LogOut size={12} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )
          ) : (
            /* AUTH SCREEN FLOW */
            <div className="h-full overflow-y-auto scrollbar-none px-5 py-6 flex flex-col justify-start z-10 pb-24 space-y-4">
              
              {/* BRAND HEADER */}
              <div className="text-center mt-3 mb-2 flex-shrink-0">
                <div className={`w-14 h-14 ${activeColorClass} rounded-2xl mx-auto flex items-center justify-center shadow-lg text-white mb-3 border border-white/20`}>
                  <ShoppingBag size={28} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Bénin<span style={{ color: activeHex }}>Food</span>
                </h1>
                <p className="text-white/70 text-xs mt-1.5 px-6 leading-relaxed">
                  {isLogin 
                    ? "Savourez les meilleurs plats du Bénin, livrés chez vous en un clic"
                    : "Rejoignez la plus grande plateforme de commande au Bénin !"
                  }
                </p>
              </div>

              {/* CARD CONTAINER */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-[28px] shadow-lg border border-white/15 flex-shrink-0 flex flex-col">
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">
                    {isLogin ? "Se connecter" : "Créer un compte"}
                  </h2>

                  {/* FORM BODY */}
                  <div className="space-y-3.5">
                    
                    {/* ROLE SELECTOR CARDS (ONLY REGISTRATION) */}
                    {!isLogin && (
                      <div className="mb-2">
                        <label className="text-white/50 font-bold text-[10px] tracking-wider uppercase block mb-2">
                          Sélectionnez votre rôle
                        </label>
                        <div className="space-y-2">
                          
                          {/* CLIENT */}
                          <div 
                            onClick={() => setRole("Client")}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                              role === "Client"
                                ? "bg-white/15 border-[#fcd116]"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${role === "Client" ? "bg-[#fcd116]/20 text-[#fcd116]" : "bg-white/5 text-white/50"}`}>
                                <ShoppingBag size={16} />
                              </div>
                              <div className="text-left">
                                <h4 className={`text-xs font-bold ${role === "Client" ? "text-white" : "text-white/70"}`}>Client gourmand</h4>
                                <p className="text-[10px] text-white/40">Commander des repas</p>
                              </div>
                            </div>
                            {role === "Client" && (
                              <div className="w-4 h-4 rounded-full bg-[#fcd116] flex items-center justify-center text-[#004d31]">
                                <Check size={10} />
                              </div>
                            )}
                          </div>

                          {/* GERANT */}
                          <div 
                            onClick={() => setRole("Gérant de Restaurant/Maquis")}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                              role === "Gérant de Restaurant/Maquis"
                                ? "bg-white/15 border-emerald-400"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${role === "Gérant de Restaurant/Maquis" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/50"}`}>
                                <Utensils size={16} />
                              </div>
                              <div className="text-left">
                                <h4 className={`text-xs font-bold ${role === "Gérant de Restaurant/Maquis" ? "text-white" : "text-white/70"}`}>Gérant Restaurant</h4>
                                <p className="text-[10px] text-white/40">Vendre mes spécialités</p>
                              </div>
                            </div>
                            {role === "Gérant de Restaurant/Maquis" && (
                              <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center text-white">
                                <Check size={10} />
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Note d'information Livreur */}
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start space-x-2">
                          <Bike size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-white/70 leading-relaxed font-semibold">
                            💡 <span className="text-blue-300 font-bold">Livreurs :</span> Votre inscription publique n'est pas autorisée sur l'application. Les comptes livreurs sont créés exclusivement par l'administrateur depuis le site web d'administration de <span className="text-[#fcd116] font-bold">BéninFood</span>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FIELD: NAME (ONLY SIGNUP) */}
                    {!isLogin && (
                      <div>
                        <label className="text-white/50 font-bold text-[10px] tracking-wider uppercase block mb-1.5">
                          Nom complet
                        </label>
                        <div className={`flex items-center px-3.5 py-2.5 bg-white/5 border rounded-xl transition-all ${
                          errors.name ? "border-red-500" : "border-white/10 focus-within:border-white/30"
                        }`}>
                          <User size={15} className="text-white/40" />
                          <input 
                            type="text"
                            placeholder="Sylvain Kodjo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-transparent flex-1 ml-2 text-xs text-white font-medium outline-none placeholder-white/25"
                          />
                        </div>
                        {errors.name && <span className="text-red-400 text-[10px] block mt-0.5 ml-1 font-semibold">{errors.name}</span>}
                      </div>
                    )}

                    {/* FIELD: PHONE */}
                    <div>
                      <label className="text-white/50 font-bold text-[10px] tracking-wider uppercase block mb-1.5">
                        Téléphone
                      </label>
                      <div className={`flex items-center px-3.5 py-2.5 bg-white/5 border rounded-xl transition-all ${
                        errors.phone ? "border-red-500" : "border-white/10 focus-within:border-white/30"
                      }`}>
                        <Phone size={15} className="text-white/40" />
                        <span className="ml-2 font-extrabold text-xs text-white/50">+229</span>
                        <div className="w-[1px] h-4 bg-white/15 mx-2" />
                        <input 
                          type="tel"
                          placeholder="61 00 00 00"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-transparent flex-1 text-xs text-white font-medium outline-none placeholder-white/25"
                        />
                      </div>
                      {errors.phone && <span className="text-red-400 text-[10px] block mt-0.5 ml-1 font-semibold">{errors.phone}</span>}
                    </div>

                    {/* FIELD: PASSWORD */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-white/50 font-bold text-[10px] tracking-wider uppercase">
                          Mot de passe
                        </label>
                        {isLogin && (
                          <button className="text-[10px] font-bold text-white/40 hover:text-white/60">
                            Oublié ?
                          </button>
                        )}
                      </div>
                      <div className={`flex items-center px-3.5 py-2.5 bg-white/5 border rounded-xl transition-all ${
                        errors.password ? "border-red-500" : "border-white/10 focus-within:border-white/30"
                      }`}>
                        <Lock size={15} className="text-white/40" />
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handlePasswordKeyDown}
                          onKeyUp={handlePasswordKeyUp}
                          className="bg-transparent flex-1 ml-2 text-xs text-white font-medium outline-none placeholder-white/25"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-white/40 focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.password && <span className="text-red-400 text-[10px] block mt-0.5 ml-1 font-semibold">{errors.password}</span>}
                    </div>

                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAction}
                  style={{ backgroundColor: activeHex === '#fcd116' ? '#fcd116' : activeHex }}
                  className={`w-full py-3 rounded-xl mt-5 font-extrabold text-sm flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all duration-150 disabled:opacity-80 cursor-pointer ${
                    activeHex === '#fcd116' ? 'text-[#004d31]' : 'text-white'
                  }`}
                >
                  <span>
                    {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire sur BeninFood"}
                  </span>
                  {!loading && <ArrowRight size={14} />}
                </button>
              </div>

              {/* TOGGLE BOTTOM LINK */}
              {customization.screenType === "both" && (
                <div className="flex items-center justify-center mt-4">
                  <span className="text-xs text-white/55">
                    {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                  </span>
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setAlertMessage(null);
                    }}
                    style={{ color: activeHex }}
                    className="ml-1.5 font-extrabold text-xs focus:outline-none cursor-pointer hover:underline"
                  >
                    {isLogin ? "S'inscrire" : "Se connecter"}
                  </button>
                </div>
              )}

              {/* Scrolling Bottom Spacer */}
              <div className="h-28 flex-shrink-0" />

            </div>
          )}

          {/* CALL SIMULATION POPUP OVERLAY */}
          {isCallingClient && activeOrder && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col justify-between p-8 z-50 text-center animate-fade-in rounded-[36px]">
              <div className="mt-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 rounded-full mx-auto flex items-center justify-center text-emerald-400 animate-pulse">
                  <Phone size={28} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-black">Appel en cours...</h3>
                  <p className="text-[#fcd116] font-mono text-xs mt-1">+229 {activeOrder.deliveryPhone}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-left text-white/70 text-[9px] leading-relaxed space-y-1 max-h-40 overflow-y-auto">
                  <p className="font-extrabold text-white text-[10px]">Simulateur Vocal :</p>
                  <p>"Allô ! Bonjour, c'est le livreur BéninFood au téléphone.</p>
                  <p>Je viens de récupérer votre commande au maquis <span className="text-[#fcd116] font-bold">{activeOrder.maquisName}</span>.</p>
                  <p>J'ai bien pris note de vos indications : <span className="text-white font-bold">{activeOrder.deliveryLandmark}</span>.</p>
                  <p>Je lance l'itinéraire et j'arrive à votre position dans environ 10 minutes ! À tout de suite !"</p>
                </div>
              </div>

              <button
                onClick={() => setIsCallingClient(false)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Raccrocher 📞
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
