/**
 * Demo mode flags — synthetic content only. Never represent as production users.
 */

/** Explicit demo feed simulation (local fixtures, no DB writes). */
export const DEMO_FEED_MODE =
  process.env.NEXT_PUBLIC_DEMO_FEED_MODE === "true" ||
  ((process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test") &&
    process.env.NEXT_PUBLIC_DEMO_FEED_MODE !== "false");

/** Interval between synthetic feed events (ms). */
export const DEMO_FEED_INTERVAL_MS = 4000;

/** Max in-memory demo posts before oldest are trimmed. */
export const DEMO_FEED_MAX_POSTS = 24;
