import { handleStravaV3Proxy } from "@/lib/integrations/strava/proxy-handler";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return handleStravaV3Proxy(request, path);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
