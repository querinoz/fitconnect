import { tokens } from "@/lib/tokens";
import { StyleSheet, Text, View } from "react-native";

export function OfflineBanner() {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.text}>Offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(250,204,21,0.15)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(250,204,21,0.35)",
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  text: {
    color: "#fde68a",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  }
});
