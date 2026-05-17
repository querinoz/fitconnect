import { TRAINERS } from "@/lib/data";
import type { DashboardState } from "./types";

const tomas = TRAINERS.find((t) => t.id === "t-002")!;
const marina = TRAINERS.find((t) => t.id === "t-001")!;

export const DEMO_ATHLETE_ID = "a-ines";
export const DEMO_COACH_TOMAS_ID = "t-002";
export const DEMO_COACH_MARINA_ID = "t-001";

export const initialDashboardState: DashboardState = {
  athletes: [
    {
      id: DEMO_ATHLETE_ID,
      name: "Inês M.",
      avatar: "https://i.pravatar.cc/200?img=32",
      sports: ["Strength", "Running"],
      coachId: DEMO_COACH_TOMAS_ID,
      readiness: 82,
      hrv: 68,
      sleepHours: "7h 42m",
      sleepEfficiency: 89,
      vo2max: 52.4,
      recoveryStatus: "green",
      goalTitle: "Sub-1:35 half marathon",
      goalProgress: 68,
      streakWeeks: 5
    },
    {
      id: "a-joao",
      name: "João R.",
      avatar: "https://i.pravatar.cc/200?img=12",
      sports: ["Running"],
      coachId: DEMO_COACH_MARINA_ID,
      readiness: 61,
      hrv: 49,
      sleepHours: "6h 10m",
      sleepEfficiency: 76,
      vo2max: 48.2,
      recoveryStatus: "amber",
      goalTitle: "First trail 30K",
      goalProgress: 42,
      streakWeeks: 2
    },
    {
      id: "a-sara",
      name: "Sara K.",
      avatar: "https://i.pravatar.cc/200?img=47",
      sports: ["Yoga", "Climbing"],
      coachId: DEMO_COACH_MARINA_ID,
      readiness: 78,
      hrv: 71,
      sleepHours: "8h 05m",
      sleepEfficiency: 91,
      vo2max: 44.1,
      recoveryStatus: "green",
      goalTitle: "Lead 6b+ project",
      goalProgress: 55,
      streakWeeks: 8
    },
    {
      id: "a-miguel",
      name: "Miguel T.",
      avatar: "https://i.pravatar.cc/200?img=23",
      sports: ["Strength"],
      coachId: DEMO_COACH_MARINA_ID,
      readiness: 70,
      hrv: 55,
      sleepHours: "7h 20m",
      sleepEfficiency: 84,
      vo2max: 50.8,
      recoveryStatus: "amber",
      goalTitle: "2× bodyweight squat",
      goalProgress: 61,
      streakWeeks: 3
    }
  ],
  plans: [
    {
      id: "plan-ines-w20",
      athleteId: DEMO_ATHLETE_ID,
      coachId: DEMO_COACH_TOMAS_ID,
      weekLabel: "Week 20 · Strength block",
      aiSuggestion:
        "HRV +4 ms vs 30-day avg · sleep efficiency 89%. Green light for planned 5×5 back-squat at 82.5 kg.",
      approvedLabel: `Approved by ${tomas.name.split(" ")[0]}`,
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: "b1",
          day: "Mon",
          title: "Lower body strength",
          detail: "5×5 back squat @ 82.5 kg · 3×8 single-leg RDL",
          intensity: "RPE 7",
          completed: true
        },
        {
          id: "b2",
          day: "Wed",
          title: "Threshold intervals",
          detail: "4×8 min @ zone 4 · 2 min float recovery",
          intensity: "Zone 4",
          completed: false
        },
        {
          id: "b3",
          day: "Fri",
          title: "Mobility + core",
          detail: "30 min flow · anti-rotation plank series",
          intensity: "RPE 4",
          completed: false
        },
        {
          id: "b4",
          day: "Sat",
          title: "Long run",
          detail: "14 km easy · last 3 km marathon pace",
          intensity: "Z2 → MP",
          completed: false
        }
      ]
    },
    {
      id: "plan-joao-w20",
      athleteId: "a-joao",
      coachId: DEMO_COACH_MARINA_ID,
      weekLabel: "Week 20 · Aerobic base",
      aiSuggestion: "HRV suppressed — shift Thursday intervals to strides only.",
      approvedLabel: `Approved by ${marina.name.split(" ")[0]}`,
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: "j1",
          day: "Tue",
          title: "Easy aerobic",
          detail: "45 min Z2 · nasal breathing focus",
          intensity: "Z2",
          completed: false
        },
        {
          id: "j2",
          day: "Thu",
          title: "Strides",
          detail: "6×20 s @ 5K pace · full recovery",
          intensity: "RPE 6",
          completed: false
        }
      ]
    }
  ],
  sessions: [
    {
      id: "s1",
      athleteId: DEMO_ATHLETE_ID,
      coachId: DEMO_COACH_TOMAS_ID,
      when: "Tomorrow · 07:30",
      type: "Lower body strength",
      mode: "Online",
      intensity: "RPE 7"
    },
    {
      id: "s2",
      athleteId: DEMO_ATHLETE_ID,
      coachId: "t-006",
      when: "Wed · 18:00",
      type: "Threshold intervals",
      mode: "Online",
      intensity: "Zone 4"
    },
    {
      id: "s3",
      athleteId: DEMO_ATHLETE_ID,
      coachId: "t-001",
      when: "Sat · 09:00",
      type: "Yoga · Recovery flow",
      mode: "In-person",
      intensity: "Z2"
    },
    {
      id: "s4",
      athleteId: "a-joao",
      coachId: DEMO_COACH_MARINA_ID,
      when: "Tomorrow · 07:30",
      type: "Easy aerobic check-in",
      mode: "Online",
      intensity: "Z2"
    },
    {
      id: "s5",
      athleteId: "a-sara",
      coachId: DEMO_COACH_MARINA_ID,
      when: "Wed · 18:00",
      type: "Climbing skills",
      mode: "In-person",
      intensity: "Technical"
    }
  ],
  messages: [
    {
      id: "m1",
      athleteId: DEMO_ATHLETE_ID,
      coachId: DEMO_COACH_TOMAS_ID,
      from: "coach",
      preview:
        "Great squat session yesterday — depth looked clean. For Thursday let's keep the 5×5 and add RDLs.",
      when: "12m",
      unread: true
    },
    {
      id: "m2",
      athleteId: DEMO_ATHLETE_ID,
      coachId: DEMO_COACH_TOMAS_ID,
      from: "athlete",
      preview: "Sleep was solid — HRV 68 this morning. Ready for tomorrow.",
      when: "2h",
      unread: false
    },
    {
      id: "m3",
      athleteId: "a-joao",
      coachId: DEMO_COACH_MARINA_ID,
      from: "athlete",
      preview: "HRV still low after travel — can we shift Thursday?",
      when: "18m",
      unread: true
    }
  ],
  habits: [
    {
      id: "h1",
      athleteId: DEMO_ATHLETE_ID,
      name: "Mobility · 10 min",
      done: true,
      streak: 24
    },
    {
      id: "h2",
      athleteId: DEMO_ATHLETE_ID,
      name: "Hydration · 2.5L",
      done: true,
      streak: 41
    },
    {
      id: "h3",
      athleteId: DEMO_ATHLETE_ID,
      name: "Sleep before 23:00",
      done: true,
      streak: 11
    },
    {
      id: "h4",
      athleteId: DEMO_ATHLETE_ID,
      name: "Mindfulness · 5 min",
      done: false,
      streak: 0
    }
  ],
  coachMetrics: [
    {
      coachId: DEMO_COACH_TOMAS_ID,
      activeAthletes: 12,
      revenueMtd: "€2,140",
      sessionsWeek: 28,
      retention: 96
    },
    {
      coachId: DEMO_COACH_MARINA_ID,
      activeAthletes: 41,
      revenueMtd: "€4,280",
      sessionsWeek: 62,
      retention: 94
    }
  ],
  weeklyVolume: [
    { d: "Mon", load: 1240, rpe: 6.4 },
    { d: "Tue", load: 0, rpe: 0 },
    { d: "Wed", load: 980, rpe: 5.2 },
    { d: "Thu", load: 1620, rpe: 7.8 },
    { d: "Fri", load: 0, rpe: 0 },
    { d: "Sat", load: 1980, rpe: 8.4 },
    { d: "Sun", load: 1180, rpe: 5.8 }
  ],
  monthlyTrend: [
    { m: "Dec", kpi: 64, hrv: 54 },
    { m: "Jan", kpi: 68, hrv: 56 },
    { m: "Feb", kpi: 71, hrv: 59 },
    { m: "Mar", kpi: 74, hrv: 61 },
    { m: "Apr", kpi: 78, hrv: 64 },
    { m: "May", kpi: 82, hrv: 68 }
  ],
  sleepWeek: [
    { d: "Mon", sleep: 7.2, deep: 1.8, hrv: 58 },
    { d: "Tue", sleep: 8.1, deep: 2.4, hrv: 64 },
    { d: "Wed", sleep: 6.4, deep: 1.2, hrv: 49 },
    { d: "Thu", sleep: 7.8, deep: 2.1, hrv: 61 },
    { d: "Fri", sleep: 7.4, deep: 1.9, hrv: 59 },
    { d: "Sat", sleep: 8.3, deep: 2.6, hrv: 71 },
    { d: "Sun", sleep: 7.6, deep: 2.0, hrv: 68 }
  ],
  revenueWeekly: [
    { d: "Mon", rev: 420 },
    { d: "Tue", rev: 580 },
    { d: "Wed", rev: 510 },
    { d: "Thu", rev: 720 },
    { d: "Fri", rev: 680 },
    { d: "Sat", rev: 840 },
    { d: "Sun", rev: 530 }
  ],
  retentionTrend: [
    { m: "Dec", rate: 88 },
    { m: "Jan", rate: 90 },
    { m: "Feb", rate: 91 },
    { m: "Mar", rate: 92 },
    { m: "Apr", rate: 93 },
    { m: "May", rate: 94 }
  ]
};

export function getTrainerById(id: string) {
  return TRAINERS.find((t) => t.id === id);
}
