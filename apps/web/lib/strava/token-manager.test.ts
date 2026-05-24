import { describe, expect, it, vi } from "vitest";
import { StravaTokenManager, inMemoryLock } from "./token-manager";

describe("StravaTokenManager", () => {
  it("should_not_refresh_when_token_valid_for_more_than_5_minutes", async () => {
    const refreshFn = vi.fn();
    const manager = new StravaTokenManager({
      refreshFn,
      now: () => 1_000_000_000_000
    });

    const record = {
      accessToken: "a",
      refreshToken: "r",
      expiresAt: Math.floor(1_000_000_000_000 / 1000) + 7200
    };

    const result = await manager.getValidToken("u1", record, vi.fn());
    expect(result.accessToken).toBe("a");
    expect(refreshFn).not.toHaveBeenCalled();
  });

  it("should_refresh_proactively_when_token_expires_within_5_minutes", async () => {
    const now = 1_700_000_000_000;
    const refreshFn = vi.fn().mockResolvedValue({
      access_token: "new",
      refresh_token: "new-r",
      expires_at: Math.floor(now / 1000) + 3600,
      token_type: "Bearer"
    });

    const manager = new StravaTokenManager({ refreshFn, lock: inMemoryLock, now: () => now });
    const persist = vi.fn().mockResolvedValue(undefined);

    const result = await manager.getValidToken(
      "u1",
      { accessToken: "old", refreshToken: "r", expiresAt: Math.floor(now / 1000) + 120 },
      persist
    );

    expect(result.accessToken).toBe("new");
    expect(persist).toHaveBeenCalledOnce();
  });

  it("should_retry_refresh_on_429_then_succeed", async () => {
    const refreshFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429"))
      .mockResolvedValue({
        access_token: "new",
        refresh_token: "new-r",
        expires_at: 9999999999,
        token_type: "Bearer"
      });

    const manager = new StravaTokenManager({ refreshFn, lock: inMemoryLock });
    const result = await manager.getValidToken(
      "u1",
      { accessToken: "old", refreshToken: "r", expiresAt: 1 },
      vi.fn()
    );
    expect(result.accessToken).toBe("new");
    expect(refreshFn).toHaveBeenCalledTimes(2);
  });

  it("should_call_onRefreshError_after_exhausted_retries", async () => {
    const onRefreshError = vi.fn();
    const refreshFn = vi.fn().mockRejectedValue(new Error("revoked"));
    const manager = new StravaTokenManager({ refreshFn, onRefreshError, lock: inMemoryLock });

    await expect(
      manager.getValidToken(
        "u1",
        { accessToken: "old", refreshToken: "r", expiresAt: 1 },
        vi.fn()
      )
    ).rejects.toThrow("revoked");
    expect(onRefreshError).toHaveBeenCalled();
  });
});
