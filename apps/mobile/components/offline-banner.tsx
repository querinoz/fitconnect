import { tokens } from "@/lib/tokens";
import { StyleSheet, Text, View } from "react-native";

const recoveryColor = tokens.colors.recovery[500];

export function OfflineBanner() {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.text}>Offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: `${recoveryColor}26`, // 15% opacity
    borderBottomWidth: 1,
    borderBottomColor: `${recoveryColor}59`, // 35% opacity
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  text: {
    color: recoveryColor,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  }
});
