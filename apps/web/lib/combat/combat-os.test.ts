import { describe, expect, it } from "vitest";
import {
  REQUIRED_DISCIPLINE_IDS,
  catalogIndex,
  getDiscipline,
  listDisciplines,
  defaultRoundPrescription
} from "./taxonomy";
import { reduceRound, IDLE_ROUND, formatClock } from "./round-engine";
import { assertHonestForce, measured, missingMeasurement, canMeasureDirectForce } from "./measurement";
import { createDetectedStrike, classifyStrike, createImpactSafety, safetyCopy } from "./events";
import { outputDecline, roundVolumes, neverFillChart, combinationSequences } from "./analytics";
import { adapterFor } from "./adapters";
import { combatRecoveryFromSignals } from "./recovery";
import { buildSharePayload } from "./social";
import { WEIGHT_SAFETY_COPY } from "./weight-class";
import { zenithCombatContext } from "./zenith";
import { metricAllowed } from "./sensors";
import {
  createDevMockPacket,
  packetMayClaimDirectForce,
  bleHardwareUnavailable
} from "./sensor-adapters";
import { classifyTechniqueHypothesis, TECHNIQUE_MODEL, assertNeverConfirmedFromModel } from "./technique-classifier";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeIngestEvent } from "./ingest";
import { accelerationOutlier, eventDedupeKey, isDuplicate, normalizeIso } from "./quality";
import { calibrationReady, emptyCalibration, kinematicsNeedCalibration } from "./calibration";

describe("Martial Arts taxonomy", () => {
  it("covers every required internationally practiced discipline", () => {
    const index = catalogIndex();
    expect(index.requiredCovered).toBe(true);
    expect(index.count).toBeGreaterThanOrEqual(REQUIRED_DISCIPLINE_IDS.length);
    for (const id of REQUIRED_DISCIPLINE_IDS) {
      expect(getDiscipline(id)?.id).toBe(id);
    }
  });

  it("does not treat Capoeira as a strike-rate combat skin", () => {
    const capoeira = getDiscipline("capoeira")!;
    expect(capoeira.unescoIch?.id).toBe("00892");
    expect(capoeira.family).toBe("traditional_cultural");
    expect(capoeira.practiceKinds).toContain("cultural_practice");
    expect(adapterFor("capoeira")?.headlineIsNotStrikeRate).toBe(true);
    expect(capoeira.sessionModes).toContain("roda");
    expect(defaultRoundPrescription("capoeira").sessionMode).toBe("roda");
  });

  it("keeps Silat and Pencak Silat as distinct UNESCO entries", () => {
    expect(getDiscipline("silat")?.unescoIch?.id).toBe("01504");
    expect(getDiscipline("pencak_silat")?.unescoIch?.id).toBe("01391");
    expect(getDiscipline("chidaoba")?.unescoIch?.id).toBe("01371");
  });

  it("versions Sambo rulesets instead of hardcoding eternal scoring", () => {
    const sambo = getDiscipline("sambo")!;
    expect(sambo.rulesets.some((r) => r.version.includes("2026"))).toBe(true);
    expect(sambo.rulesets.every((r) => r.officialScoringFromWearable === false)).toBe(true);
  });

  it("separates Wushu taolu from Sanda", () => {
    expect(getDiscipline("wushu")?.sessionModes).toContain("taolu");
    expect(getDiscipline("sanda")?.sessionModes).toContain("sanda");
    expect(getDiscipline("karate")?.sessionModes).toEqual(expect.arrayContaining(["kata", "kumite"]));
  });

  it("lists striking, grappling, mixed and cultural families", () => {
    expect(listDisciplines({ family: "striking" }).length).toBeGreaterThan(5);
    expect(listDisciplines({ family: "grappling" }).length).toBeGreaterThan(4);
    expect(listDisciplines({ family: "mixed" }).some((d) => d.id === "mma")).toBe(true);
    expect(listDisciplines({ family: "traditional_cultural" }).some((d) => d.id === "capoeira")).toBe(true);
  });
});

describe("Round engine", () => {
  it("runs countdown → work → warning → rest → next round → complete", () => {
    let snap = reduceRound(IDLE_ROUND, {
      type: "configure",
      disciplineId: "boxing",
      prescription: {
        roundCount: 2,
        workSec: 5,
        restSec: 2,
        warningSec: 2,
        countdownSec: 2,
        sessionMode: "bag_work"
      }
    });
    snap = reduceRound(snap, { type: "start", nowMs: 1 });
    expect(snap.phase).toBe("countdown");
    snap = reduceRound(snap, { type: "tick" });
    snap = reduceRound(snap, { type: "tick" });
    expect(snap.phase).toBe("work");
    expect(snap.currentRound).toBe(1);
    snap = reduceRound(snap, { type: "tick" });
    snap = reduceRound(snap, { type: "tick" });
    snap = reduceRound(snap, { type: "tick" });
    expect(snap.phase).toBe("warning");
    snap = reduceRound(snap, { type: "tick" });
    snap = reduceRound(snap, { type: "tick" });
    expect(snap.phase).toBe("rest");
    snap = reduceRound(snap, { type: "tick" });
    snap = reduceRound(snap, { type: "tick" });
    expect(snap.phase).toBe("work");
    expect(snap.currentRound).toBe(2);
    for (let i = 0; i < 5; i += 1) snap = reduceRound(snap, { type: "tick" });
    expect(snap.phase).toBe("complete");
    expect(formatClock(0)).toBe("00:00");
  });

  it("pauses and resumes without inventing completed rounds", () => {
    let snap = reduceRound(IDLE_ROUND, { type: "start", nowMs: 1 });
    snap = reduceRound(snap, { type: "pause" });
    expect(snap.phase).toBe("paused");
    const remaining = snap.remainingSec;
    snap = reduceRound(snap, { type: "tick" });
    expect(snap.remainingSec).toBe(remaining);
    snap = reduceRound(snap, { type: "resume" });
    expect(snap.phase).toBe("countdown");
  });

  it("skips rest and finishes without stranded phases", () => {
    let snap = reduceRound(IDLE_ROUND, {
      type: "configure",
      disciplineId: "bjj",
      prescription: {
        roundCount: 2,
        workSec: 2,
        restSec: 30,
        warningSec: 1,
        countdownSec: 0,
        sessionMode: "rolling"
      }
    });
    snap = reduceRound(snap, { type: "start", nowMs: 1 });
    snap = reduceRound(snap, { type: "tick" });
    snap = reduceRound(snap, { type: "tick" });
    expect(snap.phase).toBe("rest");
    snap = reduceRound(snap, { type: "skip_rest" });
    expect(snap.phase).toBe("work");
    expect(snap.currentRound).toBe(2);
    snap = reduceRound(snap, { type: "finish", nowMs: 9 });
    expect(snap.phase).toBe("complete");
  });
});

describe("Measurement honesty", () => {
  it("downgrades IMU force claims to estimated impact", () => {
    const raw = measured({
      metric: "impact_force",
      value: 900,
      unit: "N",
      measurementType: "DIRECT",
      sensor: "WATCH_IMU",
      source: "watch",
      provider: "WATCH_IMU",
      confidence: "HIGH",
      sessionId: "s1"
    });
    expect(raw.metric).toBe("impact_estimate");
    expect(raw.measurementType).toBe("ESTIMATED");
    expect(canMeasureDirectForce("WATCH_IMU")).toBe(false);
    expect(canMeasureDirectForce("INSTRUMENTED_BAG")).toBe(true);
    expect(assertHonestForce(raw).confidence).not.toBe("HIGH");
  });

  it("keeps missing force missing", () => {
    const missing = missingMeasurement({ metric: "impact_force", sessionId: "s1", source: "none" });
    expect(missing.value).toBeNull();
    expect(missing.confidence).toBe("MISSING");
    expect(neverFillChart([], "s1", "impact_force")[0]?.value).toBeNull();
  });

  it("does not allow watch IMU to claim direct force metrics", () => {
    expect(metricAllowed("WATCH_IMU", "impact_force")).toBe(false);
    expect(metricAllowed("GLOVE_IMU", "strike_acceleration")).toBe(true);
  });
});

describe("Classification", () => {
  it("never auto-confirms IMU detections", () => {
    const detected = createDetectedStrike({
      id: "e1",
      sessionId: "s1",
      roundIndex: 1,
      occurredAtMs: 10,
      source: "GLOVE_IMU",
      confidence: "MEDIUM",
      strikeKind: "punch",
      punchClass: "cross",
      side: "right",
      target: "unknown",
      measurements: []
    });
    expect(detected.classification).toBe("DETECTED");
    expect(classifyStrike(detected, true).classification).toBe("CLASSIFIED");
    expect(classifyStrike(detected, true).confirmedBy).toBeNull();
  });

  it("labels head impact as IMPACT_EVENT, not a diagnosis", () => {
    const event = createImpactSafety({
      id: "i1",
      sessionId: "s1",
      roundIndex: 1,
      occurredAtMs: 1,
      source: "GLOVE_IMU",
      confidence: "LOW",
      confirmedBy: null,
      region: "head"
    });
    expect(event.advisory).toBe("IMPACT_EVENT");
    expect(safetyCopy().toLowerCase()).toMatch(/not a concussion/);
  });
});

describe("Analytics", () => {
  it("reports output decline without inventing a fatigue percent", () => {
    const volumes = roundVolumes(
      [
        {
          id: "a",
          kind: "strike",
          sessionId: "s",
          roundIndex: 1,
          occurredAtMs: 1,
          source: "MANUAL",
          classification: "CONFIRMED",
          confidence: "HIGH",
          confirmedBy: "athlete",
          strikeKind: "punch",
          side: "right",
          target: "unknown",
          measurements: []
        },
        {
          id: "b",
          kind: "strike",
          sessionId: "s",
          roundIndex: 1,
          occurredAtMs: 2,
          source: "MANUAL",
          classification: "CONFIRMED",
          confidence: "HIGH",
          confirmedBy: "athlete",
          strikeKind: "punch",
          side: "left",
          target: "unknown",
          measurements: []
        }
      ],
      [60, 60]
    );
    expect(volumes[0]?.strikeCount).toBe(2);
    expect(volumes[1]?.strikeCount).toBe(0);
    const decline = outputDecline([
      { roundIndex: 1, strikeCount: 82, durationSec: 60, ratePerMin: 82 },
      { roundIndex: 5, strikeCount: 61, durationSec: 60, ratePerMin: 61 }
    ]);
    expect(decline?.label).toBe("OUTPUT DECLINE");
    expect(decline?.inventedFatiguePercent).toBeNull();
    expect(combinationSequences([]).length).toBe(0);
  });
});

describe("Recovery, social, Zenith, safety copy", () => {
  it("refuses an undocumented combat recovery composite", () => {
    const view = combatRecoveryFromSignals({ sparringRounds: 8, sleepHours: 5, source: "manual" });
    expect(view.compositeScore).toBeNull();
    expect(view.signals.hrvMs.value).toBeNull();
    expect(WEIGHT_SAFETY_COPY.toLowerCase()).toMatch(/dehydration|weight cutting/);
  });

  it("blocks biometric leakage in share payloads", () => {
    expect(buildSharePayload({ title: "HRV 42", disciplineName: "Boxing" })).toEqual({
      error: "sensitive_content"
    });
    expect(buildSharePayload({ title: "Head impact 4g", disciplineName: "Boxing" })).toEqual({
      error: "sensitive_content"
    });
    const ok = buildSharePayload({
      kind: "milestone",
      title: "Completed 8 rounds",
      disciplineName: "Muay Thai",
      roundsCompleted: 8
    });
    expect(ok).toMatchObject({ includesBiometrics: false, roundsCompleted: 8, kind: "milestone" });
  });

  it("builds Zenith context that forbids medical claims", () => {
    const ctx = zenithCombatContext({
      disciplineId: "judo",
      sessionMode: "randori",
      experience: "competitor",
      goal: "randori control",
      round: 2,
      historySessions: 4
    });
    expect(ctx?.medicalClaims).toBe(false);
    expect(ctx?.briefing.toLowerCase()).toMatch(/ippon|wearable/);
    expect(ctx?.disciplineName).toBe("Judo");
    const boxing = zenithCombatContext({ disciplineId: "boxing" });
    const bjj = zenithCombatContext({ disciplineId: "bjj" });
    const capoeira = zenithCombatContext({ disciplineId: "capoeira" });
    expect(boxing?.disciplineName).toBe("Boxing");
    expect(bjj?.disciplineName).toMatch(/Brazilian Jiu-Jitsu|BJJ/i);
    expect(capoeira?.disciplineName).toBe("Capoeira");
    expect(boxing?.briefing).not.toBe(bjj?.briefing);
  });
});

describe("Ingest honesty, quality, calibration", () => {
  it("downgrades IMU auto-confirm and concussion wording", () => {
    const imu = sanitizeIngestEvent({
      sessionId: "s1",
      kind: "strike",
      source: "WATCH_IMU",
      classification: "CONFIRMED",
      payload: { punchClass: "cross" },
      measurements: [
        {
          metric: "impact_force",
          value: 900,
          unit: "N",
          measurementType: "DIRECT",
          sensor: "WATCH_IMU",
          source: "watch",
          provider: "WATCH_IMU",
          confidence: "HIGH",
          sampledAt: null,
          sessionId: "s1",
          roundIndex: 1
        }
      ]
    });
    expect("error" in imu).toBe(false);
    if ("error" in imu) return;
    expect(imu.classification).toBe("CLASSIFIED");
    expect(imu.confirmedBy).toBeNull();
    expect(imu.measurements[0]?.metric).toBe("impact_estimate");
    const safety = sanitizeIngestEvent({
      sessionId: "s1",
      kind: "impact_safety",
      source: "GLOVE_IMU",
      payload: { diagnosis: "concussion", concussion: true }
    });
    expect("error" in safety).toBe(false);
    if ("error" in safety) return;
    expect(safety.payload.advisory).toBe("IMPACT_EVENT");
    expect(safety.payload.diagnosis).toBeUndefined();
  });

  it("dedupes events and drops impossible acceleration", () => {
    const seen = new Set<string>();
    const key = eventDedupeKey({ sessionId: "s", occurredAt: "t", kind: "strike", source: "MANUAL" });
    expect(isDuplicate(seen, key)).toBe(false);
    expect(isDuplicate(seen, key)).toBe(true);
    expect(accelerationOutlier(900)).toBe(true);
    expect(accelerationOutlier(12)).toBe(false);
    expect(normalizeIso("not-a-date")).toBeNull();
  });

  it("treats uncalibrated IMU kinematics as not ready", () => {
    expect(calibrationReady(emptyCalibration("WATCH_IMU"))).toBe(false);
    expect(kinematicsNeedCalibration("WATCH_IMU")).toBe(true);
    expect(kinematicsNeedCalibration("HR_STRAP")).toBe(false);
  });
});

describe("DEV_MOCK sensors, unvalidated ML, migration 035", () => {
  it("never lets a mock packet claim direct force", () => {
    const packet = createDevMockPacket({
      sensor: "WATCH_IMU",
      metric: "impact_force",
      value: 900,
      unit: "N"
    });
    expect(packet.sourceKind).toBe("DEV_MOCK");
    expect(packetMayClaimDirectForce(packet)).toBe(false);
    expect(bleHardwareUnavailable().telemetryLive).toBe(false);
  });

  it("keeps technique ML unvalidated and never CONFIRMED", () => {
    expect(TECHNIQUE_MODEL.validated).toBe(false);
    const hyp = classifyTechniqueHypothesis({ label: "cross", sensorConfidence: 0.9 });
    expect(hyp.classification).not.toBe("CONFIRMED");
    expect(hyp.validated).toBe(false);
    expect(() => assertNeverConfirmedFromModel("CONFIRMED")).toThrow(/cannot CONFIRM/i);
  });

  it("keeps 035 additive, forced RLS, and anon-ungranted", () => {
    const sql = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../../supabase/migrations/035_combat_os.sql"),
      "utf8"
    );
    expect(sql).toMatch(/force row level security/i);
    expect(sql.toLowerCase()).not.toMatch(/grant[\s\S]{0,80}to anon/);
    expect(sql).not.toMatch(/disable row level security/i);
    expect(sql).toMatch(/combat_calibrations/);
    expect(sql.toLowerCase()).toMatch(/authenticated/);
  });
});
