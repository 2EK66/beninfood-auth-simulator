import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ─── Sécurité : CORS strict ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.APP_URL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "50kb" })); // limite taille payload

// ─── Rate limiting par IP ─────────────────────────────────────────────────────
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 30,                    // 30 requêtes/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Veuillez patienter une minute." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 tentatives d'auth/15min/IP
  message: { error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// ─── Clients Gemini & Supabase ────────────────────────────────────────────────
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { "User-Agent": "beninfood-studio" } },
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jafhpkbtxcmzufznnbxc.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZmhwa2J0eGNtenVmem5uYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjMxNjcsImV4cCI6MjA5MDQzOTE2N30.PruNINSYGjCwhsiZhcIFVJRX6ix0zJKQMIJKta3YlEM";

// Client admin (service key) pour les opérations serveur
const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// Client anon pour les opérations côté serveur qui passent par RLS
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helper validation ────────────────────────────────────────────────────────
function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-\+\(\)]/g, "").replace(/^229/, "");
}

function isValidBeninPhone(phone: string): boolean {
  const cleaned = sanitizePhone(phone);
  return /^\d{8}$/.test(cleaned);
}

function isValidRole(role: string): boolean {
  return ["Client", "Gérant de Restaurant/Maquis", "Livreur"].includes(role);
}

// ─── ENDPOINT : Authentification réelle via Supabase ─────────────────────────
app.post("/api/auth", authLimiter, async (req, res) => {
  try {
    const { action, name, phone, password, role } = req.body;

    // Validation des champs
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Téléphone et mot de passe sont requis.",
      });
    }

    const cleanedPhone = sanitizePhone(phone);

    if (!isValidBeninPhone(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Numéro de téléphone béninois invalide (8 chiffres requis).",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    // Construire l'email fictif basé sur le téléphone (Supabase Auth exige un email)
    const fakeEmail = `${cleanedPhone}@beninfood.bj`;

    if (action === "register") {
      // ── Inscription ────────────────────────────────────────────────────────
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Le nom complet est requis (min. 2 caractères).",
        });
      }

      if (!isValidRole(role)) {
        return res.status(400).json({
          success: false,
          message: "Rôle invalide. Choisissez : Client, Gérant de Restaurant/Maquis, ou Livreur.",
        });
      }

      if (role === "Livreur") {
        return res.status(403).json({
          success: false,
          message: "Les comptes Livreurs sont créés uniquement par l'administrateur BéninFood.",
        });
      }

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
        email: fakeEmail,
        password,
        options: {
          data: { full_name: name.trim(), phone: cleanedPhone, role },
        },
      });

      if (authError) {
        // Cas : utilisateur déjà existant
        if (authError.message.includes("already registered")) {
          return res.status(409).json({
            success: false,
            message: "Ce numéro de téléphone est déjà enregistré. Connectez-vous.",
          });
        }
        throw authError;
      }

      if (!authData.user) {
        return res.status(500).json({
          success: false,
          message: "Échec de la création du compte. Réessayez.",
        });
      }

      // Créer le profil BeninFood dans bf_profiles
      const { error: profileError } = await supabaseAnon
        .from("bf_profiles")
        .upsert({
          id: authData.user.id,
          name: name.trim(),
          phone: cleanedPhone,
          role: role === "Gérant de Restaurant/Maquis" ? "Gérant" : role,
        });

      if (profileError) {
        console.error("Erreur création bf_profiles:", profileError.message);
        // On ne bloque pas — l'auth est créée, le profil peut être retenté
      }

      return res.json({
        success: true,
        message: `Compte BéninFood créé avec succès ! Bienvenue, ${name.trim()} !`,
        data: {
          user: {
            id: authData.user.id,
            name: name.trim(),
            phone: cleanedPhone,
            role,
            email: fakeEmail,
          },
          session: authData.session,
        },
      });

    } else {
      // ── Connexion ──────────────────────────────────────────────────────────
      const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (authError) {
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.message.includes("invalid_credentials")
        ) {
          return res.status(401).json({
            success: false,
            message: "Numéro ou mot de passe incorrect.",
          });
        }
        throw authError;
      }

      if (!authData.user || !authData.session) {
        return res.status(401).json({
          success: false,
          message: "Échec de la connexion.",
        });
      }

      // Récupérer le profil BeninFood
      const { data: profile } = await supabaseAnon
        .from("bf_profiles")
        .select("name, phone, role")
        .eq("id", authData.user.id)
        .single();

      const userName = profile?.name || authData.user.user_metadata?.full_name || "Utilisateur";
      const userRole = profile?.role || authData.user.user_metadata?.role || "Client";

      return res.json({
        success: true,
        message: `Connexion réussie ! Heureux de vous revoir, ${userName} 👋`,
        data: {
          user: {
            id: authData.user.id,
            name: userName,
            phone: cleanedPhone,
            role: userRole,
          },
          session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at,
          },
        },
      });
    }
  } catch (error: any) {
    console.error("Auth error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur. Veuillez réessayer.",
    });
  }
});

// ─── ENDPOINT : Déconnexion ───────────────────────────────────────────────────
app.post("/api/auth/logout", authLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    await userClient.auth.signOut();
    return res.json({ success: true, message: "Déconnexion réussie." });
  } catch (error: any) {
    console.error("Logout error:", error?.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la déconnexion." });
  }
});

// ─── ENDPOINT : Profil utilisateur connecté ───────────────────────────────────
app.get("/api/me", apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Non autorisé." });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: "Session expirée. Reconnectez-vous." });
    }

    const { data: profile } = await supabaseAnon
      .from("bf_profiles")
      .select("name, phone, role")
      .eq("id", user.id)
      .single();

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: profile?.name || user.user_metadata?.full_name,
        phone: profile?.phone,
        role: profile?.role || "Client",
      },
    });
  } catch (error: any) {
    console.error("Me error:", error?.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─── ENDPOINT (legacy conservé) : mock-auth redirige vers /api/auth ──────────
app.post("/api/mock-auth", authLimiter, async (req, res) => {
  // Redirige proprement vers le vrai endpoint
  req.url = "/api/auth";
  app._router.handle(req, res, () => {});
});

// ─── ENDPOINT : Génération de code Gemini ────────────────────────────────────
app.post("/api/generate-component", apiLimiter, async (req, res) => {
  try {
    const { checkOnly, customInstructions, screenType, themeColor, language } = req.body;

    if (checkOnly) {
      return res.json({ available: !!ai });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Clé API Gemini non configurée. Ajoutez GEMINI_API_KEY dans vos secrets.",
      });
    }

    // Validation des inputs
    if (customInstructions && customInstructions.length > 2000) {
      return res.status(400).json({ error: "Instructions trop longues (max 2000 caractères)." });
    }

    const validScreenTypes = ["both", "login", "signup", "home"];
    if (screenType && !validScreenTypes.includes(screenType)) {
      return res.status(400).json({ error: "Type d'écran invalide." });
    }

    const prompt = `
Tu es un expert mondial en développement d'applications mobiles React Native avec Expo, TypeScript et NativeWind (Tailwind CSS pour mobile).
On souhaite générer ${
  screenType === "both"
    ? "l'écran de Connexion et d'Inscription"
    : screenType === "login"
    ? "l'écran de Connexion uniquement"
    : screenType === "signup"
    ? "l'écran d'Inscription uniquement"
    : "l'écran d'accueil principal hybride (HomeScreen)"
}.
L'application s'appelle "BeninFood", une plateforme de livraison de repas au Bénin (Afrique de l'Ouest).

${
  screenType === "home"
    ? `
Spécifications pour l'Écran d'Accueil Hybride :
- Bouton de bascule Client / Gérant (visible uniquement pour les Gérants).
- Vue Client : barre de recherche, carrousel de catégories, FlatList des établissements (bf_etablissements).
- Vue Gérant : formulaire d'ajout de plat au menu du jour (bf_menu_du_jour), liste des plats publiés.
- Déconnexion via supabase.auth.signOut().
`
    : `
Spécifications Connexion/Inscription :
- Champs : Nom complet, Téléphone béninois (+229), Mot de passe.
- Sélecteur de rôle stylisé : Client, Gérant de Restaurant/Maquis.
- Note informatique pour les Livreurs (inscription admin uniquement).
- Validation des champs et affichage d'erreurs claires.
`
}
- Style : moderne, épuré, couleur principale ${themeColor || "#E15C17"}.
- Langue : ${language || "Français"}.
- NativeWind (className Tailwind).
- Icônes lucide-react-native.
- useState pour la gestion d'état.
- Instructions supplémentaires : "${customInstructions || "Aucune"}"

Renvoie UNIQUEMENT le code TypeScript (.tsx) complet, sans texte ni balises markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",  // ✅ Modèle corrigé
      contents: prompt,
    });

    let code = (response.text || "").trim();
    // Nettoyer les balises markdown éventuelles
    code = code
      .replace(/^```(?:typescript|tsx|ts)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    if (!code || code.length < 100) {
      return res.status(500).json({ error: "Réponse IA vide ou trop courte. Réessayez." });
    }

    return res.json({ success: true, code });

  } catch (error: any) {
    console.error("Gemini error:", error?.message || error);

    const errStr = (error?.message || "").toLowerCase();
    if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("resource_exhausted")) {
      return res.status(429).json({
        error: "Quota Gemini dépassé. Patientez quelques secondes et réessayez.",
      });
    }
    if (errStr.includes("api_key") || errStr.includes("invalid key")) {
      return res.status(401).json({
        error: "Clé API Gemini invalide. Vérifiez votre configuration.",
      });
    }

    return res.status(500).json({ error: "Erreur lors de la génération IA. Réessayez." });
  }
});

// ─── Santé du serveur ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    gemini: !!ai,
    supabase: !!SUPABASE_URL,
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ─── Démarrage serveur ────────────────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1h" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ BéninFood Server → http://localhost:${PORT}`);
    console.log(`   Gemini : ${ai ? "✅ Prêt" : "⚠️  Clé manquante"}`);
    console.log(`   Supabase : ${SUPABASE_URL}`);
  });
}

startServer();
