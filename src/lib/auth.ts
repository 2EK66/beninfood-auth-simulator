import { supabase, buildPhoneEmail, sanitizePhone, getBfProfile } from "./supabase";
import { BfProfile, UserRole } from "../types";

interface SignUpParams {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface AuthResult {
  success: boolean;
  user?: BfProfile;
  error?: string;
}

/**
 * Attend que le trigger SQL ait créé le profil (SignUp uniquement).
 */
async function waitForProfile(
  userId: string,
  retries = 5,
  delay = 400
): Promise<BfProfile | null> {
  for (let i = 0; i < retries; i++) {
    const profile = await getBfProfile(userId);

    if (profile) {
      return profile as BfProfile;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return null;
}

/* ===========================
   INSCRIPTION (SIGN UP)
=========================== */

export async function signUp({
  name,
  phone,
  password,
  role,
}: SignUpParams): Promise<AuthResult> {
  try {
    const cleanPhone = sanitizePhone(phone);
    const email = buildPhoneEmail(cleanPhone);

    if (role === "Livreur") {
      return {
        success: false,
        error: "Les comptes Livreurs sont créés uniquement par l'administrateur BéninFood.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          phone: cleanPhone,
          role,
        },
      },
    });

    if (error) {
      console.error("Erreur Auth SignUp:", error.message);

      if (error.message.toLowerCase().includes("already")) {
        return {
          success: false,
          error: "Ce numéro est déjà enregistré.",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Impossible de créer le compte.",
      };
    }

    // Attendre la création du profil par le trigger SQL
    const profile = await waitForProfile(data.user.id);

    if (!profile) {
      return {
        success: true,
        user: {
          id: data.user.id,
          name: name.trim(),
          phone: cleanPhone,
          role,
        } as BfProfile,
      };
    }

    return {
      success: true,
      user: profile,
    };
  } catch (e: any) {
    console.error("Exception signUp :", e);

    return {
      success: false,
      error: e?.message ?? "Une erreur inattendue est survenue.",
    };
  }
}

/* ===========================
   CONNEXION (SIGN IN)
=========================== */

export async function signIn({
  phone,
  password,
}: {
  phone: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const cleanPhone = sanitizePhone(phone);
    const email = buildPhoneEmail(cleanPhone);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid_credentials")
      ) {
        return {
          success: false,
          error: "Numéro ou mot de passe incorrect.",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Connexion impossible.",
      };
    }

    // Récupération directe sans boucle d'attente inutile
    const profile = await getBfProfile(data.user.id);

    if (!profile) {
      return {
        success: false,
        error: "Profil introuvable. Veuillez contacter le support.",
      };
    }

    return {
      success: true,
      user: profile as BfProfile,
    };
  } catch (e: any) {
    console.error("Exception signIn :", e);

    return {
      success: false,
      error: e?.message ?? "Une erreur inattendue est survenue.",
    };
  }
}

/* ===========================
   DÉCONNEXION (SIGN OUT)
=========================== */

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    console.error("Exception signOut :", e);
    return {
      success: false,
      error: e?.message ?? "Erreur lors de la déconnexion.",
    };
  }
}
