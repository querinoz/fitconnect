"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEMO_FEED_INTERVAL_MS,
  DEMO_FEED_MAX_POSTS,
  DEMO_FEED_MODE
} from "./constants";
import {
  createDemoFeedPost,
  nextDemoFeedTemplate,
  seedDemoFeedPosts,
  type DemoFeedPost
} from "./demo-feed";

export type UseDemoLiveFeedOptions = {
  enabled?: boolean;
  intervalMs?: number;
  maxPosts?: number;
};

export type UseDemoLiveFeedResult = {
  posts: DemoFeedPost[];
  isLive: boolean;
  demoMode: boolean;
  pause: () => void;
  resume: () => void;
};

/**
 * Lifecycle-aware demo feed stream. Local fixtures only — no network/DB.
 * Disabled unless DEMO_FEED_MODE is true.
 */
export function useDemoLiveFeed(
  options: UseDemoLiveFeedOptions = {}
): UseDemoLiveFeedResult {
  const {
    enabled = true,
    intervalMs = DEMO_FEED_INTERVAL_MS,
    maxPosts = DEMO_FEED_MAX_POSTS
  } = options;

  const active = DEMO_FEED_MODE && enabled;
  const [posts, setPosts] = useState<DemoFeedPost[]>(() =>
    active ? seedDemoFeedPosts(3) : []
  );
  const [isLive, setIsLive] = useState(active);
  const seenEventIds = useRef(new Set<string>());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushPost = useCallback(
    (post: DemoFeedPost) => {
      if (seenEventIds.current.has(post.eventId)) return;
      seenEventIds.current.add(post.eventId);
      setPosts((prev) => {
        const next = [post, ...prev];
        return next.slice(0, maxPosts);
      });
    },
    [maxPosts]
  );

  const tick = useCallback(() => {
    const template = nextDemoFeedTemplate();
    pushPost(createDemoFeedPost(template));
  }, [pushPost]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!active) return;
    clearTimer();
    timerRef.current = setInterval(tick, intervalMs);
  }, [active, clearTimer, intervalMs, tick]);

  const pause = useCallback(() => {
    setIsLive(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!active) return;
    setIsLive(true);
    startTimer();
  }, [active, startTimer]);

  useEffect(() => {
    if (!active) {
      clearTimer();
      setIsLive(false);
      return;
    }

    seenEventIds.current = new Set(posts.map((p) => p.eventId));
    setIsLive(true);
    startTimer();

    const onVisibility = () => {
      if (document.hidden) {
        clearTimer();
      } else if (isLive) {
        startTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount lifecycle
  }, [active, intervalMs]);

  return {
    posts,
    isLive,
    demoMode: DEMO_FEED_MODE,
    pause,
    resume
  };
}
