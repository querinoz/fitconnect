import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppIntroSplash } from "@/components/app-intro-splash";
import { useAuthStore } from "@/lib/auth-store";
import { LanguageProvider } from "@/lib/i18n-provider";
import { registerForPushNotificationsAsync } from "@/lib/notifications";

/** Expo root — push registration + stack navigator. Realtime via useMobileChannel bridge. */

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) void registerForPushNotificationsAsync();
  }, [user]);

  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <AppIntroSplash />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(athlete)" />
        <Stack.Screen name="(coach)" />
      </Stack>
    </LanguageProvider>
  );
}
