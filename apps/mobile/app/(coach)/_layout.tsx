import { Redirect, Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { TAB_BAR_HEIGHT } from "@/lib/layout";
import { tokens } from "@/lib/tokens";

function TabLabel({ label }: { label: string }) {
  return <Text style={{ color: tokens.colors.ink[200], fontSize: 11 }}>{label}</Text>;
}

export default function CoachLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/signin" />;
  if (user.role !== "coach" && user.role !== "admin") {
    return <Redirect href="/(athlete)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.colors.ink[950],
          borderTopColor: tokens.colors.ink[800],
          height: TAB_BAR_HEIGHT,
          paddingBottom: Platform.OS === "ios" ? 22 : 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: tokens.colors.accent[400],
        tabBarInactiveTintColor: tokens.colors.ink[500]
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Overview", tabBarLabel: () => <TabLabel label="Overview" /> }} />
      <Tabs.Screen name="athletes" options={{ title: "Athletes", tabBarLabel: () => <TabLabel label="Athletes" /> }} />
      <Tabs.Screen name="sessions" options={{ title: "Sessions", tabBarLabel: () => <TabLabel label="Sessions" /> }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings", tabBarLabel: () => <TabLabel label="Earnings" /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarLabel: () => <TabLabel label="Settings" /> }} />
    </Tabs>
  );
}
