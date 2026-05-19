import { NextResponse } from "next/server";
import { buildHealthReport } from "@/lib/observability/health";

export async function GET() {
  const report = buildHealthReport();
  return NextResponse.json(report, { status: 200 });
}
