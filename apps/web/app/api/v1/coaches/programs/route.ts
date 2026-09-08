import { NextResponse } from "next/server";
import { isAuthFailure, requireCoachId } from "@/lib/api/require-auth";
import {
  cloneCoachProgram,
  draftCoachProgram,
  listMutableCoachPrograms,
  publishCoachProgram
} from "@/lib/db/coach-program-mutations";
import { listCoachPrograms } from "@/lib/db/repository";

/** Path A: postgres or empty/memory mutations — never expose seed fixtures. */
export async function GET(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const remote = await listCoachPrograms(resolved.coachId);
  if (remote.source === "postgres") {
    return NextResponse.json({ programs: remote.programs, source: remote.source });
  }
  const mutable = listMutableCoachPrograms(resolved.coachId);
  return NextResponse.json({
    programs: mutable,
    source: mutable.length > 0 ? "memory" : "empty"
  });
}

export async function POST(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const body = (await req.json().catch(() => null)) as {
    action?: "publish" | "draft" | "clone";
    programId?: string;
  } | null;
  if (!body?.action || !body?.programId?.trim()) {
    return NextResponse.json({ error: "action_and_programId_required" }, { status: 400 });
  }
  const id = body.programId.trim();
  const coachId = resolved.coachId;
  const result =
    body.action === "publish"
      ? publishCoachProgram(coachId, id)
      : body.action === "draft"
        ? draftCoachProgram(coachId, id)
        : cloneCoachProgram(coachId, id);
  if (!result) {
    return NextResponse.json({ error: "program_not_found" }, { status: 404 });
  }
  return NextResponse.json({ program: result, source: "memory" });
}
