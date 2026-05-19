import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/auth-store";

export default function Index() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Redirect href="/(auth)/signin" />;
  if (user.role === "coach") return <Redirect href="/(coach)" />;
  return <Redirect href="/(athlete)" />;
}
