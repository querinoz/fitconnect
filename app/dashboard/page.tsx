"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ai-assistant";
import { useT } from "@/lib/i18n-provider";
import { TRAINERS } from "@/lib/data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Award,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  Goal,
  HeartPulse,
  MessageSquare,
  Moon,
  PlayCircle,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Wind,
  Zap
} from "lucide-react";

const weeklyVolume = [
  { d: "Mon", load: 1240, rpe: 6.4 },
  { d: "Tue", load: 0, rpe: 0 },
  { d: "Wed", load: 980, rpe: 5.2 },
  { d: "Thu", load: 1620, rpe: 7.8 },
  { d: "Fri", load: 0, rpe: 0 },
  { d: "Sat", load: 1980, rpe: 8.4 },
  { d: "Sun", load: 1180, rpe: 5.8 }
];

const monthly = [
  { m: "Dec", kpi: 64, hrv: 54 },
  { m: "Jan", kpi: 68, hrv: 56 },
  { m: "Feb", kpi: 71, hrv: 59 },
  { m: "Mar", kpi: 74, hrv: 61 },
  { m: "Apr", kpi: 78, hrv: 64 },
  { m: "May", kpi: 82, hrv: 68 }
];

const sleepData = [
  { d: "Mon", sleep: 7.2, deep: 1.8, hrv: 58 },
  { d: "Tue", sleep: 8.1, deep: 2.4, hrv: 64 },
  { d: "Wed", sleep: 6.4, deep: 1.2, hrv: 49 },
  { d: "Thu", sleep: 7.8, deep: 2.1, hrv: 61 },
  { d: "Fri", sleep: 7.4, deep: 1.9, hrv: 59 },
  { d: "Sat", sleep: 8.3, deep: 2.6, hrv: 71 },
  { d: "Sun", sleep: 7.6, deep: 2.0, hrv: 68 }
];

const upcoming = [
  {
    coach: TRAINERS[1],
    when: "Tomorrow · 07:30",
    type: "Lower body strength",
    mode: "Online",
    intensity: "RPE 7"
  },
  {
    coach: TRAINERS[5],
    when: "Wed · 18:00",
    type: "Threshold intervals",
    mode: "Online",
    intensity: "Zone 4"
  },
  {
    coach: TRAINERS[0],
    when: "Sat · 09:00",
    type: "Yoga · Recovery flow",
    mode: "In-person",
    intensity: "Z2"
  }
];

const habits = [
  { name: "Mobility · 10 min", done: true, streak: 24 },
  { name: "Hydration · 2.5L", done: true, streak: 41 },
  { name: "Sleep before 23:00", done: true, streak: 11 },
  { name: "Mindfulness · 5 min", done: false, streak: 0 }
];

const messages = [
  {
    coach: TRAINERS[1],
    preview: "Great squat session yesterday — depth looked clean. For Thursday let's…",
    when: "12m",
    unread: true
  },
  {
    coach: TRAINERS[5],
    preview: "Saw the threshold work. Power is creeping up. Send me your sleep when…",
    when: "2h",
    unread: false
  },
  {
    coach: TRAINERS[0],
    preview: "Bring the bolster on Saturday — I want to deepen the hip openers a bit.",
    when: "1d",
    unread: false
  }
];

export default function DashboardPage() {
  const t = useT();
  return (
    <>
      <Nav />
      <main id="main" className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Activity aria-hidden="true" className="h-3.5 w-3.5" />{" "}
              {t("dashboard", "eyebrow")}
            </p>
            <h1 className="fc-vt-hero mt-2 font-display text-3xl md:text-4xl font-bold">
              {t("dashboard", "welcome")}
            </h1>
            <p className="text-ink-400">{t("dashboard", "streak")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4" /> Schedule
            </Button>
            <Button>
              <PlayCircle className="h-4 w-4" /> Start today&apos;s session
            </Button>
          </div>
        </header>

        {/* AI suggestion banner */}
        <section className="rounded-3xl border border-plasma-500/30 bg-gradient-to-r from-plasma-500/10 via-transparent to-brand-500/10 p-5 flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-plasma-500/15 text-plasma-400 ring-1 ring-plasma-500/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-ink-100">AI workout suggestion</p>
              <span className="rounded-full bg-plasma-500/15 text-plasma-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Approved by Tomás
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-300 leading-relaxed">
              Your HRV is +4 ms above your 30-day average and sleep efficiency is 89%. Hit the
              planned <span className="text-ink-100 font-medium">5×5 back-squat at 82.5kg</span>
              {" "}— and add the 3 sets of single-leg RDLs we paused last week. You&apos;re ready.
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0">
            Apply to plan <ChevronRight className="h-4 w-4" />
          </Button>
        </section>

        {/* Top KPI row */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReadinessCard />
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-signal-500/10 text-signal-400 ring-1 ring-signal-500/30">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="text-xs text-accent-400 flex items-center gap-0.5 font-semibold">
                  <ArrowUpRight className="h-3 w-3" /> +4
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold font-display tabular-nums">68 ms</p>
              <p className="text-xs text-ink-400">HRV (7-day avg)</p>
              <div className="mt-3 h-6">
                <ResponsiveContainer>
                  <LineChart data={sleepData}>
                    <Line
                      type="monotone"
                      dataKey="hrv"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
                  <Moon className="h-5 w-5" />
                </div>
                <span className="text-xs text-accent-400 flex items-center gap-0.5 font-semibold">
                  <ArrowUpRight className="h-3 w-3" /> 89%
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold font-display tabular-nums">7h 42m</p>
              <p className="text-xs text-ink-400">Sleep last night · efficiency</p>
              <div className="mt-3 h-6">
                <ResponsiveContainer>
                  <BarChart data={sleepData}>
                    <Bar dataKey="sleep" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-500/10 text-accent-400 ring-1 ring-accent-500/30">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs text-accent-400 flex items-center gap-0.5 font-semibold">
                  <ArrowUpRight className="h-3 w-3" /> +1.2
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold font-display tabular-nums">52.4</p>
              <p className="text-xs text-ink-400">VO₂max · 6 mo</p>
              <div className="mt-3 h-6">
                <ResponsiveContainer>
                  <AreaChart data={monthly}>
                    <Area
                      type="monotone"
                      dataKey="kpi"
                      stroke="#84cc16"
                      fill="#84cc16"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Second KPI row */}
        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              icon: Flame,
              label: "Sessions this month",
              value: "18",
              trend: "+3 vs last"
            },
            { icon: Timer, label: "Hours trained", value: "23.4h", trend: "+5h" },
            { icon: Award, label: "PR streak", value: "5 weeks", trend: "Personal best" },
            { icon: Goal, label: "Goal completion", value: "68%", trend: "On track" }
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-950 ring-1 ring-ink-800 text-brand-300">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-accent-400 flex items-center gap-0.5 font-semibold">
                    <ArrowUpRight className="h-3 w-3" /> {s.trend}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold font-display tabular-nums">
                  {s.value}
                </p>
                <p className="text-xs text-ink-400">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Volume + intensity */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span>Weekly training volume & intensity</span>
                <div className="flex gap-1.5">
                  <Badge>Auto-synced</Badge>
                  <Badge className="bg-accent-500/10 text-accent-400 ring-accent-500/30">
                    Polarised 81/19
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={weeklyVolume}>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="d" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "12px"
                      }}
                    />
                    <Bar dataKey="load" radius={[8, 8, 0, 0]} fill="#22d3ee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>VO₂max & HRV trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={monthly}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="m" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "12px"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="kpi"
                      stroke="#84cc16"
                      fill="url(#g1)"
                      strokeWidth={2}
                      name="VO₂max"
                    />
                    <Area
                      type="monotone"
                      dataKey="hrv"
                      stroke="#f43f5e"
                      fill="url(#g2)"
                      strokeWidth={2}
                      name="HRV"
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sleep correlation */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-brand-300" /> Sleep × HRV correlation (7 days)
                </span>
                <Badge className="bg-plasma-500/10 text-plasma-300 ring-plasma-500/30">
                  r = 0.74
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={sleepData}>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="d" stroke="#64748b" />
                    <YAxis yAxisId="l" stroke="#22d3ee" />
                    <YAxis yAxisId="r" orientation="right" stroke="#f43f5e" />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "12px"
                      }}
                    />
                    <Line
                      yAxisId="l"
                      type="monotone"
                      dataKey="sleep"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      name="Sleep (h)"
                    />
                    <Line
                      yAxisId="r"
                      type="monotone"
                      dataKey="hrv"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      name="HRV (ms)"
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-ink-500">
                On nights when you sleep &gt; 7.5h, your morning HRV averages 12 ms higher. Your
                coach uses this to suggest intensity for the next day.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-plasma-400" /> Coach AI insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Insight
                tone="success"
                title="Recovery looks solid"
                body="HRV trend is up, sleep efficiency is averaging 86%."
              />
              <Insight
                tone="info"
                title="Mid-week dip"
                body="Wednesday HRV consistently drops 8-10 ms. Suggest a light Z1 spin."
              />
              <Insight
                tone="warning"
                title="Late-night training"
                body="Last 3 Thursday sessions ended past 21:00 — sleep efficiency drops 11%."
              />
            </CardContent>
          </Card>
        </section>

        {/* Upcoming + Goal + Messages */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.map((u) => (
                <div
                  key={u.coach.id + u.when}
                  className="group flex items-center gap-4 rounded-2xl border border-ink-800 bg-ink-950/40 p-4 hover:border-brand-400/40 transition-colors"
                >
                  <img
                    src={u.coach.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full ring-2 ring-ink-950"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-100">
                      {u.type}
                      <span className="ml-2 inline-flex items-center rounded-full bg-brand-500/10 text-brand-300 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-brand-500/30">
                        {u.intensity}
                      </span>
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      with {u.coach.name} · {u.when} · {u.mode}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm">Join</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-400" /> Current goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-ink-200">Run sub-1:35 half marathon by October.</p>
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500"
                    style={{ width: "68%" }}
                  />
                </div>
                <p className="text-xs text-ink-400">
                  68% there · 6 weeks of build left · Pace tracking on plan
                </p>
              </div>
              <div className="pt-4 border-t border-ink-800 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-300">
                    <Award className="h-4 w-4 text-amber-400" /> Latest PR
                  </span>
                  <span className="font-semibold">5k · 21:12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-300">
                    <Wind className="h-4 w-4 text-brand-300" /> Threshold pace
                  </span>
                  <span className="font-semibold">4:18/km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-300">
                    <Zap className="h-4 w-4 text-accent-400" /> Goal pace
                  </span>
                  <span className="font-semibold">4:30/km</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Habits + messages */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s habits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {habits.map((h) => (
                <div
                  key={h.name}
                  className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-950/40 p-3"
                >
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full ${
                      h.done
                        ? "bg-accent-500/15 text-accent-400 ring-1 ring-accent-500/30"
                        : "bg-ink-800 text-ink-500"
                    }`}
                  >
                    {h.done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">○</span>
                    )}
                  </div>
                  <p className="flex-1 text-sm text-ink-100">{h.name}</p>
                  <span className="text-xs text-ink-500 tabular-nums">
                    {h.streak > 0 ? `🔥 ${h.streak}d` : "—"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Coach messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {messages.map((m) => (
                <div
                  key={m.coach.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-950/40 p-4 hover:border-ink-700 transition-colors cursor-pointer"
                >
                  <img
                    src={m.coach.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-100 text-sm">
                        {m.coach.name}
                      </p>
                      {m.unread && (
                        <span className="h-2 w-2 rounded-full bg-brand-400" />
                      )}
                    </div>
                    <p className="text-xs text-ink-400 truncate">{m.preview}</p>
                  </div>
                  <span className="text-[10px] text-ink-500">{m.when}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
      <AIAssistant />
    </>
  );
}

function ReadinessCard() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
      <CardContent className="pt-6 relative">
        <div className="flex items-center justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-500/10 text-accent-400 ring-1 ring-accent-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-accent-400 font-semibold">
            Train hard
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-[88px] w-[88px]">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="transparent"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="7"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="transparent"
                stroke="url(#readiness)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={188}
                strokeDashoffset={188 * 0.18}
              />
              <defs>
                <linearGradient id="readiness" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <p className="font-display text-2xl font-bold tabular-nums">82</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-display font-bold gradient-text">82</p>
            <p className="text-xs text-ink-400">Readiness</p>
            <p className="text-[11px] text-accent-400 mt-1">+6 vs yesterday</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Insight({
  tone,
  title,
  body
}: {
  tone: "success" | "info" | "warning";
  title: string;
  body: string;
}) {
  const tones: Record<string, { color: string; icon: any }> = {
    success: { color: "text-accent-400", icon: CheckCircle2 },
    info: { color: "text-brand-300", icon: Sparkles },
    warning: { color: "text-amber-400", icon: AlertCircle }
  };
  const Icon = tones[tone].icon;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-950/40 p-3">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tones[tone].color}`} />
      <div>
        <p className="text-sm font-semibold text-ink-100">{title}</p>
        <p className="text-xs text-ink-400 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
