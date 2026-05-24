import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import path from "node:path";

export type TestPrisma = PrismaClient;

const TRUNCATE_TABLES = [
  "StravaSegmentEffort",
  "StravaActivityLap",
  "StravaActivity",
  "StravaConnection",
  "SessionFeedback",
  "PushToken",
  "PlanBlock",
  "TrainingPlan",
  "ReadinessSnapshot",
  "BiometricSample",
  "WearableConnection",
  "Message",
  "Session",
  "Program",
  "CoachProfile",
  "AthleteProfile",
  "User",
  "Route",
  "Club",
  "ProcessedStripeEvent",
  "UserSubscription"
] as const;

export function createTestPrisma(databaseUrl: string): TestPrisma {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = databaseUrl;
  const client = new PrismaClient();
  if (previous) process.env.DATABASE_URL = previous;
  return client;
}

export async function cleanDb(prisma: TestPrisma): Promise<void> {
  const tableList = TRUNCATE_TABLES.map((t) => `"${t}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
}

export async function seedMinimal(prisma: TestPrisma): Promise<void> {
  await prisma.user.create({
    data: {
      id: "user-athlete-ines",
      email: "ines@test.fitconnect.app",
      role: "ATHLETE",
      athleteProfile: {
        create: {
          externalId: "a-ines",
          name: "Inês M.",
          avatar: "https://i.pravatar.cc/200?img=32",
          sports: ["Strength", "Running"],
          coachExternalId: "t-002",
          readiness: 82,
          hrv: 68,
          sleepHours: "7.4",
          sleepEfficiency: 89,
          recoveryStatus: "GREEN"
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: "user-coach-tomas",
      email: "tomas@test.fitconnect.app",
      role: "COACH",
      coachProfile: {
        create: {
          externalId: "t-002",
          name: "Tomás R.",
          avatar: "https://i.pravatar.cc/200?img=11",
          headline: "Endurance coach",
          city: "Lisbon",
          country: "PT",
          sports: ["Running"],
          rating: 4.96,
          reviews: 48,
          hourlyRate: 85,
          athletesCoached: 12,
          retentionRate: 94
        }
      }
    }
  });
}

export function runMigrateDeploy(databaseUrl: string): void {
  const repoRoot = path.resolve(__dirname, "../../../..");
  execSync("pnpm exec prisma migrate deploy", {
    cwd: repoRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      DIRECT_URL: databaseUrl
    },
    stdio: "pipe"
  });
}
