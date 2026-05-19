"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  createDemoUserFromSignup,
  dashboardPathForRole
} from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useOnboardingStore } from "@/lib/onboarding/store";
import { startSubscription } from "@/lib/stripe/client";
import { cn } from "@/lib/utils";

const SPORTS = ["Running", "Cycling", "Swimming", "Strength", "Triathlon", "Climbing"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export default function AthleteOnboardingPage() {
  const router = useRouter();
  const { athlete, patchAthlete, reset } = useOnboardingStore();
  const login = useAuthStore((s) => s.login);
  const registerDemo = useAuthStore((s) => s.registerDemo);
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("fitconnect-pending-signup");
    if (!raw) return;
    try {
      setPendingSignup(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function toggleSport(sport: string) {
    const sports = athlete.sports.includes(sport)
      ? athlete.sports.filter((s) => s !== sport)
      : [...athlete.sports, sport];
    patchAthlete({ sports });
  }

  async function finish() {
    setBusy(true);
    patchAthlete({ completed: true });

    if (athlete.subscription === "pro" && pendingSignup?.email) {
      await startSubscription(pendingSignup.email);
    }

    if (user) {
      reset();
      sessionStorage.removeItem("fitconnect-pending-signup");
      router.replace(dashboardPathForRole("athlete"));
      return;
    }

    if (pendingSignup) {
      const cred = createDemoUserFromSignup({
        ...pendingSignup,
        role: "athlete"
      });
      registerDemo(cred);
      login(cred);
      sessionStorage.removeItem("fitconnect-pending-signup");
    }

    reset();
    router.replace(dashboardPathForRole("athlete"));
  }

  if (step === 1) {
    return (
      <OnboardingShell
        step={1}
        totalSteps={5}
        stepLabels={["Sports", "Goal", "Wearables", "Plan", "Done"]}
        title="What do you train?"
        subtitle="Pick sports and your current level so we can match coaches."
        onNext={() => setStep(2)}
        nextDisabled={athlete.sports.length === 0}
      >
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => toggleSport(sport)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                athlete.sports.includes(sport)
                  ? "bg-brand-500/20 text-brand-200 ring-brand-500/40"
                  : "text-ink-300 ring-ink-800 hover:ring-ink-600"
              )}
            >
              {sport}
            </button>
          ))}
        </div>
        <fieldset>
          <legend className="text-xs uppercase tracking-widest text-ink-500">
            Level
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => patchAthlete({ level })}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm ring-1",
                  athlete.level === level
                    ? "bg-accent-500/15 text-accent-200 ring-accent-500/40"
                    : "text-ink-400 ring-ink-800"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </fieldset>
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell
        step={2}
        totalSteps={5}
        stepLabels={["Sports", "Goal", "Wearables", "Plan", "Done"]}
        title="Your 90-day goal"
        subtitle="One sentence — we'll surface it on your dashboard."
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        nextDisabled={athlete.goal.trim().length < 8}
      >
        <textarea
          value={athlete.goal}
          onChange={(e) => patchAthlete({ goal: e.target.value })}
          rows={4}
          placeholder="e.g. Sub-4h marathon at Lisbon with consistent weekly volume"
          className="w-full rounded-xl border border-glass-border bg-glass-md px-4 py-3 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-volt-500/50"
        />
      </OnboardingShell>
    );
  }

  if (step === 3) {
    const athleteId = user?.athleteId ?? "a-ines";
    return (
      <OnboardingShell
        step={3}
        totalSteps={5}
        stepLabels={["Sports", "Goal", "Wearables", "Plan", "Done"]}
        title="Connect Strava & wearables"
        subtitle="Strava syncs activities automatically. Wearables feed your Readiness Score."
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextLabel="Continue"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={`/api/v1/integrations/strava/connect?athleteId=${encodeURIComponent(athleteId)}`}
            className="rounded-xl border border-[#FC4C02]/40 bg-[#FC4C02]/10 px-4 py-4 text-left hover:border-[#FC4C02]/60"
          >
            <span className="font-semibold text-ink-100">Strava</span>
            <span className="block text-xs text-ink-400 mt-1">
              OAuth connect · activities + webhooks
            </span>
          </a>
          {["Garmin", "WHOOP", "Oura", "Apple Health"].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => patchAthlete({ wearablesConnected: true })}
              className="rounded-xl border border-ink-800 bg-ink-950/60 px-4 py-3 text-left text-sm hover:border-brand-500/40"
            >
              <span className="font-semibold text-ink-100">{w}</span>
              <span className="block text-xs text-ink-500 mt-1">Coming soon</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="text-sm text-ink-400 underline-offset-2 hover:underline"
        >
          Skip for now
        </button>
      </OnboardingShell>
    );
  }

  if (step === 4) {
    return (
      <OnboardingShell
        step={4}
        totalSteps={5}
        stepLabels={["Sports", "Goal", "Wearables", "Plan", "Done"]}
        title="Choose your plan"
        subtitle="Browse free or unlock Pro with unlimited coach messaging."
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { id: "free" as const, title: "Browse", price: "€0" },
              { id: "pro" as const, title: "Pro", price: "€12/mo" }
            ] as const
          ).map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => patchAthlete({ subscription: plan.id })}
              className={cn(
                "rounded-2xl border p-5 text-left ring-1 transition",
                athlete.subscription === plan.id
                  ? "border-brand-500/50 bg-brand-500/10 ring-brand-500/40"
                  : "border-ink-800 ring-ink-800"
              )}
            >
              <p className="font-display text-lg font-bold">{plan.title}</p>
              <p className="text-2xl font-bold mt-1">{plan.price}</p>
              <p className="text-xs text-ink-500 mt-2">
                {plan.id === "pro"
                  ? "Stripe test mode · cancel anytime"
                  : "Discover coaches · book intro calls"}
              </p>
            </button>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={5}
      totalSteps={5}
      stepLabels={["Sports", "Goal", "Wearables", "Plan", "Done"]}
      title="You're set"
      subtitle="Your athlete dashboard is ready — coaches can see your goal and sports."
      onBack={() => setStep(4)}
      onNext={finish}
      nextLabel={busy ? "Finishing…" : "Go to dashboard"}
      nextDisabled={busy}
    >
      <ul className="space-y-2 text-sm text-ink-300">
        <li>Sports: {athlete.sports.join(", ") || "—"}</li>
        <li>Level: {athlete.level}</li>
        <li>Plan: {athlete.subscription === "pro" ? "Pro €12/mo" : "Free browse"}</li>
      </ul>
    </OnboardingShell>
  );
}
