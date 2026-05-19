import { Button } from "@/components/ui/button";
import { tokens } from "@/lib/tokens";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";

const API_BASE = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3001";

export default function SessionRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ended, setEnded] = useState(false);
  const [rpe, setRpe] = useState(6);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submitRpe() {
    await fetch(`${API_BASE}/api/v1/sessions/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteExternalId: "a-ines", rpe, notes })
    }).catch(() => undefined);
    setSubmitted(true);
  }

  if (ended && !submitted) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Post-workout RPE</Text>
        <Text style={styles.subtitle}>How hard was session {id}?</Text>
        <Text style={styles.rpeLabel}>RPE: {rpe}/10</Text>
        <View style={styles.rpeRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Button
              key={n}
              label={String(n)}
              variant={n === rpe ? "primary" : "ghost"}
              onPress={() => setRpe(n)}
            />
          ))}
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes for coach (optional)"
          placeholderTextColor={tokens.colors.ink[500]}
          style={styles.input}
          multiline
        />
        <Button label="Submit feedback" onPress={() => void submitRpe()} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Video room</Text>
      <Text style={styles.subtitle}>Session {id} · WebRTC demo UI</Text>
      <View style={styles.stage}>
        <Text style={styles.placeholder}>Coach video</Text>
      </View>
      <View style={styles.toolbar}>
        <Button label="Share plan" variant="ghost" />
        <Button label="End session" onPress={() => setEnded(true)} />
      </View>
      {submitted && (
        <Text style={styles.note}>Thanks — your coach will see this RPE score.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.ink[950],
    padding: 16,
    gap: 12
  },
  content: { paddingBottom: SCROLL_BOTTOM_INSET, gap: 12 },
  title: { color: tokens.colors.ink[50], fontSize: 22, fontWeight: "800" },
  subtitle: { color: tokens.colors.ink[400] },
  stage: {
    flex: 1,
    borderRadius: tokens.radius["2xl"],
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    backgroundColor: tokens.colors.ink[900],
    alignItems: "center",
    justifyContent: "center"
  },
  placeholder: { color: tokens.colors.ink[500], fontWeight: "600" },
  toolbar: { flexDirection: "row", gap: 8 },
  note: { color: tokens.colors.ink[500], fontSize: 12, lineHeight: 18 },
  rpeLabel: { color: tokens.colors.brand[400], fontWeight: "700", fontSize: 18 },
  rpeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    borderRadius: 12,
    padding: 12,
    color: tokens.colors.ink[100],
    minHeight: 80
  }
});
