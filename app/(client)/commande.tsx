import { useAuth } from "../../src/hooks/useAuth";
import CommandeScreen from "../../src/screens/client/CommandeScreen";
import { View, ActivityIndicator } from "react-native";

export default function Commande() {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0f0d", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fcd116" />
      </View>
    );
  }

  return <CommandeScreen user={user} />;
}
```eof

Le fichier d'écran est prêt et parfaitement connecté à votre composant existant !
