import { useState, useEffect } from "react";
import { supabase, getBfProfile } from "../lib/supabase";
import { BfProfile } from "../types";

interface AuthState {
  user: BfProfile | null;
  loading: boolean;
  initialized: boolean;
}

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

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const profile = await waitForProfile(session.user.id);

          if (!mounted) return;

          setState({
            user: profile,
            loading: false,
            initialized: true,
          });
        } else {
          setState({
            user: null,
            loading: false,
            initialized: true,
          });
        }
      } catch (e) {
        console.error("Auth init :", e);

        if (!mounted) return;

        setState({
          user: null,
          loading: false,
          initialized: true,
        });
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      try {
        if (session?.user) {
          const profile = await waitForProfile(session.user.id);

          if (!mounted) return;

          setState({
            user: profile,
            loading: false,
            initialized: true,
          });
        } else {
          if (!mounted) return;

          setState({
            user: null,
            loading: false,
            initialized: true,
          });
        }
      } catch (e) {
        console.error("Auth listener :", e);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
