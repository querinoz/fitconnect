"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  EliteAuthAlert,
  EliteAuthField,
  EliteAuthPanel
} from "@/components/auth/elite";
import { AiInsightCard } from "@/components/elite-os/layout-primitives";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { Headline, LabelCaps } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";

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
  const { reduced, uiTransition } = useEliteMotion();

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
      <EliteAuthPanel
        badge="Onboarding"
        headerAction={
          <LabelCaps className="text-eos-on-surface-subtle">
            {step + 1} / {STEPS.length}
          </LabelCaps>
        }
        className="mx-auto max-w-lg"
      >
        <div className="mb-6 flex gap-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-eos-voltline" : "bg-eos-outline"
              )}
              aria-hidden
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduced ? 0 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -12 }}
            transition={uiTransition}
          >
            {step === 0 && (
              <div className="space-y-4">
                <Headline>I am a…</Headline>
                <p className="text-sm text-eos-on-surface-muted">Choose your operating mode.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["athlete", "coach"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "rounded-[var(--eos-radius-card)] border p-5 text-left transition",
                        role === r
                          ? "border-eos-voltline/40 bg-eos-voltline-dim ring-1 ring-eos-voltline/30"
                          : "border-eos-outline bg-eos-carbon/50 hover:border-eos-outline-strong"
                      )}
                    >
                      {r === "athlete" ? (
                        <Dumbbell className="mb-3 h-6 w-6 text-eos-voltline" />
                      ) : (
                        <Sparkles className="mb-3 h-6 w-6 text-eos-telemetry" />
                      )}
                      <p className="font-display font-bold capitalize text-eos-on-surface">{r}</p>
                      <p className="mt-1 text-xs text-eos-on-surface-muted">
                        {r === "athlete" ? "Train smarter with AI readiness" : "Run your coaching OS"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Headline className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-eos-voltline" /> Your goals
                </Headline>
                <p className="text-sm text-eos-on-surface-muted">Pick up to 3 — we personalize from here.</p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <EliteChip
                      key={g}
                      tone={goals.includes(g) ? "volt" : "neutral"}
                      as="button"
                      type="button"
                      onClick={() => toggleGoal(g)}
                    >
                      {g}
                    </EliteChip>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Headline>Experience level</Headline>
                <div className="grid gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={cn(
                        "rounded-[var(--eos-radius-control)] border px-4 py-3 text-left text-sm font-semibold capitalize transition",
                        experience === lvl
                          ? "border-eos-voltline/40 bg-eos-voltline-dim text-eos-voltline"
                          : "border-eos-outline text-eos-on-surface-muted hover:border-eos-outline-strong"
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
                <Brain className="mx-auto h-10 w-10 text-eos-voltline" />
                <Headline>Building your AI profile</Headline>
                <BentoCard elevation="glass" padding="md" className="text-left">
                  <AiInsightCard
                    title="AI insight"
                    body={
                      aiReady
                        ? `Optimized for ${role} · ${experience} · ${goals.join(", ") || "general fitness"}. Recovery-aware scheduling enabled.`
                        : "Analyzing goals, experience, and readiness patterns…"
                    }
                    className="border-0 bg-transparent p-0"
                  />
                </BentoCard>
              </div>
            )}

            {step === 4 && (
              <form onSubmit={onSubmit} className="space-y-4">
                <Headline>Create account</Headline>
                <OAuthRow mode="signup" signupRole={role} onDemoComplete={handleDemoOAuth} />
                <EliteAuthField
                  id="name"
                  label="Full name"
                  icon={User}
                  required
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Full name"
                />
                <EliteAuthField
                  id="email"
                  label={t("auth", "emailLabel")}
                  type="email"
                  required
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder={t("auth", "emailPlaceholder")}
                />
                <EliteAuthField
                  id="password"
                  label={t("auth", "passwordLabel")}
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder={t("auth", "passwordPlaceholder")}
                />
                <label className="flex items-start gap-2 text-xs text-eos-on-surface-muted">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-eos-voltline"
                  />
                  {t("auth", "legalNote")}
                </label>
                {error ? <EliteAuthAlert tone="error">{error}</EliteAuthAlert> : null}
                <EliteButton type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Creating…" : t("auth", "submitSignUp")}
                </EliteButton>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-eos-outline pt-5">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-1 text-sm text-eos-on-surface-muted disabled:opacity-40 hover:text-eos-on-surface"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 4 ? (
            <EliteButton type="button" onClick={nextStep} disabled={!canContinue} size="sm">
              Continue <ArrowRight className="h-4 w-4" />
            </EliteButton>
          ) : null}
        </div>

        <p className="mt-5 text-center text-sm text-eos-on-surface-muted">
          {t("auth", "haveAccount")}{" "}
          <Link href="/signin" className="font-semibold text-eos-voltline hover:text-eos-voltline/80">
            {t("auth", "signInLink")}
          </Link>
        </p>
      </EliteAuthPanel>
    </div>
  );
}
