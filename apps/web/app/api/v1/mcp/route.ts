import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { dispatchMcp, listMcpCatalog } from "@/lib/mcp/gateway";

export async function GET() {
  return NextResponse.json({ tools: listMcpCatalog() });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "highcost");
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    tool?: string;
    arguments?: Record<string, unknown>;
  } | null;

  if (!body?.tool || typeof body.tool !== "string") {
    return NextResponse.json({ error: "tool_required" }, { status: 400 });
  }

  const result = await dispatchMcp(
    {
      uid: auth.user.id,
      role: auth.user.role,
      capabilities: auth.capabilities ?? [auth.user.role]
    },
    { tool: body.tool, arguments: body.arguments }
  );

  return NextResponse.json(result, { status: result.status });
}
