import { isInsecurePlaceholderSecret, isProductionSecurityMode } from "@/lib/security/runtime";

export function stravaWebhookVerifyToken(
  env: NodeJS.ProcessEnv = process.env
): string | null {
  const token = env.STRAVA_WEBHOOK_VERIFY_TOKEN?.trim();
  if (isInsecurePlaceholderSecret(token)) return null;
  return token ?? null;
}

export function qstashPublishToken(env: NodeJS.ProcessEnv = process.env): string | null {
  const token = env.QSTASH_TOKEN?.trim();
  return token ? token : null;
}

export function integrationJobSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const token = env.INTEGRATION_AUTH_SECRET?.trim();
  if (isInsecurePlaceholderSecret(token)) return null;
  return token ?? null;
}

export function canEnqueueStravaSyncJob(env: NodeJS.ProcessEnv = process.env): {
  ok: true;
  mode: "qstash" | "local-secret";
} | { ok: false; error: string } {
  const qstash = qstashPublishToken(env);
  const jobSecret = integrationJobSecret(env);
  if (isProductionSecurityMode(env)) {
    if (!qstash) return { ok: false, error: "qstash_required" };
    if (!jobSecret) return { ok: false, error: "job_secret_required" };
    return { ok: true, mode: "qstash" };
  }
  if (qstash && jobSecret) return { ok: true, mode: "qstash" };
  if (jobSecret) return { ok: true, mode: "local-secret" };
  return { ok: false, error: "job_secret_required" };
}
