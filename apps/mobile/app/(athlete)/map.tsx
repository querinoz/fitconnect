import { useT } from "@/lib/i18n-provider";
import { tokens } from "@/lib/tokens";
import { StyleSheet, Text, View } from "react-native";

export default function AthleteMapScreen() {
  const t = useT();

  return (
    <View style={styles.screen}>
      <View style={styles.glassPanel}>
        <Text style={styles.micro}>{t("map", "scrollHint")}</Text>
        <Text style={styles.title}>{t("map", "title")}</Text>
        <Text style={styles.body}>{t("map", "body")}</Text>
        <Text style={styles.note}>{t("map", "tokenNote")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.ink[950],
    padding: 16,
    justifyContent: "center"
  },
  glassPanel: {
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 20,
    gap: 10
  },
  micro: {
    color: tokens.colors.brand[500],
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  title: {
    color: tokens.colors.ink[50],
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  body: { color: tokens.colors.ink[300], fontSize: 15, lineHeight: 22 },
  note: { color: tokens.colors.ink[500], fontSize: 13, lineHeight: 20, marginTop: 4 }
});
