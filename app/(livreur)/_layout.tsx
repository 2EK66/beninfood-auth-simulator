import { Tabs } from "expo-router";
import { Bike, MapPin, Wallet } from "lucide-react-native";

export default function LivreurLayout() {
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
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color }) => <Bike size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="livraison"
        options={{
          title: "En route",
          tabBarIcon: ({ color }) => <MapPin size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gains"
        options={{
          title: "Mes gains",
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
