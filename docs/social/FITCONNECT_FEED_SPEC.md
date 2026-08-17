# FitConnect — Feed spec

## Kinds (engine)

PERSONAL, FOLLOWING, COACH, GROUP, PROGRAM, CHALLENGE, SPORT, LOCAL, OFFICIAL

## Ranking

`ChronoEngagementRanker`: recency + reactions + comments + follow boost.  
Explainable. Not a black-box popularity casino.

## Post kinds (engine)

TEXT, WORKOUT, ACHIEVEMENT, PROGRESS, PHOTO, VIDEO, ROUTE, PROGRAM_UPDATE, CHALLENGE_UPDATE, COACH_EDUCATION, EVENT

UI today only authors TEXT. Workout share exists on Activity complete.

## Not in v1

Reels, Stories 24h, GIF comments, repost graph. Engines/media pipeline are metadata-only.

## Quality

Rate limiter exists. Report/moderation engine exists. UI does not expose report yet.

## Privacy

`shareTelemetryFacts` default false. Redact for non-authors.
