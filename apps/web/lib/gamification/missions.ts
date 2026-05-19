export type MissionType = "daily" | "super";
export type MissionSport = "general" | "strength" | "cardio" | "flexibility";

export type MissionDef = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  sport: MissionSport;
  xpReward: number;
};

export const MISSION_BANK: MissionDef[] = [
  { id: "m001", title: "Morning activation", description: "Complete training before 8h", type: "daily", sport: "general", xpReward: 10 },
  { id: "m002", title: "Coach check-in", description: "Send feedback to your coach", type: "daily", sport: "general", xpReward: 10 },
  { id: "m003", title: "Technique video", description: "Watch a 10-min technique clip", type: "daily", sport: "general", xpReward: 10 },
  { id: "m004", title: "Invite a friend", description: "Share FitConnect with one athlete", type: "daily", sport: "general", xpReward: 15 },
  { id: "m005", title: "Squat PR attempt", description: "Beat your squat record in session", type: "daily", sport: "strength", xpReward: 20 },
  { id: "m006", title: "Z2 spin", description: "45 min zone-2 cardio", type: "daily", sport: "cardio", xpReward: 15 },
  { id: "m007", title: "Mobility flow", description: "15 min flexibility routine", type: "daily", sport: "flexibility", xpReward: 10 },
  { id: "m008", title: "Log readiness", description: "Sync wearable and check readiness", type: "daily", sport: "general", xpReward: 10 },
  { id: "m009", title: "Strava sync", description: "Connect or sync latest activity", type: "daily", sport: "cardio", xpReward: 15 },
  { id: "m010", title: "Hydration goal", description: "Drink 2L water today", type: "daily", sport: "general", xpReward: 8 },
  { id: "m011", title: "Sleep 7h+", description: "Hit 7 hours sleep efficiency", type: "daily", sport: "general", xpReward: 12 },
  { id: "m012", title: "Core finisher", description: "10 min core after main session", type: "daily", sport: "strength", xpReward: 10 },
  { id: "m013", title: "5K easy run", description: "Complete 5 km easy pace", type: "daily", sport: "cardio", xpReward: 18 },
  { id: "m014", title: "Yoga reset", description: "20 min yoga session", type: "daily", sport: "flexibility", xpReward: 12 },
  { id: "m015", title: "Protein target", description: "Hit daily protein goal", type: "daily", sport: "general", xpReward: 8 },
  { id: "m016", title: "Warm-up ritual", description: "Full warm-up before training", type: "daily", sport: "general", xpReward: 8 },
  { id: "m017", title: "Cooldown stretch", description: "10 min post-session stretch", type: "daily", sport: "flexibility", xpReward: 8 },
  { id: "m018", title: "HRV check", description: "Review HRV trend in dashboard", type: "daily", sport: "general", xpReward: 10 },
  { id: "m019", title: "Book intro", description: "Schedule a 15-min coach intro", type: "daily", sport: "general", xpReward: 25 },
  { id: "m020", title: "Community post", description: "Share a check-in in community", type: "daily", sport: "general", xpReward: 15 },
  { id: "m021", title: "Tempo intervals", description: "4×8 min tempo blocks", type: "daily", sport: "cardio", xpReward: 22 },
  { id: "m022", title: "Deadlift focus", description: "Technique sets on deadlift", type: "daily", sport: "strength", xpReward: 18 },
  { id: "m023", title: "Breath work", description: "5 min box breathing", type: "daily", sport: "flexibility", xpReward: 8 },
  { id: "m024", title: "Steps 8k", description: "Walk 8,000 steps", type: "daily", sport: "cardio", xpReward: 12 },
  { id: "m025", title: "Meal prep", description: "Prep meals for tomorrow", type: "daily", sport: "general", xpReward: 10 },
  { id: "m026", title: "Super: Long run", description: "90 min endurance session", type: "super", sport: "cardio", xpReward: 100 },
  { id: "m027", title: "Super: Max test", description: "Test 1RM or benchmark WOD", type: "super", sport: "strength", xpReward: 100 },
  { id: "m028", title: "Super: Recovery day", description: "Full rest + mobility only", type: "super", sport: "flexibility", xpReward: 100 },
  { id: "m029", title: "Super: Double session", description: "AM + PM training blocks", type: "super", sport: "general", xpReward: 100 },
  { id: "m030", title: "Super: Coach live", description: "Attend a live coach session", type: "super", sport: "general", xpReward: 100 }
];

function dateSeed(date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

/** Pick N daily missions deterministically per day without duplicates. */
function pickDailyMissions(
  daily: MissionDef[],
  date: Date,
  count: number,
  offset: number
): MissionDef[] {
  if (daily.length === 0) return [];
  const seed = dateSeed(date);
  const start = (seed + offset) % daily.length;
  const picked: MissionDef[] = [];
  for (let i = 0; i < daily.length && picked.length < count; i++) {
    const candidate = daily[(start + i) % daily.length]!;
    if (!picked.some((m) => m.id === candidate.id)) {
      picked.push(candidate);
    }
  }
  return picked;
}

/** Pick 3 daily missions deterministically per day (round-robin by date). */
export function dailyMissionsForDate(date = new Date()): MissionDef[] {
  const daily = MISSION_BANK.filter((m) => m.type === "daily");
  return pickDailyMissions(daily, date, 3, 0);
}

export function weeklySuperMission(date = new Date()): MissionDef {
  const supers = MISSION_BANK.filter((m) => m.type === "super");
  const week = Math.floor(dateSeed(date) / 7);
  return supers[week % supers.length]!;
}

export const COACH_MISSION_BANK: MissionDef[] = [
  { id: "c001", title: "Morning roster scan", description: "Review all athlete readiness scores", type: "daily", sport: "general", xpReward: 15 },
  { id: "c002", title: "Reply within 2h", description: "Respond to pending athlete messages", type: "daily", sport: "general", xpReward: 12 },
  { id: "c003", title: "Session notes", description: "Log notes for today's completed sessions", type: "daily", sport: "general", xpReward: 18 },
  { id: "c004", title: "Plan adjustment", description: "Update one athlete's weekly plan", type: "daily", sport: "general", xpReward: 20 },
  { id: "c005", title: "Intro call", description: "Complete a 15-min intro with a prospect", type: "daily", sport: "general", xpReward: 25 },
  { id: "c006", title: "Video feedback", description: "Send technique feedback on athlete video", type: "daily", sport: "strength", xpReward: 15 },
  { id: "c007", title: "Recovery check", description: "Flag athletes below 60 readiness", type: "daily", sport: "general", xpReward: 12 },
  { id: "c008", title: "Community engagement", description: "Comment on an athlete community post", type: "daily", sport: "general", xpReward: 10 },
  { id: "c009", title: "Strava review", description: "Review synced athlete activities", type: "daily", sport: "cardio", xpReward: 14 },
  { id: "c010", title: "Program publish", description: "Publish or update a program template", type: "daily", sport: "general", xpReward: 22 },
  { id: "c026", title: "Super: Live session", description: "Host a live coached session", type: "super", sport: "general", xpReward: 100 },
  { id: "c027", title: "Super: Roster review", description: "Full weekly review for all athletes", type: "super", sport: "general", xpReward: 100 },
  { id: "c028", title: "Super: Content drop", description: "Publish educational content for athletes", type: "super", sport: "general", xpReward: 100 }
];

export function coachDailyMissionsForDate(date = new Date()): MissionDef[] {
  const daily = COACH_MISSION_BANK.filter((m) => m.type === "daily");
  return pickDailyMissions(daily, date, 3, 3);
}

export function coachWeeklySuperMission(date = new Date()): MissionDef {
  const supers = COACH_MISSION_BANK.filter((m) => m.type === "super");
  const week = Math.floor(dateSeed(date) / 7);
  return supers[(week + 1) % supers.length]!;
}
