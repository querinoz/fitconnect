"use client";

export {
  authBackend,
  signInWithPassword,
  signUpWithPassword,
  signInWithMagicLink,
  signInWithOAuth,
  signInWithGoogle,
  signOutSession,
  fetchSupabaseAuthUser,
  fetchFirebaseAuthUser,
  sendPasswordReset,
  type AuthResult,
  type AuthBackend,
  type GoogleAuthFailure
} from "./firebase-web-auth";
