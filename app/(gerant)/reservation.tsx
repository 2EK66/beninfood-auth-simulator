import GerantReservationsScreen from "../../src/screens/gerant/GerantReservationsScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function GerantReservationPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <View className="flex-1 bg-[#0a0f0d] items-center justify-center">
        <ActivityIndicator size="large" color="#fcd116" />
      </View>
    );
  }

  return <GerantReservationsScreen user={user} />;
}
