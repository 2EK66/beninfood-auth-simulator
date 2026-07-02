import LoginScreen from "../../src/screens/auth/LoginScreen";
import { useRouter } from "expo-router";
export default function Login() {
  const router = useRouter();
  return <LoginScreen onToggle={() => router.push("/(auth)/register")} />;
}
