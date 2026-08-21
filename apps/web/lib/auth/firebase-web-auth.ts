"use client";

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  browserLocalPersistence,
  type Auth,
  type User
} from "firebase/auth";
import { isDemoMode } from "@/lib/auth/supabase/client";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { initFirebaseClient } from "@/lib/firebase/client";
import type { UserRole } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { FIREBASE_ID_COOKIE } from "@/lib/auth/session-cookie";

export type AuthBackend = "demo" | "firebase" | "unconfigured";

export type AuthResult =
  | { ok: true; mode: AuthBackend; user?: AuthUser }
  | { ok: false; message: string; code?: GoogleAuthFailure };

export type GoogleAuthFailure =
  | "cancelled"
  | "no_account"
  | "network"
  | "configuration"
  | "provider";

export function authBackend(): AuthBackend {
  if (isDemoMode()) return "demo";
  if (isFirebaseWebConfigured()) return "firebase";
  return "unconfigured";
}

async function firebaseAuth(): Promise<Auth | null> {
  const app = await initFirebaseClient();
  if (!app) return null;
  const auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);
  return auth;
}

function mapFirebaseUser(user: User, role: UserRole = "athlete"): AuthUser {
  const email = user.email ?? "";
  const slug = email.split("@")[0] || user.uid.slice(0, 8);
  return {
    id: user.uid,
    username: slug,
    name: user.displayName || slug,
    email,
    role,
    athleteId: user.uid,
    coachId: role === "coach" ? user.uid : undefined
  };
}

function mapAuthError(error: unknown): { message: string; code?: GoogleAuthFailure } {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code: string }).code)
    : "";
  if (code.includes("popup-closed") || code.includes("cancelled")) {
    return { message: "Sign-in was cancelled.", code: "cancelled" };
  }
  if (code.includes("network")) {
    return { message: "Network error. Try again.", code: "network" };
  }
  if (code.includes("invalid-api-key") || code.includes("configuration") || code.includes("operation-not-allowed")) {
    return { message: "Sign-in is not configured.", code: "configuration" };
  }
  if (code.includes("account-exists") || code.includes("user-not-found") || code.includes("no-auth")) {
    return { message: "No account available for this provider.", code: "no_account" };
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("invalid-email")) {
    return { message: "Invalid email or password." };
  }
  if (code.includes("email-already-in-use")) {
    return { message: "An account already exists for this email." };
  }
  return { message: "Could not complete sign-in.", code: "provider" };
}

async function persistServerSession(user: User): Promise<void> {
  const token = await user.getIdToken(true);
  await fetch("/api/v1/identity/session", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ idToken: token })
  });
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  if (authBackend() === "demo") return { ok: true, mode: "demo" };
  if (authBackend() !== "firebase") {
    return { ok: false, message: "Authentication is not configured." };
  }
  try {
    const auth = await firebaseAuth();
    if (!auth) return { ok: false, message: "Authentication is not configured.", code: "configuration" };
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await persistServerSession(cred.user);
    return { ok: true, mode: "firebase", user: mapFirebaseUser(cred.user) };
  } catch (error) {
    const mapped = mapAuthError(error);
    return { ok: false, ...mapped };
  }
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<AuthResult> {
  if (authBackend() === "demo") return { ok: true, mode: "demo" };
  if (authBackend() !== "firebase") {
    return { ok: false, message: "Authentication is not configured." };
  }
  try {
    const auth = await firebaseAuth();
    if (!auth) return { ok: false, message: "Authentication is not configured.", code: "configuration" };
    const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await sendEmailVerification(cred.user).catch(() => undefined);
    await persistServerSession(cred.user);
    const user = mapFirebaseUser(cred.user, input.role === "coach" ? "coach" : "athlete");
    user.name = input.name || user.name;
    return { ok: true, mode: "firebase", user };
  } catch (error) {
    const mapped = mapAuthError(error);
    return { ok: false, ...mapped };
  }
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  if (authBackend() === "demo") {
    return { ok: false, message: "Magic link is not available in demo mode." };
  }
  return sendPasswordReset(email);
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (authBackend() !== "firebase") {
    return { ok: false, message: "Authentication is not configured." };
  }
  try {
    const auth = await firebaseAuth();
    if (!auth) return { ok: false, message: "Authentication is not configured." };
    await sendPasswordResetEmail(auth, email);
    return { ok: true, mode: "firebase" };
  } catch (error) {
    const mapped = mapAuthError(error);
    return { ok: false, ...mapped };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (authBackend() === "demo") return { ok: true, mode: "demo" };
  if (authBackend() !== "firebase") {
    return { ok: false, message: "Authentication is not configured.", code: "configuration" };
  }
  try {
    const auth = await firebaseAuth();
    if (!auth) return { ok: false, message: "Authentication is not configured.", code: "configuration" };
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    await persistServerSession(cred.user);
    return { ok: true, mode: "firebase", user: mapFirebaseUser(cred.user) };
  } catch (error) {
    const mapped = mapAuthError(error);
    return { ok: false, ...mapped };
  }
}

/** @deprecated Use signInWithGoogle. Apple is HUMAN_CONFIGURATION, not this phase. */
export async function signInWithOAuth(
  provider: "google" | "apple"
): Promise<AuthResult> {
  if (provider === "google") return signInWithGoogle();
  return { ok: false, message: "This sign-in method is not available yet.", code: "provider" };
}

export async function signOutSession(): Promise<void> {
  if (authBackend() === "demo") {
    document.cookie = `${FIREBASE_ID_COOKIE}=; Max-Age=0; Path=/`;
    return;
  }
  await fetch("/api/v1/identity/session", { method: "DELETE" }).catch(() => undefined);
  const auth = await firebaseAuth();
  if (auth) await signOut(auth);
}

export async function fetchFirebaseAuthUser(): Promise<User | null> {
  if (authBackend() !== "firebase") return null;
  const auth = await firebaseAuth();
  return auth?.currentUser ?? null;
}

export async function fetchSupabaseAuthUser() {
  const user = await fetchFirebaseAuthUser();
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    user_metadata: {
      name: user.displayName,
      role: "athlete"
    }
  };
}
