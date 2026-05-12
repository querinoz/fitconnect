"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Video
} from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Verified specialists",
    body:
      "Every trainer is interviewed and certifications are validated against the issuing body. No anonymous coaches, ever."
  },
  {
    icon: Video,
    title: "Built-in HD video room",
    body:
      "Run remote sessions inside the app, with screen share, drawing tools and recordings for review."
  },
  {
    icon: CalendarCheck,
    title: "Smart scheduling",
    body:
      "Two-way calendar sync, auto-rebooking, time-zone aware. Trainers see availability in one tap."
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    body:
      "Powered by Stripe Connect — packs, subscriptions, refunds & instant payouts handled for you."
  },
  {
    icon: Activity,
    title: "Live training plans",
    body:
      "Personalised programs with embedded video, sets/reps, RPE tracking and progress charts."
  },
  {
    icon: MessageSquare,
    title: "Real-time chat",
    body:
      "Voice notes, attachments and form-check uploads stay private between you and your coach."
  }
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest">
          Everything you need
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          A complete training stack, not just a directory.
        </h2>
        <p className="mt-4 text-ink-400 text-lg">
          We rebuilt the entire personal-training experience around what athletes and coaches
          actually need to get results.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="card-glow rounded-2xl bg-ink-900/40 p-6 hover:bg-ink-900/60 transition-colors"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display font-semibold text-xl">{it.title}</h3>
            <p className="mt-2 text-ink-400">{it.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
