"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  createDemoUserFromSignup,
  dashboardPathForRole
} from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useVerificationStore } from "@/lib/coach/verification-store";
import { useOnboardingStore } from "@/lib/onboarding/store";
import { startConnectOnboarding } from "@/lib/stripe/client";
import { cn } from "@/lib/utils";

const SPORTS = ["Running", "Cycling", "Swimming", "Strength", "Triathlon", "Climbing"];

export default function CoachOnboardingPage() {
  const router = useRouter();
  const { coach, patchCoach, reset } = useOnboardingStore();
  const login = useAuthStore((s) => s.login);
  const registerDemo = useAuthStore((s) => s.registerDemo);
  const user = useAuthStore((s) => s.user);
  const submitCase = useVerificationStore((s) => s.submitCase);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<string[]>([]);

  function toggleSport(sport: string) {
    const sports = coach.sports.includes(sport)
      ? coach.sports.filter((s) => s !== sport)
      : [...coach.sports, sport];
    patchCoach({ sports });
  }

  async function connectStripe() {
    setBusy(true);
    const coachId = user?.coachId ?? `t-new-${Date.now()}`;
    const res = await startConnectOnboarding(coachId);
    patchCoach({ stripeConnected: true });
    window.open(res.onboardingUrl, "_blank", "noopener,noreferrer");
    setBusy(false);
    setStep(5);
  }

  async function finish() {
    setBusy(true);
    patchCoach({ completed: true, verificationStatus: "under_review" });

    const pendingRaw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("fitconnect-pending-signup")
        : null;
    let pending: { name: string; email: string; password: string } | null = null;
    if (pendingRaw) {
      try {
        pending = JSON.parse(pendingRaw);
      } catch {
        /* ignore */
      }
    }

    const name = pending?.name ?? user?.name ?? "New Coach";
    const email = pending?.email ?? user?.email ?? "coach@fitconnect.local";
    const coachId = user?.coachId ?? `t-${email.split("@")[0]}`;

    submitCase({
      coachId,
      coachName: name,
      email,
      sports: coach.sports,
      documentsUploaded: coach.documentsUploaded
    });

    if (!user && pending) {
      const cred = createDemoUserFromSignup({ ...pending, role: "coach" });
      registerDemo(cred);
      login(cred);
      sessionStorage.removeItem("fitconnect-pending-signup");
    }

    reset();
    router.replace(dashboardPathForRole("coach"));
  }

  if (step === 1) {
    return (
      <OnboardingShell
        step={1}
        totalSteps={5}
        stepLabels={["Profile", "Certs", "Pricing", "Stripe", "Review"]}
        title="Coach profile"
        subtitle="Tell athletes who you are and what you coach."
        onNext={() => setStep(2)}
        nextDisabled={coach.bio.trim().length < 20 || coach.sports.length === 0}
      >
        <textarea
          value={coach.bio}
          onChange={(e) => patchCoach({ bio: e.target.value })}
          rows={4}
          placeholder="Certified coach with 8+ years coaching age-group triathletes…"
          className="w-full rounded-xl border border-glass-border bg-glass-md px-4 py-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => toggleSport(sport)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold ring-1",
                coach.sports.includes(sport)
                  ? "bg-brand-500/20 text-brand-200 ring-brand-500/40"
                  : "text-ink-300 ring-ink-800"
              )}
            >
              {sport}
            </button>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell
        step={2}
        totalSteps={5}
        stepLabels={["Profile", "Certs", "Pricing", "Stripe", "Review"]}
        title="Verification documents"
        subtitle="Upload certification, ID, and optional intro video (demo — files stay local)."
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        nextDisabled={!coach.documentsUploaded}
      >
        <label className="block rounded-xl border border-dashed border-ink-700 p-6 text-center cursor-pointer hover:border-brand-500/40">
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              const names = Array.from(e.target.files ?? []).map((f) => f.name);
              setDocs(names);
              if (names.length > 0) patchCoach({ documentsUploaded: true });
            }}
          />
          <p className="text-sm font-semibold text-ink-200">Drop files or click to upload</p>
          <p className="text-xs text-ink-500 mt-1">Cert · ID · intro video</p>
        </label>
        {docs.length > 0 && (
          <ul className="text-xs text-ink-400 space-y-1">
            {docs.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell
        step={3}
        totalSteps={5}
        stepLabels={["Profile", "Certs", "Pricing", "Stripe", "Review"]}
        title="Pricing & availability"
        subtitle="Set your hourly rate — FitConnect takes 15% on paid sessions."
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-500">
            Hourly rate (EUR)
          </span>
          <input
            type="number"
            min={25}
            max={250}
            value={coach.hourlyRate}
            onChange={(e) =>
              patchCoach({ hourlyRate: Number(e.target.value) || 65 })
            }
            className="mt-1.5 w-full rounded-xl border border-glass-border bg-glass-md px-4 h-11 text-sm"
          />
        </label>
        <p className="text-xs text-ink-500">
          You keep 85% · platform fee 15% · payouts via Stripe Connect
        </p>
      </OnboardingShell>
    );
  }

  if (step === 4) {
    return (
      <OnboardingShell
        step={4}
        totalSteps={5}
        stepLabels={["Profile", "Certs", "Pricing", "Stripe", "Review"]}
        title="Stripe Connect"
        subtitle="Link a payout account to receive session and program revenue."
        onBack={() => setStep(3)}
        onNext={connectStripe}
        nextLabel={busy ? "Opening Stripe…" : "Connect with Stripe"}
        nextDisabled={busy}
      >
        <p className="text-sm text-ink-300">
          Express onboarding opens in a new tab. Demo mode simulates a connected account
          instantly.
        </p>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={5}
      totalSteps={5}
      stepLabels={["Profile", "Certs", "Pricing", "Stripe", "Review"]}
      title="Under review"
      subtitle="Our team verifies coaches within 48h. You can explore the coach dashboard now."
      showBack={false}
      onNext={finish}
      nextLabel={busy ? "Loading…" : "Enter coach dashboard"}
      nextDisabled={busy}
    >
      <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm text-accent-200">
        Status: under review · documents received
        {coach.stripeConnected ? " · Stripe connected" : ""}
      </div>
    </OnboardingShell>
  );
}
