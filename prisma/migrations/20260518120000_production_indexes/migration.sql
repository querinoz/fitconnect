-- Production indexes + Stripe idempotency tables
CREATE INDEX IF NOT EXISTS "Session_athleteExternalId_idx" ON "Session"("athleteExternalId");
CREATE INDEX IF NOT EXISTS "Session_scheduledAt_idx" ON "Session"("scheduledAt");
CREATE INDEX IF NOT EXISTS "ReadinessSnapshot_athleteExternalId_idx" ON "ReadinessSnapshot"("athleteExternalId");

CREATE TABLE IF NOT EXISTS "ProcessedStripeEvent" (
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("stripeEventId")
);

CREATE TABLE IF NOT EXISTS "UserSubscription" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "UserSubscription_userId_key" ON "UserSubscription"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserSubscription_stripeSubscriptionId_key" ON "UserSubscription"("stripeSubscriptionId");
