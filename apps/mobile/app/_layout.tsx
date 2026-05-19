import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { registerForPushNotificationsAsync } from "@/lib/notifications";

/** Expo root — push registration + stack navigator. Realtime via useMobileChannel bridge. */

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) void registerForPushNotificationsAsync();
  }, [user]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(athlete)" />
        <Stack.Screen name="(coach)" />
      </Stack>
    </>
  );
}
