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
 * Attend que le trigger SQL ait créé le profil.
 */
async function waitForProfile(
  userId: string,
  retries = 10,
  delay = 500
): Promise<BfProfile | null> {
  for (let i = 0; i < retries; i++) {
    const profile = await getBfProfile(userId);

    if (profile) {
      return profile;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return null;
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
          name: name.trim(),
          phone: cleanPhone,
          role,
        },
      },
    });

    console.log("========== RÉPONSE SUPABASE ==========");
    console.log({
      user: data.user?.id,
      session: !!data.session,
      error,
    });

    if (error) {
      console.error(error);

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

    // Attendre que le trigger SQL crée bf_profiles
    const profile = await waitForProfile(data.user.id);

    if (!profile) {
      console.warn("Le profil n'a pas encore été créé.");

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

    console.log("========== RÉPONSE SUPABASE ==========");
    console.log({
      user: data.user?.id,
      session: !!data.session,
      error,
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

    const profile = await waitForProfile(data.user.id);

    if (!profile) {
      return {
        success: false,
        error:
          "Votre profil est en cours de création. Réessayez dans quelques secondes.",
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
