import type { CombatSensor, Side } from "@fitconnect/types";

export type CombatCalibration = {
  deviceId: string;
  sensor: CombatSensor;
  dominantSide: Side;
  placement: string | null;
  samplingHz: number | null;
  calibratedAt: string | null;
  orientation: string | null;
};

export function emptyCalibration(sensor: CombatSensor): CombatCalibration {
  return {
    deviceId: "",
    sensor,
    dominantSide: "unknown",
    placement: null,
    samplingHz: null,
    calibratedAt: null,
    orientation: null
  };
}

export function calibrationReady(c: CombatCalibration | null): boolean {
  if (!c) return false;
  return Boolean(c.deviceId && c.calibratedAt && c.sensor);
}

export function kinematicsNeedCalibration(sensor: CombatSensor): boolean {
  return sensor === "WATCH_IMU" || sensor === "GLOVE_IMU" || sensor === "WRIST_BAND_IMU" || sensor === "PHONE_IMU";
}
