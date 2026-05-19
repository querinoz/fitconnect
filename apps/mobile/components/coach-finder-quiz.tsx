import { tokens } from "@/lib/tokens";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const STEPS = [
  { title: "Sport", options: ["Running", "Cycling", "Triathlon", "Climbing"] },
  { title: "Level", options: ["Beginner", "Intermediate", "Advanced"] },
  { title: "Goal", options: ["Performance", "Health", "Technique", "Race"] },
  { title: "Sessions/week", options: ["1", "2", "3", "4+"] },
  { title: "Format", options: ["Online", "Hybrid", "In-person"] }
];

type CoachFinderQuizProps = {
  onStart?: () => void;
  onComplete: () => void;
};

export function CoachFinderQuiz({ onStart, onComplete }: CoachFinderQuizProps) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  if (!started) {
    return (
      <Card>
        <Text style={styles.cardTitle}>Coach finder quiz</Text>
        <Text style={styles.cardBody}>5 steps · results in ~60 seconds</Text>
        <Button
          label="Start quiz"
          onPress={() => {
            setStarted(true);
            onStart?.();
          }}
        />
      </Card>
    );
  }

  const current = STEPS[step];
  const progress = `${step + 1}/${STEPS.length}`;

  return (
    <Card>
      <Text style={styles.progress}>{progress}</Text>
      <Text style={styles.cardTitle}>{current.title}</Text>
      <View style={styles.options}>
        {current.options.map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              const next = [...answers, option];
              setAnswers(next);
              if (step >= STEPS.length - 1) {
                onComplete();
                return;
              }
              setStep((s) => s + 1);
            }}
            style={styles.option}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: tokens.colors.ink[50], fontSize: 18, fontWeight: "700", marginBottom: 6 },
  cardBody: { color: tokens.colors.ink[400], fontSize: 13, marginBottom: 12 },
  progress: { color: tokens.colors.brand[400], fontSize: 11, fontWeight: "700", marginBottom: 8 },
  options: { gap: 8 },
  option: {
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  optionText: { color: tokens.colors.ink[100], fontWeight: "600" }
});
