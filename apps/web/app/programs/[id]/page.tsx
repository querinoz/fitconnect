"use client";

import Link from "next/link";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import {
  getProgramById,
  getProgramCoach,
  getProgramWeekPreview,
  getSampleWorkout,
  programReviewMetrics
} from "@/lib/programs/detail";
import { formatPrice } from "@/lib/utils";
import { startStripeCheckout } from "@/lib/stripe/client";
import {
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import { ArrowLeft, Award, Check, ShieldCheck, Star } from "lucide-react";

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const program = getProgramById(params.id);
  const coach = program ? getProgramCoach(program) : undefined;
  const [enrolled, setEnrolled] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "processing" | "done">("idle");

  if (!program || !coach) {
    return (
      <>
        <DemoBanner />
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-ink-400">Program not found.</p>
          <Button asChild className="mt-4">
            <Link href="/programs">Browse programs</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const weeks = getProgramWeekPreview(program);
  const sample = getSampleWorkout(program);
  const programId = program.id;
  const programPrice = program.price;
  const coachId = coach.id;

  async function enroll() {
    setCheckoutStep("processing");
    try {
      await startStripeCheckout({
        kind: "program",
        amountCents: programPrice * 100,
        programId,
        coachId
      });
      setCheckoutStep("done");
      setEnrolled(true);
    } catch {
      setCheckoutStep("idle");
    }
  }

  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main" className="pb-16">
        <section className="relative overflow-hidden pt-12 pb-10">
          <div className="absolute inset-0 -z-10 premium-grid opacity-30" />
          <div className="mx-auto max-w-7xl px-6">
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
              <Link href="/programs" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                All programs
              </Link>
            </Button>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={program.cover}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                {program.badge && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-950">
                    <Award className="h-3 w-3" aria-hidden />
                    {program.badge}
                  </span>
                )}
              </div>
              <div>
                <SectionHeader
                  as="h1"
                  eyebrow={`${program.sport} · ${program.level}`}
                  title={program.title}
                  body={program.tagline}
                  action={<RealtimeBadge>{program.weeks} weeks</RealtimeBadge>}
                />
                <p className="mt-4 text-ink-300">{program.description}</p>
                <div className="mt-6 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="h-12 w-12 rounded-full ring-2 ring-ink-800 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-ink-100">{coach.name}</p>
                    <p className="text-xs text-ink-500">{coach.headline}</p>
                  </div>
                </div>
                <p className="mt-6 font-display text-3xl font-bold text-ink-50">
                  {formatPrice(program.price)}{" "}
                  <span className="text-base font-normal text-ink-400">one-time</span>
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="mt-4 w-full sm:w-auto"
                  disabled={enrolled || checkoutStep === "processing"}
                  onClick={enroll}
                >
                  {checkoutStep === "processing"
                    ? "Processing Stripe checkout…"
                    : enrolled
                      ? "Enrolled ✓"
                      : "Enroll · Stripe test mode"}
                </Button>
                {enrolled && (
                  <p className="mt-2 text-sm text-accent-400">
                    Payment authorized (demo). Program unlocked in your dashboard.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 grid gap-8 lg:grid-cols-3">
          <PremiumCard className="lg:col-span-2 p-6 space-y-4">
            <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400">
              Week-by-week preview
            </h2>
            <ul className="space-y-4">
              {weeks.map((w) => (
                <li key={w.week} className="rounded-2xl border border-ink-800 bg-ink-950/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-300">
                    Week {w.week}
                  </p>
                  <p className="mt-1 font-semibold text-ink-100">{w.focus}</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-400">
                    {w.sessions.map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard tone="plasma" className="p-6 space-y-4 h-fit">
            <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400">
              Sample workout
            </h2>
            <p className="font-display text-xl font-bold text-ink-50">{sample.title}</p>
            <p className="text-xs text-ink-500">{sample.duration}</p>
            <ol className="space-y-3">
              {sample.blocks.map((b) => (
                <li key={b.name}>
                  <p className="text-sm font-semibold text-ink-100">{b.name}</p>
                  <p className="text-xs text-ink-400">{b.detail}</p>
                </li>
              ))}
            </ol>
          </PremiumCard>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-6">
          <PremiumCard className="p-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400 mb-4">
              What you&apos;ll need
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-ink-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-400" aria-hidden />
                Barbell or gym access
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-400" aria-hidden />
                Heart-rate monitor (optional)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-400" aria-hidden />
                45–60 min per session
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-400" aria-hidden />
                FitConnect mobile app
              </li>
            </ul>
          </PremiumCard>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400 mb-4">
            Athlete results
          </h2>
          <PremiumCard className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              ))}
              <span className="text-sm text-ink-300">4.9 · {program.joined} athletes</span>
            </div>
            <p className="text-sm font-semibold text-volt-400">
              &ldquo;{programReviewMetrics(program)}&rdquo;
            </p>
          </PremiumCard>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-4 w-4 text-brand-400" aria-hidden />
            14-day money-back guarantee if the program isn&apos;t the right fit.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
