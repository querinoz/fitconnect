import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useAuthStore } from "@/lib/auth-store";

const API_BASE = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3001";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const tokenResult = await Notifications.getExpoPushTokenAsync().catch(() => null);
  const userId = useAuthStore.getState().user?.id;
  if (tokenResult?.data && userId) {
    await fetch(`${API_BASE}/api/v1/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        token: tokenResult.data,
        platform: Platform.OS
      })
    }).catch(() => undefined);
  }

  return tokenResult;
}

export async function scheduleDemoSessionReminder(coachName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Session in 30 minutes",
      body: `Your session with ${coachName} starts soon.`,
      data: { url: "fitconnect-expo://sessions/s-101" }
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 }
  });
}
