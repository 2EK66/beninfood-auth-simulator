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

export async function signUp({ name, phone, password, role }: SignUpParams): Promise<AuthResult> {
  const cleanPhone = sanitizePhone(phone);
  const email = buildPhoneEmail(cleanPhone);

  // Livreurs bloqués côté client aussi
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
        full_name: name.trim(),
        phone: cleanPhone,
        role,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Ce numéro est déjà enregistré. Connectez-vous." };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) return { success: false, error: "Échec de la création du compte." };

  // Créer le profil BéninFood
  const bfRole = role === "Gérant" ? "Gérant" : "Client";
  await supabase.from("bf_profiles").upsert({
    id: data.user.id,
    name: name.trim(),
    phone: cleanPhone,
    role: bfRole,
  });

  return {
    success: true,
    user: { id: data.user.id, name: name.trim(), phone: cleanPhone, role: bfRole },
  };
}

export async function signIn({ phone, password }: { phone: string; password: string }): Promise<AuthResult> {
  const cleanPhone = sanitizePhone(phone);
  const email = buildPhoneEmail(cleanPhone);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
      return { success: false, error: "Numéro ou mot de passe incorrect." };
    }
    return { success: false, error: error.message };
  }

  if (!data.user || !data.session) {
    return { success: false, error: "Échec de la connexion." };
  }

  const profile = await getBfProfile(data.user.id);
  if (!profile) {
    return { success: false, error: "Profil introuvable. Contactez le support." };
  }

  return { success: true, user: profile };
}
