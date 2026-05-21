import { PrismaClient, RecoveryStatus, SessionMode, SessionStatus } from "@prisma/client";
import { TRAINERS } from "../apps/web/lib/data";
import { initialDashboardState } from "../apps/web/lib/dashboard/seed";

const prisma = new PrismaClient();

function recovery(s: "green" | "amber" | "red"): RecoveryStatus {
  if (s === "amber") return RecoveryStatus.AMBER;
  if (s === "red") return RecoveryStatus.RED;
  return RecoveryStatus.GREEN;
}

function sessionWhen(when: string): Date {
  const now = new Date();
  if (when.toLowerCase().includes("tomorrow")) {
    now.setDate(now.getDate() + 1);
    now.setHours(7, 30, 0, 0);
    return now;
  }
  if (when.toLowerCase().includes("wed")) {
    now.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
    now.setHours(18, 0, 0, 0);
    return now;
  }
  if (when.toLowerCase().includes("sat")) {
    now.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
    now.setHours(9, 0, 0, 0);
    return now;
  }
  return now;
}

async function main() {
  for (const t of TRAINERS) {
    await prisma.coachProfile.upsert({
      where: { externalId: t.id },
      create: {
        externalId: t.id,
        name: t.name,
        avatar: t.avatar,
        headline: t.headline,
        city: t.city,
        country: t.country,
        sports: t.sports,
        rating: t.rating,
        reviews: t.reviews,
        hourlyRate: t.hourlyRate,
        athletesCoached: t.athletesCoached,
        retentionRate: t.retentionRate
      },
      update: {
        name: t.name,
        avatar: t.avatar,
        headline: t.headline,
        rating: t.rating,
        reviews: t.reviews
      }
    });
  }

  for (const a of initialDashboardState.athletes) {
    await prisma.athleteProfile.upsert({
      where: { externalId: a.id },
      create: {
        externalId: a.id,
        name: a.name,
        avatar: a.avatar,
        sports: a.sports,
        coachExternalId: a.coachId,
        readiness: a.readiness,
        hrv: a.hrv,
        sleepHours: a.sleepHours,
        sleepEfficiency: a.sleepEfficiency,
        vo2max: a.vo2max,
        recoveryStatus: recovery(a.recoveryStatus),
        goalTitle: a.goalTitle,
        goalProgress: a.goalProgress,
        streakWeeks: a.streakWeeks
      },
      update: {
        readiness: a.readiness,
        hrv: a.hrv,
        recoveryStatus: recovery(a.recoveryStatus)
      }
    });

    await prisma.readinessSnapshot.create({
      data: {
        athleteExternalId: a.id,
        score: a.readiness,
        hrvMs: a.hrv,
        sleepHours: a.sleepHours,
        sleepEfficiency: a.sleepEfficiency,
        recoveryStatus: recovery(a.recoveryStatus)
      }
    });
  }

  for (const s of initialDashboardState.sessions) {
    await prisma.session.upsert({
      where: { externalId: s.id },
      create: {
        externalId: s.id,
        athleteExternalId: s.athleteId,
        coachExternalId: s.coachId,
        scheduledAt: sessionWhen(s.when),
        type: s.type,
        mode: s.mode === "Online" ? SessionMode.ONLINE : SessionMode.IN_PERSON,
        intensity: s.intensity,
        status: SessionStatus.SCHEDULED
      },
      update: {
        type: s.type,
        intensity: s.intensity
      }
    });
  }

  for (const m of initialDashboardState.messages) {
    await prisma.message.upsert({
      where: { externalId: m.id },
      create: {
        externalId: m.id,
        athleteExternalId: m.athleteId,
        coachExternalId: m.coachId,
        fromRole: m.from,
        preview: m.preview,
        sentAt: new Date(),
        unread: m.unread
      },
      update: { preview: m.preview, unread: m.unread }
    });
  }

  console.log("Seed complete:", {
    coaches: TRAINERS.length,
    athletes: initialDashboardState.athletes.length,
    sessions: initialDashboardState.sessions.length,
    messages: initialDashboardState.messages.length
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
