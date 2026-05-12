import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { DemoBanner } from "@/components/demo-banner";
import { METHODOLOGY } from "@/lib/data";
import { ArrowDown, BookOpen, FlaskConical, ShieldCheck, Microscope, Quote } from "lucide-react";

export const metadata = {
  title: "Methodology · The Specialist Standard™ — FitConnect",
  description:
    "How we vet, verify and program coaches. The evidence-based framework behind FitConnect's 12,418 specialists."
};

const evidence = [
  {
    title: "Polarised intensity distribution",
    citation: "Seiler & Tønnessen, 2009",
    body: "80% easy / 20% hard is the dominant pattern among elite endurance athletes. We default every endurance plan to this distribution unless your coach overrides it."
  },
  {
    title: "Daily HRV-guided training",
    citation: "Vesterinen et al., 2016",
    body: "Training adjusted by HRV produces equal or greater VO₂max gains than fixed plans, with fewer overtraining episodes. We surface readiness; your coach adjusts the plan."
  },
  {
    title: "Specificity of skill",
    citation: "Schmidt & Lee, 2019",
    body: "Skill transfer between sports is small. Generalist coaches can't substitute for someone who lives the discipline. Our marketplace is built on this fact."
  },
  {
    title: "Autoregulation via RPE",
    citation: "Helms et al., 2016",
    body: "RPE-based load selection produces equal hypertrophy to percentage-based work with better adherence and lower injury rate. Every program has an RPE check-in."
  }
];

export default function MethodologyPage() {
  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main">
        <section className="relative overflow-hidden pt-16 pb-20">
          <div className="absolute inset-0 -z-10 gradient-bg opacity-70" />
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> The Specialist Standard™
            </p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl font-bold leading-[0.95] text-balance">
              The methodology behind every{" "}
              <span className="gradient-text">FitConnect</span> coach.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-300 max-w-2xl mx-auto leading-relaxed">
              We didn&apos;t build a directory and add a logo. We built six principles that any
              coach has to clear before athletes ever see their profile — and the evidence
              behind each one.
            </p>
            <a
              href="#pillars"
              className="mt-10 inline-flex items-center gap-2 text-sm text-ink-300 hover:text-ink-100"
            >
              Read the six pillars <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </section>

        <section id="pillars" className="mx-auto max-w-7xl px-6 py-20">
          <div className="space-y-20">
            {METHODOLOGY.map((m, i) => (
              <article
                key={m.id}
                className="grid lg:grid-cols-12 gap-10 items-start"
              >
                <div className="lg:col-span-4">
                  <div className="sticky top-24">
                    <p className="font-display text-7xl md:text-8xl font-bold gradient-text leading-none">
                      {m.number}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-widest text-ink-500">
                      Pillar {i + 1} of {METHODOLOGY.length}
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-5">
                  <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                    {m.title}
                  </h2>
                  <p className="text-ink-300 text-lg leading-relaxed">{m.subtitle}</p>
                  <p className="text-ink-400 leading-relaxed">{m.body}</p>
                  <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-ink-500">
                        {m.metric.label}
                      </p>
                      <p className="mt-1 font-display text-3xl font-bold gradient-text">
                        {m.metric.value}
                      </p>
                    </div>
                    <p className="text-xs text-ink-500 max-w-[180px] text-right">
                      Source: {m.citation}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="absolute inset-0 -z-10 gradient-bg-warm opacity-30" />
          <div className="max-w-3xl">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Microscope className="h-3.5 w-3.5" /> The evidence
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
              The science we lean on
            </h2>
            <p className="mt-4 text-ink-400 text-lg">
              We&apos;re a marketplace, not a lab. So we&apos;re honest about whose work
              FitConnect stands on. The principles below shape every coach interview and every
              program approval.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {evidence.map((e) => (
              <article
                key={e.title}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-plasma-500/10 text-plasma-400 ring-1 ring-plasma-500/30">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg leading-snug">
                      {e.title}
                    </h3>
                    <p className="text-xs text-ink-500">{e.citation}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink-300 leading-relaxed">{e.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-10">
            <div className="flex items-start gap-4">
              <Quote className="h-8 w-8 text-brand-400 shrink-0" />
              <div>
                <p className="font-display text-2xl md:text-3xl font-bold leading-snug">
                  &ldquo;A generic coach will get you fit. A specialist will get you{" "}
                  <span className="gradient-text">where you actually want to go</span>.&rdquo;
                </p>
                <p className="mt-5 text-sm text-ink-400">
                  — Diego Almeida, sub-2:25 marathoner & FitConnect coach
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-10 grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Coaches interviewed in 2026", value: "32,184" },
              { label: "Coaches accepted", value: "12,418" },
              { label: "Acceptance rate", value: "38.6%" }
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-5xl font-bold gradient-text">{s.value}</p>
                <p className="mt-2 text-sm text-ink-400">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
            All figures audited by an external compliance team, Q1 2026
          </p>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
