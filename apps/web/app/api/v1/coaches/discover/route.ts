import { NextResponse } from "next/server";
import { listDiscoverCoaches } from "@/lib/db/repository";
import { requireAuth } from "@/lib/api/require-auth";

/** Athlete marketplace coach list — auth required; no seed on configured DB. */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { coaches, source } = await listDiscoverCoaches();
  return NextResponse.json({ coaches, source });
}
