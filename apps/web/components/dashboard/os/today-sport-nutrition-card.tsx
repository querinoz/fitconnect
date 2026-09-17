"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { adaptTodaySession } from "@/lib/sport-intelligence/adaptation-engine";
import {
  fetchSportsIdentity,
  persistSportsIdentity,
  loadSportsIdentityCache
} from "@/lib/sport-intelligence/identity-store";
import { emptySportsIdentity } from "@/lib/sport-intelligence/sports-identity";
import { listSports, type SportId } from "@/lib/sport-intelligence/sport-registry";
import { readinessFromApi } from "@/lib/train/readiness";
import type { ReadinessView } from "@/lib/train/types";

type Props = {
  athleteId: string;
};

/**
 * Athlete dashboard: WHAT SHOULD I DO TODAY?
 * Uses sport intelligence + nutrition ESTIMATE context — never fakes biometrics.
 */
export function TodaySportNutritionCard({ athleteId }: Props) {
  const [readiness, setReadiness] = useState<ReadinessView>(() =>
    readinessFromApi({ score: null, source: "pending" })
  );
  const [sportId, setSportId] = useState<SportId>("GENERAL_FITNESS");
  const [fuel, setFuel] = useState<{
    kcal: number | null;
    proteinG: number | null;
    carbohydrateG: number | null;
    confidence: string;
    estimateKind: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await fetchSportsIdentity(athleteId);
      if (!cancelled && stored.primarySport) setSportId(stored.primarySport);
    })();
    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/readiness", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setReadiness(readinessFromApi({ score: null, source: "unauthorized" }));
          return;
        }
        const body = await res.json();
        if (!cancelled) setReadiness(readinessFromApi(body));
      } catch {
        if (!cancelled) setReadiness(readinessFromApi({ score: null, source: "offline" }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const card = useMemo(() => {
    const profile = emptySportsIdentity(athleteId);
    profile.primarySport = sportId;
    return adaptTodaySession({ profile, readiness, recentPlanIds: [] });
  }, [athleteId, sportId, readiness]);

  useEffect(() => {
    let cancelled = false;
    const day =
      card.trainingLoadLabel === "HIGH" ? "hard" : card.trainingLoadLabel === "LOW" ? "easy" : "moderate";
    (async () => {
      try {
        const res = await fetch(
          `/api/v1/nutrition/targets?sport=${encodeURIComponent(sportId)}&day=${day}&durationMin=${card.session.durationMin}&goal=PERFORMANCE`,
          { credentials: "include" }
        );
        if (!res.ok) {
          if (!cancelled) setFuel(null);
          return;
        }
        const body = (await res.json()) as {
          targets?: {
            kcal: number | null;
            proteinG: number | null;
            carbohydrateG: number | null;
            confidence: string;
            estimateKind: string;
          };
        };
        if (!cancelled && body.targets) {
          setFuel({
            kcal: body.targets.kcal,
            proteinG: body.targets.proteinG,
            carbohydrateG: body.targets.carbohydrateG,
            confidence: body.targets.confidence,
            estimateKind: body.targets.estimateKind
          });
        }
      } catch {
        if (!cancelled) setFuel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sportId, card.trainingLoadLabel, card.session.durationMin]);

  function onSportChange(next: SportId) {
    setSportId(next);
    void persistSportsIdentity({
      ...loadSportsIdentityCache(athleteId),
      userId: athleteId,
      primarySport: next
    });
  }

  return (
    <BentoCard label="TODAY · WHAT SHOULD I DO?" className="space-y-4" data-testid="today-sport-nutrition">
      <div className="flex flex-wrap gap-2">
        {listSports()
          .slice(0, 8)
          .map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSportChange(s.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                sportId === s.id
                  ? "border-eos-voltline bg-eos-voltline/10 text-eos-voltline"
                  : "border-eos-outline text-eos-on-surface-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">Session</p>
          <p className="mt-1 text-lg font-semibold text-eos-on-surface">{card.session.title}</p>
          <p className="text-sm text-eos-on-surface-muted">
            {card.session.sessionType} · {card.session.durationMin} min · load {card.trainingLoadLabel}
          </p>
          <p className="mt-2 text-xs text-eos-telemetry">{card.session.explanation.why}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">Readiness</p>
          <p className="mt-1 font-mono text-2xl text-eos-voltline">
            {card.readinessState === "AVAILABLE" && card.readinessScore != null
              ? card.readinessScore
              : card.readinessState}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
            Nutrition context ({fuel?.estimateKind ?? "—"})
          </p>
          {fuel ? (
            <p className="mt-1 text-sm text-eos-on-surface">
              ~{fuel.kcal ?? "—"} kcal · P {fuel.proteinG ?? "—"}g · C {fuel.carbohydrateG ?? "—"}g
              <span className="ml-2 text-eos-on-surface-subtle">({fuel.confidence})</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-eos-on-surface-muted">NO PROFILE / UNAVAILABLE</p>
          )}
          <p className="mt-2 text-xs text-eos-on-surface-muted">{card.fuelingHint}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <EliteButton asChild size="sm">
          <Link href="/train">Open TRAIN</Link>
        </EliteButton>
        <EliteButton asChild variant="ghost" size="sm">
          <Link href="/ascend">Ascend</Link>
        </EliteButton>
      </div>
    </BentoCard>
  );
}
