import { MobileSession } from "@/lib/mock-data";
import { tokens } from "@/lib/tokens";
import { formatDate } from "@fitconnect/utils";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type SessionCardProps = {
  session: MobileSession;
};

export function SessionCard({ session }: SessionCardProps) {
  const upcoming = session.status === "upcoming";
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.coach}>{session.coachName}</Text>
          <Text style={styles.meta}>
            {session.sport} · {formatDate(session.startsAt)}
          </Text>
        </View>
        <Badge label={upcoming ? "Upcoming" : "Done"} tone={upcoming ? "brand" : "accent"} />
      </View>
      {upcoming && (
        <Link href={`/(athlete)/sessions/${session.id}/room`} asChild>
          <Button label="Join video room" />
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.ink[900],
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    padding: 14,
    gap: 12
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  coach: { color: tokens.colors.ink[50], fontSize: 16, fontWeight: "700" },
  meta: { color: tokens.colors.ink[400], fontSize: 12, marginTop: 4 }
});
