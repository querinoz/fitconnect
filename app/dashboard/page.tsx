"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRAINERS } from "@/lib/data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowUpRight,
  Award,
  Calendar,
  Flame,
  HeartPulse,
  MessageSquare,
  PlayCircle,
  Target,
  Timer,
  TrendingUp
} from "lucide-react";

const weeklyVolume = [
  { d: "Mon", load: 1240 },
  { d: "Tue", load: 0 },
  { d: "Wed", load: 980 },
  { d: "Thu", load: 1620 },
  { d: "Fri", load: 0 },
  { d: "Sat", load: 1980 },
  { d: "Sun", load: 1180 }
];

const monthly = [
  { m: "Dec", kpi: 64 },
  { m: "Jan", kpi: 68 },
  { m: "Feb", kpi: 71 },
  { m: "Mar", kpi: 74 },
  { m: "Apr", kpi: 78 },
  { m: "May", kpi: 82 }
];

const upcoming = [
  {
    coach: TRAINERS[1],
    when: "Tomorrow · 07:30",
    type: "Lower body strength",
    mode: "Online"
  },
  {
    coach: TRAINERS[5],
    when: "Wed · 18:00",
    type: "Threshold intervals",
    mode: "Online"
  },
  {
    coach: TRAINERS[0],
    when: "Sat · 09:00",
    type: "Yoga · Recovery flow",
    mode: "In-person"
  }
];

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Welcome back, Inês.
            </h1>
            <p className="text-ink-400">You&apos;re on a 5-week streak — keep it rolling.</p>
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

        <section className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Flame, label: "Sessions this month", value: "18", trend: "+3 vs last" },
            { icon: Timer, label: "Hours trained", value: "23.4h", trend: "+5h" },
            { icon: HeartPulse, label: "Avg HRV", value: "62 ms", trend: "+4" },
            { icon: TrendingUp, label: "PR streak", value: "5 wks", trend: "Personal best" }
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-accent-500 flex items-center gap-0.5 font-semibold">
                    <ArrowUpRight className="h-3 w-3" /> {s.trend}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold font-display">{s.value}</p>
                <p className="text-xs text-ink-400">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Weekly training volume</span>
                <Badge>Auto-synced</Badge>
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
                        border: "1px solid #1e293b"
                      }}
                    />
                    <Bar dataKey="load" radius={[6, 6, 0, 0]} fill="#22d3ee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VO₂max trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={monthly}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="m" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e293b"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="kpi"
                      stroke="#84cc16"
                      fill="url(#g)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.map((u) => (
                <div
                  key={u.coach.id + u.when}
                  className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-950/40 p-4"
                >
                  <img
                    src={u.coach.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {u.type}{" "}
                      <span className="text-ink-500 font-normal text-sm">
                        · with {u.coach.name}
                      </span>
                    </p>
                    <p className="text-xs text-ink-400">
                      {u.when} · {u.mode}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" /> Chat
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
            <CardContent className="space-y-3">
              <p className="text-ink-300">Run sub-1:35 half marathon by October.</p>
              <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500"
                  style={{ width: "68%" }}
                />
              </div>
              <p className="text-xs text-ink-400">68% there — 6 weeks of build left.</p>
              <div className="pt-4 border-t border-ink-800 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-300">
                  <Award className="h-4 w-4 text-amber-400" /> Latest PR
                </span>
                <span className="font-semibold">5k · 21:12</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
