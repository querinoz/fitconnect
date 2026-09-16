"use client";

import { Check } from "lucide-react";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { cn } from "@/lib/utils";

export type DeviceConnectionState =
  | "CONNECTED"
  | "SYNCING"
  | "SYNCED"
  | "DISCONNECTED"
  | "PERMISSION_REQUIRED"
  | "UNAVAILABLE"
  | "ERROR";

function normalizeStatus(raw: string): DeviceConnectionState {
  const s = raw.trim().toLowerCase();
  if (s === "connected" || s === "active") return "CONNECTED";
  if (s === "syncing") return "SYNCING";
  if (s === "synced") return "SYNCED";
  if (s === "permission_required" || s === "permission") return "PERMISSION_REQUIRED";
  if (s === "unavailable" || s === "not_configured") return "UNAVAILABLE";
  if (s === "error" || s === "failed") return "ERROR";
  return "DISCONNECTED";
}

const COPY: Record<DeviceConnectionState, string> = {
  CONNECTED: "Connected",
  SYNCING: "Syncing",
  SYNCED: "Synced",
  DISCONNECTED: "Disconnected",
  PERMISSION_REQUIRED: "Permission required",
  UNAVAILABLE: "Unavailable",
  ERROR: "Error"
};

type DeviceStatusBadgeProps = {
  status: string;
  className?: string;
};

/**
 * Maps provider API status → honest device states.
 * Never shows Connected unless the backend said so.
 */
export function DeviceStatusBadge({ status, className }: DeviceStatusBadgeProps) {
  const state = normalizeStatus(status);
  const connected = state === "CONNECTED" || state === "SYNCED";
  const tone =
    connected
      ? "performance"
      : state === "ERROR"
        ? "alert"
        : state === "SYNCING"
          ? "telemetry"
          : state === "PERMISSION_REQUIRED"
            ? "recovery"
            : state === "UNAVAILABLE"
              ? "recovery"
              : "neutral";
  return (
    <EliteChip
      tone={tone}
      as="span"
      className={cn("text-[10px]", className)}
      data-testid="device-status-badge"
      data-state={state}
    >
      {connected ? <Check className="mr-1 inline h-3 w-3" aria-hidden /> : null}
      {COPY[state]}
    </EliteChip>
  );
}

export { normalizeStatus as normalizeDeviceStatus };
