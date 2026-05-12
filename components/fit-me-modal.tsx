"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin, Sparkles, X, Zap } from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n-provider";
import type { Trainer } from "@/lib/data";
import { Button } from "./ui/button";

interface FitMeModalProps {
  trainer: Trainer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Phase = "idle" | "sending" | "sent";

export function FitMeModal({ trainer, open, onOpenChange }: FitMeModalProps) {
  const t = useT();
  const { lang } = useLanguage();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!open) {
      const id = window.setTimeout(() => setPhase("idle"), 250);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const intro = useMemo(() => {
    if (!trainer) return [];
    const sport = trainer.sports[0];
    if (lang === "pt") {
      return [
        `Olá ${trainer.name.split(" ")[0]}, sou a Inês — atleta intermédia em ${sport.toLowerCase()}, baseada em Lisboa.`,
        `Procuro um plano sustentável de 8–12 semanas para um objetivo claro este trimestre, e a tua abordagem encaixa.`,
        `Disponível para uma intro grátis de 15 min esta semana — manhãs ou pós-trabalho. Avisa-me o que dá.`
      ];
    }
    return [
      `Hi ${trainer.name.split(" ")[0]}, I'm Inês — intermediate ${sport.toLowerCase()} athlete based in Lisbon.`,
      `I'm looking for a sustainable 8–12 week block toward one clear goal this quarter and your approach fits.`,
      `Free for a 15-min intro this week — mornings or post-work. Let me know what works.`
    ];
  }, [trainer, lang]);

  function handleSend() {
    if (phase !== "idle") return;
    setPhase("sending");
    window.setTimeout(() => setPhase("sent"), 1100);
  }

  if (!trainer) return null;

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
                transition={{ duration: reduce ? 0 : 0.2 }}
                className="fixed inset-0 z-[60] bg-ink-950/80 backdrop-blur"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby="fitme-desc"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reduce ? 0 : 12, scale: reduce ? 1 : 0.97 }}
                transition={{
                  duration: reduce ? 0 : 0.32,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="fixed left-1/2 top-1/2 z-[61] w-[min(540px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-ink-800 bg-ink-950 p-0 shadow-elevated"
              >
                {/* Ambient glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-56 w-[120%] -translate-x-1/2 bg-gradient-to-br from-brand-500/30 via-accent-500/15 to-transparent blur-3xl"
                />

                <div className="relative px-6 pt-6 pb-2">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950 shadow-glow">
                      <Zap className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <Dialog.Title className="font-display text-xl font-bold text-ink-50">
                        {t("fitme", "modalTitle")}
                      </Dialog.Title>
                      <p
                        id="fitme-desc"
                        className="mt-1 text-sm text-ink-400 leading-relaxed"
                      >
                        {t("fitme", "modalSubtitle")}
                      </p>
                    </div>
                    <Dialog.Close
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:text-ink-100 hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
                      aria-label={t("fitme", "closeButton")}
                    >
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>
                </div>

                <div className="relative px-6 pb-6 pt-4">
                  {/* Trainer chip */}
                  <div className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900/50 p-3">
                    <img
                      src={trainer.avatar}
                      alt=""
                      className="h-11 w-11 rounded-full ring-2 ring-ink-950 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-50 truncate">
                        {trainer.name}
                      </p>
                      <p className="text-xs text-ink-400 flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-brand-400 shrink-0" />
                        {trainer.city} · {trainer.sports.join(" · ")}
                      </p>
                    </div>
                  </div>

                  {/* Phases */}
                  <div className="mt-5 min-h-[210px]">
                    <AnimatePresence mode="wait">
                      {phase === "sent" ? (
                        <motion.div
                          key="sent"
                          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.32 }}
                          className="flex flex-col items-center text-center pt-4"
                        >
                          <motion.div
                            initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              duration: reduce ? 0 : 0.45,
                              ease: [0.25, 1.5, 0.5, 1]
                            }}
                            className="relative grid h-16 w-16 place-items-center rounded-full bg-accent-500/20 ring-1 ring-accent-500/40 text-accent-300"
                          >
                            <CheckCircle2 className="h-8 w-8" />
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-full bg-accent-500/30 blur-xl"
                            />
                          </motion.div>
                          <h3 className="mt-4 font-display text-lg font-bold text-ink-50">
                            {t("fitme", "sentTitle")}
                          </h3>
                          <p className="mt-1.5 text-sm text-ink-400 max-w-sm">
                            {t("fitme", "sentBody")}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.18 }}
                        >
                          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-ink-500">
                            <span>{t("fitme", "previewLabel")}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-plasma-500/15 text-plasma-300 px-2 py-0.5 text-[10px] font-bold ring-1 ring-plasma-500/30">
                              <Sparkles className="h-3 w-3" /> AI
                            </span>
                          </div>
                          <div className="relative rounded-2xl border border-ink-800 bg-ink-900/60 p-4 text-sm text-ink-200 leading-relaxed space-y-2">
                            {intro.map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                          <p className="mt-3 text-[11px] text-ink-500">
                            {t("fitme", "poweredBy")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end gap-2">
                    {phase === "sent" ? (
                      <Button onClick={() => onOpenChange(false)}>
                        {t("fitme", "closeButton")}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSend}
                        disabled={phase === "sending"}
                        size="lg"
                        className="min-w-[160px]"
                      >
                        {phase === "sending" ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
                            {t("fitme", "sendingLabel")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            {t("fitme", "sendButton")}
                          </span>
                        )}
                      </Button>
                    )}
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
