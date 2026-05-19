/** Temporal worker stub — connect when TEMPORAL_ADDRESS is configured. */
export type WearableSyncWorkflowInput = {
  athleteId: string;
  provider: string;
};

export async function enqueueWearableSync(input: WearableSyncWorkflowInput): Promise<{ queued: boolean }> {
  const address = process.env.TEMPORAL_ADDRESS;
  if (!address) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[temporal] sync queued (demo)", input);
    }
    return { queued: false };
  }
  return { queued: true };
}
