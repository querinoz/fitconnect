import { Card } from "@/components/ui/card";
import { DEMO_ATHLETES } from "@/lib/mock-data";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { tokens } from "@/lib/tokens";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function CoachAthletesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Athlete roster</Text>
      {DEMO_ATHLETES.map((athlete) => (
        <Card key={athlete.id}>
          <Text style={styles.name}>{athlete.name}</Text>
          <Text style={styles.meta}>
            {athlete.sport} · HRV trend {athlete.trend} · readiness {athlete.readiness}%
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: SCROLL_BOTTOM_INSET },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  name: { color: tokens.colors.ink[50], fontWeight: "700", fontSize: 16 },
  meta: { color: tokens.colors.ink[400], fontSize: 13, marginTop: 4 }
});
