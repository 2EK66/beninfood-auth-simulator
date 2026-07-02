import { useRouter } from "expo-router";
import RegisterScreen from "../../src/screens/auth/RegisterScreen";

export default function Register() {
  const router = useRouter();
  return <RegisterScreen onToggle={() => router.replace("/(auth)/login")} />;
}
