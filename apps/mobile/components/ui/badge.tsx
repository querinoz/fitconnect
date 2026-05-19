import { tokens } from "@/lib/tokens";
import { StyleSheet, Text, View } from "react-native";

type BadgeProps = {
  label: string;
  tone?: "brand" | "accent" | "signal";
};

export function Badge({ label, tone = "brand" }: BadgeProps) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <Text style={[styles.text, styles[`${tone}Text` as keyof typeof styles]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  brand: { backgroundColor: "rgba(34,211,238,0.15)" },
  accent: { backgroundColor: "rgba(163,230,53,0.15)" },
  signal: { backgroundColor: "rgba(244,63,94,0.15)" },
  text: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  brandText: { color: tokens.colors.brand[400] },
  accentText: { color: tokens.colors.accent[400] },
  signalText: { color: tokens.colors.signal[500] }
});
