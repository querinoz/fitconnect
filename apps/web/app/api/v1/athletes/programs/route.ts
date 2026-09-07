import { NextResponse } from "next/server";
import { isAuthFailure, requireAthleteId } from "@/lib/api/require-auth";
import {
  enrollAthleteInProgram,
  listAthleteEnrollments,
  listProgramCatalog
} from "@/lib/db/program-enrollments";

/** Athlete program enrollments + enroll mutation. */
export async function GET(req: Request) {
  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const enrollments = listAthleteEnrollments(resolved.athleteId);
  const catalog = listProgramCatalog();
  return NextResponse.json({
    enrollments,
    catalog,
    source: "memory"
  });
}

export async function POST(req: Request) {
  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;

  const body = (await req.json().catch(() => null)) as {
    programId?: string;
    athleteId?: string;
  } | null;

  if (body?.athleteId && body.athleteId !== resolved.athleteId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!body?.programId?.trim()) {
    return NextResponse.json({ error: "programId_required" }, { status: 400 });
  }

  const result = await enrollAthleteInProgram({
    athleteId: resolved.athleteId,
    programId: body.programId
  });

  if (result.error === "programId_required") {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (result.error === "program_not_found") {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  if (result.error || !result.enrollment) {
    return NextResponse.json(
      { error: result.error ?? "enroll_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      enrollment: result.enrollment,
      source: result.source,
      idempotent: result.idempotent
    },
    { status: result.idempotent ? 200 : 201 }
  );
}
