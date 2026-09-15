export type TrainProgressResult = {
  status: "applied" | "duplicate" | "local_only" | "failed" | "offline" | "unauthorized";
  awardedXp: number | null;
};

export async function notifyTrainProgress(input: {
  sessionId: string;
  durationMs: number;
  planId: string;
}): Promise<TrainProgressResult> {
  try {
    const res = await fetch("/api/v1/ascend/progression", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventId: `train:${input.sessionId}`,
        type: "WORKOUT_COMPLETED",
        payload: {
          durationMs: input.durationMs,
          sessionId: input.sessionId,
          workoutId: input.planId
        }
      })
    });
    if (res.status === 401) return { status: "unauthorized", awardedXp: null };
    if (res.status === 503) return { status: "local_only", awardedXp: null };
    if (!res.ok) return { status: "failed", awardedXp: null };
    const body = (await res.json()) as { status?: string; awardedXp?: number };
    if (body.status === "DUPLICATE") return { status: "duplicate", awardedXp: 0 };
    if (typeof body.awardedXp === "number") {
      return { status: "applied", awardedXp: body.awardedXp };
    }
    return { status: "failed", awardedXp: null };
  } catch {
    return { status: "offline", awardedXp: null };
  }
}
