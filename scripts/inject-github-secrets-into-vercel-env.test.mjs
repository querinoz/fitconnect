import assert from "node:assert/strict";
import test from "node:test";
import {
  isPlaceholderValue,
  mergeAndSanitizeEnv
} from "./inject-github-secrets-into-vercel-env.mjs";

const firebase = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "A".repeat(39),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "fitconnect.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fitconnect",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "fitconnect.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc"
};

test("drops TURBO_API=base and placeholder DATABASE_URL hosts", () => {
  const { text, keys } = mergeAndSanitizeEnv(
    [
      "TURBO_API=base",
      "TURBO_TOKEN=secret-should-drop",
      "DATABASE_URL=postgres://user:pass@base:5432/postgres",
      "NEXT_PUBLIC_CONVEX_URL=base",
      "NEXT_PUBLIC_APP_URL=http://base"
    ].join("\n"),
    firebase
  );
  assert.equal(keys.includes("TURBO_API"), false);
  assert.equal(keys.includes("TURBO_TOKEN"), false);
  assert.equal(keys.includes("DATABASE_URL"), false);
  assert.equal(keys.includes("NEXT_PUBLIC_CONVEX_URL"), false);
  assert.match(text, /NEXT_PUBLIC_APP_URL=https:\/\/fitconnect-phi\.vercel\.app/);
  assert.equal(text.includes("secret-should-drop"), false);
});

test("keeps a real production app URL and injects optional redis when set", () => {
  const { text, injectedOptional } = mergeAndSanitizeEnv("NEXT_PUBLIC_APP_URL=https://fitconnect-phi.vercel.app\n", {
    ...firebase,
    UPSTASH_REDIS_REST_URL: "https://ready.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "tok"
  });
  assert.match(text, /NEXT_PUBLIC_APP_URL=https:\/\/fitconnect-phi\.vercel\.app/);
  assert.match(text, /UPSTASH_REDIS_REST_URL=https:\/\/ready\.upstash\.io/);
  assert.ok(injectedOptional >= 2);
});

test("omits DATABASE_URL even when the host is real and drops libpq host=base", () => {
  const { keys, text } = mergeAndSanitizeEnv(
    [
      "DATABASE_URL=postgres://postgres:pass@db.example.supabase.co:5432/postgres",
      "DIRECT_URL=postgres://postgres:pass@db.example.supabase.co:5432/postgres",
      "PGHOST=base",
      "OTHER=host=base port=5432"
    ].join("\n"),
    firebase
  );
  assert.equal(keys.includes("DATABASE_URL"), false);
  assert.equal(keys.includes("DIRECT_URL"), false);
  assert.equal(keys.includes("PGHOST"), false);
  assert.equal(keys.includes("OTHER"), false);
  assert.equal(text.includes("db.example.supabase.co"), false);
});

test("placeholder detector", () => {
  assert.equal(isPlaceholderValue("TURBO_API", "https://vercel.com"), true);
  assert.equal(isPlaceholderValue("DATABASE_URL", "postgres://x@base/db"), true);
  assert.equal(isPlaceholderValue("NEXT_PUBLIC_APP_URL", "https://fitconnect-phi.vercel.app"), false);
});
