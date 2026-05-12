"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Faqs() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5" /> Questions, answered
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
          We&apos;re happy to be{" "}
          <span className="gradient-text">specific</span>.
        </h2>
        <p className="mt-4 text-ink-400">
          Everything we&apos;d want to know if we were signing up tonight.
        </p>
      </div>
      <div className="mt-10 space-y-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className={cn(
                "group w-full text-left rounded-2xl border bg-ink-900/40 p-5 transition-all",
                isOpen
                  ? "border-brand-400/40 bg-ink-900/70"
                  : "border-ink-800 hover:border-ink-700"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-ink-100">{f.q}</h3>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform shrink-0",
                    isOpen ? "rotate-180 text-brand-300" : "text-ink-400"
                  )}
                />
              </div>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-ink-400 text-sm leading-relaxed">{f.a}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
