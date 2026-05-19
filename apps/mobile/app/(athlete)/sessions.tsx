import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { DEMO_SESSIONS } from "@/lib/mock-data";
import { writeSessionsCache } from "@/lib/cache";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { scheduleDemoSessionReminder } from "@/lib/notifications";
import { tokens } from "@/lib/tokens";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function SessionsScreen() {
  useEffect(() => {
    writeSessionsCache(DEMO_SESSIONS);
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sessions</Text>
      <Button
        label="Schedule demo reminder"
        variant="ghost"
        onPress={() => scheduleDemoSessionReminder("Tomás Ribeiro")}
      />
      {DEMO_SESSIONS.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: SCROLL_BOTTOM_INSET },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800", marginBottom: 4 }
});
