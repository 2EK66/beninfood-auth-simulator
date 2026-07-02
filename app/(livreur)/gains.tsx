import LivreurGainsScreen from "../../src/screens/livreur/LivreurGainsScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
export default function Gains() {
  const { user } = useAuth();
  if (!user) return <View className="flex-1 bg-[#0a0f0d] items-center justify-center"><ActivityIndicator color="#fcd116" /></View>;
  return <LivreurGainsScreen user={user} />;
}
