import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { tokens } from "@/lib/tokens";

function TabLabel({ label }: { label: string }) {
  return <Text style={{ color: tokens.colors.ink[200], fontSize: 11 }}>{label}</Text>;
}

export default function AthleteLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/signin" />;
  if (user.role === "coach") return <Redirect href="/(coach)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.colors.ink[950],
          borderTopColor: tokens.colors.ink[800]
        },
        tabBarActiveTintColor: tokens.colors.brand[400],
        tabBarInactiveTintColor: tokens.colors.ink[500]
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: () => <TabLabel label="Home" /> }} />
      <Tabs.Screen name="discover" options={{ title: "Discover", tabBarLabel: () => <TabLabel label="Discover" /> }} />
      <Tabs.Screen name="sessions" options={{ title: "Sessions", tabBarLabel: () => <TabLabel label="Sessions" /> }} />
      <Tabs.Screen name="programs" options={{ title: "Programs", tabBarLabel: () => <TabLabel label="Programs" /> }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarLabel: () => <TabLabel label="Community" /> }} />
      <Tabs.Screen name="sessions/[id]/room" options={{ href: null }} />
    </Tabs>
  );
}
