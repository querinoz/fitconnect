import { MobileCoach } from "@/lib/mock-data";
import { tokens } from "@/lib/tokens";
import { formatPrice } from "@fitconnect/utils";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type CoachCardProps = {
  coach: MobileCoach;
  onPress?: () => void;
  onBook?: () => void;
};

export function CoachCard({ coach, onPress, onBook }: CoachCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{coach.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{coach.name}</Text>
          <Text style={styles.headline}>{coach.headline}</Text>
          <View style={styles.badges}>
            <Badge label={coach.sport} />
            {coach.match != null && <Badge label={`${coach.match}% match`} tone="accent" />}
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.rating}>⭐ {coach.rating} · {coach.reviews} reviews</Text>
        <Text style={styles.price}>{formatPrice(coach.price)}/h</Text>
      </View>
      <Button label="Book free 15-min intro" onPress={onBook} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.ink[900],
    borderRadius: tokens.radius["2xl"],
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    padding: 16,
    gap: 12
  },
  row: { flexDirection: "row", gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(34,211,238,0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { color: tokens.colors.brand[400], fontWeight: "800", fontSize: 20 },
  meta: { flex: 1, gap: 4 },
  name: { color: tokens.colors.ink[50], fontSize: 17, fontWeight: "700" },
  headline: { color: tokens.colors.ink[400], fontSize: 13 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rating: { color: tokens.colors.ink[300], fontSize: 12 },
  price: { color: tokens.colors.ink[100], fontWeight: "700" }
});
