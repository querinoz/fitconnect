"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Dumbbell, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n-provider";
import { TiltCard } from "./tilt-card";

const PILLARS = [
  {
    icon: Users,
    tone: "volt" as const,
    titleEn: "Athletes",
    titlePt: "Atletas",
    tagEn: "Find your specialist",
    tagPt: "Encontra o teu especialista",
    bulletsEn: ["Verified coaches", "10 sports", "Free intro call"],
    bulletsPt: ["Coaches verificados", "10 desportos", "Intro grátis"]
  },
  {
    icon: Dumbbell,
    tone: "brand" as const,
    titleEn: "Coaches",
    titlePt: "Coaches",
    tagEn: "Scale your practice",
    tagPt: "Escala o teu negócio",
    bulletsEn: ["85% payouts", "HD video room", "Smart scheduling"],
    bulletsPt: ["85% de receita", "Sala de vídeo HD", "Agenda inteligente"]
  },
  {
    icon: Sparkles,
    tone: "cyan" as const,
    titleEn: "Platform",
    titlePt: "Plataforma",
    tagEn: "Science-grade tools",
    tagPt: "Ferramentas de nível científico",
    bulletsEn: ["AI plan tweaks", "Recovery sync", "Real-time chat"],
    bulletsPt: ["Ajustes por IA", "Sync de recuperação", "Chat em tempo real"]
  }
] as const;

const toneRing: Record<(typeof PILLARS)[number]["tone"], string> = {
  volt: "text-volt-500 bg-volt-dim ring-volt-500/25",
  brand: "text-brand-400 bg-connect-dim ring-brand-400/25",
  cyan: "text-cyan-500 bg-cyan-dim ring-cyan-500/25"
};

export function FloatingPillars() {
  const { lang } = useLanguage();
  const reduce = useReducedMotion();
  const isPt = lang === "pt";

  return (
    <section className="relative mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow">Capabilities</p>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-balance leading-tight">
          Floating{" "}
          <span className="gradient-text">expertise</span>
        </h2>
        <p className="mt-4 text-ink-400 text-lg max-w-xl">
          Hover a card. If it tilts, Framer Motion is doing its job. If it
          doesn&apos;t, blame the viewport.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PILLARS.map((p, i) => {
          const title = isPt ? p.titlePt : p.titleEn;
          const tag = isPt ? p.tagPt : p.tagEn;
          const bullets = isPt ? p.bulletsPt : p.bulletsEn;
          return (
            <motion.div
              key={p.titleEn}
              initial={{ opacity: 0, y: reduce ? 0 : 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : i * 0.1 }}
            >
              <TiltCard className="h-full p-7">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl ring-1 ${toneRing[p.tone]}`}
                >
                  <p.icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink-50">{title}</h3>
                <p className="mt-1 text-sm text-ink-400">{tag}</p>
                <ul className="mt-6 space-y-2 text-sm text-ink-300">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-volt-500/80" />
                      {b}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
