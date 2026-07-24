import HomeScreen from "../../src/screens/client/HomeScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View className="flex-1 bg-[#0a0f0d] items-center justify-center">
        <ActivityIndicator color="#fcd116" />
      </View>
    );
  }

  return <HomeScreen user={user} />;
}
