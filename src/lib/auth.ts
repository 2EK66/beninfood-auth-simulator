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

export async function signUp({
  name,
  phone,
  password,
  role,
}: SignUpParams): Promise<AuthResult> {
  try {
    const cleanPhone = sanitizePhone(phone);
    const email = buildPhoneEmail(cleanPhone);

    console.log("========== SIGNUP ==========");
    console.log({
      email,
      phone: cleanPhone,
      role,
    });

    // Les livreurs sont créés uniquement par un administrateur
    if (role === "Livreur") {
      return {
        success: false,
        error:
          "Les comptes Livreurs sont créés uniquement par l'administrateur BéninFood.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(), // correspond au trigger SQL
          phone: cleanPhone,
          role,
        },
      },
    });

    console.log("Réponse signUp :", { data, error });

    if (error) {
      console.error("Erreur Supabase :", error);

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

    /*
     * IMPORTANT
     *
     * Le trigger SQL handle_new_user()
     * crée automatiquement bf_profiles.
     *
     * On ne fait plus de upsert ici.
     */

    const profile = await getBfProfile(data.user.id);

    if (!profile) {
      return {
        success: true,
        user: {
          id: data.user.id,
          name: name.trim(),
          phone: cleanPhone,
          role,
        },
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

    console.log("========== SIGNIN ==========");
    console.log(email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Réponse signIn :", { data, error });

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

    const profile = await getBfProfile(data.user.id);

    if (!profile) {
      return {
        success: false,
        error: "Votre profil est introuvable.",
      };
    }

    return {
      success: true,
      user: profile,
    };
  } catch (e: any) {
    console.error("Exception signIn :", e);

    return {
      success: false,
      error: e?.message ?? "Une erreur inattendue est survenue.",
    };
  }
}
