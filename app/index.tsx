import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/(auth)/login");
    } else if (user.role === "Gérant") {
      router.replace("/(gerant)/home");
    } else if (user.role === "Livreur") {
      router.replace("/(livreur)/courses");
    } else {
      router.replace("/(client)/home");
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0f0d", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#fcd116" size="large" />
    </View>
  );
}
