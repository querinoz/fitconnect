import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { buildMobileUrls } from "@/lib/network/local-urls";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/mobile";
  const hostHeader = request.headers.get("host") ?? "localhost:3001";
  const [hostname, portStr] = hostHeader.split(":");
  const port = Number(process.env.PORT || portStr || 3001);

  const urls = new Set<string>();

  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    urls.add(`http://${hostHeader}${path}`);
  }

  for (const url of buildMobileUrls(port, path)) {
    urls.add(url);
  }

  urls.add(`http://localhost:${port}${path}`);

  const qrs = await Promise.all(
    [...urls].map(async (url) => ({
      url,
      isLocalhost: url.includes("localhost") || url.includes("127.0.0.1"),
      dataUrl: await QRCode.toDataURL(url, {
        margin: 2,
        width: 280,
        color: { dark: "#C8FF00", light: "#090402" }
      })
    }))
  );

  return NextResponse.json({
    path,
    port,
    qrs: qrs.sort((a, b) => Number(a.isLocalhost) - Number(b.isLocalhost))
  });
}
