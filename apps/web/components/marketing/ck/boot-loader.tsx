"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BrandLockup } from "@/components/brand/brand-lockup";

const STEPS = [
  "[01] Booting FitConnect OS…",
  "[02] Syncing specialist registry…",
  "[03] Loading recovery models…",
  "[04] Warming Volt pipeline…"
] as const;

function isMobileViewport() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function BootLoader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce || isMobileViewport()) return;
    const seen = sessionStorage.getItem("fc-boot-seen");
    if (seen) return;
    setVisible(true);
  }, [reduce]);

  useEffect(() => {
    if (!visible || reduce) return;

    const tick = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 2 + Math.random() * 4));
    }, 48);

    const stepTimer = window.setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 520);

    const hide = window.setTimeout(() => {
      sessionStorage.setItem("fc-boot-seen", "1");
      setVisible(false);
    }, 2200);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(stepTimer);
      window.clearTimeout(hide);
    };
  }, [visible, reduce]);

  function dismiss() {
    sessionStorage.setItem("fc-boot-seen", "1");
    setVisible(false);
  }

  if (reduce) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="Loading FitConnect"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050608] px-6"
        >
          <div className="w-full max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-ink-500">
              System startup
            </p>
            <div className="mt-6 flex items-center gap-3">
              <BrandLockup logoSize={28} textSize={14} tagline={false} layout="inline" />
            </div>
            <ul className="mt-8 space-y-2 font-mono text-xs text-ink-400">
              {STEPS.map((line, i) => (
                <li
                  key={line}
                  className={i <= step ? "text-volt-500/90" : "text-ink-600"}
                >
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <div className="flex justify-between text-[10px] font-mono text-ink-500 mb-2">
                <span>Loading workspace</span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="h-px overflow-hidden bg-ink-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-volt-500 via-brand-400 to-cyan-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-xl border border-ink-700 py-2.5 text-xs font-semibold text-ink-400 hover:text-ink-100"
            >
              Skip intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
