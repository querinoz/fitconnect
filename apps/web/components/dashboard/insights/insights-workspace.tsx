"use client";

import { useMemo, useState } from "react";
import {
  BentoCard,
  EliteButton,
  EliteChip,
  LabelCaps,
  MetricDisplay
} from "@/components/elite-os";
import {
  ATL_POINTS,
  BENCH_POINTS,
  CTL_POINTS,
  DEADLIFT_POINTS,
  HRV_POINTS,
  INSIGHTS_HISTORY,
  SQUAT_POINTS,
  downloadCsv,
  historyToCsv,
  type HistoryRow
} from "@/lib/dashboard/insights-demo";
import { useLocale } from "@/lib/i18n-provider";
import {
  ackTransfer,
  claimStart,
  offerTransfer,
  originLabel,
  type SessionLease
} from "@/lib/sync/session-ownership";

type InsightsPanel = "load" | "progression" | "sleep" | "history" | "compare" | "notes";
export type InsightsQaState = "default" | "loading" | "empty" | "error" | "offline";
type ExerciseKey = "squat" | "bench" | "deadlift";

const WEB_DEVICE = "web-1";
const WATCH_DEVICE = "SM-R860";

function seedWatchLease(): SessionLease {
  const started = claimStart(null, {
    sessionId: "local-demo-run",
    deviceId: WATCH_DEVICE,
    sportKey: "Run",
    nowEpochMs: Date.now() - 18 * 60 * 1000
  });
  if (!started.ok) {
    throw new Error("LOCAL_DEMO lease must start");
  }
  return started.lease;
}

function Sparkline({
  points,
  strokeVar,
  labelledBy
}: {
  points: string;
  strokeVar: string;
  labelledBy: string;
}) {
  return (
    <svg className="h-[220px] w-full" viewBox="0 0 640 220" role="img" aria-labelledby={labelledBy}>
      <line
        x1="32"
        y1="200"
        x2="620"
        y2="200"
        stroke="var(--eos-outline)"
        strokeWidth="1"
      />
      <polyline fill="none" stroke={strokeVar} strokeWidth="2" points={points} />
    </svg>
  );
}

export function InsightsWorkspace() {
  const copy = useLocale().insights;
  const [panel, setPanel] = useState<InsightsPanel>("load");
  const [qa, setQa] = useState<InsightsQaState>("default");
  const [lease, setLease] = useState<SessionLease>(seedWatchLease);
  const [ownerNote, setOwnerNote] = useState(copy.ownerNote);
  const [exercise, setExercise] = useState<ExerciseKey>("squat");
  const [sport, setSport] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [query, setQuery] = useState("");

  const origin = originLabel(lease.ownerDeviceId);
  const isWebOwner = lease.ownerDeviceId === WEB_DEVICE;

  const rows = useMemo(() => {
    const filtered = INSIGHTS_HISTORY.filter((row) => {
      const hay = `${row.date} ${row.sport} ${row.origin}`.toLowerCase();
      const sportOk = !sport || row.sport === sport;
      const queryOk = !query || hay.includes(query.toLowerCase());
      return sportOk && queryOk;
    });
    return [...filtered].sort((a, b) =>
      sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    );
  }, [query, sortAsc, sport]);

  const exerciseSeries: Record<ExerciseKey, { points: string; summary: string }> = {
    squat: { points: SQUAT_POINTS, summary: copy.squatSummary },
    bench: { points: BENCH_POINTS, summary: copy.benchSummary },
    deadlift: { points: DEADLIFT_POINTS, summary: copy.deadliftSummary }
  };

  const transferToWeb = () => {
    const now = Date.now();
    const offered = offerTransfer(lease, WEB_DEVICE, now);
    if (!offered.ok) {
      setOwnerNote(offered.code);
      return;
    }
    const acked = ackTransfer(offered.lease, WEB_DEVICE, now + 1);
    if (!acked.ok) {
      setOwnerNote(acked.code);
      return;
    }
    setLease(acked.lease);
    setOwnerNote(copy.ownerNoteDone);
  };

  const panels: { id: InsightsPanel; label: string }[] = [
    { id: "load", label: copy.panelLoad },
    { id: "progression", label: copy.panelProgression },
    { id: "sleep", label: copy.panelSleep },
    { id: "history", label: copy.panelHistory },
    { id: "compare", label: copy.panelCompare },
    { id: "notes", label: copy.panelNotes }
  ];

  const titles: Record<InsightsPanel, string> = {
    load: copy.titleLoad,
    progression: copy.titleProgression,
    sleep: copy.titleSleep,
    history: copy.titleHistory,
    compare: copy.titleCompare,
    notes: copy.titleNotes
  };

  return (
    <div className="mx-auto w-full max-w-[88rem] space-y-4 p-4 sm:p-5 md:p-8" data-qa={qa}>
      <div
        className="flex flex-wrap items-center gap-3 rounded-[var(--eos-radius-card)] border border-eos-telemetry/30 bg-eos-elevated px-4 py-3"
        role="status"
      >
        <EliteChip as="span" tone="telemetry">
          {origin}
        </EliteChip>
        <strong className="text-sm text-eos-on-surface">
          {isWebOwner ? copy.bannerWeb : copy.bannerWatch}
        </strong>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-eos-on-surface-subtle">
          {copy.bannerMeta}
        </span>
        {!isWebOwner ? (
          <EliteButton type="button" size="sm" onClick={transferToWeb}>
            {copy.transfer}
          </EliteButton>
        ) : null}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-eos-on-surface-subtle">
          {ownerNote}
        </span>
      </div>

      <LabelCaps className="text-eos-on-surface-subtle">{copy.kicker}</LabelCaps>

      <div className="grid gap-4 min-[900px]:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)]">
        <nav
          aria-label={copy.panelLoad}
          className="flex gap-1 overflow-x-auto min-[900px]:flex-col min-[900px]:overflow-visible"
        >
          {panels.map((item) => (
            <EliteButton
              key={item.id}
              type="button"
              variant={panel === item.id ? "secondary" : "ghost"}
              size="sm"
              aria-current={panel === item.id ? "page" : undefined}
              onClick={() => setPanel(item.id)}
              className="justify-start shrink-0"
            >
              {item.label}
            </EliteButton>
          ))}
        </nav>

        <main id="insights-main" className="min-w-0 space-y-4">
          <h1 className="eos-label-caps text-eos-on-surface-subtle">{titles[panel]}</h1>

          {qa !== "default" ? (
            <QaMessage
              panel={panel}
              qa={qa}
              copy={copy}
              onRetry={() => setQa("default")}
            />
          ) : (
            <PanelBody
              panel={panel}
              copy={copy}
              exercise={exercise}
              onExercise={setExercise}
              exerciseSeries={exerciseSeries}
              rows={rows}
              sport={sport}
              onSport={setSport}
              onSort={() => setSortAsc((v) => !v)}
              query={query}
              onQuery={setQuery}
            />
          )}
        </main>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={copy.qaLabel}>
        <LabelCaps className="text-eos-on-surface-subtle">{copy.qaLabel}</LabelCaps>
        {(
          [
            ["default", copy.qaDefault],
            ["loading", copy.qaLoading],
            ["empty", copy.qaEmpty],
            ["error", copy.qaError],
            ["offline", copy.qaOffline]
          ] as const
        ).map(([id, label]) => (
          <EliteButton
            key={id}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={qa === id}
            onClick={() => setQa(id)}
          >
            {label}
          </EliteButton>
        ))}
      </div>
    </div>
  );
}

function QaMessage({
  panel,
  qa,
  copy,
  onRetry
}: {
  panel: InsightsPanel;
  qa: InsightsQaState;
  copy: ReturnType<typeof useLocale>["insights"];
  onRetry: () => void;
}) {
  const emptyMap: Record<InsightsPanel, string> = {
    load: copy.emptyLoad,
    progression: copy.emptyProgression,
    sleep: copy.emptySleep,
    history: copy.emptyHistory,
    compare: copy.emptyCompare,
    notes: copy.emptyLoad
  };
  const errorMap: Record<InsightsPanel, string> = {
    load: copy.errorLoad,
    progression: copy.errorProgression,
    sleep: copy.emptySleep,
    history: copy.errorHistory,
    compare: copy.errorCompare,
    notes: copy.errorLoad
  };
  const offlineMap: Record<InsightsPanel, string> = {
    load: copy.offlineLoad,
    progression: copy.offlineProgression,
    sleep: copy.offlineSleep,
    history: copy.offlineHistory,
    compare: copy.offlineCompare,
    notes: copy.offlineLoad
  };

  return (
    <div className="rounded-[var(--eos-radius-card)] border border-eos-outline bg-eos-carbon p-5 text-sm text-eos-on-surface-muted">
      {qa === "loading" ? (
        <div className="space-y-3">
          <div className="h-32 animate-pulse rounded-[var(--eos-radius-nested)] bg-eos-elevated motion-reduce:animate-none" />
          <p>{copy.loading}</p>
        </div>
      ) : null}
      {qa === "empty" ? <p>{emptyMap[panel]}</p> : null}
      {qa === "error" ? (
        <p className="flex flex-wrap items-center gap-2">
          <span>{errorMap[panel]}</span>
          <EliteButton type="button" variant="ghost" size="sm" onClick={onRetry}>
            {copy.retry}
          </EliteButton>
        </p>
      ) : null}
      {qa === "offline" ? <p>{offlineMap[panel]}</p> : null}
    </div>
  );
}

function PanelBody({
  panel,
  copy,
  exercise,
  onExercise,
  exerciseSeries,
  rows,
  sport,
  onSport,
  onSort,
  query,
  onQuery
}: {
  panel: InsightsPanel;
  copy: ReturnType<typeof useLocale>["insights"];
  exercise: ExerciseKey;
  onExercise: (v: ExerciseKey) => void;
  exerciseSeries: Record<ExerciseKey, { points: string; summary: string }>;
  rows: HistoryRow[];
  sport: string;
  onSport: (v: string) => void;
  onSort: () => void;
  query: string;
  onQuery: (v: string) => void;
}) {
  if (panel === "load") {
    return (
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-[2fr_1fr]">
        <BentoCard elevation="1" padding="md">
          <h2 className="eos-headline mb-2 text-lg">{copy.loadHeading}</h2>
          <p id="load-summary" className="mb-4 max-w-[65ch] text-sm text-eos-on-surface-muted">
            {copy.loadSummary}
          </p>
          <svg
            className="h-[220px] w-full"
            viewBox="0 0 640 220"
            role="img"
            aria-labelledby="load-summary"
          >
            <title>{copy.titleLoad}</title>
            <line x1="32" y1="200" x2="620" y2="200" stroke="var(--eos-outline)" />
            <polyline
              fill="none"
              stroke="var(--eos-chart-2)"
              strokeWidth="2"
              points={CTL_POINTS}
            />
            <polyline
              fill="none"
              stroke="var(--eos-chart-1)"
              strokeWidth="2"
              points={ATL_POINTS}
            />
          </svg>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-eos-on-surface-muted">
            <span className="inline-flex items-center gap-2">
              <i className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--eos-chart-2)" }} aria-hidden />
              {copy.ctlLegend}
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--eos-chart-1)" }} aria-hidden />
              {copy.atlLegend}
            </span>
            <EliteChip as="span" tone="volt">
              {copy.localDemo}
            </EliteChip>
          </div>
        </BentoCard>
        <BentoCard elevation="1" padding="md">
          <h3 className="eos-headline mb-2 text-base">{copy.recoveryHeading}</h3>
          <MetricDisplay value={copy.recoveryScore} />
          <LabelCaps className="mt-2 text-eos-on-surface-subtle">{copy.recoveryHint}</LabelCaps>
          <p className="mt-3 text-sm text-eos-on-surface-muted">{copy.recoveryBody}</p>
        </BentoCard>
      </div>
    );
  }

  if (panel === "progression") {
    const series = exerciseSeries[exercise];
    return (
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-[2fr_1fr]">
        <BentoCard elevation="1" padding="md">
          <h2 className="eos-headline mb-2 text-lg">{copy.progHeading}</h2>
          <label className="eos-label-caps mb-1 block text-eos-on-surface-subtle" htmlFor="insights-ex">
            {copy.exerciseLabel}
          </label>
          <select
            id="insights-ex"
            className="mb-4 h-11 w-full max-w-xs rounded-[var(--eos-radius-nested)] border border-eos-outline bg-eos-floor px-3 text-sm text-eos-on-surface focus:border-eos-iris focus:outline-none"
            value={exercise}
            onChange={(e) => onExercise(e.target.value as ExerciseKey)}
          >
            <option value="squat">{copy.squat}</option>
            <option value="bench">{copy.bench}</option>
            <option value="deadlift">{copy.deadlift}</option>
          </select>
          <p id="prog-summary" className="mb-4 max-w-[65ch] text-sm text-eos-on-surface-muted">
            {series.summary}
          </p>
          <Sparkline points={series.points} strokeVar="var(--eos-chart-2)" labelledBy="prog-summary" />
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-eos-on-surface-muted">
            <span>{copy.oneRmLegend}</span>
            <EliteChip as="span" tone="telemetry">
              PHONE
            </EliteChip>
          </div>
        </BentoCard>
        <BentoCard elevation="1" padding="md">
          <h3 className="eos-headline mb-2 text-base">{copy.distHeading}</h3>
          <p id="dist-summary" className="mb-4 text-sm text-eos-on-surface-muted">
            {copy.distSummary}
          </p>
          <div className="space-y-3" aria-labelledby="dist-summary">
            <BarRow label={copy.strength} pct={46} fill="var(--eos-chart-2)" />
            <BarRow label={copy.cardio} pct={38} fill="var(--eos-chart-1)" />
            <BarRow label={copy.mobility} pct={16} fill="var(--eos-chart-3)" />
          </div>
        </BentoCard>
      </div>
    );
  }

  if (panel === "sleep") {
    return (
      <BentoCard elevation="1" padding="md">
        <h2 className="eos-headline mb-2 text-lg">{copy.sleepHeading}</h2>
        <p id="sleep-summary" className="mb-4 max-w-[65ch] text-sm text-eos-on-surface-muted">
          {copy.sleepSummary}
        </p>
        <Sparkline points={HRV_POINTS} strokeVar="var(--eos-chart-1)" labelledBy="sleep-summary" />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-eos-on-surface-muted">
          <span>{copy.hrvLegend}</span>
          <EliteChip as="span">IMPORT</EliteChip>
          <EliteChip as="span" tone="volt">
            {copy.localDemo}
          </EliteChip>
        </div>
      </BentoCard>
    );
  }

  if (panel === "history") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="eos-label-caps mb-1 block text-eos-on-surface-subtle" htmlFor="sport-filter">
              {copy.sportFilter}
            </label>
            <select
              id="sport-filter"
              className="h-11 rounded-[var(--eos-radius-nested)] border border-eos-outline bg-eos-floor px-3 text-sm text-eos-on-surface focus:border-eos-iris focus:outline-none"
              value={sport}
              onChange={(e) => onSport(e.target.value)}
            >
              <option value="">{copy.allSports}</option>
              <option>Run</option>
              <option>Ride</option>
              <option>Strength</option>
            </select>
          </div>
          <label className="sr-only" htmlFor="history-search">
            {copy.panelHistory}
          </label>
          <input
            id="history-search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Run, WATCH, 2026"
            className="h-11 min-w-[12rem] flex-1 rounded-[var(--eos-radius-nested)] border border-eos-outline bg-eos-floor px-3 text-sm text-eos-on-surface placeholder:text-eos-on-surface-subtle focus:border-eos-iris focus:outline-none"
          />
          <EliteButton type="button" variant="ghost" size="sm" onClick={onSort}>
            {copy.sortDate}
          </EliteButton>
          <EliteButton
            type="button"
            size="sm"
            onClick={() =>
              downloadCsv("fitconnect-history-LOCAL_DEMO.csv", historyToCsv(rows))
            }
          >
            {copy.exportCsv}
          </EliteButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="eos-label-caps mb-2 text-left text-eos-on-surface-subtle">
              {copy.historyCaption}
            </caption>
            <thead>
              <tr className="border-b border-eos-outline text-eos-on-surface-subtle">
                <th className="py-2 pr-3 font-medium">{copy.colDate}</th>
                <th className="py-2 pr-3 font-medium">{copy.colSport}</th>
                <th className="py-2 pr-3 font-medium">{copy.colDuration}</th>
                <th className="py-2 pr-3 font-medium">{copy.colOrigin}</th>
                <th className="py-2 font-medium">{copy.colTss}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.date}-${row.sport}-${row.tss}`} className="border-b border-eos-outline/60">
                  <td className="py-2 pr-3 font-mono tabular-nums">{row.date}</td>
                  <td className="py-2 pr-3">{row.sport}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">{row.duration}</td>
                  <td className="py-2 pr-3">{row.origin}</td>
                  <td className="py-2 font-mono tabular-nums">{row.tss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (panel === "compare") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
          <BentoCard elevation="1" padding="md">
            <h2 className="eos-headline mb-2 text-lg">{copy.compareA}</h2>
            <MetricDisplay value="6" />
            <LabelCaps className="mt-2 text-eos-on-surface-subtle">{copy.sessionsLabel}</LabelCaps>
            <p className="mt-3 text-sm text-eos-on-surface-muted">{copy.compareABody}</p>
          </BentoCard>
          <BentoCard elevation="1" padding="md">
            <h2 className="eos-headline mb-2 text-lg">{copy.compareB}</h2>
            <MetricDisplay value="8" />
            <LabelCaps className="mt-2 text-eos-on-surface-subtle">{copy.sessionsLabel}</LabelCaps>
            <p className="mt-3 text-sm text-eos-on-surface-muted">{copy.compareBBody}</p>
          </BentoCard>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-eos-on-surface-subtle">
          {copy.compareNote}
        </p>
      </div>
    );
  }

  return (
    <BentoCard elevation="1" padding="md" className="space-y-3 text-sm text-eos-on-surface-muted">
      <p>{copy.notesBody1}</p>
      <p>{copy.notesBody2}</p>
      <p>{copy.notesBody3}</p>
      <p>{copy.notesBody4}</p>
    </BentoCard>
  );
}

function BarRow({ label, pct, fill }: { label: string; pct: number; fill: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs">
      <span className="text-eos-on-surface-muted">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-eos-elevated">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
      </div>
      <span className="font-mono tabular-nums text-eos-on-surface">{pct}%</span>
    </div>
  );
}
