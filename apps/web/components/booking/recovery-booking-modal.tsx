"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, HeartPulse, Sparkles } from "lucide-react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
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
  coachId,
  athleteId,
  athleteName,
  open,
  onClose,
  onBooked
}: RecoveryBookingModalProps) {
  const [step, setStep] = useState<"prompt" | "confirm" | "success">("prompt");
  const [choice, setChoice] = useState<"recovery" | "standard" | "intense">("standard");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const band =
    readinessScore < 40 ? "low" : readinessScore <= 70 ? "mid" : "high";

  function resetAndClose() {
    setStep("prompt");
    setError(null);
    setSubmitting(false);
    onClose();
  }

  async function handleConfirm() {
    if (choice === "intense") {
      setStep("success");
      return;
    }
    if (!coachId || !athleteId) {
      setError("Connect a coach before booking. We will not invent a reservation.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const res = await fetch("/api/v1/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachId,
        scheduledAt,
        type: choice === "recovery" ? "Recovery session" : "Training session",
        mode: "Online",
        notes: athleteName ? `Requested by ${athleteName}` : choice
      })
    });
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    setSubmitting(false);
    if (res.status === 401) {
      setError("Sign in to book this session.");
      return;
    }
    if (res.status === 503) {
      setError("Booking is unavailable until the database is configured.");
      return;
    }
    if (!res.ok) {
      setError(body?.error === "scheduledAt_in_past"
        ? "That slot is no longer available."
        : body?.error ?? "Booking failed. Nothing was reserved.");
      return;
    }
    toastSuccess("Session booked", `${coachName} has been notified.`);
    setStep("success");
    onBooked?.(choice);
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
            <p className="mt-3 font-display text-lg font-bold">
              {choice === "intense" ? "Keep your later slot" : "Session booked"}
            </p>
            <p className="text-sm text-ink-400 mt-1">
              {choice === "intense"
                ? "Open TRAIN to pick a later time. Nothing was reserved just now."
                : `${coachName} has been notified.`}
            </p>
            <EliteButton type="button" className="mt-4 w-full" onClick={resetAndClose}>
              Done
            </EliteButton>
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
                planned session or pick a later slot.
              </p>
            )}
            {band === "high" && (
              <p className="text-sm text-ink-300">
                When HRV and sleep are present, this is a good day for your hardest session.
              </p>
            )}

            {!coachId ? (
              <div className="space-y-3">
                <p className="text-sm text-eos-on-surface-muted">
                  No coach is linked to this account yet, so a booking cannot be created.
                </p>
                <EliteButton asChild className="w-full">
                  <Link href="/discover">Find a coach</Link>
                </EliteButton>
              </div>
            ) : step === "prompt" ? (
              <div className="grid gap-2">
                {(band === "low"
                  ? ([
                      ["recovery", "Book recovery session"],
                      ["standard", "Book planned session anyway"],
                      ["intense", "Pick a later slot"]
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
            ) : null}

            {error ? (
              <p className="text-sm text-eos-alert" role="alert">
                {error}
              </p>
            ) : null}

            {step === "confirm" && coachId ? (
              <div className="flex gap-2 pt-2">
                <EliteButton
                  type="button"
                  className="flex-1"
                  disabled={submitting}
                  onClick={() => void handleConfirm()}
                >
                  <Calendar className="h-4 w-4" aria-hidden />
                  {submitting ? "Booking…" : "Confirm"}
                </EliteButton>
                <EliteButton type="button" variant="secondary" onClick={() => setStep("prompt")}>
                  Back
                </EliteButton>
              </div>
            ) : null}

            <EliteButton type="button" variant="ghost" className="w-full" onClick={resetAndClose}>
              Cancel
            </EliteButton>
          </>
        )}
      </BentoCard>
    </div>
  );
}
