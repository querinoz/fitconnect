import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardList,
  CreditCard,
  Globe2,
  HeartHandshake,
  Users,
  Video,
  Wallet
} from "lucide-react";

export const metadata = {
  title: "For coaches · Run your business on FitConnect",
  description:
    "Run your coaching business from one app. Keep 85% of every booking. Get featured to 184,512 athletes."
};

const perks = [
  { icon: Wallet, label: "Keep 85% of every booking", body: "Industry-leading take-home — we publish our P&L." },
  { icon: Video, label: "Free HD video & scheduling", body: "Built-in studio room, no Zoom links, auto-recording." },
  { icon: CreditCard, label: "Stripe Connect payouts", body: "Funds in your account 24h after every session." },
  { icon: Globe2, label: "Featured to 184,512 athletes", body: "Marketing built in. Featured slots earned, not bought." },
  { icon: ClipboardList, label: "Plan builder & exercise library", body: "600+ exercises, custom blocks, drag-and-drop." },
  { icon: BadgeCheck, label: "Verified-coach badge", body: "Cleared the Specialist Standard™. Athletes notice." }
];

const earningsCohort = [
  { months: "0-3", median: 980, top10: 2640 },
  { months: "3-6", median: 2110, top10: 4180 },
  { months: "6-12", median: 3420, top10: 6210 },
  { months: "12+", median: 4880, top10: 9740 }
];

const coachVoices = [
  {
    name: "Marina Costa",
    role: "Yoga · Lisbon",
    avatar: "https://i.pravatar.cc/200?img=47",
    quote:
      "I went from teaching 6 athletes to 41 in five months. The clients are people who actually train, not flakes."
  },
  {
    name: "Tomás Reyes",
    role: "Powerlifting · Madrid",
    avatar: "https://i.pravatar.cc/200?img=12",
    quote:
      "FitConnect is the first platform that pays me what I earn. I keep €52 of every €60 — not €30."
  },
  {
    name: "Diego Almeida",
    role: "Marathon · Porto",
    avatar: "https://i.pravatar.cc/200?img=23",
    quote:
      "The dashboard does the heavy lifting. I read HRV trends instead of asking 'how was your week?'."
  }
];

const onboarding = [
  {
    n: "01",
    title: "Apply in 12 minutes",
    body: "Quick application form — sport, certifications, video clip, scheduling."
  },
  {
    n: "02",
    title: "30-min interview",
    body: "Senior FitConnect coach interviews you on technique, programming philosophy and ethics."
  },
  {
    n: "03",
    title: "Profile activation",
    body: "Credentials cross-checked. Profile goes live. Featured slot for your first 90 days."
  }
];

export default function TrainerCtaPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden pt-12 pb-16">
          <div className="absolute inset-0 -z-10 gradient-bg" />
          <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5">
                <HeartHandshake className="h-3.5 w-3.5" /> For specialist coaches
              </p>
              <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-[0.95] text-balance">
                Coach your sport.<br />
                <span className="gradient-text">Keep 85% of it.</span>
              </h1>
              <p className="mt-5 text-ink-300 text-lg max-w-xl">
                FitConnect is the marketplace built around the athletes you&apos;d actually want
                — verified, committed, recovery-aware. The median FitConnect coach earns
                €3,420/month within 90 days.
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <Button asChild size="lg">
                  <Link href="/dashboard?as=trainer">
                    Apply now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#earnings">See coach earnings</Link>
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <Stat label="Active coaches" value="12,418" />
                <Stat label="Avg. take-home" value="85%" />
                <Stat label="Coach NPS" value="71" />
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1100&auto=format&fit=crop"
                alt=""
                className="rounded-3xl ring-1 ring-ink-800 shadow-elevated"
              />
              <div className="absolute -bottom-4 -left-4 hidden md:flex items-center gap-3 rounded-2xl glass p-4 shadow-elevated">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/15 text-accent-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-ink-100 font-semibold">€3,420 / mo</p>
                  <p className="text-[11px] text-ink-400">Median coach by month 4</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 hidden md:flex items-center gap-3 rounded-2xl glass p-4 shadow-elevated">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-ink-100 font-semibold">+12 new athletes</p>
                  <p className="text-[11px] text-ink-400">This week · auto-matched</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="perks" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 hover:border-brand-400/40 transition-colors"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg">{p.label}</h3>
                <p className="mt-2 text-sm text-ink-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Earnings */}
        <section id="earnings" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="eyebrow">Real coach earnings</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-balance">
                What you can <span className="gradient-text">actually earn</span>
              </h2>
              <p className="mt-4 text-ink-400 text-lg">
                We don&apos;t cherry-pick. These are median and top-decile gross monthly earnings
                from our active coach cohort by months on the platform.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ink-300">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5" /> No platform fees on free intro
                  calls
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5" /> Optional 9% commission rebate
                  for coaches teaching ≥ 60h/mo
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5" /> Featured slots earned on
                  retention metrics, not paid
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-8">
              <div className="space-y-5">
                {earningsCohort.map((row, i) => {
                  const max = 10000;
                  return (
                    <div key={row.months}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <p className="text-sm font-medium text-ink-100">
                          Month {row.months}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          median €{row.median.toLocaleString()} · top-10% €
                          {row.top10.toLocaleString()}
                        </p>
                      </div>
                      <div className="relative h-7 rounded-full bg-ink-800/50 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                          style={{ width: `${(row.median / max) * 100}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full border border-brand-300/40"
                          style={{ width: `${(row.top10 / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-xs text-ink-500">
                Source: active FitConnect coach cohort, Q1 2026. Self-reported gross monthly
                earnings (verified against Stripe).
              </p>
            </div>
          </div>
        </section>

        {/* Coach voices */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {coachVoices.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="h-10 w-10 rounded-full ring-2 ring-ink-950"
                  />
                  <div>
                    <p className="font-semibold text-ink-100">{c.name}</p>
                    <p className="text-xs text-ink-500">{c.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-ink-200 leading-relaxed text-sm">
                  &ldquo;{c.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Onboarding */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">Onboarding</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
              Three steps. Fourteen days. <span className="gradient-text">Live.</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {onboarding.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-7"
              >
                <span className="font-display text-5xl font-bold gradient-text">{s.n}</span>
                <h3 className="mt-3 font-display font-semibold text-xl">{s.title}</h3>
                <p className="mt-2 text-ink-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold gradient-text">{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}
