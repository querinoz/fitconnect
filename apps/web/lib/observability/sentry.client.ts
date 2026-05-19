/** Sentry client stub — wire @sentry/nextjs when NEXT_PUBLIC_SENTRY_DSN is set. */
export function initSentryClient() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  if (process.env.NODE_ENV === "development") {
    console.info("[observability] Sentry DSN configured (install @sentry/nextjs to enable)");
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.error("[observability]", error, context);
  }
}
