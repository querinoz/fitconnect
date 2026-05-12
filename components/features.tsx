"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage, useT } from "@/lib/i18n-provider";
import {
  Activity,
  Award,
  BadgeCheck,
  Brain,
  CalendarCheck,
  CreditCard,
  HeartPulse,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trophy,
  Video
} from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    titleEn: "Verified specialists",
    titlePt: "Especialistas verificados",
    bodyEn:
      "Every trainer is interviewed and certifications are validated against the issuing body. 38% acceptance rate.",
    bodyPt:
      "Cada coach é entrevistado e as certificações são validadas junto da entidade emissora. Taxa de aceitação de 38%.",
    color: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
  },
  {
    icon: Video,
    titleEn: "Built-in HD video room",
    titlePt: "Sala de vídeo HD integrada",
    bodyEn:
      "Run remote sessions in the app, with screen share, drawing tools and auto-recordings for review.",
    bodyPt:
      "Sessões remotas dentro da app, com partilha de ecrã, ferramentas de desenho e gravações automáticas para rever.",
    color: "text-brand-300 bg-brand-500/10 ring-brand-500/30"
  },
  {
    icon: CalendarCheck,
    titleEn: "Smart scheduling",
    titlePt: "Agenda inteligente",
    bodyEn:
      "Two-way calendar sync. Auto-rebooking. Time-zone aware. Coaches see availability in one tap.",
    bodyPt:
      "Sincronização de calendário em duas vias. Remarcação automática. Consciente de fusos. Coaches veem disponibilidade num toque.",
    color: "text-plasma-400 bg-plasma-500/10 ring-plasma-500/30"
  },
  {
    icon: CreditCard,
    titleEn: "Stripe Connect payouts",
    titlePt: "Pagamentos via Stripe Connect",
    bodyEn:
      "Coaches keep 85% — highest in the industry. Packs, subscriptions, refunds handled for you.",
    bodyPt:
      "Os coaches ficam com 85% — o mais alto do setor. Packs, subscrições e reembolsos tratados por nós.",
    color: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
  },
  {
    icon: HeartPulse,
    titleEn: "Recovery-aware coaching",
    titlePt: "Coaching consciente da recuperação",
    bodyEn:
      "HRV + sleep from Apple Watch / Garmin / Whoop flow straight to your coach's plan.",
    bodyPt:
      "HRV e sono do Apple Watch / Garmin / Whoop fluem direto para o plano do teu coach.",
    color: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
  },
  {
    icon: Brain,
    titleEn: "AI plan adjustments",
    titlePt: "Ajustes de plano por IA",
    bodyEn:
      "Bad sleep last night? Your interval session quietly becomes a Z2 ride. Your coach approves.",
    bodyPt:
      "Má noite? A tua sessão de intervalos passa silenciosamente a um spin Z2. O teu coach aprova.",
    color: "text-plasma-400 bg-plasma-500/10 ring-plasma-500/30"
  },
  {
    icon: MessageSquare,
    titleEn: "Real-time chat",
    titlePt: "Chat em tempo real",
    bodyEn:
      "Voice notes, attachments, form-check uploads — stay private between you and your coach.",
    bodyPt:
      "Notas de voz, anexos, vídeos de técnica — privados entre ti e o teu coach.",
    color: "text-brand-300 bg-brand-500/10 ring-brand-500/30"
  },
  {
    icon: Activity,
    titleEn: "Multi-sport athlete",
    titlePt: "Atleta multi-desporto",
    bodyEn:
      "Yoga Monday, BJJ Wednesday, run Saturday — one identity, one unified recovery score.",
    bodyPt:
      "Yoga à segunda, BJJ à quarta, corrida ao sábado — uma identidade, uma pontuação de recuperação unificada.",
    color: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
  },
  {
    icon: Trophy,
    titleEn: "Programs library",
    titlePt: "Biblioteca de programas",
    bodyEn:
      "84 branded programs by signature coaches. Battle-tested by 12,000+ athletes.",
    bodyPt:
      "84 programas assinados por coaches de referência. Testados por mais de 12 000 atletas.",
    color: "text-amber-400 bg-amber-500/10 ring-amber-500/30"
  },
  {
    icon: BadgeCheck,
    titleEn: "Free 15-min intro call",
    titlePt: "Intro grátis de 15 min",
    bodyEn:
      "Try every coach risk-free. Switch any time. Your athlete profile travels with you.",
    bodyPt:
      "Experimenta cada coach sem risco. Troca quando quiseres. O teu perfil de atleta viaja contigo.",
    color: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
  },
  {
    icon: Award,
    titleEn: "Athlete community",
    titlePt: "Comunidade de atletas",
    bodyEn:
      "Check-ins, PRs, before/afters. Train solo with the energy of a clubhouse.",
    bodyPt:
      "Check-ins, PRs, antes/depois. Treina sozinho com a energia de um clube.",
    color: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
  },
  {
    icon: Sparkles,
    titleEn: "Continuous evolution",
    titlePt: "Evolução contínua",
    bodyEn:
      "Ship every two weeks. The product you sign up for in March looks better in May.",
    bodyPt:
      "Lançamentos a cada duas semanas. O produto em que entras em março fica melhor em maio.",
    color: "text-plasma-400 bg-plasma-500/10 ring-plasma-500/30"
  }
];

export function Features() {
  const t = useT();
  const { lang } = useLanguage();
  const reduce = useReducedMotion();
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="eyebrow">{t("features", "eyebrow")}</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          {t("features", "title1")}{" "}
          <span className="gradient-text">{t("features", "titleAccent")}</span>
          {t("features", "titleAfter")}
        </h2>
        <p className="mt-4 text-ink-400 text-lg">{t("features", "subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it, i) => {
          const title = lang === "pt" ? it.titlePt : it.titleEn;
          const body = lang === "pt" ? it.bodyPt : it.bodyEn;
          return (
            <motion.div
              key={it.titleEn}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : (i % 4) * 0.06 }}
              whileHover={reduce ? undefined : { y: -4 }}
              className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-5 hover:bg-ink-900/70 hover:border-ink-700 transition-all"
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${it.color}`}
              >
                <it.icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg leading-snug">
                {title}
              </h3>
              <p className="mt-2 text-sm text-ink-400 leading-relaxed">{body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
