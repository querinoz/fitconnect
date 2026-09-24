import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { createGeoProvider, createRoutingProvider } from "@/lib/geo/providers";
import { assertValidLatLng } from "@/lib/spots/types";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "geocode";

  if (action === "geocode") {
    const q = url.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ status: "AVAILABLE", results: [] });
    }
    const provider = createGeoProvider();
    if (!provider) {
      return NextResponse.json({
        status: "NOT_CONFIGURED",
        results: [],
        note: "GEOAPIFY_API_KEY missing — map still works without search.",
      });
    }
    const out = await provider.geocode(q);
    return NextResponse.json(out);
  }

  if (action === "reverse") {
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));
    if (!assertValidLatLng(lat, lng)) {
      return NextResponse.json({ error: "invalid_coordinates" }, { status: 400 });
    }
    const provider = createGeoProvider();
    if (!provider) {
      return NextResponse.json({ status: "NOT_CONFIGURED", result: null });
    }
    const out = await provider.reverseGeocode(lat, lng);
    return NextResponse.json(out);
  }

  if (action === "route") {
    const fromLat = Number(url.searchParams.get("fromLat"));
    const fromLng = Number(url.searchParams.get("fromLng"));
    const toLat = Number(url.searchParams.get("toLat"));
    const toLng = Number(url.searchParams.get("toLng"));
    const modeRaw = url.searchParams.get("mode") ?? "walk";
    const mode =
      modeRaw === "bike" || modeRaw === "drive" || modeRaw === "walk" ? modeRaw : null;
    if (
      !mode ||
      !assertValidLatLng(fromLat, fromLng) ||
      !assertValidLatLng(toLat, toLng)
    ) {
      return NextResponse.json({ error: "invalid_route" }, { status: 400 });
    }
    const provider = createRoutingProvider();
    if (!provider) {
      return NextResponse.json({
        status: "NOT_CONFIGURED",
        route: null,
        message: "GEOAPIFY_API_KEY missing",
      });
    }
    const out = await provider.route(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
      mode
    );
    return NextResponse.json(out);
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
