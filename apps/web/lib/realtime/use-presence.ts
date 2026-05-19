"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/auth/supabase/client";
import { useAuthStore } from "@/lib/auth-store";

export type PresenceMember = {
  userId: string;
  role: string;
  lastSeen: number;
};

/** Tracks online presence via Supabase Realtime presence:* channels. */
export function usePresence(scope: "coach" | "athlete", id: string) {
  const user = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const channelName = `presence:${scope}:${id}`;

  const heartbeat = useCallback(() => {
    if (!user?.id) return;
    const supa = createSupabaseBrowserClient();
    if (!supa) return;

    const ch = supa.channel(`fc:${channelName}`, {
      config: { presence: { key: user.id } }
    });

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, PresenceMember[]>;
      const flat = Object.values(state).flat();
      setMembers(flat);
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ userId: user.id, role: user.role, lastSeen: Date.now() });
      }
    });

    return () => {
      void ch.untrack();
      void ch.unsubscribe();
    };
  }, [channelName, user?.id, user?.role]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return;
    return heartbeat();
  }, [heartbeat, user?.id]);

  return { members, online: members.length > 0 };
}
