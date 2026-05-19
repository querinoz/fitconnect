"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n-provider";

const EN = [
  "We turn unclear training goals into something athletes can actually follow.",
  "Most platforms fail because nobody aligned on what 'ready' means — recovery, schedule, and coach fit included.",
  "Our role is to make progress obvious early: who you're training with, why it matters, and what success looks like.",
  "We focus on things that hold up over time: verified specialists, predictable scheduling, and plans that won't feel wrong later.",
  "Tools will change. Sports will change. Motivation dips and travel weeks won't.",
  "So we optimize for clarity over complexity, and outcomes over implementation.",
  "Because in the end, it's not about how flashy the dashboard is — it's about whether you actually show up."
] as const;

const PT = [
  "Transformamos objetivos de treino vagos em algo que os atletas conseguem seguir de verdade.",
  "A maioria das plataformas falha porque ninguém alinhou o que 'pronto' significa — recuperação, agenda e fit com o coach incluídos.",
  "O nosso papel é tornar o progresso óbvio cedo: com quem treinas, porquê importa, e como é o sucesso.",
  "Focamo-nos no que aguenta com o tempo: especialistas verificados, agenda previsível e planos que não parecem errados depois.",
  "As ferramentas mudam. Os desportos mudam. Quedas de motivação e semanas de viagem, não.",
  "Por isso optimizamos clareza em vez de complexidade, e resultados em vez de implementação.",
  "Porque no fim, não é sobre quão flashy é o dashboard — é sobre se apareces mesmo."
] as const;

export function PhilosophyBlock() {
  const { lang } = useLanguage();
  const reduce = useReducedMotion();
  const isPt = lang === "pt";
  const lines = isPt ? PT : EN;

  return (
    <section className="relative mx-auto max-w-3xl fc-section-x px-4 py-16 sm:px-6 sm:py-24 md:py-32 text-center">
      <p className="eyebrow">Experience · Philosophy</p>
      <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-balance">
        How we approach{" "}
        <span className="gradient-text">building things</span>
      </h2>

      <div className="mt-12 space-y-6 text-left md:text-center">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : i * 0.06 }}
            className="text-lg md:text-xl text-ink-300 leading-relaxed text-balance"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
