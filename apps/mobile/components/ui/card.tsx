import { tokens } from "@/lib/tokens";
import { ReactNode } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type CardProps = ViewProps & {
  children: ReactNode;
  tone?: "default" | "plasma" | "glass";
};

/** Nivis-inspired glass card for mobile screens */
export function Card({ children, tone = "glass", style, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        tone === "plasma" && styles.plasma,
        tone === "default" && styles.solid,
        tone === "glass" && styles.glass,
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.xl,
    padding: 16
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  solid: {
    backgroundColor: tokens.colors.ink[900],
    borderWidth: 1,
    borderColor: tokens.colors.ink[800]
  },
  plasma: {
    borderColor: "rgba(168,85,247,0.35)",
    backgroundColor: "rgba(168,85,247,0.08)"
  }
});
