import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  listDeviceRegistry,
  setDeviceRegistryEntry,
  type DeviceStatus
} from "@/lib/devices/platform";
import type { ProviderId } from "@fitconnect/types";
import { constraintsFor } from "@fitconnect/types";
import { ingestAthleteEvent } from "@/lib/sports-intelligence/event-store";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({
    devices: listDeviceRegistry(),
    note: "Statuses are honest. NOT_CONNECTED until a live authorization exists."
  });
}

/**
 * Explicit athlete intent to update device connection state.
 * Never marks CONNECTED without confirm:true.
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (b.confirm !== true) {
    return NextResponse.json(
      { error: "confirmation_required", message: "Set confirm:true after explicit athlete action." },
      { status: 400 }
    );
  }

  const providerId = b.providerId as ProviderId;
  const status = b.status as DeviceStatus;
  if (!providerId || !status) {
    return NextResponse.json({ error: "provider_and_status_required" }, { status: 422 });
  }

  const constraints = constraintsFor(providerId);
  if (!constraints.enabled) {
    return NextResponse.json({ error: "provider_unsupported" }, { status: 422 });
  }

  const entry = listDeviceRegistry().find((d) => d.providerId === providerId)!;
  const next = {
    ...entry,
    status,
    lastSyncAt: status === "SYNCED" ? new Date().toISOString() : entry.lastSyncAt,
    note: typeof b.note === "string" ? b.note : entry.note
  };
  setDeviceRegistryEntry(next);

  const eventType =
    status === "CONNECTED"
      ? "DEVICE_CONNECTED"
      : status === "DISCONNECTED"
        ? "DEVICE_DISCONNECTED"
        : status === "SYNCING"
          ? "SYNC_STARTED"
          : status === "SYNCED"
            ? "SYNC_COMPLETED"
            : status === "ERROR"
              ? "SYNC_FAILED"
              : null;

  if (eventType) {
    ingestAthleteEvent({
      type: eventType,
      timestamp: new Date().toISOString(),
      userId: auth.user.id,
      source: "SYSTEM",
      dedupeKey: `device:${providerId}:${status}:${Date.now()}`,
      payload: { providerId, status }
    });
  }

  return NextResponse.json({ device: next });
}
