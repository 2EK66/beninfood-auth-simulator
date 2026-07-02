import { Tabs } from "expo-router";
import { Home, ShoppingBag, Calendar } from "lucide-react-native";

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d1a12",
          borderTopColor: "#1a2e1f",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#fcd116",
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="commande"
        options={{
          title: "Commander",
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: "Réserver",
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
