-- FitConnect Strava integration schema (extended models)
-- Generated for production deployment

CREATE TABLE IF NOT EXISTS "StravaConnection" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "StravaConnection_athleteExternalId_key" ON "StravaConnection"("athleteExternalId");
CREATE UNIQUE INDEX IF NOT EXISTS "StravaConnection_stravaAthleteId_key" ON "StravaConnection"("stravaAthleteId");

CREATE TABLE IF NOT EXISTS "StravaActivity" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "StravaActivity_stravaId_key" ON "StravaActivity"("stravaId");
CREATE INDEX IF NOT EXISTS "StravaActivity_athleteExternalId_startDate_idx" ON "StravaActivity"("athleteExternalId", "startDate");
CREATE INDEX IF NOT EXISTS "StravaActivity_sportType_idx" ON "StravaActivity"("sportType");
CREATE INDEX IF NOT EXISTS "StravaActivity_deletedAt_idx" ON "StravaActivity"("deletedAt");

CREATE TABLE IF NOT EXISTS "StravaActivityLap" (
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

CREATE INDEX IF NOT EXISTS "StravaActivityLap_activityId_idx" ON "StravaActivityLap"("activityId");

CREATE TABLE IF NOT EXISTS "StravaSegmentEffort" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "StravaSegmentEffort_stravaEffortId_key" ON "StravaSegmentEffort"("stravaEffortId");
CREATE INDEX IF NOT EXISTS "StravaSegmentEffort_activityId_idx" ON "StravaSegmentEffort"("activityId");
