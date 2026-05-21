import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n-provider";
import { NivisTabBar } from "@/components/nivis-tab-bar";

export default function CoachLayout() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  if (!user) return <Redirect href="/(auth)/signin" />;
  if (user.role !== "coach" && user.role !== "admin") {
    return <Redirect href="/(athlete)" />;
  }

  return (
    <Tabs
      tabBar={(props) => <NivisTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs", "overview"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="athletes"
        options={{
          title: t("tabs", "athletes"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t("tabs", "map"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: t("tabs", "sessions"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: t("tabs", "earnings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
