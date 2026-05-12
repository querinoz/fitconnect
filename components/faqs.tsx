"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Faqs() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="font-display text-4xl md:text-5xl font-bold text-center">
        Questions, answered.
      </h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <button
            key={f.q}
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left rounded-2xl border border-ink-800 bg-ink-900/40 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold">{f.q}</h3>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open === i && "rotate-180"
                )}
              />
            </div>
            <div
              className={cn(
                "grid transition-all duration-300",
                open === i ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
              )}
            >
              <p className="overflow-hidden text-ink-400 text-sm">{f.a}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
