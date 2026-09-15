export function isLoopbackPostgresUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function assertMigrationApplyAllowed(url, env = process.env) {
  if (isLoopbackPostgresUrl(url)) return { ok: true, reason: "localhost" };
  if (env.FITCONNECT_APPLY_PRODUCTION === "1") {
    return { ok: true, reason: "explicit-production-flag" };
  }
  return {
    ok: false,
    reason: "Refusing non-localhost DIRECT_URL without FITCONNECT_APPLY_PRODUCTION=1"
  };
}
