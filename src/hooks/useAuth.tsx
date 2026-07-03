import { useState, useEffect } from "react";
import { supabase, getBfProfile } from "../lib/supabase";
import { BfProfile } from "../types";

interface AuthState {
  user: BfProfile | null;
  loading: boolean;
  initialized: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Vérifier la session existante au démarrage
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getBfProfile(session.user.id);
        setState({ user: profile, loading: false, initialized: true });
      } else {
        setState({ user: null, loading: false, initialized: true });
      }
    });

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await getBfProfile(session.user.id);
          setState(prev => ({ ...prev, user: profile, loading: false }));
        } else if (event === "SIGNED_OUT") {
          setState({ user: null, loading: false, initialized: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
