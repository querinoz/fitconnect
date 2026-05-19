import { NextResponse } from "next/server";
import { createLiveKitToken, isLiveKitConfigured } from "@/lib/video/livekit";

export async function POST(req: Request) {
  const body = (await req.json()) as {
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
