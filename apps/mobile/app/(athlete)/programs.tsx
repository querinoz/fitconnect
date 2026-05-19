import { DEMO_PROGRAMS } from "@/lib/mock-data";
import { tokens } from "@/lib/tokens";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";

export default function ProgramsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Programs</Text>
      {DEMO_PROGRAMS.map((program) => (
        <Card key={program.id}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <Text style={styles.meta}>
            {program.sport} · {program.weeks} weeks · {program.coachName}
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${program.progress}%` }]} />
          </View>
          <Text style={styles.progress}>{program.progress}% complete</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800", marginBottom: 4 },
  programTitle: { color: tokens.colors.ink[50], fontSize: 17, fontWeight: "700" },
  meta: { color: tokens.colors.ink[400], fontSize: 12, marginTop: 4, marginBottom: 10 },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: tokens.colors.ink[800],
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    backgroundColor: tokens.colors.brand[400]
  },
  progress: { color: tokens.colors.ink[300], fontSize: 12, marginTop: 6 }
});
