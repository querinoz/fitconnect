import type {
  CombatMeasurement,
  CombatMetricKey,
  CombatSensor,
  MeasurementConfidence,
  MeasurementType
} from "@fitconnect/types";

/** Sensors that can emit DIRECT force in newtons. IMU-only devices cannot. */
const DIRECT_FORCE_SENSORS: CombatSensor[] = [
  "INSTRUMENTED_GLOVE_FORCE",
  "INSTRUMENTED_BAG",
  "INSTRUMENTED_PAD",
  "FORCE_PLATE"
];

const DIRECT_PRESSURE_SENSORS: CombatSensor[] = ["INSOLE_PRESSURE", "FORCE_PLATE"];

const IMU_SENSORS: CombatSensor[] = ["WATCH_IMU", "PHONE_IMU", "GLOVE_IMU", "WRIST_BAND_IMU"];

export function canMeasureDirectForce(sensor: CombatSensor): boolean {
  return DIRECT_FORCE_SENSORS.includes(sensor);
}

export function canMeasureDirectPressure(sensor: CombatSensor): boolean {
  return DIRECT_PRESSURE_SENSORS.includes(sensor);
}

export function isImuOnly(sensor: CombatSensor): boolean {
  return IMU_SENSORS.includes(sensor);
}

export function displayLabelForMeasurement(m: CombatMeasurement): string {
  if (m.value == null || m.confidence === "MISSING") return "—";
  if (m.metric === "impact_force" && m.measurementType !== "DIRECT") {
    return "estimated impact (not measured force)";
  }
  if (m.measurementType === "PROXY") return `${m.metric} (proxy)`;
  if (m.measurementType === "ESTIMATED") return `${m.metric} (estimated)`;
  return m.metric;
}

export function assertHonestForce(m: CombatMeasurement): CombatMeasurement {
  if (m.metric !== "impact_force") return m;
  if (m.measurementType === "DIRECT" && canMeasureDirectForce(m.sensor) && m.value != null) {
    return { ...m, confidence: m.confidence === "MISSING" ? "HIGH" : m.confidence };
  }
  return {
    ...m,
    metric: "impact_estimate",
    measurementType: "ESTIMATED",
    confidence: m.value == null ? "MISSING" : "LOW",
    notes: m.notes ?? "Force requires an instrumented target, glove load cell, or force plate. IMU acceleration is not force."
  };
}

export function missingMeasurement(input: {
  metric: CombatMetricKey | string;
  sessionId: string;
  source: string;
  provider?: string;
  sensor?: CombatSensor;
  roundIndex?: number | null;
  unit?: string | null;
}): CombatMeasurement {
  return {
    metric: input.metric,
    value: null,
    unit: input.unit ?? null,
    measurementType: "PROXY",
    sensor: input.sensor ?? "UNKNOWN",
    source: input.source,
    provider: input.provider ?? input.source,
    confidence: "MISSING",
    sampledAt: null,
    sessionId: input.sessionId,
    roundIndex: input.roundIndex ?? null
  };
}

export function measured(input: {
  metric: CombatMetricKey | string;
  value: number;
  unit: string;
  measurementType: MeasurementType;
  sensor: CombatSensor;
  source: string;
  provider: string;
  confidence: MeasurementConfidence;
  sessionId: string;
  roundIndex?: number | null;
  sampledAt?: string | null;
  notes?: string;
}): CombatMeasurement {
  const raw: CombatMeasurement = {
    metric: input.metric,
    value: input.value,
    unit: input.unit,
    measurementType: input.measurementType,
    sensor: input.sensor,
    source: input.source,
    provider: input.provider,
    confidence: input.confidence,
    sampledAt: input.sampledAt ?? null,
    sessionId: input.sessionId,
    roundIndex: input.roundIndex ?? null,
    notes: input.notes
  };
  return assertHonestForce(raw);
}
