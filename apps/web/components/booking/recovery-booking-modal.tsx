"use client";

import { useState } from "react";
import { Calendar, HeartPulse, Sparkles } from "lucide-react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { publishSessionBooking } from "@/lib/realtime/publish-booking";
import { toastSuccess } from "@/lib/toast/store";
import { cn } from "@/lib/utils";

type RecoveryBookingModalProps = {
  readinessScore: number;
  coachName: string;
  coachId?: string;
  athleteId?: string;
  athleteName?: string;
  open: boolean;
  onClose: () => void;
  onBooked?: (mode: "recovery" | "standard" | "intense") => void;
};

export function RecoveryBookingModal({
  readinessScore,
  coachName,
  coachId = "t-002",
  athleteId = "a-ines",
  athleteName = "Inês M.",
  open,
  onClose,
  onBooked
}: RecoveryBookingModalProps) {
  const [step, setStep] = useState<"prompt" | "confirm" | "success">("prompt");
  const [choice, setChoice] = useState<"recovery" | "standard" | "intense">(
    "standard"
  );

  if (!open) return null;

  const band =
    readinessScore < 40 ? "low" : readinessScore <= 70 ? "mid" : "high";

  function resetAndClose() {
    setStep("prompt");
    onClose();
  }

  function handleConfirm() {
    publishSessionBooking({
      athleteId,
      athleteName,
      coachId,
      coachName,
      mode: choice
    });
    toastSuccess("Session booked", `${coachName} has been notified.`);
    setStep("success");
    onBooked?.(choice);
    window.setTimeout(resetAndClose, 1400);
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-booking-title"
    >
      <BentoCard elevation="glass" padding="lg" className="w-full max-w-md space-y-4">
        {step === "success" ? (
          <div className="text-center py-4">
            <Sparkles className="mx-auto h-8 w-8 text-accent-400" aria-hidden />
            <p className="mt-3 font-display text-lg font-bold">Session booked</p>
            <p className="text-sm text-ink-400 mt-1">
              {coachName} has been notified.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <HeartPulse className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 id="recovery-booking-title" className="font-display text-lg font-bold">
                  {band === "low" && "Low readiness day"}
                  {band === "mid" && "Book a session"}
                  {band === "high" && "You're primed"}
                </h2>
                <p className="text-sm text-ink-400 mt-1">
                  Readiness {readinessScore}% · coach {coachName}
                </p>
              </div>
            </div>

            {band === "low" && (
              <p className="text-sm text-ink-300">
                Your coach suggests a recovery session. You can still book your
                planned session or reschedule.
              </p>
            )}
            {band === "high" && (
              <p className="text-sm text-ink-300">
                HRV and sleep are aligned — great day for your hardest session.
              </p>
            )}

            <div className="grid gap-2">
              {(band === "low"
                ? ([
                    ["recovery", "Book recovery session"],
                    ["standard", "Book planned session anyway"],
                    ["intense", "Reschedule for later"]
                  ] as const)
                : ([["standard", "Confirm booking"]] as const)
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setChoice(id);
                    setStep("confirm");
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    "border-ink-800 hover:border-brand-400/50 hover:bg-brand-500/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {step === "confirm" && (
              <div className="flex gap-2 pt-2">
                <EliteButton type="button" className="flex-1" onClick={handleConfirm}>
                  <Calendar className="h-4 w-4" aria-hidden />
                  Confirm
                </EliteButton>
                <EliteButton type="button" variant="secondary" onClick={() => setStep("prompt")}>
                  Back
                </EliteButton>
              </div>
            )}

            <EliteButton type="button" variant="ghost" className="w-full" onClick={resetAndClose}>
              Cancel
            </EliteButton>
          </>
        )}
      </BentoCard>
    </div>
  );
}
