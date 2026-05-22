"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Dumbbell,
  Sparkles,
  Target,
  User
} from "lucide-react";
import {
  createDemoUserFromSignup,
  onboardingPathForRole
} from "@/lib/auth";
import {
  authBackend,
  signUpWithPassword
} from "@/lib/auth/supabase-browser-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useOnboardingStore } from "@/lib/onboarding/store";
import { useT } from "@/lib/i18n-provider";
import { OAuthRow } from "@/components/oauth-row";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { RealtimeBadge, PremiumCard } from "@/components/ui-glass/premium-system";
import { PremiumInput, FilterChip } from "@/components/ui-glass/form-system";
import { cn } from "@/lib/utils";
import { FC_EASE } from "@/lib/motion/premium-transitions";

const GOALS = [
  "Performance",
  "Strength",
  "Endurance",
  "Weight loss",
  "Recovery",
  "Competition prep"
] as const;

const STEPS = ["Role", "Goals", "Experience", "AI profile", "Account"] as const;

type SignupWizardProps = {
  embedded?: boolean;
};

export function SignupWizard({ embedded = false }: SignupWizardProps) {
  const t = useT();
  const router = useRouter();
  const registerDemo = useAuthStore((s) => s.registerDemo);
  const setOnboardingRole = useOnboardingStore((s) => s.setRole);
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"athlete" | "coach">("athlete");
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [aiReady, setAiReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal].slice(0, 3)
    );
  }

  function nextStep() {
    if (step === 2) {
      setStep(3);
      setAiReady(false);
      setTimeout(() => setAiReady(true), 1200);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Accept the terms to create an account.");
      return;
    }
    setError(null);
    setSubmitting(true);

    sessionStorage.setItem(
      "fitconnect-signup-intent",
      JSON.stringify({ role, goals, experience })
    );

    if (authBackend() === "supabase") {
      const result = await signUpWithPassword({ email, password, name, role });
      setSubmitting(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOnboardingRole(role);
      router.push(onboardingPathForRole(role));
      return;
    }

    const cred = createDemoUserFromSignup({ name, email, password, role });
    registerDemo(cred);
    sessionStorage.setItem(
      "fitconnect-pending-signup",
      JSON.stringify({ name, email, password })
    );
    setOnboardingRole(role);
    setSubmitting(false);
    router.push(onboardingPathForRole(role));
  }

  function handleDemoOAuth(r: "athlete" | "coach") {
    setOnboardingRole(r);
    sessionStorage.setItem(
      "fitconnect-pending-signup",
      JSON.stringify({
        name: r === "coach" ? "OAuth Coach" : "OAuth Athlete",
        email: `oauth-${r}@fitconnect.local`,
        password: "oauth-demo"
      })
    );
    router.push(onboardingPathForRole(r));
  }

  const canContinue =
    step === 0 ||
    (step === 1 && goals.length > 0) ||
    step === 2 ||
    (step === 3 && aiReady) ||
    step === 4;

  return (
    <div className={cn("w-full", !embedded && "fc-marketing-hero fc-marketing-container pb-16")}>
      <GlassCard tone="active" className="mx-auto max-w-lg rounded-3xl p-7 md:p-9">
        <div className="mb-6 flex items-center justify-between gap-3">
          <RealtimeBadge>Onboarding</RealtimeBadge>
          <span className="text-xs font-semibold text-ink-500">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="mb-6 flex gap-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-volt-500" : "bg-ink-800"
              )}
              aria-hidden
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduce ? 0 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -12 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: FC_EASE }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold">I am a…</h2>
                <p className="text-sm text-ink-400">Choose your operating mode.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["athlete", "coach"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "fc-radius-card border p-5 text-left transition",
                        role === r
                          ? "border-volt-500/40 bg-volt-500/10 ring-1 ring-volt-500/30"
                          : "border-glass-border bg-glass-md hover:border-white/10"
                      )}
                    >
                      {r === "athlete" ? (
                        <Dumbbell className="mb-3 h-6 w-6 text-volt-400" />
                      ) : (
                        <Sparkles className="mb-3 h-6 w-6 text-connect-500" />
                      )}
                      <p className="font-display font-bold capitalize">{r}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {r === "athlete" ? "Train smarter with AI readiness" : "Run your coaching OS"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <Target className="h-6 w-6 text-volt-400" /> Your goals
                </h2>
                <p className="text-sm text-ink-400">Pick up to 3 — we personalize from here.</p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <FilterChip key={g} active={goals.includes(g)} onClick={() => toggleGoal(g)}>
                      {g}
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold">Experience level</h2>
                <div className="grid gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm font-semibold capitalize transition",
                        experience === lvl
                          ? "border-volt-500/40 bg-volt-500/10 text-volt-300"
                          : "border-glass-border text-ink-300 hover:border-white/10"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-center">
                <Brain className="mx-auto h-10 w-10 text-volt-400" />
                <h2 className="font-display text-2xl font-bold">Building your AI profile</h2>
                <PremiumCard tone="brand" className="p-5 text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-500">
                    AI insight
                  </p>
                  <p className="mt-2 text-sm text-ink-200">
                    {aiReady
                      ? `Optimized for ${role} · ${experience} · ${goals.join(", ") || "general fitness"}. Recovery-aware scheduling enabled.`
                      : "Analyzing goals, experience, and readiness patterns…"}
                  </p>
                </PremiumCard>
              </div>
            )}

            {step === 4 && (
              <form onSubmit={onSubmit} className="space-y-4">
                <h2 className="font-display text-2xl font-bold">Create account</h2>
                <OAuthRow mode="signup" signupRole={role} onDemoComplete={handleDemoOAuth} />
                <PremiumInput
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  icon={<User className="h-4 w-4" />}
                />
                <PremiumInput
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth", "emailPlaceholder")}
                />
                <PremiumInput
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth", "passwordPlaceholder")}
                />
                <label className="flex items-start gap-2 text-xs text-ink-400">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-volt-500"
                  />
                  {t("auth", "legalNote")}
                </label>
                {error ? (
                  <p role="alert" className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-3 py-2 text-sm text-signal-300">
                    {error}
                  </p>
                ) : null}
                <VoltButton type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Creating…" : t("auth", "submitSignUp")}
                </VoltButton>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-glass-border pt-5">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-1 text-sm text-ink-400 disabled:opacity-40 hover:text-ink-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 4 ? (
            <VoltButton type="button" onClick={nextStep} disabled={!canContinue} className="h-10 px-5">
              Continue <ArrowRight className="h-4 w-4" />
            </VoltButton>
          ) : null}
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          {t("auth", "haveAccount")}{" "}
          <Link href="/signin" className="font-semibold text-volt-400 hover:text-volt-300">
            {t("auth", "signInLink")}
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
