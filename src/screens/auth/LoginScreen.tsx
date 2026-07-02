import { useRouter } from "expo-router";
import LoginScreen from "../../src/screens/auth/LoginScreen";

export default function Login() {
  const router = useRouter();
  return <LoginScreen onToggle={() => router.replace("/(auth)/register")} />;
}
