import os from "node:os";

/** RFC1918 + link-local IPv4 addresses suitable for LAN mobile access */
export function getLocalNetworkHosts(): string[] {
  const hosts = new Set<string>();
  const nets = os.networkInterfaces();

  for (const entries of Object.values(nets)) {
    if (!entries) continue;
    for (const net of entries) {
      if (net.family !== "IPv4" || net.internal) continue;
      hosts.add(net.address);
    }
  }

  return [...hosts];
}

export function buildMobileUrls(port: number, path = "/mobile"): string[] {
  return getLocalNetworkHosts().map((host) => `http://${host}:${port}${path}`);
}
