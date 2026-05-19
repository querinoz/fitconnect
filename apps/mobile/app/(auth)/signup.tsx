import { Button } from "@/components/ui/button";
import { useAuthStore, type AuthUser } from "@/lib/auth-store";
import { tokens } from "@/lib/tokens";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthUser["role"]>("athlete");

  function submit() {
    const user: AuthUser = {
      id: `user-${Date.now()}`,
      name: name || "New User",
      email,
      role
    };
    login(user);
    router.replace(role === "coach" ? "/(coach)" : "/(athlete)");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create account</Text>
      <View style={styles.roles}>
        {(["athlete", "coach"] as const).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[styles.role, role === r && styles.roleActive]}
          >
            <Text style={styles.roleText}>{r}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        placeholderTextColor={tokens.colors.ink[500]}
        style={styles.input}
      />
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
      <Button label="Continue" onPress={submit} />
      <Link href="/(auth)/signin" style={styles.link}>
        Already have an account?
      </Link>
    </View>
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
  title: { color: tokens.colors.ink[50], fontSize: 28, fontWeight: "800", marginBottom: 8 },
  roles: { flexDirection: "row", gap: 8 },
  role: {
    flex: 1,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    paddingVertical: 10,
    alignItems: "center"
  },
  roleActive: { borderColor: tokens.colors.brand[400], backgroundColor: "rgba(34,211,238,0.1)" },
  roleText: { color: tokens.colors.ink[100], fontWeight: "700", textTransform: "capitalize" },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.ink[800],
    backgroundColor: tokens.colors.ink[900],
    borderRadius: tokens.radius.xl,
    paddingHorizontal: 14,
    height: 48,
    color: tokens.colors.ink[100]
  },
  link: { color: tokens.colors.brand[400], textAlign: "center", marginTop: 16 }
});
