"use client";

import {
  createSupabaseBrowserClient,
  isDemoMode,
  isSupabaseConfigured
} from "@/lib/auth/supabase/client";
import type { UserRole } from "@/lib/auth";

export type AuthResult =
  | { ok: true; mode: "demo" | "supabase" }
  | { ok: false; message: string };

function callbackUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

export function authBackend(): "demo" | "supabase" {
  if (isDemoMode() || !isSupabaseConfigured()) return "demo";
  return "supabase";
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  if (authBackend() === "demo") {
    return { ok: true, mode: "demo" };
  }
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, mode: "supabase" };
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<AuthResult> {
  if (authBackend() === "demo") {
    return { ok: true, mode: "demo" };
  }
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Supabase not configured" };
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name, role: input.role },
      emailRedirectTo: callbackUrl()
    }
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, mode: "supabase" };
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  if (authBackend() === "demo") {
    return { ok: false, message: "Magic link requires Supabase (disable demo mode)." };
  }
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl() }
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, mode: "supabase" };
}

export async function signInWithOAuth(
  provider: "google" | "apple"
): Promise<AuthResult> {
  if (authBackend() === "demo") {
    return { ok: true, mode: "demo" };
  }
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl() }
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, mode: "supabase" };
}
