/**
 * GET /api/v1/auth/config — safe presence-only auth diagnostic.
 * Never returns secrets.
 */
import { NextResponse } from "next/server";
import path from "node:path";
import { buildAuthConfigDiagnostic } from "@/lib/auth/auth-config-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const googleServicesPath = path.resolve(
    process.cwd(),
    "../../android/app/google-services.json"
  );
  const report = buildAuthConfigDiagnostic({ googleServicesPath });
  return NextResponse.json(report, {
    status: 200,
    headers: { "Cache-Control": "no-store" }
  });
}
