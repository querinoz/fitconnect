"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { BentoCard } from "@/components/elite-os/bento-card";

type DiscoverCoach = {
  id: string;
  name: string;
  headline?: string;
  city?: string;
  country?: string;
  sports?: string[];
  hourlyRate?: number;
};

export default function CoachesPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <CoachesDirectory />
    </AuthGate>
  );
}

function CoachesDirectory() {
  const [coaches, setCoaches] = useState<DiscoverCoach[]>([]);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/v1/coaches/discover", { credentials: "include" });
        if (res.status === 401) {
          if (!cancelled) setError("Sign in to browse coaches. We will not show a fake marketplace.");
          return;
        }
        if (res.status === 503) {
          if (!cancelled) setError("Coach directory is unavailable until persistence is configured.");
          return;
        }
        if (!res.ok) throw new Error("discover failed");
        const body = (await res.json()) as { coaches: DiscoverCoach[]; source?: string };
        if (!cancelled) {
          setCoaches(body.coaches ?? []);
          setSource(body.source ?? "unknown");
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Could not load coaches.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6" data-testid="coaches-directory">
      <header className="space-y-2">
        <p className="eos-label-caps text-eos-voltline">COACHES</p>
        <h1 className="eos-headline text-4xl italic">Find a specialist.</h1>
        <p className="text-sm text-eos-on-surface-muted">
          Live directory from FitConnect. Editorial marketing cards on /discover are not bookings.
        </p>
      </header>
      {loading ? <p>Loading coaches…</p> : null}
      {error ? (
        <BentoCard label="DIRECTORY">
          <p role="alert">{error}</p>
        </BentoCard>
      ) : null}
      {!loading && !error && coaches.length === 0 ? (
        <BentoCard label="EMPTY">
          <p>No coaches in the live directory yet. Nothing was invented.</p>
          <Link className="mt-3 inline-block text-eos-telemetry underline-offset-4 hover:underline" href="/sessions">
            Open bookings
          </Link>
        </BentoCard>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {coaches.map((coach) => (
          <BentoCard key={coach.id} label={coach.city ?? "COACH"}>
            <p className="font-display text-2xl">{coach.name}</p>
            <p className="text-sm text-eos-on-surface-muted">{coach.headline}</p>
            <p className="mt-2 text-xs uppercase tracking-wider">
              {(coach.sports ?? []).join(" · ") || "Sport unpublished"}
            </p>
            {typeof coach.hourlyRate === "number" ? (
              <p className="mt-2 font-mono">{coach.hourlyRate} / hr</p>
            ) : null}
            <Link
              className="mt-4 inline-block text-sm text-eos-telemetry underline-offset-4 hover:underline"
              href={`/trainer/${coach.id}`}
            >
              View profile
            </Link>
          </BentoCard>
        ))}
      </div>
      {source ? <p className="text-xs text-eos-on-surface-muted">Source: {source}</p> : null}
    </div>
  );
}
