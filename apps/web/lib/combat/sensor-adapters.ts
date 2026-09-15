import type { CombatSensor } from "@fitconnect/types";
import { metricAllowed } from "./sensors";

/** Development packets must never be stored or rendered as REAL device sources. */
export type SensorSourceKind = "REAL" | "DEV_MOCK";

export type CombatSensorPacket = {
  sourceKind: SensorSourceKind;
  sensor: CombatSensor;
  metric: string;
  value: number | null;
  unit: string;
  sampledAt: string;
  deviceId: string | null;
  notes: string;
};

export const BLE_DEVICE_KINDS = [
  "instrumented_glove",
  "instrumented_bag",
  "instrumented_pad",
  "insole",
  "force_plate",
  "hr_strap",
  "watch_imu"
] as const;

export type BleDeviceKind = (typeof BLE_DEVICE_KINDS)[number];

export type BleConnectionState = "disconnected" | "connecting" | "connected" | "unavailable_no_hardware";

export function bleHardwareUnavailable(state: BleConnectionState = "unavailable_no_hardware"): {
  state: BleConnectionState;
  telemetryLive: false;
  reason: string;
} {
  return {
    state,
    telemetryLive: false,
    reason:
      "BLE combat peripherals are modeled (glove, bag, pad, insole, force plate, HR strap) but live telemetry requires physical hardware validation."
  };
}

function mockAllowed(): boolean {
  if (process.env.COMBAT_ALLOW_DEV_MOCK === "true") return true;
  return process.env.NODE_ENV !== "production";
}

/** Test/dev only. Throws in production unless COMBAT_ALLOW_DEV_MOCK=true. */
export function createDevMockPacket(input: {
  sensor: CombatSensor;
  metric: string;
  value: number | null;
  unit: string;
}): CombatSensorPacket {
  if (!mockAllowed()) {
    throw new Error("DEV_MOCK combat packets cannot be created in production.");
  }
  return {
    sourceKind: "DEV_MOCK",
    sensor: input.sensor,
    metric: input.metric,
    value: input.value,
    unit: input.unit,
    sampledAt: new Date().toISOString(),
    deviceId: "dev-mock",
    notes: "DEV_MOCK — not a connected device. Do not persist as DIRECT hardware."
  };
}

export function createRealPacket(input: {
  sensor: CombatSensor;
  metric: string;
  value: number | null;
  unit: string;
  deviceId: string;
  sampledAt: string;
}): CombatSensorPacket {
  return {
    sourceKind: "REAL",
    sensor: input.sensor,
    metric: input.metric,
    value: input.value,
    unit: input.unit,
    sampledAt: input.sampledAt,
    deviceId: input.deviceId,
    notes: "REAL device packet. Honesty rewrite still applies at ingest."
  };
}

export function packetMayClaimDirectForce(packet: CombatSensorPacket): boolean {
  if (packet.sourceKind === "DEV_MOCK") return false;
  if (packet.metric !== "impact_force") return false;
  return metricAllowed(packet.sensor, "impact_force");
}

export function displaySourceLabel(packet: CombatSensorPacket): string {
  return packet.sourceKind === "DEV_MOCK" ? "DEV_MOCK (not hardware)" : packet.sensor;
}
