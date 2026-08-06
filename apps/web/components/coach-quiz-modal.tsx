"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { CoachQuizFlow } from "@/components/coach-quiz";
import { useQuizModalStore } from "@/lib/quiz-modal-store";
import { useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

export function CoachQuizModal() {
  const open = useQuizModalStore((s) => s.open);
  const setOpen = useQuizModalStore((s) => s.setOpen);
  const t = useT();
  const reduce = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                className="fixed inset-0 z-[60] bg-ink-950/85 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              aria-describedby="quiz-modal-desc"
              onOpenAutoFocus={(e) => e.preventDefault()}
              className={cn(
                "fixed left-1/2 top-1/2 z-[61] w-[calc(100%-1.5rem)] max-w-2xl max-h-[min(92vh,760px)]",
                "-translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl",
                "border border-ink-800 bg-ink-950 shadow-elevated focus:outline-none"
              )}
            >
              <motion.div
                initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-800/80 bg-ink-950/95 px-5 py-4 backdrop-blur">
                  <div>
                    <Dialog.Title className="font-display text-lg font-bold text-ink-50">
                      {t("quiz", "title")}{" "}
                      <span className="gradient-text">{t("quiz", "titleAccent")}</span>
                    </Dialog.Title>
                    <p id="quiz-modal-desc" className="mt-0.5 text-xs text-ink-500">
                      {t("quiz", "subtitle")}
                    </p>
                  </div>
                  <Dialog.Close
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900 hover:text-ink-100"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <div className="p-5 md:p-6">
                  <CoachQuizFlow compact />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
