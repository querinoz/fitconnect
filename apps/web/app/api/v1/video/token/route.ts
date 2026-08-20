import { NextResponse } from "next/server";
import { createLiveKitToken, isLiveKitConfigured } from "@/lib/video/livekit";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "highcost");
  if (limited) return limited;

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    roomName?: string;
    participantName?: string;
    participantId?: string;
  };

  const { roomName, participantName, participantId } = body;
  if (!roomName || !participantName || !participantId) {
    return NextResponse.json(
      { error: "roomName, participantName, participantId required" },
      { status: 400 }
    );
  }

  if (participantId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!isLiveKitConfigured()) {
    return NextResponse.json({
      demo: true,
      roomName,
      message: "LiveKit not configured — demo room placeholder"
    });
  }

  const result = await createLiveKitToken({ roomName, participantName, participantId });
  if (!result) {
    return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
