import { SessionCard } from "@/components/session-card";
import { DEMO_SESSIONS } from "@/lib/mock-data";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { tokens } from "@/lib/tokens";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function CoachSessionsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Agenda</Text>
      {DEMO_SESSIONS.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: SCROLL_BOTTOM_INSET },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" }
});
