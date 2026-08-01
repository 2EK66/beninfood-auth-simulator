import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import CommandeScreen from "../../src/screens/client/CommandeScreen";

export default function Commande() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0f0d",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fcd116" />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0f0d",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fcd116" />
      </View>
    );
  }

  return <CommandeScreen user={user} />;
}
