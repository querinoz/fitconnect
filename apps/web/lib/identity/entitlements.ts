import type {
  ActiveMode,
  AppCapability,
  EntitlementSnapshot,
  SubscriptionPlanId
} from "@fitconnect/types";
import {
  capabilitiesFromPlan,
  resolveActiveMode,
  toUserCapabilities
} from "@fitconnect/types";
import type { UserRole } from "@/lib/auth";
import { parseAppRole } from "@/lib/identity/role-policy";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";

const KNOWN_CAPS = new Set<AppCapability>([
  "athlete",
  "coach",
  "club_admin",
  "team_manager",
  "specialist",
  "organization_admin"
]);

export function parseCapability(value: unknown): AppCapability | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase() as AppCapability;
  return KNOWN_CAPS.has(v) ? v : null;
}

export function parseActiveMode(value: unknown): ActiveMode | null {
  if (value === "athlete" || value === "coach") return value;
  if (value === "ATHLETE") return "athlete";
  if (value === "COACH") return "coach";
  return null;
}

type CapRow = { uid: string; capability: string; source?: string };
type PrefRow = { uid: string; payload: Record<string, unknown> | null };

export async function listCapabilities(
  uid: string,
  accessToken: string
): Promise<AppCapability[]> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return [];
  const { data, error } = await client
    .from("user_capabilities")
    .select("capability")
    .eq("uid", uid);
  if (error || !data) {
    // Fallback: legacy single role → one capability
    const { data: roleRow } = await client
      .from("user_roles")
      .select("role")
      .eq("uid", uid)
      .maybeSingle();
    const role = parseAppRole((roleRow as { role?: string } | null)?.role);
    if (role === "athlete" || role === "coach") return [role];
    return [];
  }
  const caps = (data as CapRow[])
    .map((r) => parseCapability(r.capability))
    .filter((c): c is AppCapability => c != null);
  if (caps.length > 0) return Array.from(new Set(caps));
  const { data: roleRow } = await client
    .from("user_roles")
    .select("role")
    .eq("uid", uid)
    .maybeSingle();
  const role = parseAppRole((roleRow as { role?: string } | null)?.role);
  if (role === "athlete" || role === "coach") return [role];
  return [];
}

export async function readPreferredActiveMode(
  uid: string,
  accessToken: string
): Promise<ActiveMode | null> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return null;
  const { data } = await client
    .from("user_preferences")
    .select("payload")
    .eq("uid", uid)
    .maybeSingle();
  const payload = (data as PrefRow | null)?.payload ?? null;
  return parseActiveMode(payload?.activeMode);
}

export async function persistActiveMode(
  uid: string,
  accessToken: string,
  mode: ActiveMode
): Promise<{ ok: boolean; error: string | null; status: number }> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return { ok: false, error: "data_api_not_configured", status: 503 };

  const { data: existing } = await client
    .from("user_preferences")
    .select("payload")
    .eq("uid", uid)
    .maybeSingle();

  const prev = ((existing as PrefRow | null)?.payload ?? {}) as Record<string, unknown>;
  const payload = { ...prev, activeMode: mode };
  const now = new Date().toISOString();

  const { error: prefError } = existing
    ? await client
        .from("user_preferences")
        .update({ payload, updated_at: now })
        .eq("uid", uid)
    : await client.from("user_preferences").insert({ uid, payload, updated_at: now });

  if (prefError) return { ok: false, error: prefError.message, status: 403 };

  // Mirror activeMode into legacy user_roles for older clients / requireAuth.
  const { data: roleRow } = await client
    .from("user_roles")
    .select("role")
    .eq("uid", uid)
    .maybeSingle();

  if (roleRow) {
    const { error: updErr } = await client
      .from("user_roles")
      .update({ role: mode })
      .eq("uid", uid);
    if (updErr) return { ok: false, error: updErr.message, status: 403 };
  } else {
    const { error: insErr } = await client
      .from("user_roles")
      .insert({ uid, role: mode });
    if (insErr) return { ok: false, error: insErr.message, status: 403 };
  }

  return { ok: true, error: null, status: 200 };
}

export async function grantCapability(
  uid: string,
  accessToken: string,
  capability: AppCapability,
  source: string = "grant"
): Promise<{ ok: boolean; error: string | null; status: number }> {
  if (capability !== "athlete" && capability !== "coach") {
    return { ok: false, error: "capability_not_self_assignable", status: 403 };
  }
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return { ok: false, error: "data_api_not_configured", status: 503 };
  const { error } = await client.from("user_capabilities").upsert(
    { uid, capability, source, granted_at: new Date().toISOString() },
    { onConflict: "uid,capability" }
  );
  if (error) return { ok: false, error: error.message, status: 403 };
  return { ok: true, error: null, status: 200 };
}

export async function resolveEntitlements(
  uid: string,
  accessToken: string
): Promise<EntitlementSnapshot> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) {
    return {
      planId: "unknown",
      planCapabilities: ["athlete"],
      status: "unknown"
    };
  }
  const { data } = await client
    .from("user_subscriptions")
    .select("plan_id,status")
    .eq("user_id", uid)
    .maybeSingle();

  const planId = ((data as { plan_id?: string } | null)?.plan_id ??
    "athlete") as SubscriptionPlanId;
  const statusRaw = (data as { status?: string } | null)?.status ?? "none";
  const status = (
    ["active", "trialing", "past_due", "canceled", "none"].includes(statusRaw)
      ? statusRaw
      : "unknown"
  ) as EntitlementSnapshot["status"];

  return {
    planId: planId || "athlete",
    planCapabilities: capabilitiesFromPlan(planId),
    status
  };
}

export function canSetActiveMode(
  capabilities: AppCapability[],
  mode: ActiveMode
): boolean {
  return capabilities.includes(mode);
}

/**
 * First-time capability grant from RoleSelect.
 * Adding a second capability is allowed (unified identity) — no longer role_locked XOR.
 */
export async function ensureCapabilityFromRoleAssign(
  uid: string,
  accessToken: string,
  role: Exclude<UserRole, "admin">
): Promise<{ ok: boolean; error: string | null; status: number }> {
  if (role !== "athlete" && role !== "coach") {
    return { ok: false, error: "role_not_allowed", status: 403 };
  }
  const granted = await grantCapability(uid, accessToken, role, "legacy_role");
  if (!granted.ok) return granted;
  const caps = await listCapabilities(uid, accessToken);
  const preferred = await readPreferredActiveMode(uid, accessToken);
  const mode = resolveActiveMode({
    capabilities: caps,
    preferred,
    legacyRole: role
  });
  if (!mode) return { ok: false, error: "mode_unresolved", status: 500 };
  return persistActiveMode(uid, accessToken, mode);
}

export { resolveActiveMode, toUserCapabilities, capabilitiesFromPlan };
