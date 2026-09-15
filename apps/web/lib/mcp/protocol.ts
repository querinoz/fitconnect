/** MCP spec 2026-07-28: stateless core, per-request _meta, no initialize handshake. */
export const MCP_PROTOCOL_VERSION = "2026-07-28";
export const MCP_SUPPORTED_PROTOCOL_VERSIONS = ["2026-07-28", "2025-11-25"] as const;
export const MCP_PROTOCOL_VERSION_META = "io.modelcontextprotocol/protocolVersion";
export const MCP_CLIENT_INFO_META = "io.modelcontextprotocol/clientInfo";
export const MCP_SERVER_INFO_META = "io.modelcontextprotocol/serverInfo";

export const MCP_SERVER_INFO = {
  name: "fitconnect-mcp",
  version: "2026-07-28",
  title: "FitConnect MCP Gateway"
};

export type McpRequestMeta = {
  [MCP_PROTOCOL_VERSION_META]?: string;
  [MCP_CLIENT_INFO_META]?: { name?: string; version?: string };
};

export function readRequestedProtocolVersion(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const value = (meta as Record<string, unknown>)[MCP_PROTOCOL_VERSION_META];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function isSupportedProtocolVersion(version: string | null): boolean {
  if (!version) return true;
  return (MCP_SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version);
}

export function mcpResultMeta() {
  return {
    [MCP_PROTOCOL_VERSION_META]: MCP_PROTOCOL_VERSION,
    [MCP_SERVER_INFO_META]: MCP_SERVER_INFO,
    session: "stateless"
  };
}

export function mcpDiscoverPayload(tools?: unknown) {
  return {
    protocolVersion: MCP_PROTOCOL_VERSION,
    supportedProtocolVersions: MCP_SUPPORTED_PROTOCOL_VERSIONS,
    capabilities: { tools: { listChanged: false } },
    serverInfo: MCP_SERVER_INFO,
    authorization: {
      required: true,
      issuerValidation: "rfc9207",
      clientRegistration: "cimd",
      dynamicClientRegistration: "deprecated"
    },
    session: "stateless",
    tools: tools ?? null,
    _meta: mcpResultMeta()
  };
}
