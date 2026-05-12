"use client";

import { motion } from "framer-motion";
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
    title: "Verified specialists",
    body:
      "Every trainer is interviewed and certifications are validated against the issuing body. 38% acceptance rate.",
    color: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
  },
  {
    icon: Video,
    title: "Built-in HD video room",
    body:
      "Run remote sessions in the app, with screen share, drawing tools and auto-recordings for review.",
    color: "text-brand-300 bg-brand-500/10 ring-brand-500/30"
  },
  {
    icon: CalendarCheck,
    title: "Smart scheduling",
    body:
      "Two-way calendar sync. Auto-rebooking. Time-zone aware. Coaches see availability in one tap.",
    color: "text-plasma-400 bg-plasma-500/10 ring-plasma-500/30"
  },
  {
    icon: CreditCard,
    title: "Stripe Connect payouts",
    body:
      "Coaches keep 85% — highest in the industry. Packs, subscriptions, refunds handled for you.",
    color: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
  },
  {
    icon: HeartPulse,
    title: "Recovery-aware coaching",
    body:
      "HRV + sleep from Apple Watch / Garmin / Whoop flow straight to your coach&apos;s plan.",
    color: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
  },
  {
    icon: Brain,
    title: "AI plan adjustments",
    body:
      "Bad sleep last night? Your interval session quietly becomes a Z2 ride. Your coach approves.",
    color: "text-plasma-400 bg-plasma-500/10 ring-plasma-500/30"
  },
  {
    icon: MessageSquare,
    title: "Real-time chat",
    body:
      "Voice notes, attachments, form-check uploads — stay private between you and your coach.",
    color: "text-brand-300 bg-brand-500/10 ring-brand-500/30"
  },
  {
    icon: Activity,
    title: "Multi-sport athlete",
    body:
      "Yoga Monday, BJJ Wednesday, run Saturday — one identity, one unified recovery score.",
    color: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
  },
  {
    icon: Trophy,
    title: "Programs library",
    body:
      "84 branded programs by signature coaches. Battle-tested by 12,000+ athletes.",
    color: "text-amber-400 bg-amber-500/10 ring-amber-500/30"
  },
  {
    icon: BadgeCheck,
    title: "Free 15-min intro call",
    body:
      "Try every coach risk-free. Switch any time. Your athlete profile travels with you.",
    color: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
  },
  {
    icon: Award,
    title: "Athlete community",
    body:
      "Check-ins, PRs, before/afters. Train solo with the energy of a clubhouse.",
    color: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
  },
  {
    icon: Sparkles,
    title: "Continuous evolution",
    body:
      "Ship every two weeks. The product you sign up for in March looks better in May.",
    color: "text-plasma-400 bg-plasma-500/10 ring-plasma-500/30"
  }
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="eyebrow">The complete stack</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          Not a directory.{" "}
          <span className="gradient-text">An entire training stack</span>.
        </h2>
        <p className="mt-4 text-ink-400 text-lg">
          We rebuilt the personal-training experience around what athletes and coaches actually
          need to get results. Twelve modules — and we&apos;re still shipping.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
            whileHover={{ y: -4 }}
            className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-5 hover:bg-ink-900/70 hover:border-ink-700 transition-all"
          >
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${it.color}`}
            >
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display font-semibold text-lg leading-snug">
              {it.title}
            </h3>
            <p className="mt-2 text-sm text-ink-400 leading-relaxed">{it.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
