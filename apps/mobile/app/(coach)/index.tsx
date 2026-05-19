import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_ATHLETES } from "@/lib/mock-data";
import { useAuthStore } from "@/lib/auth-store";
import { tokens } from "@/lib/tokens";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function CoachOverviewScreen() {
  const user = useAuthStore((s) => s.user);
  const alerts = DEMO_ATHLETES.filter((a) => a.readiness < 60);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome back, {user?.name?.split(" ")[0] ?? "Coach"}</Text>
      <Text style={styles.subtitle}>{alerts.length} athletes need attention</Text>
      {DEMO_ATHLETES.map((athlete) => (
        <Card key={athlete.id}>
          <Text style={styles.name}>{athlete.name}</Text>
          <Text style={styles.meta}>{athlete.sport}</Text>
          <Badge
            label={`Readiness ${athlete.readiness}% (${athlete.trend})`}
            tone={athlete.readiness < 60 ? "signal" : "accent"}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  subtitle: { color: tokens.colors.ink[400], marginBottom: 8 },
  name: { color: tokens.colors.ink[50], fontWeight: "700", fontSize: 16 },
  meta: { color: tokens.colors.ink[400], fontSize: 12, marginVertical: 6 }
});
