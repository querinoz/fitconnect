-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ATHLETE', 'COACH', 'ADMIN', 'FEDERATION', 'GYM_OWNER');

-- CreateEnum
CREATE TYPE "RecoveryStatus" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('ONLINE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WearableProvider" AS ENUM ('APPLE_HEALTH', 'HEALTH_CONNECT', 'GARMIN', 'WHOOP', 'OURA', 'POLAR', 'STRAVA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ATHLETE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "sports" TEXT[],
    "coachExternalId" TEXT NOT NULL,
    "readiness" INTEGER NOT NULL DEFAULT 0,
    "hrv" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" TEXT NOT NULL DEFAULT '',
    "sleepEfficiency" INTEGER NOT NULL DEFAULT 0,
    "vo2max" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recoveryStatus" "RecoveryStatus" NOT NULL DEFAULT 'GREEN',
    "goalTitle" TEXT NOT NULL DEFAULT '',
    "goalProgress" INTEGER NOT NULL DEFAULT 0,
    "streakWeeks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AthleteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "sports" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" INTEGER NOT NULL DEFAULT 0,
    "athletesCoached" INTEGER NOT NULL DEFAULT 0,
    "retentionRate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "weeks" INTEGER NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "coachExternalId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "mode" "SessionMode" NOT NULL,
    "intensity" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "coachExternalId" TEXT NOT NULL,
    "fromRole" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "unread" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearableConnection" (
    "id" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "provider" "WearableProvider" NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "WearableConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricSample" (
    "id" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "provider" "WearableProvider" NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessSnapshot" (
    "id" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "hrvMs" INTEGER NOT NULL,
    "sleepHours" TEXT NOT NULL,
    "sleepEfficiency" INTEGER NOT NULL,
    "recoveryStatus" "RecoveryStatus" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadinessSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "coachExternalId" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "aiSuggestion" TEXT NOT NULL,
    "approvedLabel" TEXT NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanBlock" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "intensity" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "geoJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StravaConnection" (
    "id" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "stravaAthleteId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'read,activity:read,activity:read_all,profile:read_all',
    "lastSyncAt" TIMESTAMP(3),
    "deauthorizedAt" TIMESTAMP(3),
    "webhookSubId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StravaConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StravaActivity" (
    "id" TEXT NOT NULL,
    "stravaId" INTEGER NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sportType" TEXT NOT NULL,
    "legacyType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startDateLocal" TIMESTAMP(3),
    "timezone" TEXT,
    "distanceM" DOUBLE PRECISION NOT NULL,
    "movingTimeSec" INTEGER NOT NULL,
    "elapsedTimeSec" INTEGER NOT NULL,
    "avgHr" DOUBLE PRECISION,
    "maxHr" DOUBLE PRECISION,
    "elevationM" DOUBLE PRECISION,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "hasHeartrate" BOOLEAN NOT NULL DEFAULT false,
    "deviceName" TEXT,
    "mapPolyline" TEXT,
    "mapSummaryPolyline" TEXT,
    "sufferScore" DOUBLE PRECISION,
    "averageWatts" DOUBLE PRECISION,
    "maxWatts" DOUBLE PRECISION,
    "loadScore" DOUBLE PRECISION,
    "trimp" DOUBLE PRECISION,
    "streamsJson" JSONB,
    "rawData" JSONB,
    "deletedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StravaActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StravaActivityLap" (
    "id" TEXT NOT NULL,
    "stravaLapId" INTEGER,
    "activityId" TEXT NOT NULL,
    "lapIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "distanceM" DOUBLE PRECISION NOT NULL,
    "movingTimeSec" INTEGER NOT NULL,
    "elapsedTimeSec" INTEGER NOT NULL,
    "avgHr" DOUBLE PRECISION,
    "maxHr" DOUBLE PRECISION,
    "elevationM" DOUBLE PRECISION,

    CONSTRAINT "StravaActivityLap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StravaSegmentEffort" (
    "id" TEXT NOT NULL,
    "stravaEffortId" INTEGER NOT NULL,
    "activityId" TEXT NOT NULL,
    "segmentId" INTEGER,
    "name" TEXT NOT NULL,
    "elapsedTimeSec" INTEGER NOT NULL,
    "movingTimeSec" INTEGER NOT NULL,
    "distanceM" DOUBLE PRECISION NOT NULL,
    "prRank" INTEGER,
    "komRank" INTEGER,

    CONSTRAINT "StravaSegmentEffort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL,
    "sessionExternalId" TEXT NOT NULL,
    "athleteExternalId" TEXT NOT NULL,
    "rpe" INTEGER NOT NULL,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedStripeEvent" (
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("stripeEventId")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "planId" TEXT NOT NULL DEFAULT 'pro',
    "status" TEXT NOT NULL DEFAULT 'active',
    "gracePeriodEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteProfile_userId_key" ON "AthleteProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteProfile_externalId_key" ON "AthleteProfile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_externalId_key" ON "CoachProfile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Program_externalId_key" ON "Program"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_externalId_key" ON "Session"("externalId");

-- CreateIndex
CREATE INDEX "Session_athleteExternalId_idx" ON "Session"("athleteExternalId");

-- CreateIndex
CREATE INDEX "Session_scheduledAt_idx" ON "Session"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_externalId_key" ON "Message"("externalId");

-- CreateIndex
CREATE INDEX "BiometricSample_athleteExternalId_recordedAt_idx" ON "BiometricSample"("athleteExternalId", "recordedAt");

-- CreateIndex
CREATE INDEX "ReadinessSnapshot_athleteExternalId_idx" ON "ReadinessSnapshot"("athleteExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlan_externalId_key" ON "TrainingPlan"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "StravaConnection_athleteExternalId_key" ON "StravaConnection"("athleteExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "StravaConnection_stravaAthleteId_key" ON "StravaConnection"("stravaAthleteId");

-- CreateIndex
CREATE UNIQUE INDEX "StravaActivity_stravaId_key" ON "StravaActivity"("stravaId");

-- CreateIndex
CREATE INDEX "StravaActivity_athleteExternalId_startDate_idx" ON "StravaActivity"("athleteExternalId", "startDate");

-- CreateIndex
CREATE INDEX "StravaActivity_sportType_idx" ON "StravaActivity"("sportType");

-- CreateIndex
CREATE INDEX "StravaActivity_deletedAt_idx" ON "StravaActivity"("deletedAt");

-- CreateIndex
CREATE INDEX "StravaActivityLap_activityId_idx" ON "StravaActivityLap"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "StravaSegmentEffort_stravaEffortId_key" ON "StravaSegmentEffort"("stravaEffortId");

-- CreateIndex
CREATE INDEX "StravaSegmentEffort_activityId_idx" ON "StravaSegmentEffort"("activityId");

-- CreateIndex
CREATE INDEX "SessionFeedback_athleteExternalId_sessionExternalId_idx" ON "SessionFeedback"("athleteExternalId", "sessionExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_stripeSubscriptionId_key" ON "UserSubscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "AthleteProfile" ADD CONSTRAINT "AthleteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_athleteExternalId_fkey" FOREIGN KEY ("athleteExternalId") REFERENCES "AthleteProfile"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_athleteExternalId_fkey" FOREIGN KEY ("athleteExternalId") REFERENCES "AthleteProfile"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearableConnection" ADD CONSTRAINT "WearableConnection_athleteExternalId_fkey" FOREIGN KEY ("athleteExternalId") REFERENCES "AthleteProfile"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessSnapshot" ADD CONSTRAINT "ReadinessSnapshot_athleteExternalId_fkey" FOREIGN KEY ("athleteExternalId") REFERENCES "AthleteProfile"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StravaActivity" ADD CONSTRAINT "StravaActivity_athleteExternalId_fkey" FOREIGN KEY ("athleteExternalId") REFERENCES "StravaConnection"("athleteExternalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StravaActivityLap" ADD CONSTRAINT "StravaActivityLap_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "StravaActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StravaSegmentEffort" ADD CONSTRAINT "StravaSegmentEffort_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "StravaActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
