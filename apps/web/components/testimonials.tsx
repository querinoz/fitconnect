"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";
import { TESTIMONIALS } from "@/lib/data";

export function Testimonials() {
  const locale = useLocale();

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="absolute inset-0 -z-10 gradient-bg-warm opacity-50" />
      <div className="max-w-2xl">
        <p className="eyebrow text-signal-400">{locale.testimonials.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          {locale.testimonials.title}{" "}
          <span className="gradient-text-warm">{locale.testimonials.titleAccent}</span>.
        </h2>
        <p className="mt-4 text-lg text-ink-400">{locale.testimonials.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {TESTIMONIALS.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 hover:border-signal-400/40 transition-all hover:-translate-y-0.5"
          >
            {t.actionPhoto && (
              <div className="relative aspect-[16/9] overflow-hidden fc-photo-mask fc-photo-duotone fc-photo-duotone-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.actionPhoto}
                  alt={`${t.name} mid-training`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-signal-200 ring-1 ring-signal-500/40">
                    Athlete story
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 z-10 text-right">
                  <p className="font-display font-bold text-lg gradient-text-warm tabular-nums leading-none">
                    {t.metric.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-ink-300">
                    {t.metric.label}
                  </p>
                </div>
              </div>
            )}
            <div className="relative p-7 flex flex-col flex-1">
              <Quote
                aria-hidden="true"
                className="absolute top-5 right-5 h-7 w-7 text-signal-500/20"
              />
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    aria-hidden="true"
                    className="h-3.5 w-3.5 fill-current"
                  />
                ))}
              </div>
              <p className="text-ink-200 text-[15px] leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto pt-5 flex items-center gap-3 border-t border-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full ring-2 ring-ink-950 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-100 text-sm">{t.name}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {t.role} · {t.location}
                  </p>
                </div>
                {!t.actionPhoto && (
                  <div className="text-right">
                    <p className="font-display font-bold text-lg gradient-text-warm tabular-nums">
                      {t.metric.value}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-ink-500">
                      {t.metric.label}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] text-ink-500">Coach: {t.coachName}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
