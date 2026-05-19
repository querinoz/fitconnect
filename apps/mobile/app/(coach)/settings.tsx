import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { tokens } from "@/lib/tokens";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function CoachSettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>Stripe Connect · notifications · profile</Text>
      <Button
        label="Sign out"
        variant="ghost"
        onPress={() => {
          logout();
          router.replace("/(auth)/signin");
        }}
      />
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
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  body: { color: tokens.colors.ink[400], marginBottom: 8 }
});
