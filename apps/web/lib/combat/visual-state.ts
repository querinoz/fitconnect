import type { CombatPlanMeta, TrainSnapshot } from "@/lib/train/types";

export type CombatProductState =
  | "IDLE"
  | "PREP"
  | "ROUND"
  | "WARNING"
  | "REST"
  | "PAUSED"
  | "INTERRUPTED"
  | "COMPLETING"
  | "COMPLETED"
  | "SAVE_PENDING"
  | "SAVED"
  | "SAVE_FAILED"
  | "LOCAL_ONLY";

/** Maps TRAIN + Fight Mode visual warning onto the product-facing combat state list. */
export function combatProductState(
  snapshot: TrainSnapshot,
  combat?: CombatPlanMeta | null
): CombatProductState {
  if (snapshot.phase === "idle") return "IDLE";
  if (snapshot.phase === "prep") return "PREP";
  if (snapshot.phase === "paused") return "PAUSED";
  if (snapshot.phase === "interrupted") return "INTERRUPTED";
  if (snapshot.phase === "completing") {
    if (snapshot.saveStatus === "save_pending") return "SAVE_PENDING";
    return "COMPLETING";
  }
  if (snapshot.phase === "complete") {
    if (snapshot.saveStatus === "failed") return "SAVE_FAILED";
    if (snapshot.saveStatus === "saved") return "SAVED";
    if (snapshot.saveStatus === "local_only") return "LOCAL_ONLY";
    if (snapshot.saveStatus === "save_pending") return "SAVE_PENDING";
    return "COMPLETED";
  }
  if (snapshot.phase === "rest") return "REST";
  if (
    combat &&
    (snapshot.phase === "active" || snapshot.phase === "warmup") &&
    snapshot.workRemainingSec > 0 &&
    snapshot.workRemainingSec <= combat.warningSec
  ) {
    return "WARNING";
  }
  if (snapshot.phase === "active" || snapshot.phase === "warmup") return "ROUND";
  return "IDLE";
}

export function combatStateCopy(state: CombatProductState): string {
  switch (state) {
    case "IDLE":
      return "Choose a discipline and open Fight Mode.";
    case "PREP":
      return "Briefing. Timers have not started.";
    case "ROUND":
      return "Work interval. Force and HR stay blank without a real sensor.";
    case "WARNING":
      return "Last seconds of the round.";
    case "REST":
      return "Programmed rest. Optional breathing — not a measured recovery signal.";
    case "PAUSED":
      return "Hold. Resume keeps this round on the clock.";
    case "INTERRUPTED":
      return "Left the session. Nothing uploaded while interrupted.";
    case "COMPLETING":
      return "Closing the session.";
    case "SAVE_PENDING":
      return "Writing history. Stay on this screen.";
    case "SAVED":
      return "Cloud history accepted.";
    case "SAVE_FAILED":
      return "Cloud save failed. Sets stay on this device — retry when ready.";
    case "LOCAL_ONLY":
      return "Kept on this device. Cloud persistence is not configured.";
    case "COMPLETED":
      return "Session closed.";
    default:
      return "Fight Mode.";
  }
}
