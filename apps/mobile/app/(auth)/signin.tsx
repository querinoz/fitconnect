import { Button } from "@/components/ui/button";
import { validateCredentials, useAuthStore } from "@/lib/auth-store";
import { tokens } from "@/lib/tokens";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image
} from "react-native";

const LOGO = require("../../assets/brand/logo.png");

export default function SignInScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("ines@fitconnect.local");
  const [password, setPassword] = useState("Athlete");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    setError(null);
    const user = validateCredentials(email, password);
    setLoading(false);
    if (!user) {
      setError("Invalid credentials. Try ines@fitconnect.local / Athlete");
      return;
    }
    login(user);
    router.replace(user.role === "coach" ? "/(coach)" : "/(athlete)");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <Image source={LOGO} style={styles.logo} accessibilityLabel="FitConnect" />
      <Text style={styles.title}>FitConnect</Text>
      <Text style={styles.subtitle}>Sign in to sync with web</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={tokens.colors.ink[500]}
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={tokens.colors.ink[500]}
        style={styles.input}
      />
      <Button label="Sign in" loading={loading} onPress={submit} />
      <Link href="/(auth)/signup" style={styles.link}>
        Create account
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.ink[950],
    padding: 24,
    justifyContent: "center",
    gap: 12
  },
  logo: { width: 88, height: 88, alignSelf: "center", marginBottom: 8, resizeMode: "contain" },
  title: { color: tokens.colors.ink[50], fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { color: tokens.colors.ink[400], marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    backgroundColor: tokens.colors.ink[900],
    borderRadius: tokens.radius.xl,
    paddingHorizontal: 14,
    height: 48,
    color: tokens.colors.ink[100]
  },
  error: { color: tokens.colors.signal[500], fontSize: 13 },
  link: { color: tokens.colors.brand[400], textAlign: "center", marginTop: 16, fontWeight: "600" }
});
