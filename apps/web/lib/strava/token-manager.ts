import type { StravaTokenResponseInput } from "@fitconnect/strava-integration";

export type TokenRecord = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type RefreshFn = (refreshToken: string) => Promise<StravaTokenResponseInput>;

export type LockFn = {
  acquire: (key: string, ttlMs: number) => Promise<boolean>;
  release: (key: string) => Promise<void>;
};

const memoryLocks = new Map<string, number>();

export const inMemoryLock: LockFn = {
  async acquire(key, ttlMs) {
    const now = Date.now();
    const until = memoryLocks.get(key) ?? 0;
    if (until > now) return false;
    memoryLocks.set(key, now + ttlMs);
    return true;
  },
  async release(key) {
    memoryLocks.delete(key);
  }
};

export type TokenManagerOptions = {
  refreshFn: RefreshFn;
  lock?: LockFn;
  now?: () => number;
  onRefreshError?: (error: unknown) => void;
  proactiveSkewMs?: number;
};

export class StravaTokenManager {
  private readonly refreshFn: RefreshFn;
  private readonly lock: LockFn;
  private readonly now: () => number;
  private readonly onRefreshError?: (error: unknown) => void;
  private readonly proactiveSkewMs: number;

  constructor(options: TokenManagerOptions) {
    this.refreshFn = options.refreshFn;
    this.lock = options.lock ?? inMemoryLock;
    this.now = options.now ?? (() => Date.now());
    this.onRefreshError = options.onRefreshError;
    this.proactiveSkewMs = options.proactiveSkewMs ?? 5 * 60 * 1000;
  }

  needsRefresh(expiresAt: number): boolean {
    return expiresAt * 1000 <= this.now() + this.proactiveSkewMs;
  }

  async getValidToken(
    userId: string,
    record: TokenRecord,
    persist: (next: TokenRecord) => Promise<void>
  ): Promise<TokenRecord & { stale?: boolean }> {
    if (!this.needsRefresh(record.expiresAt)) {
      return record;
    }

    const lockKey = `strava:refresh:${userId}`;
    const acquired = await this.lock.acquire(lockKey, 30_000);
    if (!acquired) {
      return { ...record, stale: true };
    }

    try {
      const refreshed = await this.refreshWithRetry(record.refreshToken);
      const next: TokenRecord = {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: refreshed.expires_at
      };
      await persist(next);
      return next;
    } catch (error) {
      this.onRefreshError?.(error);
      throw error;
    } finally {
      await this.lock.release(lockKey);
    }
  }

  private async refreshWithRetry(refreshToken: string, attempts = 3): Promise<StravaTokenResponseInput> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await this.refreshFn(refreshToken);
      } catch (error) {
        lastError = error;
        await new Promise((r) => setTimeout(r, 250 * 2 ** i));
      }
    }
    throw lastError;
  }
}
