import type { CombatMetricKey, CombatSensor } from "@fitconnect/types";

export type SensorCapability = {
  sensor: CombatSensor;
  legitimate: CombatMetricKey[];
  never: string[];
  notes: string;
};

export const SENSOR_CAPABILITIES: SensorCapability[] = [
  {
    sensor: "WATCH_IMU",
    legitimate: ["strike_acceleration", "session_duration", "work_rate"],
    never: ["impact_force", "punch classification as confirmed", "concussion"],
    notes: "Wrist/watch IMU can estimate punch-like acceleration after calibration. It cannot report ground-truth punch force."
  },
  {
    sensor: "PHONE_IMU",
    legitimate: ["session_duration"],
    never: ["impact_force", "strike_count as measured"],
    notes: "A pocketed phone is not a strike sensor."
  },
  {
    sensor: "GLOVE_IMU",
    legitimate: ["strike_acceleration", "strike_velocity", "punch_count", "strike_rate"],
    never: ["impact_force"],
    notes: "Glove IMUs support kinematics. Force requires a co-located force/pressure transducer (e.g. RD α / piezo wrap)."
  },
  {
    sensor: "WRIST_BAND_IMU",
    legitimate: ["strike_acceleration", "punch_count", "strike_rate"],
    never: ["impact_force"],
    notes: "Same class as commercial IMU bands: count and kinematics, not newtons."
  },
  {
    sensor: "INSTRUMENTED_GLOVE_FORCE",
    legitimate: ["impact_force", "impact_impulse", "contact_duration", "strike_acceleration", "punch_count"],
    never: ["concussion"],
    notes: "Direct force only when the transducer is calibrated against a reference (force plate / load cell)."
  },
  {
    sensor: "INSTRUMENTED_BAG",
    legitimate: ["impact_force", "impact_impulse", "punch_count", "kick_count"],
    never: ["official fight statistics"],
    notes: "Bag load cells measure bag contact, not opponent contact."
  },
  {
    sensor: "INSTRUMENTED_PAD",
    legitimate: ["impact_force", "punch_count", "kick_count"],
    never: ["official scores"],
    notes: "Coach-held pads measure pad impact, not competition scoring."
  },
  {
    sensor: "INSOLE_PRESSURE",
    legitimate: ["work_rate", "session_duration"],
    never: ["impact_force as punch force"],
    notes: "Plantar pressure is direct at the foot. Lower-limb contribution to a punch is a proxy, not punch force."
  },
  {
    sensor: "FORCE_PLATE",
    legitimate: ["impact_force", "impact_impulse"],
    never: ["in-fight official stats"],
    notes: "Lab reference. High confidence only in calibrated setups."
  },
  {
    sensor: "HR_STRAP",
    legitimate: ["heart_rate"],
    never: ["impact_force"],
    notes: "Heart rate is DIRECT when the strap reports bpm. Missing if disconnected."
  },
  {
    sensor: "HR_WATCH",
    legitimate: ["heart_rate"],
    never: ["impact_force"],
    notes: "Optical HR is measured by the watch; still not force."
  },
  {
    sensor: "SEMG",
    legitimate: ["work_rate"],
    never: ["impact_force", "medical diagnosis"],
    notes: "sEMG is muscle activation. Fatigue inferences stay qualitative unless a validated protocol exists."
  },
  {
    sensor: "ELECTRONIC_SCORING",
    legitimate: ["kick_count", "punch_count"],
    never: ["generic wearable scores"],
    notes: "WT hogu / PSS style systems only. Do not emulate from a watch."
  },
  {
    sensor: "MANUAL",
    legitimate: [
      "punch_count",
      "kick_count",
      "rpe",
      "takedowns",
      "takedown_attempts",
      "submission_attempts",
      "control_time",
      "session_duration"
    ],
    never: ["claimed as sensor-measured"],
    notes: "Athlete or coach entered. Classification CONFIRMED only when they confirm."
  },
  {
    sensor: "COACH",
    legitimate: ["rpe", "takedowns", "submission_attempts"],
    never: ["secret biometrics published"],
    notes: "Coach-confirmed labels. Private health data stays off social by default."
  },
  {
    sensor: "OFFICIAL_RESULT",
    legitimate: ["takedowns", "punch_count", "kick_count"],
    never: ["training wearable as official"],
    notes: "Competition stats require an official or licensed data source."
  }
];

export function capabilitiesFor(sensor: CombatSensor): SensorCapability | undefined {
  return SENSOR_CAPABILITIES.find((s) => s.sensor === sensor);
}

export function metricAllowed(sensor: CombatSensor, metric: CombatMetricKey): boolean {
  const cap = capabilitiesFor(sensor);
  if (!cap) return false;
  return cap.legitimate.includes(metric);
}
