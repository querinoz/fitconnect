/**
 * Supabase Third-Party Firebase Auth — role claim injection.
 * @see https://supabase.com/docs/guides/auth/third-party/firebase-auth
 *
 * Blocking functions require Firebase Auth with Identity Platform.
 * onCreate backfill covers projects without blocking support and races on first token.
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as functions from "firebase-functions/v1";
import { setGlobalOptions } from "firebase-functions/v2";
import { beforeUserCreated, beforeUserSignedIn } from "firebase-functions/v2/identity";

initializeApp();
setGlobalOptions({ region: "us-central1" });

const SUPABASE_ROLE_CLAIM = { role: "authenticated" } as const;

export const beforecreated = beforeUserCreated(() => ({
  customClaims: SUPABASE_ROLE_CLAIM,
}));

export const beforesignedin = beforeUserSignedIn(() => ({
  customClaims: SUPABASE_ROLE_CLAIM,
}));

/** Fallback for Spark / non-blocking projects; first token may need client refresh. */
export const processSignUp = functions.auth.user().onCreate(async (user) => {
  const auth = getAuth();
  const existing = (await auth.getUser(user.uid)).customClaims ?? {};
  if (existing.role === "authenticated") return;
  await auth.setCustomUserClaims(user.uid, SUPABASE_ROLE_CLAIM);
});
