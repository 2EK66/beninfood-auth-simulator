import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Endpoint to generate customized React Native components using Gemini
app.post("/api/generate-component", async (req, res) => {
  try {
    const { customInstructions, screenType, themeColor, language } = req.body;

    if (!ai) {
      return res.status(500).json({ 
        error: "Le client de l'API Gemini n'est pas initialisé. Veuillez configurer votre clé API dans les secrets du panneau Settings." 
      });
    }

    const prompt = `
Tu es un expert mondial en développement d'applications mobiles React Native avec Expo, TypeScript et NativeWind (Tailwind CSS pour mobile).
On souhaite générer ${screenType === 'both' ? "l'écran de Connexion et d'Inscription" : screenType === 'login' ? "l'écran de Connexion uniquement" : screenType === 'signup' ? "l'écran d'Inscription uniquement" : "l'écran d'accueil principal hybride (HomeScreen)"}.
L'application s'appelle "BeninFood", une plateforme de livraison de repas au Bénin (Afrique de l'Ouest).

${screenType === 'home' ? `
Spécifications pour l'Écran d'Accueil Hybride (HomeScreen) :
- S'adresse à un utilisateur qui a le rôle "Gérant" ou "Gérant de Restaurant/Maquis" et qui peut basculer entre la vue "Client" et la vue "Gérant" grâce à un bouton de bascule visible uniquement pour son rôle.
- 1. Le Header doit afficher dynamiquement "Akwaaba 👋" en mode client, et "Mon Maquis 🏢" en mode gérant.
- 2. La vue Client : Une belle barre de recherche de maquis, un carrousel de badges stylisés (Maquis 🇧🇯, Fast-Food, Pâtisseries, Grillades/Choukouya), et une FlatList affichant les maquis et plats du jour de la table bf_etablissements (nom, catégorie, image, note).
- 3. La vue Gérant : Un formulaire complet permettant au restaurateur d'ajouter un nouveau plat au "Menu du jour" (nom du plat, prix en FCFA, accompagnement ou description) avec un bouton de publication, ainsi qu'une liste affichant les plats du jour déjà publiés.
- 4. Inclure une fonction de déconnexion liée à "supabase.auth.signOut()".
` : `
Spécifications pour l'Inscription (Sign Up) et Connexion :
- Demander le Nom complet, le Téléphone (format béninois avec indicatif ou de type local).
- Inclure un sélecteur de rôle ultra stylisé (cartes interactives cliquables) pour choisir son rôle parmi : 'Client', 'Gérant de Restaurant/Maquis' ou 'Livreur'.
- Gérer la validation de formulaire de base et l'affichage d'erreurs claires.
`}
- Le style doit être moderne, épuré, dynamique et accueillant.
- Couleur principale souhaitée pour les boutons, états actifs et accents : ${themeColor || 'Orange Gastronomique (#E15C17)'}.
- Langue privilégiée de l'interface : ${language || 'Français'}.
- Utiliser NativeWind (classes Tailwind standard className="...").
- Importer les icônes de "lucide-react-native" pour ajouter une touche visuelle élégante.
- Gérer l'état local (useState) de manière irréprochable.

Instructions de personnalisation supplémentaires fournies par l'utilisateur :
"${customInstructions || 'Aucune consigne supplémentaire.'}"

Renvoie UNIQUEMENT le code source TypeScript (.tsx) complet et propre, prêt à être copié-collé. Ne mets aucun texte d'introduction ou de conclusion en dehors du code. Ne mets pas de balises markdown de bloc de code (comme \`\`\`tsx). Ton retour doit pouvoir être écrit directement dans un fichier Expo sans aucune modification.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const code = response.text || "";
    // Clean any accidental markdown wrappers if the model didn't follow the instructions strictly
    let cleanedCode = code.trim();
    if (cleanedCode.startsWith("```typescript")) {
      cleanedCode = cleanedCode.substring("```typescript".length).trim();
    } else if (cleanedCode.startsWith("```tsx")) {
      cleanedCode = cleanedCode.substring("```tsx".length).trim();
    } else if (cleanedCode.startsWith("```ts")) {
      cleanedCode = cleanedCode.substring("```ts".length).trim();
    } else if (cleanedCode.startsWith("```")) {
      cleanedCode = cleanedCode.substring("```".length).trim();
    }
    if (cleanedCode.endsWith("```")) {
      cleanedCode = cleanedCode.substring(0, cleanedCode.length - 3).trim();
    }

    res.json({ success: true, code: cleanedCode });
  } catch (error: any) {
    console.error("Error generating component:", error);
    let errorMessage = error.message || "Une erreur s'est produite lors de la génération avec l'IA.";
    const errStr = JSON.stringify(error).toLowerCase() + " " + String(error.message).toLowerCase();
    
    if (
      errStr.includes("429") || 
      errStr.includes("quota") || 
      errStr.includes("resource_exhausted") || 
      errStr.includes("rate limit") || 
      error.status === 429
    ) {
      errorMessage = "La limite de requêtes (quota) de l'API Gemini gratuite a été dépassée. Veuillez attendre quelques secondes ou configurer votre propre clé API Gemini (GEMINI_API_KEY) dans les paramètres (icône Engrenage > Secrets) pour continuer sans interruption.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Endpoint to simulate authentication submission
app.post("/api/mock-auth", (req, res) => {
  const { action, name, phone, password, role } = req.body;

  if (action === "register") {
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "Tous les champs (Nom, Téléphone, Mot de passe, Rôle) sont requis." });
    }
    if (phone.length < 8) {
      return res.status(400).json({ success: false, message: "Le numéro de téléphone béninois doit contenir au moins 8 chiffres." });
    }
    
    // Simulate successful registration
    return res.json({
      success: true,
      message: "Inscription réussie sur BeninFood !",
      data: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenForBeninFile",
        user: { name, phone, role }
      }
    });
  } else {
    // login
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Téléphone et mot de passe requis." });
    }
    return res.json({
      success: true,
      message: "Connexion réussie à BeninFood !",
      data: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenForBeninFile",
        user: { name: "M. Sylvain Kodjo", phone, role: "Client" }
      }
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
