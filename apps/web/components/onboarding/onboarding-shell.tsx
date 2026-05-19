"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";

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
    <main
      id="main"
      className="relative min-h-dvh overflow-hidden bg-ink-950 text-ink-100"
    >
      <div className="absolute -top-32 -right-24 -z-10 h-[420px] w-[420px] rounded-full bg-brand-500/15 blur-3xl" />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-sm text-ink-400 hover:text-ink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-lg"
        >
          FitConnect
        </Link>
        <span className="text-xs uppercase tracking-widest text-ink-500">
          Step {step} of {totalSteps}
        </span>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-16">
        <div className="mb-8">
          <div className="h-1.5 rounded-full bg-ink-900 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-400 to-accent-500"
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
                <li
                  key={label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
                    done && "bg-accent-500/15 text-accent-300 ring-accent-500/30",
                    active && "bg-brand-500/15 text-brand-200 ring-brand-500/40",
                    !done && !active && "text-ink-500 ring-ink-800"
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : null}
                  {label}
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
          <GlassCard tone="active" className="rounded-3xl p-7 md:p-9">
            <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-ink-400">{subtitle}</p>
            <div className="mt-6 space-y-4">{children}</div>
            <div className="mt-8 flex flex-wrap gap-3">
              {showBack && step > 1 && onBack && (
                <VoltButton type="button" variant="ghost" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden />
                  Back
                </VoltButton>
              )}
              <VoltButton
                type="button"
                className="min-w-[140px]"
                disabled={nextDisabled}
                onClick={onNext}
              >
                {nextLabel}
              </VoltButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  );
}
