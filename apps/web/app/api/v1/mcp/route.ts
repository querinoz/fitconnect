import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { dispatchMcp, listMcpCatalog } from "@/lib/mcp/gateway";
import {
  MCP_PROTOCOL_VERSION,
  isSupportedProtocolVersion,
  mcpDiscoverPayload,
  mcpResultMeta,
  readRequestedProtocolVersion
} from "@/lib/mcp/protocol";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({
      ...mcpDiscoverPayload(null),
      toolsAuthRequired: true
    });
  }
  return NextResponse.json({
    ...mcpDiscoverPayload(listMcpCatalog()),
    toolsAuthRequired: true,
    actor: { uid: auth.user.id, role: auth.user.role }
  });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "highcost");
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    tool?: string;
    arguments?: Record<string, unknown>;
    _meta?: unknown;
  } | null;

  const requested = readRequestedProtocolVersion(body?._meta);
  if (!isSupportedProtocolVersion(requested)) {
    return NextResponse.json(
      {
        error: "UnsupportedProtocolVersionError",
        protocolVersion: MCP_PROTOCOL_VERSION,
        requested,
        _meta: mcpResultMeta()
      },
      { status: 400 }
    );
  }

  if (!body?.tool || typeof body.tool !== "string") {
    return NextResponse.json({ error: "tool_required", _meta: mcpResultMeta() }, { status: 400 });
  }

  const result = await dispatchMcp(
    {
      uid: auth.user.id,
      role: auth.user.role,
      capabilities: auth.capabilities ?? [auth.user.role]
    },
    { tool: body.tool, arguments: body.arguments }
  );

  return NextResponse.json({ ...result, _meta: mcpResultMeta() }, { status: result.status });
}
