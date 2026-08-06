"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MobileAppPreview } from "@/components/dashboard/mobile-app-preview";
import { useQuizModalStore } from "@/lib/quiz-modal-store";
import { useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type DemoPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DemoPreviewModal({ open, onOpenChange }: DemoPreviewModalProps) {
  const t = useT();
  const reduce = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-ink-950/88 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              className={cn(
                "fixed left-1/2 top-1/2 z-[61] w-[calc(100%-1.5rem)] max-w-4xl max-h-[min(92vh,820px)]",
                "-translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl",
                "border border-ink-800 bg-ink-950 p-0 shadow-elevated focus:outline-none"
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : 12 }}
              >
                <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
                  <Dialog.Title className="font-display text-lg font-bold text-ink-50">
                    {t("hero", "demoCta")}
                  </Dialog.Title>
                  <Dialog.Close className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900 hover:text-ink-100">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <div className="grid gap-6 p-5 md:grid-cols-2 md:p-8">
                  <div className="flex justify-center overflow-hidden rounded-2xl border border-ink-800">
                  <div className="w-[280px] sm:w-[320px]">
                    <MobileAppPreview />
                  </div>
                </div>
                  <div className="flex flex-col justify-center gap-4">
                    <p className="text-sm leading-relaxed text-ink-400">
                      {t("hero", "subtitle")}
                    </p>
                    <Link
                      href="/mobile"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-volt-500 px-5 py-3 text-sm font-bold text-ink-950 hover:bg-volt-400"
                      onClick={() => onOpenChange(false)}
                    >
                      {t("hero", "fullScreenDemo")} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-xl border border-ink-700 px-5 py-3 text-sm font-semibold text-ink-200 hover:border-volt-500/35"
                      onClick={() => onOpenChange(false)}
                    >
                      {t("hero", "signupCta")}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Hero CTA row — demo modal, signup, coach link, methodology scroll. */
export function HeroActionsClient({
  demoLabel,
  signupLabel,
  coachLabel,
  methodologyLabel
}: {
  demoLabel: string;
  signupLabel: string;
  coachLabel: string;
  methodologyLabel: string;
}) {
  const [demoOpen, setDemoOpen] = useState(false);
  const setQuizOpen = useQuizModalStore((s) => s.setOpen);

  function scrollToMethodology() {
    const el = document.getElementById("methodology");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = "/#methodology";
  }

  return (
    <>
      <div className="fc-hero-actions mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-volt-500 px-5 py-3 text-sm font-bold text-ink-950 shadow-volt-glow hover:bg-volt-400 fc-motion-micro sm:px-6"
        >
          {demoLabel} <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          className="inline-flex items-center justify-center rounded-xl border border-[var(--border-sm)] bg-carbon-1/80 px-5 py-3 text-sm font-semibold text-ink-100 hover:border-volt-500/35 fc-motion-micro sm:px-6"
        >
          {signupLabel}
        </button>
        <Link
          href="/onboarding/coach"
          className="inline-flex items-center justify-center rounded-xl border border-brand-400/35 bg-connect-dim px-5 py-3 text-sm font-semibold text-brand-400 hover:border-brand-400/55 fc-motion-micro sm:px-6"
        >
          {coachLabel}
        </Link>
      </div>
      <button
        type="button"
        onClick={scrollToMethodology}
        className="mt-3 text-sm font-medium text-brand-400/90 underline-offset-4 hover:text-brand-300 hover:underline"
      >
        {methodologyLabel}
      </button>
      <DemoPreviewModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  );
}
