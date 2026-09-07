import { NextResponse } from "next/server";
import { isAuthFailure, requireAthleteId } from "@/lib/api/require-auth";
import { toggleAthleteTask } from "@/lib/db/athlete-tasks";

export async function POST(req: Request) {
  const resolved = await requireAthleteId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const body = (await req.json().catch(() => null)) as {
    taskId?: string;
    athleteId?: string;
  } | null;
  if (body?.athleteId && body.athleteId !== resolved.athleteId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!body?.taskId?.trim()) {
    return NextResponse.json({ error: "taskId_required" }, { status: 400 });
  }
  const result = toggleAthleteTask(resolved.athleteId, body.taskId.trim());
  return NextResponse.json({ task: result, source: "memory" });
}
