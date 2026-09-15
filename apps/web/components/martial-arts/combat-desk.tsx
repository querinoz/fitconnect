"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { getDiscipline, listDisciplines, WEIGHT_SAFETY_COPY, buildSharePayload } from "@/lib/combat";

type SessionRow = {
  id: string;
  discipline_id: string;
  session_mode: string;
  rounds_completed: number;
  rpe: number | null;
  started_at: string;
};

type ProfileRow = {
  primary_discipline_id: string | null;
  gym: string | null;
  coach: string | null;
  rank: string | null;
  weight_class: string | null;
};

type CompetitionRow = {
  id: string;
  discipline_id: string;
  ruleset_id: string;
  ruleset_version: string;
  event_name: string | null;
  outcome: string | null;
  source: string;
};

export function CombatDesk() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionRow[]>([]);
  const [status, setStatus] = useState("empty");
  const [gym, setGym] = useState("");
  const [coach, setCoach] = useState("");
  const [primary, setPrimary] = useState("boxing");
  const [logKind, setLogKind] = useState<"strike" | "grappling">("strike");
  const [note, setNote] = useState("");

  useEffect(() => {
    void (async () => {
      const [s, p, c] = await Promise.all([
        fetch("/api/v1/martial-arts/sessions", { credentials: "include" }).catch(() => null),
        fetch("/api/v1/martial-arts/profile", { credentials: "include" }).catch(() => null),
        fetch("/api/v1/martial-arts/competitions", { credentials: "include" }).catch(() => null)
      ]);
      if (!s || !p || !c) {
        setStatus("local");
        return;
      }
      if (s.status === 401 || p.status === 401) {
        setStatus("signin");
        return;
      }
      const sessionsJson = s.ok ? ((await s.json()) as { items?: SessionRow[] }) : { items: [] };
      const profileJson = p.ok
        ? ((await p.json()) as { profile?: ProfileRow | null; empty?: boolean })
        : { profile: null };
      const compsJson = c.ok ? ((await c.json()) as { items?: CompetitionRow[] }) : { items: [] };
      setSessions(sessionsJson.items ?? []);
      setProfile(profileJson.profile ?? null);
      setCompetitions(compsJson.items ?? []);
      if (profileJson.profile?.gym) setGym(profileJson.profile.gym);
      if (profileJson.profile?.coach) setCoach(profileJson.profile.coach);
      if (profileJson.profile?.primary_discipline_id) setPrimary(profileJson.profile.primary_discipline_id);
      setStatus(s.status === 503 ? "local" : "ready");
    })();
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/v1/martial-arts/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ primaryDisciplineId: primary, gym: gym || null, coach: coach || null })
    });
    setNote(res.status === 503 ? "Cloud profile unavailable. Nothing invented." : res.ok ? "Profile saved." : "Profile save failed.");
  }

  async function logManual() {
    const latest = sessions[0];
    if (!latest) {
      setNote("Start a TRAIN combat session first. Manual technique needs a real session.");
      return;
    }
    const res = await fetch(`/api/v1/martial-arts/sessions/${latest.id}/events`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: logKind,
        source: "MANUAL",
        payload: logKind === "strike" ? { strikeKind: "punch", punchClass: "unclassified" } : { grapplingKind: "control" }
      })
    });
    setNote(
      res.status === 503
        ? "Event kept off-cloud (database not configured)."
        : res.ok
          ? "Manual event recorded as CONFIRMED by you."
          : "Could not record the event."
    );
  }

  async function logCompetition() {
    const d = getDiscipline(primary);
    const ruleset = d?.rulesets[0];
    if (!d || !ruleset) return;
    const res = await fetch("/api/v1/martial-arts/competitions", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        disciplineId: d.id,
        rulesetId: ruleset.id,
        rulesetVersion: ruleset.version,
        source: "athlete",
        eventName: "Training record",
        outcome: null
      })
    });
    setNote(res.status === 503 ? "Competition history stays local until persistence is configured." : res.ok ? "Competition metadata stored. Not an official result." : "Competition save failed.");
  }

  const share = buildSharePayload({
    title: sessions[0] ? `Completed ${sessions[0].rounds_completed} rounds` : "Combat session",
    disciplineName: getDiscipline(sessions[0]?.discipline_id ?? primary)?.name ?? "Martial Arts",
    roundsCompleted: sessions[0]?.rounds_completed ?? null
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2" data-testid="combat-desk">
      <BentoCard label="SESSIONS" elevation="2">
        <p className="font-display text-2xl">History</p>
        {status === "signin" ? <p className="mt-2 text-sm">Sign in to load owned sessions.</p> : null}
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-eos-on-surface-muted">No combat sessions yet. Empty stays empty.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {sessions.map((row) => (
              <li key={row.id}>
                {getDiscipline(row.discipline_id)?.name ?? row.discipline_id} · {row.session_mode} · {row.rounds_completed} rounds
              </li>
            ))}
          </ul>
        )}
        <Link className="mt-4 inline-block text-eos-telemetry underline-offset-4 hover:underline" href="/train?sport=martial_arts">
          Start Fight Mode in TRAIN
        </Link>
      </BentoCard>

      <BentoCard label="PROFILE" elevation="2">
        <p className="font-display text-2xl">Athlete combat profile</p>
        <label className="mt-4 block text-sm">
          Primary discipline
          <select
            className="mt-1 w-full rounded-xl border border-eos-outline bg-eos-floor px-3 py-2"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
          >
            {listDisciplines().map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          Gym / team
          <input
            className="mt-1 w-full rounded-xl border border-eos-outline bg-eos-floor px-3 py-2"
            value={gym}
            onChange={(e) => setGym(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          Coach
          <input
            className="mt-1 w-full rounded-xl border border-eos-outline bg-eos-floor px-3 py-2"
            value={coach}
            onChange={(e) => setCoach(e.target.value)}
          />
        </label>
        <p className="mt-2 text-xs text-eos-on-surface-muted">
          Rank stays empty until you or a coach confirm it. Current: {profile?.rank ?? "—"}
        </p>
        <button type="button" className="mt-4 min-h-11 rounded-full bg-eos-voltline px-5 font-display text-eos-floor" onClick={() => void saveProfile()}>
          Save profile
        </button>
      </BentoCard>

      <BentoCard label="TECHNIQUE LOG" elevation="2">
        <p className="font-display text-2xl">Manual confirmation</p>
        <p className="mt-2 text-sm text-eos-on-surface-muted">IMU detections stay DETECTED until you confirm. This log is athlete-confirmed.</p>
        <div className="mt-3 flex gap-2">
          <button type="button" className="min-h-11 rounded-full border border-eos-outline px-4" onClick={() => setLogKind("strike")}>
            Strike
          </button>
          <button type="button" className="min-h-11 rounded-full border border-eos-outline px-4" onClick={() => setLogKind("grappling")}>
            Grappling
          </button>
        </div>
        <button type="button" className="mt-4 min-h-11 rounded-full bg-eos-voltline px-5 font-display text-eos-floor" onClick={() => void logManual()}>
          Log {logKind}
        </button>
      </BentoCard>

      <BentoCard label="COMPETITION" elevation="2">
        <p className="font-display text-2xl">Ruleset-aware record</p>
        {competitions.length === 0 ? (
          <p className="mt-3 text-sm text-eos-on-surface-muted">No competition rows. Official scores are never generated from a wearable.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {competitions.map((row) => (
              <li key={row.id}>
                {row.event_name ?? "Unnamed"} · {row.ruleset_id} v{row.ruleset_version} · {row.source} · {row.outcome ?? "no result"}
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="mt-4 min-h-11 rounded-full border border-eos-outline px-5" onClick={() => void logCompetition()}>
          Store athlete-sourced metadata
        </button>
        <p className="mt-4 text-xs text-eos-on-surface-muted">{WEIGHT_SAFETY_COPY}</p>
      </BentoCard>

      <BentoCard label="SHARE" elevation="2" className="lg:col-span-2">
        <p className="font-display text-2xl">Social, without biometrics</p>
        {"error" in share ? (
          <p className="mt-2 text-sm">Share blocked because the title contains sensitive content.</p>
        ) : (
          <p className="mt-2 text-sm">
            {share.title} · {share.disciplineName}
            {share.roundsCompleted != null ? ` · ${share.roundsCompleted} rounds` : ""} · biometrics excluded
          </p>
        )}
        {note ? <p className="mt-3 text-sm text-eos-iris">{note}</p> : null}
      </BentoCard>
    </div>
  );
}
