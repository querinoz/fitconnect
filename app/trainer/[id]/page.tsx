import Link from "next/link";
import { notFound } from "next/navigation";
import { PROGRAMS, REVIEWS, TRAINERS } from "@/lib/data";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cta } from "@/components/cta";
import {
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Languages,
  MapPin,
  MessageSquare,
  PlayCircle,
  Quote,
  Repeat,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Video,
  Zap
} from "lucide-react";
import { formatPrice, formatCompact } from "@/lib/utils";

const samplePlan = [
  {
    day: "Mon",
    title: "Heavy lower",
    blocks: ["Back-squat 4×4 @ 82%", "RDL 3×6 @ RPE 7", "Walking lunge 3×8/leg", "Core 8 min"],
    duration: "75 min",
    rpe: "8"
  },
  {
    day: "Tue",
    title: "Active recovery",
    blocks: ["Z2 spin 45 min", "Hip mobility 10 min", "Breathwork 5 min"],
    duration: "60 min",
    rpe: "3"
  },
  {
    day: "Wed",
    title: "Upper push & pull",
    blocks: ["Bench 5×5 @ 80%", "Pendlay row 4×6", "Dips 3×8", "Face pull 3×12"],
    duration: "65 min",
    rpe: "7.5"
  },
  {
    day: "Thu",
    title: "Recovery / rest",
    blocks: ["Walk 30 min", "Soft tissue 15 min"],
    duration: "45 min",
    rpe: "2"
  },
  {
    day: "Fri",
    title: "Deadlift focus",
    blocks: [
      "Conventional DL 3×3 @ 85%",
      "Pause front squat 3×5",
      "Strict press 4×6",
      "Trap-bar carries 4×30m"
    ],
    duration: "80 min",
    rpe: "8.5"
  },
  {
    day: "Sat",
    title: "Conditioning",
    blocks: ["EMOM 20: 5 cal row + 5 KB swings", "Stretch flow 12 min"],
    duration: "40 min",
    rpe: "6"
  },
  {
    day: "Sun",
    title: "Off",
    blocks: ["Sleep in. Walk. Eat."],
    duration: "—",
    rpe: "0"
  }
];

export default function TrainerPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = TRAINERS.find((x) => x.id === id);
  if (!t) return notFound();
  const reviews = REVIEWS.filter((r) => r.trainerId === t.id);
  const programs = PROGRAMS.filter((p) => p.trainerId === t.id);
  const morePrograms =
    programs.length === 0 ? PROGRAMS.filter((p) => p.sport === t.sports[0]).slice(0, 2) : [];

  return (
    <>
      <Nav />
      <main>
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src={t.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />
          <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
        </div>

        <div className="mx-auto max-w-6xl px-6 -mt-24 relative grid lg:grid-cols-[1fr_380px] gap-10">
          <section className="space-y-8">
            <div className="flex items-end gap-5 flex-wrap">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-28 w-28 rounded-3xl ring-4 ring-ink-950 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-4xl md:text-5xl font-bold">{t.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-300 ring-1 ring-accent-500/30">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                </div>
                <p className="mt-1 text-ink-300">{t.headline}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-400" /> {t.city}, {t.country}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" /> {t.rating} ({t.reviews})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {t.responseTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5" /> {t.languages.join(" · ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Coach stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile icon={Users} label="Athletes coached" value={formatCompact(t.athletesCoached)} />
              <StatTile icon={Repeat} label="Retention" value={`${t.retentionRate}%`} />
              <StatTile icon={Trophy} label="Years coaching" value={`${t.years}+`} />
              <StatTile icon={Zap} label="Avg session intensity" value="RPE 7.2" />
            </div>

            <div className="flex flex-wrap gap-2">
              {t.sports.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              {t.highlights.map((h) => (
                <Badge
                  key={h}
                  className="bg-accent-500/10 text-accent-400 ring-accent-500/30"
                >
                  {h}
                </Badge>
              ))}
            </div>

            {/* Video intro */}
            <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-2 overflow-hidden">
              <div className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer">
                <img
                  src={t.cover}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-105 blur-[1px] brightness-50"
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-400/90 text-ink-950 shadow-glow group-hover:scale-110 transition-transform animate-pulse-glow">
                    <PlayCircle className="h-10 w-10" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-xs uppercase tracking-widest text-brand-300">
                    Video intro · 1:42
                  </p>
                  <p className="text-ink-50 font-display font-semibold text-lg mt-1">
                    Meet {t.name.split(" ")[0]} — and how she trains athletes
                  </p>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold">About me</h2>
              <p className="mt-3 text-ink-300 leading-relaxed">{t.bio}</p>
              <div className="mt-5 rounded-xl border border-ink-800 bg-ink-950/40 p-5">
                <Quote className="h-5 w-5 text-brand-400 mb-2" />
                <p className="text-ink-200 italic leading-relaxed">{t.intro}</p>
              </div>
            </section>

            {/* Programs */}
            <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-8">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" /> Signature programs
                </h2>
                <Link
                  href="/programs"
                  className="text-xs text-brand-300 hover:text-brand-200 font-semibold"
                >
                  Browse all programs →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {(programs.length > 0 ? programs : morePrograms).map((p) => (
                  <Link
                    href="/programs"
                    key={p.id}
                    className="group rounded-xl overflow-hidden border border-ink-800 hover:border-brand-400/50 transition-all hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[16/9]">
                      <img
                        src={p.cover}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-[10px] uppercase tracking-widest text-brand-300 font-semibold">
                          {p.sport} · {p.level} · {p.weeks} wks
                        </p>
                        <p className="font-display font-bold text-lg leading-tight">
                          {p.title}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between text-xs">
                      <span className="text-ink-400">
                        {formatCompact(p.joined)} joined
                      </span>
                      <span className="font-semibold text-ink-100">
                        {formatPrice(p.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Sample plan */}
            <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-300" /> Sample week
              </h2>
              <p className="mt-2 text-sm text-ink-400">
                A real week from one of {t.name.split(" ")[0]}&apos;s in-season athletes. Every
                program is personalised — this is illustrative.
              </p>
              <div className="mt-6 overflow-x-auto hide-scrollbar">
                <div className="flex gap-3 min-w-max">
                  {samplePlan.map((d) => (
                    <div
                      key={d.day}
                      className="w-[180px] shrink-0 rounded-xl border border-ink-800 bg-ink-950/50 p-4"
                    >
                      <div className="flex items-baseline justify-between">
                        <p className="font-display font-bold">{d.day}</p>
                        <span className="text-[10px] uppercase tracking-widest text-brand-300">
                          RPE {d.rpe}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold text-ink-100 text-sm">{d.title}</p>
                      <ul className="mt-3 space-y-1.5 text-[11px] text-ink-300">
                        {d.blocks.map((b) => (
                          <li key={b} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-accent-400 mt-0.5 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 pt-3 border-t border-ink-800 text-[10px] text-ink-500">
                        {d.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Verified credentials */}
            <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-500" /> Verified credentials
              </h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {t.certifications.map((c, i) => (
                  <li
                    key={c}
                    className="rounded-xl border border-ink-800 bg-ink-950/60 p-4 flex items-center justify-between gap-3 hover:border-accent-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/10 text-accent-400 ring-1 ring-accent-500/30 shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-100 truncate">{c}</p>
                        <p className="text-[11px] text-ink-500">
                          Validated · {new Date().getFullYear() - (i % 3)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-accent-500/10 text-accent-400 ring-accent-500/30 shrink-0">
                      <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-ink-500 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-400" /> All credentials
                cross-checked against the issuing body by FitConnect Trust & Safety.
              </p>
            </section>

            {/* Reviews */}
            <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 md:p-8">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h2 className="font-display text-2xl font-semibold">Athlete reviews</h2>
                <p className="text-xs text-ink-500">
                  {t.reviews} verified reviews · avg {t.rating}/5
                </p>
              </div>
              <div className="mt-6 space-y-4">
                {reviews.length === 0 && (
                  <p className="text-ink-400">
                    No reviews yet — be the first one to train with {t.name.split(" ")[0]}.
                  </p>
                )}
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-ink-800 bg-ink-950/40 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-ink-100">{r.author}</p>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-ink-300 text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-2xl border border-brand-400/30 bg-gradient-to-b from-brand-500/10 to-transparent p-6 shadow-elevated">
              <p className="text-sm text-ink-400">Starting from</p>
              <p className="text-4xl font-bold font-display gradient-text">
                {formatPrice(t.hourlyRate)}
              </p>
              <p className="text-xs text-ink-400">per 60-min session</p>

              <div className="mt-6 space-y-2">
                <Button className="w-full" size="lg">
                  <Calendar className="h-4 w-4" /> Book a session
                </Button>
                <Button className="w-full" size="lg" variant="outline">
                  <Video className="h-4 w-4" /> Free 15-min intro call
                </Button>
                <Button className="w-full" size="lg" variant="ghost">
                  <MessageSquare className="h-4 w-4" /> Message {t.name.split(" ")[0]}
                </Button>
              </div>
              <p className="mt-6 text-xs text-ink-500 text-center leading-relaxed">
                Free cancellation up to 24h before · Verified specialist · Secure Stripe
                payments
              </p>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 text-sm space-y-3">
              <p className="font-semibold text-ink-100">This coach is great if you…</p>
              <ul className="space-y-2 text-ink-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" /> Want
                  measurable, structured progress
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" /> Prefer
                  video-based form review
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" /> Train 2–5×
                  per week
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400 shrink-0 mt-0.5" /> Like
                  honest, kind, data-backed feedback
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 text-sm">
              <p className="font-semibold text-ink-100">Availability</p>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    className={`aspect-square grid place-items-center rounded-md text-[11px] font-medium ${
                      [1, 2, 3, 4, 6].includes(i)
                        ? "bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/30"
                        : "bg-ink-800 text-ink-500"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-500">
                Most available this week. Next opening: Tomorrow 07:30.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-20">
          <Cta />
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatTile({
  icon: Icon,
  label,
  value
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-4">
      <div className="flex items-center gap-2 text-ink-400">
        <Icon className="h-3.5 w-3.5 text-brand-300" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export async function generateStaticParams() {
  return TRAINERS.map((t) => ({ id: t.id }));
}
