export type HealthDependency = {
  name: string;
  status: "ok" | "degraded" | "down";
  detail?: string;
};

export type HealthReport = {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  dependencies: HealthDependency[];
};

export function buildHealthReport(env: NodeJS.ProcessEnv = process.env): HealthReport {
  const deps: HealthDependency[] = [];

  const demoMode = env.NEXT_PUBLIC_DEMO_MODE !== "false";
  deps.push({
    name: "auth",
    status: demoMode || (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? "ok" : "degraded",
    detail: demoMode ? "demo mode" : "supabase"
  });

  deps.push({
    name: "stripe",
    status: "ok",
    detail: "demo checkout routes"
  });

  deps.push({
    name: "realtime",
    status: "ok",
    detail: resolveRealtimeDetail(env)
  });

  const hasDegraded = deps.some((d) => d.status !== "ok");

  return {
    status: hasDegraded ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    version: env.npm_package_version ?? "0.1.0",
    dependencies: deps
  };
}

function resolveRealtimeDetail(env: NodeJS.ProcessEnv): string {
  const provider = env.NEXT_PUBLIC_REALTIME_PROVIDER ?? "broadcast";
  if (provider === "convex" && env.NEXT_PUBLIC_CONVEX_URL) {
    return "convex + supabase (hybrid)";
  }
  if (provider === "supabase" && env.NEXT_PUBLIC_SUPABASE_URL) {
    return "supabase realtime";
  }
  return "broadcast channel (demo)";
}
