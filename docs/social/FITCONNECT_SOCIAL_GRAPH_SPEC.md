# FitConnect — Social graph spec

## Kinds (already in `RelationshipKind`)

FOLLOW · CONNECTION · COACH_ATHLETE · TEAM_MEMBER

## Safety (already in graph)

BLOCK severs follow/connection both ways. MUTE hides in feed.

## Do not add yet

Close friends, restrict, QR invites — product later; graph must stay one table of relationships.

## Persistence

Today: `InMemorySocialGraph`.  
Target: Prisma `Relationship` with RLS. Until writers exist, do not add unused SQL.

## Identity

`UserProfile` in community directory is a **reference**, not the athlete medical record. Prime/HRV stay in telemetry with consent.
