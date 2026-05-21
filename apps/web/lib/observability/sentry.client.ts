/** Sentry client — active when NEXT_PUBLIC_SENTRY_DSN is set. */
let initialized = false;

export function initSentryClient() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || typeof window === "undefined" || initialized) return;

  void import("@sentry/browser").then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0
    });
    initialized = true;
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (dsn && typeof window !== "undefined") {
    void import("@sentry/browser").then((Sentry) => {
      Sentry.captureException(error, context ? { extra: context } : undefined);
    });
    return;
  }
  if (process.env.NODE_ENV === "development") {
    console.error("[observability]", error, context);
  }
}
