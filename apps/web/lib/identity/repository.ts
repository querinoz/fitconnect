import type { UserRole } from "@/lib/auth";
import type { IdentityOnboarding, IdentityProfile } from "@/lib/identity/types";
import { parseAppRole } from "@/lib/identity/role-policy";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  locale: string | null;
  timezone: string | null;
  accent: string | null;
  created_at: string;
  updated_at: string;
};

type RoleRow = { uid: string; role: string };
type OnboardingRow = {
  uid: string;
  role: string | null;
  step: number;
  completed: boolean;
  payload: Record<string, unknown> | null;
};

function mapProfile(row: ProfileRow, role: UserRole | null, onboarding?: OnboardingRow | null): IdentityProfile {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    locale: row.locale,
    timezone: row.timezone,
    accent: row.accent,
    role,
    onboardingCompleted: onboarding?.completed === true,
    onboardingStep: onboarding?.step ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function lookupIdentityRole(
  uid: string,
  accessToken: string
): Promise<UserRole | null> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return null;
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("uid", uid)
    .maybeSingle();
  if (error || !data) return null;
  return parseAppRole((data as RoleRow).role);
}

export async function bootstrapIdentityProfile(input: {
  uid: string;
  accessToken: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  locale?: string | null;
  timezone?: string | null;
  accent?: string | null;
}): Promise<{ profile: IdentityProfile | null; error: string | null; status: number }> {
  const client = createSupabaseRlsClient(input.accessToken);
  if (!client) {
    return { profile: null, error: "data_api_not_configured", status: 503 };
  }

  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await client
    .from("identity_profiles")
    .select("*")
    .eq("id", input.uid)
    .maybeSingle();

  if (existingError) {
    return { profile: null, error: existingError.message, status: 403 };
  }

  let row = existing as ProfileRow | null;
  if (!row) {
    const { data, error } = await client
      .from("identity_profiles")
      .insert({
        id: input.uid,
        email: input.email ?? null,
        display_name: input.displayName ?? null,
        avatar_url: input.avatarUrl ?? null,
        locale: input.locale ?? null,
        timezone: input.timezone ?? null,
        accent: input.accent ?? null,
        created_at: now,
        updated_at: now
      })
      .select("*")
      .single();
    if (error || !data) {
      return { profile: null, error: error?.message ?? "profile_insert_denied", status: 403 };
    }
    row = data as ProfileRow;
  }

  const role = await lookupIdentityRole(input.uid, input.accessToken);
  const onboarding = await getOnboardingRow(input.accessToken, input.uid);
  return { profile: mapProfile(row, role, onboarding), error: null, status: 200 };
}

export async function getIdentityProfile(
  uid: string,
  accessToken: string
): Promise<{ profile: IdentityProfile | null; error: string | null; status: number }> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return { profile: null, error: "data_api_not_configured", status: 503 };
  const { data, error } = await client
    .from("identity_profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  if (error) return { profile: null, error: error.message, status: 403 };
  if (!data) return { profile: null, error: "not_found", status: 404 };
  const role = await lookupIdentityRole(uid, accessToken);
  const onboarding = await getOnboardingRow(accessToken, uid);
  return { profile: mapProfile(data as ProfileRow, role, onboarding), error: null, status: 200 };
}

export async function updateIdentityProfile(
  uid: string,
  accessToken: string,
  patch: {
    displayName?: string | null;
    avatarUrl?: string | null;
    locale?: string | null;
    timezone?: string | null;
    accent?: string | null;
  }
): Promise<{ profile: IdentityProfile | null; error: string | null; status: number }> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return { profile: null, error: "data_api_not_configured", status: 503 };
  const { data, error } = await client
    .from("identity_profiles")
    .update({
      display_name: patch.displayName,
      avatar_url: patch.avatarUrl,
      locale: patch.locale,
      timezone: patch.timezone,
      accent: patch.accent,
      updated_at: new Date().toISOString()
    })
    .eq("id", uid)
    .select("*")
    .maybeSingle();
  if (error) return { profile: null, error: error.message, status: 403 };
  if (!data) return { profile: null, error: "not_found", status: 404 };
  const role = await lookupIdentityRole(uid, accessToken);
  const onboarding = await getOnboardingRow(accessToken, uid);
  return { profile: mapProfile(data as ProfileRow, role, onboarding), error: null, status: 200 };
}

export async function assignIdentityRole(
  uid: string,
  accessToken: string,
  nextRole: Exclude<UserRole, "admin">
): Promise<{ role: UserRole | null; error: string | null; status: number }> {
  const current = await lookupIdentityRole(uid, accessToken);
  if (current && current !== nextRole) {
    return { role: current, error: "role_locked", status: 403 };
  }
  if (current === nextRole) {
    return { role: current, error: null, status: 200 };
  }
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return { role: null, error: "data_api_not_configured", status: 503 };
  const { data, error } = await client
    .from("user_roles")
    .insert({ uid, role: nextRole })
    .select("role")
    .single();
  if (error) return { role: null, error: error.message, status: 403 };
  return { role: parseAppRole((data as RoleRow).role), error: null, status: 200 };
}

async function getOnboardingRow(
  accessToken: string,
  uid: string
): Promise<OnboardingRow | null> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return null;
  const { data } = await client
    .from("onboarding_state")
    .select("*")
    .eq("uid", uid)
    .maybeSingle();
  return (data as OnboardingRow | null) ?? null;
}

export async function getOnboardingState(
  uid: string,
  accessToken: string
): Promise<{ state: IdentityOnboarding | null; error: string | null; status: number }> {
  const row = await getOnboardingRow(accessToken, uid);
  if (!row) {
    return {
      state: { uid, role: null, step: 0, completed: false, payload: {} },
      error: null,
      status: 200
    };
  }
  return {
    state: {
      uid: row.uid,
      role: parseAppRole(row.role),
      step: row.step,
      completed: row.completed,
      payload: row.payload ?? {}
    },
    error: null,
    status: 200
  };
}

export async function upsertOnboardingState(
  uid: string,
  accessToken: string,
  patch: { role?: UserRole | null; step?: number; completed?: boolean; payload?: Record<string, unknown> }
): Promise<{ state: IdentityOnboarding | null; error: string | null; status: number }> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) return { state: null, error: "data_api_not_configured", status: 503 };
  const existing = await getOnboardingRow(accessToken, uid);
  const next = {
    uid,
    role: patch.role ?? existing?.role ?? null,
    step: patch.step ?? existing?.step ?? 0,
    completed: patch.completed ?? existing?.completed ?? false,
    payload: { ...(existing?.payload ?? {}), ...(patch.payload ?? {}) },
    updated_at: new Date().toISOString()
  };
  const { data, error } = existing
    ? await client.from("onboarding_state").update(next).eq("uid", uid).select("*").single()
    : await client.from("onboarding_state").insert(next).select("*").single();
  if (error || !data) {
    return { state: null, error: error?.message ?? "onboarding_denied", status: 403 };
  }
  const row = data as OnboardingRow;
  return {
    state: {
      uid: row.uid,
      role: parseAppRole(row.role),
      step: row.step,
      completed: row.completed,
      payload: row.payload ?? {}
    },
    error: null,
    status: 200
  };
}

export async function deleteOwnIdentity(input: {
  uid: string;
  accessToken: string;
}): Promise<{ ok: boolean; error: string | null; status: number }> {
  const client = createSupabaseRlsClient(input.accessToken);
  if (!client) return { ok: false, error: "data_api_not_configured", status: 503 };

  await client.from("account_deletion_requests").insert({
    uid: input.uid,
    status: "received",
    firebase_auth: "PENDING_HUMAN",
    retained: { billing: "not_implemented", legal_holds: "none_recorded" }
  });

  await client.from("onboarding_state").delete().eq("uid", input.uid);
  await client.from("user_preferences").delete().eq("uid", input.uid);
  await client.from("user_roles").delete().eq("uid", input.uid);
  const { error: profileError } = await client.from("identity_profiles").delete().eq("id", input.uid);
  if (profileError) {
    return { ok: false, error: profileError.message, status: 403 };
  }

  return { ok: true, error: null, status: 200 };
}
