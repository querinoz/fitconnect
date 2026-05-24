/** Batch refresh for tokens expiring within the next hour (QStash/cron entrypoint). */
export async function runStravaTokenRefreshBatch(
  tokens: Array<{ userId: string; expiresAt: number }>,
  refreshUser: (userId: string) => Promise<void>,
  now = Date.now()
): Promise<{ refreshed: string[]; skipped: string[] }> {
  const oneHour = 60 * 60 * 1000;
  const refreshed: string[] = [];
  const skipped: string[] = [];

  for (const token of tokens) {
    if (token.expiresAt * 1000 <= now + oneHour) {
      await refreshUser(token.userId);
      refreshed.push(token.userId);
    } else {
      skipped.push(token.userId);
    }
  }

  return { refreshed, skipped };
}
