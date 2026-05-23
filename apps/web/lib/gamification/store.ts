"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  coachDailyMissionsForDate,
  coachWeeklySuperMission,
  dailyMissionsForDate,
  weeklySuperMission,
  type MissionDef
} from "./missions";
import { levelFromXp, progressToNextLevel } from "./levels";

const DAILY_BONUS_XP = 30;
const STREAK_7_BONUS = 200;
const STREAK_30_BONUS = 1000;

type GamificationState = {
  xp: number;
  completedToday: string[];
  lastActiveDate: string | null;
  streakDays: number;
  badges: string[];
  completeMission: (missionId: string, xpReward: number) => { leveledUp: boolean; newLevel?: number };
  checkDailyBonus: () => number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function makeGamificationStore(getDaily: () => MissionDef[], storageName: string) {
  return create<GamificationState>()(
    persist(
      (set, get) => ({
        xp: 120,
        completedToday: [] as string[],
        lastActiveDate: null,
        streakDays: 0,
        badges: [] as string[],
        completeMission: (missionId: string, xpReward: number) => {
          const state = get();
          const today = todayKey();
          const isNewDay = state.lastActiveDate !== today;
          const completedToday = isNewDay ? [] : [...state.completedToday];

          if (completedToday.includes(missionId)) {
            return { leveledUp: false };
          }

          completedToday.push(missionId);
          const prevLevel = levelFromXp(state.xp).level;
          let bonusXp = xpReward;
          let streakDays = state.streakDays;
          const badges = [...state.badges];

          if (isNewDay) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yKey = yesterday.toISOString().slice(0, 10);
            streakDays = state.lastActiveDate === yKey ? streakDays + 1 : 1;
            if (streakDays === 7 && !badges.includes("streak-7")) {
              badges.push("streak-7");
              bonusXp += STREAK_7_BONUS;
            }
            if (streakDays === 30 && !badges.includes("streak-30")) {
              badges.push("streak-30");
              bonusXp += STREAK_30_BONUS;
            }
          }

          const daily = getDaily();
          if (daily.every((m) => completedToday.includes(m.id))) {
            bonusXp += DAILY_BONUS_XP;
          }

          const xp = state.xp + bonusXp;
          const newLevel = levelFromXp(xp).level;

          set({
            xp,
            completedToday,
            lastActiveDate: today,
            streakDays,
            badges
          });

          return {
            leveledUp: newLevel > prevLevel,
            newLevel: newLevel > prevLevel ? newLevel : undefined
          };
        },
        checkDailyBonus: () => {
          const state = get();
          const daily = getDaily();
          const done = daily.every((m) => state.completedToday.includes(m.id));
          return done ? DAILY_BONUS_XP : 0;
        }
      }),
      {
        name: storageName,
        storage: createJSONStorage(() => localStorage)
      }
    )
  );
}

export const useGamificationStore = makeGamificationStore(
  dailyMissionsForDate,
  "fitconnect-gamification-athlete"
);

export const useCoachGamificationStore = makeGamificationStore(
  coachDailyMissionsForDate,
  "fitconnect-gamification-coach"
);

function useGamificationSummaryFromStore(
  useStore: typeof useGamificationStore,
  getDaily: () => MissionDef[],
  getSuper: () => MissionDef
) {
  const xp = useStore((s) => s.xp);
  const completedToday = useStore((s) => s.completedToday);
  const streakDays = useStore((s) => s.streakDays);
  const completeMission = useStore((s) => s.completeMission);
  const level = levelFromXp(xp);
  const nextProgress = progressToNextLevel(xp);
  const daily = getDaily();
  const superMission = getSuper();
  return {
    xp,
    level,
    nextProgress,
    daily,
    superMission,
    completedToday,
    streakDays,
    completeMission
  };
}

export function useGamificationSummary(variant: "athlete" | "coach" = "athlete") {
  const athleteSummary = useGamificationSummaryFromStore(
    useGamificationStore,
    dailyMissionsForDate,
    weeklySuperMission
  );
  const coachSummary = useGamificationSummaryFromStore(
    useCoachGamificationStore,
    coachDailyMissionsForDate,
    coachWeeklySuperMission
  );
  return variant === "coach" ? coachSummary : athleteSummary;
}
