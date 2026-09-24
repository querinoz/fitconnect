import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  createTrainingSpot,
  getSpotDetail,
  queryPublicSpots,
} from "@/lib/spots/repository";
import {
  parseCertification,
  parseSkillLevel,
  parseSpotKind,
  assertValidLatLng,
} from "@/lib/spots/types";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const detail = await getSpotDetail(id, auth.user.id);
    if (!detail) {
      return NextResponse.json(
        { error: "not_found", note: "Secret/private spots are never exposed without ownership." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      spot: detail,
      exactCoordinates: detail.exactCoordinates,
    });
  }

  const kind = parseSpotKind(url.searchParams.get("kind"));
  const skill = parseSkillLevel(url.searchParams.get("skill"));
  const certification = parseCertification(url.searchParams.get("certification"));
  if (kind === null || skill === null || certification === null) {
    return NextResponse.json({ error: "invalid_filter" }, { status: 400 });
  }

  const west = num(url.searchParams.get("west"));
  const south = num(url.searchParams.get("south"));
  const east = num(url.searchParams.get("east"));
  const north = num(url.searchParams.get("north"));
  const lat = num(url.searchParams.get("lat"));
  const lng = num(url.searchParams.get("lng"));
  const radiusM = num(url.searchParams.get("radiusM"));
  const sport = url.searchParams.get("sport") ?? undefined;
  const limit = num(url.searchParams.get("limit")) ?? undefined;

  const result = await queryPublicSpots({
    west: west ?? undefined,
    south: south ?? undefined,
    east: east ?? undefined,
    north: north ?? undefined,
    lat: lat ?? undefined,
    lng: lng ?? undefined,
    radiusM: radiusM ?? undefined,
    sport,
    kind,
    skill,
    certification,
    limit,
  });

  return NextResponse.json({
    ...result,
    note: "Public spots never expose exact coordinates. Secret spots never appear.",
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  if (b.confirm !== true) {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  // Reject client attempts to self-grant MASTER.
  if (
    b.certificationStatus === "MASTER" ||
    b.spotKind === "MASTER" ||
    b.moderationState === "VERIFIED"
  ) {
    return NextResponse.json(
      { error: "master_requires_verification", note: "MASTER cannot be self-asserted." },
      { status: 403 }
    );
  }

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const sportKey = typeof b.sportKey === "string" ? b.sportKey : typeof b.sport === "string" ? b.sport : "";
  const approxLat = typeof b.approxLat === "number" ? b.approxLat : NaN;
  const approxLng = typeof b.approxLng === "number" ? b.approxLng : NaN;
  if (!name || !sportKey || !assertValidLatLng(approxLat, approxLng)) {
    return NextResponse.json({ error: "invalid_spot" }, { status: 400 });
  }

  const spot = await createTrainingSpot({
    name,
    sportKey,
    description: typeof b.description === "string" ? b.description : "",
    approxLat,
    approxLng,
    exactLat: typeof b.exactLat === "number" ? b.exactLat : null,
    exactLng: typeof b.exactLng === "number" ? b.exactLng : null,
    isSecret: Boolean(b.isSecret) || b.visibility === "secret",
    difficulty: typeof b.difficulty === "string" ? b.difficulty : undefined,
    skillLevel:
      typeof b.skillLevel === "string" &&
      ["BEGINNER", "AMATEUR", "ADVANCED", "PROFESSIONAL"].includes(b.skillLevel)
        ? (b.skillLevel as "BEGINNER" | "AMATEUR" | "ADVANCED" | "PROFESSIONAL")
        : null,
    creatorId: auth.user.id,
  });

  if (!spot) {
    return NextResponse.json({ error: "create_failed", source: "unavailable" }, { status: 503 });
  }
  return NextResponse.json({ spot }, { status: 201 });
}

function num(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
