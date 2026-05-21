import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n-provider";
import { NivisTabBar } from "@/components/nivis-tab-bar";

export default function AthleteLayout() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  if (!user) return <Redirect href="/(auth)/signin" />;
  if (user.role === "coach") return <Redirect href="/(coach)" />;

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
          title: t("tabs", "today"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
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
        name="map"
        options={{
          title: t("tabs", "map"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: t("tabs", "coach"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs", "profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="programs" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="sessions/[id]/room" options={{ href: null }} />
    </Tabs>
  );
}
