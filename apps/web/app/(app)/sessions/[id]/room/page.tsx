"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { SectionHeader } from "@/components/ui-glass/premium-system";
import { useAuthStore } from "@/lib/auth-store";
import { ArrowLeft, Video } from "lucide-react";

const LiveKitRoom = dynamicImport(
  () => import("@livekit/components-react").then((m) => m.LiveKitRoom),
  { ssr: false }
);

const VideoConference = dynamicImport(
  () => import("@livekit/components-react").then((m) => m.VideoConference),
  { ssr: false }
);

export default function SessionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<"loading" | "demo" | "ready" | "error">("loading");
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/video/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: `session-${id}`,
        participantName: user?.name ?? "Athlete",
        participantId: user?.id ?? "demo-athlete"
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.demo) {
          setStatus("demo");
          return;
        }
        if (data.token && data.url) {
          setToken(data.token);
          setLivekitUrl(data.url);
          setStatus("ready");
          return;
        }
        setStatus("error");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, user?.name]);

  return (
    <AuthGate roles={["athlete", "coach", "admin"]}>
      <div className="mb-4">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sessions
        </Link>
      </div>
      <SectionHeader eyebrow="Live session" title={`Room · ${id}`} />

      {status === "loading" && (
        <GlassCard className="mt-6 p-8 text-center">
          <Video className="mx-auto h-12 w-12 text-volt-400" />
          <p className="mt-4 text-sm text-ink-400">Connecting to session room…</p>
        </GlassCard>
      )}

      {status === "demo" && (
        <GlassCard className="mt-6 p-8 text-center">
          <Video className="mx-auto h-12 w-12 text-volt-400" />
          <p className="mt-4 text-lg font-semibold text-ink-50">Demo video room</p>
          <p className="mt-2 text-sm text-ink-300">
            Configure LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL to enable
            real-time coach form review.
          </p>
        </GlassCard>
      )}

      {status === "ready" && token && livekitUrl && (
        <div className="mt-6 h-[min(70vh,640px)] overflow-hidden rounded-2xl border border-ink-800">
          <LiveKitRoom
            token={token}
            serverUrl={livekitUrl}
            connect
            audio
            video
            data-lk-theme="default"
            style={{ height: "100%" }}
          >
            <VideoConference />
          </LiveKitRoom>
        </div>
      )}

      {status === "error" && (
        <GlassCard className="mt-6 p-8 text-center">
          <p className="text-sm text-signal-400">Could not join session room.</p>
        </GlassCard>
      )}
    </AuthGate>
  );
}
