import { tokens } from "@/lib/tokens";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle
} from "react-native";

type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: "primary" | "ghost";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "primary",
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? tokens.colors.ink[950] : tokens.colors.brand[400]} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.ghostLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: tokens.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  primary: {
    backgroundColor: tokens.colors.brand[400]
  },
  ghost: {
    borderWidth: 1,
    borderColor: tokens.colors.ink[800]
  },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.9 },
  label: { fontSize: 15, fontWeight: "700" },
  primaryLabel: { color: tokens.colors.ink[950] },
  ghostLabel: { color: tokens.colors.ink[100] }
});
