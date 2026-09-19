import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  listDeviceRegistry,
  setDeviceRegistryEntry,
  isCatalogProvider,
  type DeviceStatus
} from "@/lib/devices/platform";
import type { ProviderId } from "@fitconnect/types";
import { constraintsFor } from "@fitconnect/types";
import { ingestAthleteEvent } from "@/lib/sports-intelligence/event-store";

/** Statuses athletes may explicitly declare without a live adapter session proof */
const ALLOWED_MANUAL_STATUS: DeviceStatus[] = [
  "NOT_CONNECTED",
  "DISCONNECTED",
  "PERMISSION_REQUIRED",
  "ERROR"
];

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({
    devices: listDeviceRegistry(auth.user.id),
    note: "Per-user status only. NOT_CONNECTED until a live provider session exists."
  });
}

/**
 * Explicit athlete intent to update device connection state for THIS user only.
 * CONNECTED/SYNCED/SYNCING require a future adapter-backed session — rejected here.
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

  const providerId = b.providerId as string;
  const status = b.status as DeviceStatus;
  if (!providerId || !status) {
    return NextResponse.json({ error: "provider_and_status_required" }, { status: 422 });
  }
  if (!isCatalogProvider(providerId)) {
    return NextResponse.json({ error: "provider_not_in_catalog" }, { status: 422 });
  }

  const constraints = constraintsFor(providerId as ProviderId);
  if (!constraints.enabled) {
    return NextResponse.json({ error: "provider_unsupported" }, { status: 422 });
  }

  if (!ALLOWED_MANUAL_STATUS.includes(status)) {
    return NextResponse.json(
      {
        error: "adapter_session_required",
        message:
          "CONNECTED/SYNCING/SYNCED require a live provider adapter session — cannot be client-asserted."
      },
      { status: 422 }
    );
  }

  const current = listDeviceRegistry(auth.user.id).find((d) => d.providerId === providerId)!;
  const next = {
    ...current,
    status,
    lastSyncAt: current.lastSyncAt,
    note: typeof b.note === "string" ? b.note : current.note
  };
  setDeviceRegistryEntry(auth.user.id, next);

  const eventType =
    status === "DISCONNECTED"
      ? "DEVICE_DISCONNECTED"
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
