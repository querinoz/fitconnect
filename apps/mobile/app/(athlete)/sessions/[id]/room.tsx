import { Button } from "@/components/ui/button";
import { tokens } from "@/lib/tokens";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function SessionRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Video room</Text>
      <Text style={styles.subtitle}>Session {id} · WebRTC demo UI</Text>
      <View style={styles.stage}>
        <Text style={styles.placeholder}>Coach video</Text>
      </View>
      <View style={styles.toolbar}>
        <Button label="Share plan" variant="ghost" />
        <Button label="End session" />
      </View>
      <Text style={styles.note}>
        Livekit/Daily.co integration placeholder — timer, RPE input after session.
      </Text>
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
  title: { color: tokens.colors.ink[50], fontSize: 22, fontWeight: "800" },
  subtitle: { color: tokens.colors.ink[400] },
  stage: {
    flex: 1,
    borderRadius: tokens.radius["2xl"],
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    backgroundColor: tokens.colors.ink[900],
    alignItems: "center",
    justifyContent: "center"
  },
  placeholder: { color: tokens.colors.ink[500], fontWeight: "600" },
  toolbar: { flexDirection: "row", gap: 8 },
  note: { color: tokens.colors.ink[500], fontSize: 12, lineHeight: 18 }
});
