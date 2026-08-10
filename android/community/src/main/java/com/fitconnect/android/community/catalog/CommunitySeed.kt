package com.fitconnect.android.community.catalog

import com.fitconnect.android.community.challenges.ChallengeEngine
import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.ChallengeDefinition
import com.fitconnect.android.community.domain.ChallengeMetric
import com.fitconnect.android.community.domain.ChallengeScope
import com.fitconnect.android.community.domain.ChallengeScoring
import com.fitconnect.android.community.domain.CommunityRole
import com.fitconnect.android.community.domain.GroupKind
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ProgramDefinition
import com.fitconnect.android.community.domain.ProgramExercise
import com.fitconnect.android.community.domain.ProgramLevel
import com.fitconnect.android.community.domain.ProgramSessionDef
import com.fitconnect.android.community.domain.ProgramStatus
import com.fitconnect.android.community.domain.ProgramWeek
import com.fitconnect.android.community.domain.UserProfile
import com.fitconnect.android.community.domain.Visibility
import com.fitconnect.android.community.feed.FeedEngine
import com.fitconnect.android.community.graph.ProfileDirectory
import com.fitconnect.android.community.graph.SocialGraph
import com.fitconnect.android.community.groups.GroupEngine
import com.fitconnect.android.community.groups.GroupFactory
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostEngine
import com.fitconnect.android.community.programs.ProgramEngine

/**
 * Deterministic demo seed. IDs align with the coach roster (coach-1, a1..a4)
 * and the athlete identity (ath-1) used across Athlete OS, Coach OS and
 * Telemetry, so the ecosystem is coherent end-to-end in demo mode.
 */
object CommunitySeed {

    suspend fun apply(
        profiles: ProfileDirectory,
        graph: SocialGraph,
        groups: GroupEngine,
        posts: PostEngine,
        programs: ProgramEngine,
        challenges: ChallengeEngine,
        nowEpochMs: Long = System.currentTimeMillis(),
    ) {
        val audit = Audit(nowEpochMs - DAY, nowEpochMs - DAY)

        listOf(
            UserProfile("ath-1", "You", CommunityRole.ATHLETE, sportKeys = listOf("running", "cycling")),
            UserProfile("a1", "Lena Fischer", CommunityRole.ATHLETE, sportKeys = listOf("running")),
            UserProfile("a2", "Marco Silva", CommunityRole.ATHLETE, sportKeys = listOf("cycling")),
            UserProfile("a3", "Aisha Khan", CommunityRole.ATHLETE, sportKeys = listOf("swimming")),
            UserProfile("a4", "Jonas Weber", CommunityRole.ATHLETE, sportKeys = listOf("strength_training")),
            UserProfile("coach-1", "Coach Rivera", CommunityRole.COACH, verifiedCoach = true, sportKeys = listOf("running", "cycling")),
            UserProfile(FeedEngine.OFFICIAL_ACCOUNT_ID, "FitConnect", CommunityRole.OFFICIAL),
        ).forEach { profiles.upsert(it) }

        graph.follow("ath-1", "a1")
        graph.follow("ath-1", "a2")
        graph.follow("ath-1", "coach-1")
        graph.follow("a1", "ath-1")
        graph.connect("ath-1", "a1")
        graph.linkCoachAthlete("coach-1", "ath-1")
        graph.linkCoachAthlete("coach-1", "a1")
        graph.linkCoachAthlete("coach-1", "a2")
        graph.linkCoachAthlete("coach-1", "a3")
        graph.linkCoachAthlete("coach-1", "a4")

        val runners = groups.create(
            GroupFactory.new(
                id = "grp-runners",
                name = "City Runners",
                description = "Local running community — weekly track sessions and long runs.",
                kind = GroupKind.SPORT,
                ownerId = "coach-1",
                sportKey = "running",
                rules = listOf("Be supportive", "No spam", "Share routes responsibly"),
                nowEpochMs = nowEpochMs,
            ),
        )
        groups.join(runners.id, "ath-1")
        groups.join(runners.id, "a1")
        groups.join(runners.id, "a2")
        groups.create(
            GroupFactory.new(
                id = "grp-strength",
                name = "Strength Lab",
                description = "Coach-led strength community with weekly programming tips.",
                kind = GroupKind.COACH_LED,
                ownerId = "coach-1",
                sportKey = "strength_training",
                nowEpochMs = nowEpochMs,
            ),
        )

        // Programs — ids match the legacy coach seeds (cp1/cp2) they replace.
        val vo2 = ProgramDefinition(
            id = "cp1",
            version = 3,
            coachId = "coach-1",
            title = "VO2 Build · 8 weeks",
            description = "Progressive VO2max block with threshold anchors and recovery weeks.",
            sportKey = "running",
            level = ProgramLevel.INTERMEDIATE,
            goals = listOf("Raise VO2max", "Hold threshold longer"),
            weeks = (1..8).map { weekIndex ->
                ProgramWeek(
                    index = weekIndex,
                    focus = if (weekIndex % 4 == 0) "Recovery" else "Build",
                    sessions = listOf(
                        ProgramSessionDef(
                            id = "cp1-w$weekIndex-s1",
                            dayLabel = "Tue",
                            title = "Threshold",
                            warmup = listOf("10 min easy", "Drills"),
                            exercises = listOf(
                                ProgramExercise("4x8 min @ threshold", "HR zone 4", restSec = 120),
                            ),
                            recoveryNotes = "Easy jog cooldown, hydrate.",
                        ),
                        ProgramSessionDef(
                            id = "cp1-w$weekIndex-s2",
                            dayLabel = "Sat",
                            title = "Long run",
                            warmup = listOf("5 min walk-jog"),
                            exercises = listOf(ProgramExercise("70-100 min Z2", "Conversational pace")),
                        ),
                    ),
                )
            },
            nutritionNotes = listOf("Carb focus before Tuesday quality sessions."),
            educationNotes = listOf("Why threshold work raises sustainable pace."),
            equipment = listOf("HR monitor"),
            requirements = listOf("Run 4x/week comfortably"),
            priceCents = 4900,
            status = ProgramStatus.DRAFT,
            audit = audit,
        )
        programs.upsertDraft(vo2)
        programs.publish("cp1", "coach-1")

        programs.upsertDraft(
            ProgramDefinition(
                id = "cp2",
                version = 1,
                coachId = "coach-1",
                title = "Base Template",
                description = "4-week aerobic base template for reuse.",
                sportKey = "running",
                level = ProgramLevel.BEGINNER,
                goals = listOf("Build aerobic base"),
                weeks = (1..4).map { weekIndex ->
                    ProgramWeek(
                        index = weekIndex,
                        focus = "Base",
                        sessions = listOf(
                            ProgramSessionDef(
                                id = "cp2-w$weekIndex-s1",
                                dayLabel = "Mon",
                                title = "Easy",
                                warmup = listOf("5 min"),
                                exercises = listOf(ProgramExercise("Z2", "45 min")),
                            ),
                        ),
                    )
                },
                status = ProgramStatus.DRAFT,
                template = true,
                audit = audit,
            ),
        )

        challenges.create(
            ChallengeDefinition(
                id = "ch-100k",
                title = "100K October",
                description = "Run or ride 100 km this month.",
                scope = ChallengeScope.COMMUNITY,
                metric = ChallengeMetric.DISTANCE,
                target = 100_000.0,
                unit = "m",
                scoring = ChallengeScoring.SUM,
                startEpochMs = nowEpochMs - 7 * DAY,
                endEpochMs = nowEpochMs + 23 * DAY,
                rewards = listOf("Finisher badge"),
                audit = audit,
            ),
        )
        challenges.create(
            ChallengeDefinition(
                id = "ch-streak",
                title = "Consistency Week",
                description = "Train every day for 7 days.",
                scope = ChallengeScope.GROUP,
                metric = ChallengeMetric.CONSISTENCY,
                target = 7.0,
                unit = "days",
                scoring = ChallengeScoring.STREAK,
                startEpochMs = nowEpochMs - 2 * DAY,
                endEpochMs = nowEpochMs + 5 * DAY,
                groupId = runners.id,
                audit = audit,
            ),
        )
        challenges.join("ch-100k", "a1")
        challenges.join("ch-100k", "a2")

        seedPosts(posts)
    }

    private suspend fun seedPosts(posts: PostEngine) {
        listOf(
            PostDraft(
                idempotencyKey = "seed-1",
                authorId = "a1",
                kind = PostKind.WORKOUT,
                text = "Track Tuesday done — legs are toast but pace is coming back. #running",
                sportKey = "running",
            ),
            PostDraft(
                idempotencyKey = "seed-2",
                authorId = "coach-1",
                kind = PostKind.COACH_EDUCATION,
                text = "Coaching tip: your easy days fund your hard days. Keep Z2 honest. #training",
            ),
            PostDraft(
                idempotencyKey = "seed-3",
                authorId = "a2",
                kind = PostKind.PROGRESS,
                text = "Week 3 of the VO2 block complete. Threshold reps finally feel controlled.",
                programId = "cp1",
            ),
            PostDraft(
                idempotencyKey = "seed-4",
                authorId = FeedEngine.OFFICIAL_ACCOUNT_ID,
                kind = PostKind.EVENT,
                text = "100K October is live — join the community challenge from the Challenges tab.",
                challengeId = "ch-100k",
            ),
            PostDraft(
                idempotencyKey = "seed-5",
                authorId = "a1",
                kind = PostKind.TEXT,
                text = "Anyone up for a Saturday long run from the river track? @you #citymiles",
                groupId = "grp-runners",
                visibility = Visibility.GROUP,
            ),
        ).forEach { posts.create(it) }
    }

    private const val DAY = 86_400_000L
}
