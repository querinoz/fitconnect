import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n-provider";
import { DEMO_COACHES } from "@/lib/mock-data";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { tokens } from "@/lib/tokens";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function AthleteCoachScreen() {
  const t = useT();
  const coach = DEMO_COACHES[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("coach", "title")}</Text>
      <Text style={styles.subtitle}>{t("coach", "subtitle")}</Text>
      <Card>
        <Text style={styles.coachName}>{coach.name}</Text>
        <Text style={styles.coachMeta}>
          {coach.sport} · {coach.rating}★ · {coach.reviews} reviews
        </Text>
        <Text style={styles.coachBio}>{coach.headline}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: SCROLL_BOTTOM_INSET },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  subtitle: { color: tokens.colors.ink[400], fontSize: 14 },
  coachName: { color: tokens.colors.ink[50], fontSize: 18, fontWeight: "700" },
  coachMeta: { color: tokens.colors.ink[400], fontSize: 13, marginTop: 4 },
  coachBio: { color: tokens.colors.ink[300], fontSize: 14, marginTop: 8, lineHeight: 20 }
});
