import { Card } from "@/components/ui/card";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { tokens } from "@/lib/tokens";
import { formatPrice } from "@fitconnect/utils";
import { ScrollView, StyleSheet, Text } from "react-native";

const PAYOUTS = [
  { id: "p1", athlete: "Inês M.", amount: 55, status: "paid" },
  { id: "p2", athlete: "Pedro S.", amount: 65, status: "pending" }
];

export default function CoachEarningsScreen() {
  const mrr = 1240;
  const takeHome = Math.round(mrr * 0.85);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Earnings</Text>
      <Card>
        <Text style={styles.kpiLabel}>This month</Text>
        <Text style={styles.kpiValue}>{formatPrice(mrr)}</Text>
        <Text style={styles.kpiSub}>You keep {formatPrice(takeHome)} (85%)</Text>
      </Card>
      {PAYOUTS.map((p) => (
        <Card key={p.id}>
          <Text style={styles.rowTitle}>{p.athlete}</Text>
          <Text style={styles.rowMeta}>
            {formatPrice(p.amount)} · {p.status}
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
  kpiLabel: { color: tokens.colors.ink[400], fontSize: 12, fontWeight: "700" },
  kpiValue: { color: tokens.colors.ink[50], fontSize: 32, fontWeight: "800", marginTop: 4 },
  kpiSub: { color: tokens.colors.accent[400], marginTop: 4 },
  rowTitle: { color: tokens.colors.ink[100], fontWeight: "700" },
  rowMeta: { color: tokens.colors.ink[400], marginTop: 4 }
});
