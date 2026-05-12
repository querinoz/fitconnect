"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { QUIZ_OPTIONS, SPORTS, TRAINERS, type Sport } from "@/lib/data";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Answers = {
  sport?: Sport;
  goal?: string;
  experience?: string;
  schedule?: string;
  modality?: string;
};

const steps = [
  { key: "sport", title: "What's your sport?" },
  { key: "goal", title: "What's the goal?" },
  { key: "experience", title: "Where are you right now?" },
  { key: "schedule", title: "How often can you train?" },
  { key: "modality", title: "Where do you want to train?" }
] as const;

const sportIcons: Record<Sport, string> = {
  Yoga: "🧘",
  Strength: "🏋️",
  Surf: "🏄",
  Climbing: "🧗",
  "Martial Arts": "🥋",
  Running: "🏃",
  Swimming: "🏊",
  Cycling: "🚴",
  CrossFit: "💪",
  Boxing: "🥊"
};

export function CoachQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const total = steps.length;

  const match = useMemo(() => {
    if (!answers.sport) return TRAINERS[0];
    return (
      TRAINERS.find((t) => t.sports.includes(answers.sport!)) ?? TRAINERS[0]
    );
  }, [answers.sport]);

  function next() {
    setStep((s) => Math.min(s + 1, total));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function pick<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTimeout(() => next(), 200);
  }

  const done = step >= total;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div>
          <p className="eyebrow">Coach finder</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight">
            60 seconds.<br />
            <span className="gradient-text">5 questions.</span><br />
            One specialist who actually fits you.
          </h2>
          <p className="mt-5 text-ink-400 text-lg max-w-md">
            We&apos;ll match you with up to three vetted coaches based on your sport, goal,
            experience and life. No spam, no upsell, no &quot;create an account first&quot;.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Filters across 12,418 verified specialists",
              "Free 15-min intro call with your top match",
              "Switch any time — your athlete profile travels"
            ].map((p) => (
              <li key={p} className="flex items-center gap-2 text-ink-300">
                <div className="grid h-5 w-5 place-items-center rounded-full bg-accent-500/10 text-accent-400 ring-1 ring-accent-500/30">
                  <Check className="h-3 w-3" />
                </div>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-ink-800 bg-ink-900/50 p-6 md:p-8 shadow-elevated">
          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  i < step
                    ? "bg-gradient-to-r from-brand-400 to-accent-500"
                    : i === step
                      ? "bg-brand-400/40"
                      : "bg-ink-800"
                )}
              />
            ))}
          </div>

          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key={steps[step].key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs uppercase tracking-widest text-ink-500">
                    Step {step + 1} of {total}
                  </p>
                  <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold">
                    {steps[step].title}
                  </h3>

                  <div
                    className={cn(
                      "mt-6 grid gap-2",
                      steps[step].key === "sport"
                        ? "grid-cols-2 sm:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {steps[step].key === "sport" &&
                      SPORTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => pick("sport", s)}
                          className={cn(
                            "rounded-xl border px-3 py-3 text-left transition-all hover:-translate-y-0.5",
                            answers.sport === s
                              ? "border-brand-400/70 bg-brand-500/10 text-ink-50"
                              : "border-ink-800 bg-ink-950/40 text-ink-200 hover:border-brand-400/40"
                          )}
                        >
                          <span className="text-xl mr-2">{sportIcons[s]}</span>
                          <span className="text-sm font-medium">{s}</span>
                        </button>
                      ))}
                    {steps[step].key === "goal" &&
                      QUIZ_OPTIONS.goals.map((g) => (
                        <QuizCard
                          key={g.id}
                          selected={answers.goal === g.id}
                          onClick={() => pick("goal", g.id)}
                          title={`${g.icon}  ${g.label}`}
                        />
                      ))}
                    {steps[step].key === "experience" &&
                      QUIZ_OPTIONS.experience.map((g) => (
                        <QuizCard
                          key={g.id}
                          selected={answers.experience === g.id}
                          onClick={() => pick("experience", g.id)}
                          title={g.label}
                          description={g.description}
                        />
                      ))}
                    {steps[step].key === "schedule" &&
                      QUIZ_OPTIONS.schedule.map((g) => (
                        <QuizCard
                          key={g.id}
                          selected={answers.schedule === g.id}
                          onClick={() => pick("schedule", g.id)}
                          title={g.label}
                        />
                      ))}
                    {steps[step].key === "modality" &&
                      QUIZ_OPTIONS.modality.map((g) => (
                        <QuizCard
                          key={g.id}
                          selected={answers.modality === g.id}
                          onClick={() => pick("modality", g.id)}
                          title={g.label}
                          description={g.description}
                        />
                      ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-400" />
                    <p className="text-xs uppercase tracking-widest text-accent-400 font-semibold">
                      We found your match
                    </p>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
                    <img
                      src={match.avatar}
                      alt={match.name}
                      className="h-16 w-16 rounded-2xl ring-2 ring-brand-400/40"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-lg">{match.name}</p>
                      <p className="text-sm text-ink-400">{match.headline}</p>
                      <p className="text-xs text-ink-500 mt-1">
                        {match.city}, {match.country} · €{match.hourlyRate}/h
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-ink-400">
                    Plus 2 more matches in your inbox. Book the free 15-min intro and decide
                    after.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={`/trainer/${match.id}`}>View profile</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        href={`/discover?sport=${encodeURIComponent(
                          answers.sport ?? ""
                        )}`}
                      >
                        See all matches
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStep(0);
                        setAnswers({});
                      }}
                    >
                      Start over
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!done && step > 0 && (
            <button
              onClick={back}
              className="mt-6 flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> back
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function QuizCard({
  selected,
  onClick,
  title,
  description
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-all hover:-translate-y-0.5",
        selected
          ? "border-brand-400/70 bg-brand-500/10"
          : "border-ink-800 bg-ink-950/40 hover:border-brand-400/40"
      )}
    >
      <div>
        <p className="text-ink-100 font-medium">{title}</p>
        {description && (
          <p className="text-xs text-ink-500 mt-0.5">{description}</p>
        )}
      </div>
      <ArrowRight
        className={cn(
          "h-4 w-4 transition-all",
          selected ? "text-brand-300" : "text-ink-600 group-hover:text-ink-300"
        )}
      />
    </button>
  );
}
