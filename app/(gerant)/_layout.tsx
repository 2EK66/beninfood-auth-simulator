import { Tabs } from "expo-router";
import { LayoutDashboard, UtensilsCrossed, Wallet } from "lucide-react-native";

export default function GerantLayout() {
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
          title: "Tableau",
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Mon Menu",
          tabBarIcon: ({ color }) => <UtensilsCrossed size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portefeuille"
        options={{
          title: "Finances",
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
