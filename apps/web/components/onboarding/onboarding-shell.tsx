"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EliteAuthPanel } from "@/components/auth/elite-auth-panel";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteChip } from "@/components/elite-os/elite-chip";

type OnboardingShellProps = {
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  stepLabels: string[];
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
};

export function OnboardingShell({
  title,
  subtitle,
  step,
  totalSteps,
  stepLabels,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  showBack = true
}: OnboardingShellProps) {
  const reduce = useReducedMotion();
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <main id="main" className="eos-floor fc-marketing-container min-h-dvh pb-16 pt-8">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-2 pb-6">
        <Link
          href="/"
          className="text-sm text-ink-400 transition hover:text-ink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-iris/60 rounded-lg"
        >
          FitConnect
        </Link>
        <EliteChip tone="neutral" as="span" className="text-[10px]">
          Step {step} of {totalSteps}
        </EliteChip>
      </header>

      <div className="mx-auto max-w-3xl px-2">
        <div className="mb-8">
          <div className="h-1.5 overflow-hidden rounded-full bg-eos-carbon eos-inner-stroke">
            <motion.div
              className="h-full bg-gradient-to-r from-eos-voltline to-eos-telemetry"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: reduce ? 0 : 0.4 }}
            />
          </div>
          <ol className="mt-4 flex flex-wrap gap-2">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <li key={label}>
                  <EliteChip
                    tone={done ? "volt" : active ? "iris" : "neutral"}
                    as="span"
                    className={cn("text-[10px]", !done && !active && "opacity-50")}
                  >
                    {done ? <Check className="mr-1 inline h-3 w-3" aria-hidden /> : null}
                    {label}
                  </EliteChip>
                </li>
              );
            })}
          </ol>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
        >
          <EliteAuthPanel badge="Onboarding" title={title} subtitle={subtitle}>
            <div className="space-y-4">{children}</div>
            <div className="mt-8 flex flex-wrap gap-3">
              {showBack && step > 1 && onBack && (
                <EliteButton type="button" variant="ghost" onClick={onBack}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
                  Back
                </EliteButton>
              )}
              <EliteButton
                type="button"
                variant="primary"
                className="min-w-[140px]"
                disabled={nextDisabled}
                onClick={onNext}
              >
                {nextLabel}
              </EliteButton>
            </div>
          </EliteAuthPanel>
        </motion.div>
      </div>
    </main>
  );
}
