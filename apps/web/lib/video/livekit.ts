import { AccessToken } from "livekit-server-sdk";

export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY?.trim() &&
      process.env.LIVEKIT_API_SECRET?.trim() &&
      process.env.LIVEKIT_URL?.trim()
  );
}

export async function createLiveKitToken(opts: {
  roomName: string;
  participantName: string;
  participantId: string;
}): Promise<{ token: string; url: string } | null> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !url) return null;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.participantId,
    name: opts.participantName,
    ttl: "2h"
  });
  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: true,
    canSubscribe: true
  });

  const token = await at.toJwt();
  return { token, url };
}
