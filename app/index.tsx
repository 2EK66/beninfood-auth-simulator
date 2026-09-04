import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../src/hooks/useAuth";

const CLIENT_CHOICE_KEY = "bf_has_chosen_client";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const decide = async () => {
      if (!user) {
        const hasChosenClient = await SecureStore.getItemAsync(CLIENT_CHOICE_KEY);

        if (hasChosenClient === "true") {
          router.replace("/(client)/home");
        } else {
          router.replace("/(auth)/welcome");
        }
        return;
      }

      if (user.role === "Gérant") {
        router.replace("/(gerant)/home");
      } else if (user.role === "Livreur") {
        router.replace("/(livreur)/courses");
      } else {
        router.replace("/(client)/home");
      }
    };

    decide();
  }, [user, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0f0d", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#fcd116" size="large" />
    </View>
  );
}
