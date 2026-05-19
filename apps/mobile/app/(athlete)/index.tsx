import { OfflineBanner } from "@/components/offline-banner";
import { RecoveryRing } from "@/components/recovery-ring";
import { Card } from "@/components/ui/card";
import { useOffline } from "@/hooks/useOffline";
import { useReadiness } from "@/hooks/useReadiness";
import { DEMO_POSTS, DEMO_SESSIONS } from "@/lib/mock-data";
import { readinessGreeting } from "@/lib/readiness";
import { useAuthStore } from "@/lib/auth-store";
import { tokens } from "@/lib/tokens";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AthleteHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const readiness = useReadiness();
  const offline = useOffline();
  const nextSession = DEMO_SESSIONS.find((s) => s.status === "upcoming");

  return (
    <View style={styles.screen}>
      {offline && <OfflineBanner />}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor={tokens.colors.brand[400]} refreshing={false} onRefresh={() => undefined} />}
      >
        <Text style={styles.greeting}>
          {readinessGreeting(user?.name ?? "Athlete", readiness.score)}
        </Text>
        <View style={styles.ringWrap}>
          <RecoveryRing score={readiness.score} label={readiness.label} />
        </View>
        <View style={styles.statsRow}>
          <Card style={styles.stat}>
            <Text style={styles.statLabel}>HRV</Text>
            <Text style={styles.statValue}>{readiness.hrvMs}ms</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statLabel}>Sleep</Text>
            <Text style={styles.statValue}>{readiness.sleepHours}h</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statLabel}>Strain</Text>
            <Text style={styles.statValue}>{readiness.strainScore}</Text>
          </Card>
        </View>
        <Card tone="plasma">
          <Text style={styles.nudgeTitle}>AI nudge</Text>
          <Text style={styles.nudgeBody}>
            HRV +4ms vs baseline — your coach suggests holding threshold work today.
          </Text>
        </Card>
        {nextSession && (
          <Card>
            <Text style={styles.sectionTitle}>Next session</Text>
            <Text style={styles.sessionMeta}>
              {nextSession.coachName} · {nextSession.sport}
            </Text>
          </Card>
        )}
        <Text style={styles.sectionTitle}>Community</Text>
        {DEMO_POSTS.slice(0, 2).map((post) => (
          <Card key={post.id}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postBody}>{post.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  greeting: { color: tokens.colors.ink[100], fontSize: 22, fontWeight: "800" },
  ringWrap: { alignItems: "center", paddingVertical: 8 },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, padding: 12 },
  statLabel: { color: tokens.colors.ink[500], fontSize: 11, fontWeight: "700" },
  statValue: { color: tokens.colors.ink[50], fontSize: 18, fontWeight: "800", marginTop: 4 },
  nudgeTitle: { color: tokens.colors.plasma[500], fontWeight: "800", marginBottom: 4 },
  nudgeBody: { color: tokens.colors.ink[200], fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: tokens.colors.ink[50], fontSize: 16, fontWeight: "700" },
  sessionMeta: { color: tokens.colors.ink[300], marginTop: 4 },
  postAuthor: { color: tokens.colors.ink[100], fontWeight: "700" },
  postBody: { color: tokens.colors.ink[400], marginTop: 4, fontSize: 13 }
});
