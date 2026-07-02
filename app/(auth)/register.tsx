import RegisterScreen from "../../src/screens/auth/RegisterScreen";
import { useRouter } from "expo-router";
export default function Register() {
  const router = useRouter();
  return <RegisterScreen onToggle={() => router.push("/(auth)/login")} />;
}
