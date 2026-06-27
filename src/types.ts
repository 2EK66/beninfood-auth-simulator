export type UserRole = "Client" | "Gérant de Restaurant/Maquis" | "Livreur" | "Gérant";

export interface CustomizationOptions {
  screenType: "both" | "login" | "signup" | "home";
  themeColor: string;
  themeColorHex: string;
  language: string;
  customInstructions: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  primary: string; // Tailwind class like bg-orange-600
  text: string;    // Tailwind text class like text-orange-600
  border: string;  // Tailwind border class like border-orange-600
  hex: string;     // Exact hex code
}

export interface AuthState {
  isLoggedIn: boolean;
  user: {
    name?: string;
    phone: string;
    role: UserRole;
  } | null;
  token?: string;
}
