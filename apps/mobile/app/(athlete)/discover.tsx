import { CoachFinderQuiz } from "@/components/coach-finder-quiz";
import { CoachCard } from "@/components/coach-card";
import { DEMO_COACHES } from "@/lib/mock-data";
import { tokens } from "@/lib/tokens";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function DiscoverScreen() {
  const [results, setResults] = useState<typeof DEMO_COACHES | null>(null);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Discover coaches</Text>
      <Text style={styles.subtitle}>Match with a verified specialist in 60 seconds.</Text>
      {!results && <CoachFinderQuiz onComplete={() => setResults(DEMO_COACHES)} />}
      {results?.map((coach) => (
        <CoachCard key={coach.id} coach={coach} onBook={() => undefined} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  subtitle: { color: tokens.colors.ink[400], fontSize: 14, marginBottom: 8 }
});
