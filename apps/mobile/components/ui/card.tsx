import { tokens } from "@/lib/tokens";
import { ReactNode } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type CardProps = ViewProps & {
  children: ReactNode;
  tone?: "default" | "plasma";
};

export function Card({ children, tone = "default", style, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        tone === "plasma" && styles.plasma,
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
    backgroundColor: tokens.colors.ink[900],
    borderRadius: tokens.radius["2xl"],
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    padding: 16
  },
  plasma: {
    borderColor: "rgba(168,85,247,0.35)",
    backgroundColor: "rgba(168,85,247,0.08)"
  }
});
