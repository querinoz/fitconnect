"use client";

import { useEffect, useMemo, useState } from "react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { adaptTodaySession, type TodayTrainingCard } from "@/lib/sport-intelligence/adaptation-engine";
import { emptySportsIdentity } from "@/lib/sport-intelligence/sports-identity";
import {
  fetchSportsIdentity,
  persistSportsIdentity,
  loadSportsIdentityCache
} from "@/lib/sport-intelligence/identity-store";
import { listSports, listSportGroups, gpsSupported, type SportId, type SportGroupId } from "@/lib/sport-intelligence/sport-registry";
import { recommendSessionAdaptation } from "@/lib/sports-intelligence/adaptive-training";
import { computeTrainingLoad } from "@/lib/sports-intelligence/training-load";
import type { ReadinessView } from "@/lib/train/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  readiness: ReadinessView;
  userId: string;
  /** Legacy train filter sport → mapped when possible */
  legacySportFilter?: string;
  onStartLegacyPlan: (planId: string) => void;
};

export function TodaySportEngine({ readiness, userId, legacySportFilter, onStartLegacyPlan }: Props) {
  const [sportId, setSportId] = useState<SportId>("STRENGTH");
  const [groupId, setGroupId] = useState<SportGroupId | null>(null);
  const [sportQuery, setSportQuery] = useState("");
  const [fuel, setFuel] = useState<{
    kcal: number | null;
    confidence: string;
    flags: string[];
  } | null>(null);
  const [adaptationConfirmed, setAdaptationConfirmed] = useState(false);
  const groups = useMemo(() => listSportGroups(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await fetchSportsIdentity(userId);
      if (cancelled) return;
      if (stored.primarySport) {
        setSportId(stored.primarySport);
        return;
      }
      if (legacySportFilter && legacySportFilter !== "all") {
        const hit = listSports().find((s) => s.legacyTrainSports.includes(legacySportFilter));
        if (hit) setSportId(hit.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [legacySportFilter, userId]);

  function selectSport(next: SportId) {
    setSportId(next);
    setAdaptationConfirmed(false);
    void persistSportsIdentity({
      ...loadSportsIdentityCache(userId),
      userId,
      primarySport: next
    });
  }

  const card: TodayTrainingCard = useMemo(() => {
    const profile = emptySportsIdentity(userId);
    profile.primarySport = sportId;
    return adaptTodaySession({
      profile,
      readiness,
      recentPlanIds: []
    });
  }, [userId, sportId, readiness]);

  const adaptation = useMemo(() => {
    const load = computeTrainingLoad([]);
    const label =
      card.trainingLoadLabel === "HIGH"
        ? ("HIGH" as const)
        : card.trainingLoadLabel === "LOW"
          ? ("LOW" as const)
          : card.trainingLoadLabel === "MODERATE"
            ? ("MODERATE" as const)
            : load.label;
    return recommendSessionAdaptation({
      trainingLoad: { ...load, label },
      readinessScore: card.readinessScore,
      readinessState:
        card.readinessState === "AVAILABLE"
          ? "HIGH"
          : card.readinessState === "MISSING" || card.readinessState === "NOT_CONNECTED"
            ? "NOT_AVAILABLE"
            : "LOW",
      availableMin: null,
      plannedDurationMin: card.session.durationMin
    });
  }, [card]);

  useEffect(() => {
    let cancelled = false;
    async function loadFuel() {
      try {
        const day =
          card.trainingLoadLabel === "HIGH"
            ? "hard"
            : card.trainingLoadLabel === "LOW"
              ? "easy"
              : "moderate";
        const res = await fetch(
          `/api/v1/nutrition/targets?sport=${encodeURIComponent(sportId)}&day=${day}&durationMin=${card.session.durationMin}&goal=PERFORMANCE`,
          { credentials: "include" }
        );
        if (!res.ok) {
          if (!cancelled) setFuel(null);
          return;
        }
        const body = (await res.json()) as {
          targets?: { kcal: number | null; confidence: string; safetyFlags?: Array<{ message: string }> };
        };
        if (!cancelled) {
          setFuel({
            kcal: body.targets?.kcal ?? null,
            confidence: body.targets?.confidence ?? "LOW",
            flags: (body.targets?.safetyFlags ?? []).map((f) => f.message)
          });
        }
      } catch {
        if (!cancelled) setFuel(null);
      }
    }
    void loadFuel();
    return () => {
      cancelled = true;
    };
  }, [sportId, card.session.durationMin, card.trainingLoadLabel]);

  return (
    <BentoCard label="TODAY · TRAINING HUB" className="space-y-4" data-testid="today-sport-engine">
      {!groupId ? (
        <div className="space-y-2" data-testid="sport-selector-groups">
          <p className="eos-label-caps text-eos-telemetry">LEVEL 1 · SPORT GROUPS</p>
          <div className="flex flex-wrap gap-2" role="listbox" aria-label="Sport groups">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                role="option"
                className="min-h-11 rounded-full border border-eos-outline-variant px-3 text-xs font-semibold uppercase tracking-wide text-eos-on-surface-muted"
                onClick={() => {
                  setGroupId(g.id);
                  setSportQuery("");
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2" data-testid="sport-selector-level2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eos-label-caps text-eos-telemetry">
              LEVEL 2 · {groups.find((g) => g.id === groupId)?.label}
            </p>
            <button
              type="button"
              className="min-h-10 rounded-full border border-eos-outline px-3 text-xs font-semibold uppercase"
              onClick={() => setGroupId(null)}
            >
              Back to groups
            </button>
          </div>
          <input
            type="search"
            value={sportQuery}
            onChange={(e) => setSportQuery(e.target.value)}
            placeholder="Search sports"
            className="min-h-11 w-full rounded-xl border border-eos-outline-variant bg-transparent px-3 text-sm"
            data-testid="sport-selector-search"
          />
          <div className="flex flex-wrap gap-2" role="listbox" aria-label="Sports in group">
            {(groups.find((g) => g.id === groupId)?.sports ?? [])
              .filter(
                (s) =>
                  !sportQuery.trim() ||
                  s.label.toLowerCase().includes(sportQuery.trim().toLowerCase()) ||
                  s.id.toLowerCase().includes(sportQuery.trim().toLowerCase())
              )
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={sportId === s.id}
                  className={cn(
                    "min-h-11 rounded-full border px-3 text-xs font-semibold uppercase tracking-wide",
                    sportId === s.id
                      ? "border-eos-voltline bg-eos-voltline/15 text-eos-voltline"
                      : "border-eos-outline-variant text-eos-on-surface-muted"
                  )}
                  onClick={() => selectSport(s.id)}
                >
                  {s.label}
                  {gpsSupported(s.id) ? " · GPS" : ""}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="SPORT" value={listSports().find((s) => s.id === card.sportId)?.label ?? card.sportId} />
        <Meta label="SESSION TYPE" value={card.session.sessionType.replace(/_/g, " ")} />
        <Meta label="INTENT" value={card.session.intent} />
        <Meta
          label="READINESS"
          value={
            card.readinessState === "AVAILABLE" && card.readinessScore != null
              ? String(card.readinessScore)
              : card.readinessState
          }
        />
        <Meta label="TRAINING LOAD" value={card.trainingLoadLabel} />
        <Meta label="DURATION" value={`${card.session.durationMin} min`} />
        <Meta label="ADAPTED" value={card.adapted ? "Yes" : "Catalog"} />
        <Meta label="CONFIDENCE" value={card.session.explanation.confidence} />
      </div>

      <div className="rounded-2xl border border-eos-outline-variant/40 bg-eos-surface-container/40 p-4">
        <p className="eos-label-caps text-eos-telemetry">Session blocks</p>
        <ol className="mt-2 space-y-1 text-sm text-eos-on-surface">
          {card.session.blocks.map((b) => (
            <li key={b.id}>
              <span className="font-semibold text-eos-voltline">{b.kind}</span>
              {" · "}
              {b.title}
              {b.durationMin != null ? ` · ${b.durationMin} min` : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-1 text-sm text-eos-on-surface-muted">
        <p>
          <span className="font-semibold text-eos-on-surface">WHY: </span>
          {card.session.explanation.why}
        </p>
        <p>
          <span className="font-semibold text-eos-on-surface">DATA: </span>
          {card.session.explanation.dataUsed.join(" · ")}
        </p>
      </div>

      <div
        className="rounded-2xl border border-eos-outline-variant/40 bg-eos-surface-container/40 p-4 space-y-2"
        data-testid="train-adaptation-confirm"
      >
        <p className="eos-label-caps text-eos-telemetry">ADAPTATION · CONFIRM ONLY</p>
        <p className="text-sm">
          <span className="font-semibold">WHAT: </span>
          {adaptation.what}
        </p>
        <p className="text-sm text-eos-on-surface-muted">
          <span className="font-semibold text-eos-on-surface">WHY: </span>
          {adaptation.why}
        </p>
        <p className="text-sm text-eos-on-surface-muted">
          <span className="font-semibold text-eos-on-surface">DATA: </span>
          {adaptation.data.join(" · ")}
        </p>
        <p className="text-sm">
          <span className="font-semibold">CONFIDENCE: </span>
          {adaptation.confidence}
        </p>
        <p className="text-xs text-eos-on-surface-muted">
          {adaptationConfirmed
            ? `Confirmed for this session · ${adaptation.action} (not auto-applied)`
            : "Not applied until you confirm. Auto-apply is forbidden."}
        </p>
        {adaptation.action !== "KEEP" ? (
          <button
            type="button"
            className="min-h-11 rounded-full border border-eos-voltline px-4 text-xs font-bold uppercase tracking-wide text-eos-voltline disabled:opacity-50"
            disabled={adaptationConfirmed}
            onClick={() => setAdaptationConfirmed(true)}
          >
            {adaptationConfirmed ? "Confirmed" : "Confirm adaptation"}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-12 rounded-full bg-eos-voltline px-6 text-sm font-bold uppercase tracking-wide text-eos-floor"
          disabled={!card.session.legacyPlanId}
          onClick={() => {
            if (card.session.legacyPlanId) onStartLegacyPlan(card.session.legacyPlanId);
          }}
        >
          Start session
        </button>
        <p className="self-center text-xs text-eos-on-surface-muted">
          Starts the linked catalog session in the existing TRAIN engine (offline-capable).
        </p>
      </div>
      <div className="flex flex-wrap gap-3" data-testid="train-domain-ctas">
        <Link
          href="/nutrition"
          className="min-h-11 rounded-full border border-eos-outline px-4 text-sm font-semibold uppercase tracking-wide text-eos-on-surface inline-flex items-center"
        >
          Open nutrition
          {fuel?.kcal != null ? ` · ${fuel.kcal} kcal EST` : ""}
        </Link>
        {gpsSupported(sportId) ? (
          <Link
            href="/map"
            className="min-h-11 rounded-full border border-eos-outline px-4 text-sm font-semibold uppercase tracking-wide text-eos-on-surface inline-flex items-center"
            data-testid="train-open-routes"
          >
            Open routes
          </Link>
        ) : null}
      </div>
    </BentoCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-eos-outline-variant/30 px-3 py-2">
      <p className="eos-label-caps text-[10px] text-eos-on-surface-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-eos-on-surface">{value}</p>
    </div>
  );
}
