import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { routeAgentQuery, buildAgentAnswerShell } from "@/lib/ai/agent-router";

/** V10.4 agent router — classification only; tool execution remains MCP gateway. */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const q = typeof (body as { query?: unknown }).query === "string" ? (body as { query: string }).query : "";
  const route = routeAgentQuery(q);
  const shell = buildAgentAnswerShell(route, []);

  return NextResponse.json({
    route,
    answerShell: shell,
    note: "Router selects agent + tools. Execute tools via /api/v1/mcp with auth. No fabricated results."
  });
}
