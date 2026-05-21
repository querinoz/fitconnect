import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n-provider";
import { useAuthStore } from "@/lib/auth-store";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { tokens } from "@/lib/tokens";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function AthleteProfileScreen() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("profile", "title")}</Text>
      <Card>
        <Text style={styles.name}>{user?.name ?? "Athlete"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
      </Card>
      <Button
        label={t("profile", "signOut")}
        variant="ghost"
        onPress={() => {
          logout();
          router.replace("/(auth)/signin");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: SCROLL_BOTTOM_INSET },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  name: { color: tokens.colors.ink[50], fontSize: 18, fontWeight: "700" },
  email: { color: tokens.colors.ink[400], fontSize: 14, marginTop: 4 }
});
