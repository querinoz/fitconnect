package com.fitconnect.android.community.catalog

import com.fitconnect.android.community.challenges.ChallengeEngine
import com.fitconnect.android.community.comments.CommentEngine
import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.ChallengeDefinition
import com.fitconnect.android.community.domain.ChallengeMetric
import com.fitconnect.android.community.domain.ChallengeScope
import com.fitconnect.android.community.domain.ChallengeScoring
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.CommunityRole
import com.fitconnect.android.community.domain.GroupKind
import com.fitconnect.android.community.domain.MediaAttachment
import com.fitconnect.android.community.domain.MediaKind
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ProgramDefinition
import com.fitconnect.android.community.domain.ProgramExercise
import com.fitconnect.android.community.domain.ProgramLevel
import com.fitconnect.android.community.domain.ProgramSessionDef
import com.fitconnect.android.community.domain.ProgramStatus
import com.fitconnect.android.community.domain.ProgramWeek
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import com.fitconnect.android.community.domain.UserProfile
import com.fitconnect.android.community.domain.Visibility
import com.fitconnect.android.community.domain.WorkoutFacts
import com.fitconnect.android.community.feed.FeedEngine
import com.fitconnect.android.community.graph.ProfileDirectory
import com.fitconnect.android.community.graph.SocialGraph
import com.fitconnect.android.community.groups.GroupEngine
import com.fitconnect.android.community.groups.GroupFactory
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostEngine
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.community.programs.ProgramEngine
import com.fitconnect.android.community.reactions.ReactionEngine

/**
 * Deterministic LOCAL_DEMO world. Looks lived-in; never claims production users.
 * IDs align with Athlete OS (`ath-1`), coach roster (`coach-1`, `a1`..`a4`).
 */
object CommunitySeed {

    suspend fun apply(
        profiles: ProfileDirectory,
        graph: SocialGraph,
        groups: GroupEngine,
        posts: PostEngine,
        programs: ProgramEngine,
        challenges: ChallengeEngine,
        reactions: ReactionEngine,
        comments: CommentEngine,
        nowEpochMs: Long = System.currentTimeMillis(),
    ) {
        val audit = Audit(nowEpochMs - DAY, nowEpochMs - DAY)

        world.forEach { profiles.upsert(it) }

        val everyone = world.map { it.id }.filter { it != "ath-1" }
        everyone.forEach { graph.follow("ath-1", it) }
        listOf("a1", "a2", "a5", "a6", "coach-1").forEach { graph.follow(it, "ath-1") }
        graph.connect("ath-1", "a1")
        graph.connect("ath-1", "a5")
        graph.linkCoachAthlete("coach-1", "ath-1")
        listOf("a1", "a2", "a3", "a4", "a5", "a8").forEach { graph.linkCoachAthlete("coach-1", it) }
        graph.linkCoachAthlete("coach-2", "a7")
        graph.linkCoachAthlete("coach-2", "a9")

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
        listOf("ath-1", "a1", "a2", "a5", "a6", "a8").forEach { groups.join(runners.id, it) }
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

        seedPrograms(programs, audit)
        seedChallenges(challenges, runners.id, nowEpochMs)
        seedSocial(posts, reactions, comments, nowEpochMs)
    }

    private suspend fun seedPrograms(programs: ProgramEngine, audit: Audit) {
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
    }

    private suspend fun seedChallenges(challenges: ChallengeEngine, groupId: String, nowEpochMs: Long) {
        val audit = Audit(nowEpochMs - DAY, nowEpochMs - DAY)
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
                groupId = groupId,
                audit = audit,
            ),
        )
        challenges.join("ch-100k", "a1")
        challenges.join("ch-100k", "a2")
        challenges.join("ch-100k", "a5")
    }

    private suspend fun seedSocial(
        posts: PostEngine,
        reactions: ReactionEngine,
        comments: CommentEngine,
        now: Long,
    ) {
        val created = mutableListOf<CommunityPost>()
        worldFeed(now).forEach { draft ->
            when (val result = posts.create(draft)) {
                is PostResult.Created -> created += result.post
                is PostResult.Duplicate -> created += result.existing
                else -> Unit
            }
        }
        created.forEachIndexed { index, post ->
            val buzz = 12 + (index * 7) % 48
            repeat(buzz) { i ->
                reactions.react(
                    actorId = "demo-r$index-$i",
                    targetKind = ReactionTargetKind.POST,
                    targetId = post.id,
                    type = ReactionType.entries[i % ReactionType.entries.size],
                )
            }
        }
        suspend fun comment(postIndex: Int, author: String, text: String) {
            created.getOrNull(postIndex)?.let { post ->
                comments.add(post.id, null, author, text)
            }
        }
        comment(0, "a5", "That dawn light is illegal. Legs look honest though.")
        comment(0, "coach-1", "Keep Z2 honest tomorrow. This is the work.")
        comment(1, "a1", "Ridge looks savage. How was the wind on the descent?")
        comment(2, "a10", "Bar path looked locked. How many kilos off last cycle?")
        comment(3, "a7", "Rest is a session. Proud of this.")
        comment(4, "a8", "Track Tuesday crew is growing. I'm in Saturday.")
        comment(5, "coach-2", "Catch looks long. Film the next 50s from the side.")
        comment(6, "a6", "Watch data doesn't lie. Beautiful split.")
        comment(7, "a2", "Saving this cue. Easy days fund the hard ones.")
        comment(8, "a1", "Threshold feeling controlled is the whole block.")
        comment(11, "ath-1", "River at 08:30. I'll bring the gel flasks.")
    }

    private fun worldFeed(now: Long): List<PostDraft> {
        fun ago(hours: Double) = now - (hours * HOUR).toLong()
        fun img(id: String, name: String) = listOf(
            MediaAttachment(id, MediaKind.IMAGE, name, null, null, 90_000),
        )
        fun clip(id: String) = listOf(
            MediaAttachment(
                id = id,
                kind = MediaKind.VIDEO,
                localUri = "demo_motion_clip",
                remoteUrl = null,
                thumbnailUrl = "demo_motion_watch",
                sizeBytes = 85_000,
                durationMs = 4_000,
            ),
        )
        fun run(km: Double, min: Int, hr: Double, load: Double, pr: Boolean = false) = WorkoutFacts(
            sportKey = "running",
            durationMinutes = min,
            distanceMeters = km * 1000,
            calories = km * 62,
            avgHeartRate = hr,
            trainingLoad = load,
            personalRecord = pr,
        )
        fun ride(km: Double, min: Int, hr: Double, load: Double) = WorkoutFacts(
            sportKey = "cycling",
            durationMinutes = min,
            distanceMeters = km * 1000,
            calories = km * 28,
            avgHeartRate = hr,
            trainingLoad = load,
        )
        return listOf(
            PostDraft(
                idempotencyKey = "seed-1",
                authorId = "a1",
                kind = PostKind.WORKOUT,
                text = "Lisbon waterfront before the city woke up. Pace came back without forcing it. #running",
                sportKey = "running",
                workoutFacts = run(12.4, 58, 148.0, 72.0),
                shareTelemetryFacts = true,
                media = img("m-run-1", "demo_run_waterfront"),
                skipRateLimit = true,
                createdAtEpochMs = ago(0.8),
            ),
            PostDraft(
                idempotencyKey = "seed-ride",
                authorId = "a2",
                kind = PostKind.WORKOUT,
                text = "Ridge loop. Legs empty, head clear. This is why I clip in. #cycling",
                sportKey = "cycling",
                workoutFacts = ride(64.2, 142, 139.0, 88.0),
                shareTelemetryFacts = true,
                media = img("m-ride-1", "demo_ride_ridge"),
                skipRateLimit = true,
                createdAtEpochMs = ago(2.1),
            ),
            PostDraft(
                idempotencyKey = "seed-iron",
                authorId = "a4",
                kind = PostKind.WORKOUT,
                text = "Heavy day. Chalk, silence, one more clean pull. #strength",
                sportKey = "strength_training",
                workoutFacts = WorkoutFacts("strength_training", 74, null, 540.0, 142.0, 95.0, personalRecord = true),
                shareTelemetryFacts = true,
                media = img("m-gym-1", "demo_gym_iron"),
                skipRateLimit = true,
                createdAtEpochMs = ago(3.4),
            ),
            PostDraft(
                idempotencyKey = "seed-rest",
                authorId = "a7",
                kind = PostKind.PHOTO,
                text = "Nervous system night. Stretch, dim light, no apology for the rest day.",
                sportKey = "yoga",
                media = img("m-rec-1", "demo_recovery_night"),
                skipRateLimit = true,
                createdAtEpochMs = ago(5.0),
            ),
            PostDraft(
                idempotencyKey = "seed-5",
                authorId = "a5",
                kind = PostKind.PHOTO,
                text = "Anyone up for a Saturday long run from the river track? @you #citymiles",
                sportKey = "running",
                groupId = "grp-runners",
                visibility = Visibility.GROUP,
                media = img("m-squad-1", "demo_squad_track"),
                skipRateLimit = true,
                createdAtEpochMs = ago(6.2),
            ),
            PostDraft(
                idempotencyKey = "seed-swim",
                authorId = "a3",
                kind = PostKind.WORKOUT,
                text = "Black-water 3k. Catch is getting longer. Quiet work. #swimming",
                sportKey = "swimming",
                workoutFacts = WorkoutFacts("swimming", 48, 3000.0, 410.0, 138.0, 61.0),
                shareTelemetryFacts = true,
                media = img("m-swim-1", "demo_swim_lanes"),
                skipRateLimit = true,
                createdAtEpochMs = ago(8.5),
            ),
            PostDraft(
                idempotencyKey = "seed-motion",
                authorId = "a8",
                kind = PostKind.VIDEO,
                text = "Split lock on the last 800. Watch doesn't lie — this is the clip. #track",
                sportKey = "running",
                workoutFacts = run(8.0, 31, 166.0, 84.0, pr = true),
                shareTelemetryFacts = true,
                media = clip("m-vid-1"),
                skipRateLimit = true,
                createdAtEpochMs = ago(1.4),
            ),
            PostDraft(
                idempotencyKey = "seed-2",
                authorId = "coach-1",
                kind = PostKind.COACH_EDUCATION,
                text = "Coaching tip: your easy days fund your hard days. Keep Z2 honest. Film the rest, not only the repeats.",
                media = img("m-coach-1", "demo_coach_track"),
                skipRateLimit = true,
                createdAtEpochMs = ago(9.0),
            ),
            PostDraft(
                idempotencyKey = "seed-3",
                authorId = "a2",
                kind = PostKind.PROGRESS,
                text = "Week 3 of the VO2 block complete. Threshold reps finally feel controlled.",
                programId = "cp1",
                skipRateLimit = true,
                createdAtEpochMs = ago(11.0),
            ),
            PostDraft(
                idempotencyKey = "seed-4",
                authorId = FeedEngine.OFFICIAL_ACCOUNT_ID,
                kind = PostKind.EVENT,
                text = "LOCAL_DEMO world is live — this feed is a seeded performance city, not production users. 100K October sits in Challenges.",
                challengeId = "ch-100k",
                skipRateLimit = true,
                createdAtEpochMs = ago(12.0),
            ),
            PostDraft(
                idempotencyKey = "seed-nuno",
                authorId = "a6",
                kind = PostKind.WORKOUT,
                text = "Trail dust and a quiet climb. No music. Just the watch and the hill. #trail",
                sportKey = "running",
                workoutFacts = run(16.8, 92, 151.0, 79.0),
                shareTelemetryFacts = true,
                media = img("m-trail-1", "demo_run_waterfront"),
                skipRateLimit = true,
                createdAtEpochMs = ago(14.0),
            ),
            PostDraft(
                idempotencyKey = "seed-elena",
                authorId = "a9",
                kind = PostKind.WORKOUT,
                text = "Group ride turned into a chase. I let the wheel go on purpose. Aerobic patience.",
                sportKey = "cycling",
                workoutFacts = ride(48.0, 110, 132.0, 64.0),
                shareTelemetryFacts = true,
                media = img("m-ride-2", "demo_ride_ridge"),
                skipRateLimit = true,
                createdAtEpochMs = ago(16.0),
            ),
            PostDraft(
                idempotencyKey = "seed-priya",
                authorId = "a10",
                kind = PostKind.ACHIEVEMENT,
                text = "First bodyweight pull-up this block. Small, loud, mine.",
                sportKey = "strength_training",
                media = img("m-gym-2", "demo_gym_iron"),
                skipRateLimit = true,
                createdAtEpochMs = ago(18.0),
            ),
            PostDraft(
                idempotencyKey = "seed-maya",
                authorId = "coach-2",
                kind = PostKind.COACH_EDUCATION,
                text = "If your HRV dipped, we don't add intensity. We add sleep and a walk. Performance is not punishment.",
                media = img("m-rec-2", "demo_recovery_night"),
                skipRateLimit = true,
                createdAtEpochMs = ago(20.0),
            ),
            PostDraft(
                idempotencyKey = "seed-tom",
                authorId = "a8",
                kind = PostKind.TEXT,
                text = "Repeats with the squad under the lights. Steam, spikes, no talking after rep 3.",
                sportKey = "running",
                groupId = "grp-runners",
                media = img("m-squad-2", "demo_squad_track"),
                skipRateLimit = true,
                createdAtEpochMs = ago(22.0),
            ),
            PostDraft(
                idempotencyKey = "seed-aisha2",
                authorId = "a3",
                kind = PostKind.PROGRESS,
                text = "CSS down 2 seconds on the 100. Quiet pool, loud number.",
                sportKey = "swimming",
                media = img("m-swim-2", "demo_swim_lanes"),
                skipRateLimit = true,
                createdAtEpochMs = ago(26.0),
            ),
            PostDraft(
                idempotencyKey = "seed-lena-txt",
                authorId = "a1",
                kind = PostKind.TEXT,
                text = "Track Tuesday done — legs are toast but pace is coming back. Who's on the river Saturday?",
                sportKey = "running",
                skipRateLimit = true,
                createdAtEpochMs = ago(28.0),
            ),
            PostDraft(
                idempotencyKey = "seed-you",
                authorId = "ath-1",
                kind = PostKind.WORKOUT,
                text = "Shakeout before the threshold set. Holding the plan.",
                sportKey = "running",
                workoutFacts = run(7.2, 38, 136.0, 41.0),
                shareTelemetryFacts = true,
                media = img("m-you-1", "demo_coach_track"),
                skipRateLimit = true,
                createdAtEpochMs = ago(30.0),
            ),
        )
    }

    private val world = listOf(
        UserProfile("ath-1", "Inês Costa", CommunityRole.ATHLETE, sportKeys = listOf("running", "cycling"), bio = "Lisbon. Threshold in progress.", avatarUri = "demo_avatar_ines"),
        UserProfile("a1", "Lena Fischer", CommunityRole.ATHLETE, sportKeys = listOf("running"), bio = "Dawn miles. City loops.", avatarUri = "demo_avatar_sofia"),
        UserProfile("a2", "Marco Silva", CommunityRole.ATHLETE, sportKeys = listOf("cycling"), bio = "Ridges and long days.", avatarUri = "demo_avatar_miguel"),
        UserProfile("a3", "Aisha Khan", CommunityRole.ATHLETE, sportKeys = listOf("swimming"), bio = "Black-water kilometres.", avatarUri = "demo_avatar_aisha"),
        UserProfile("a4", "Jonas Weber", CommunityRole.ATHLETE, sportKeys = listOf("strength_training"), bio = "Iron, chalk, quiet.", avatarUri = "demo_avatar_joao"),
        UserProfile("a5", "Sofia Mendes", CommunityRole.ATHLETE, sportKeys = listOf("running"), bio = "City Runners Saturday.", avatarUri = "demo_avatar_sofia"),
        UserProfile("a6", "Nuno Alves", CommunityRole.ATHLETE, sportKeys = listOf("running"), bio = "Trail over tarmac.", avatarUri = "demo_avatar_nuno"),
        UserProfile("a7", "Maya Chen", CommunityRole.ATHLETE, sportKeys = listOf("yoga"), bio = "Recovery is training.", avatarUri = "demo_avatar_maya"),
        UserProfile("a8", "Tomás Ribeiro", CommunityRole.ATHLETE, sportKeys = listOf("running"), bio = "Track nights.", avatarUri = "demo_avatar_joao"),
        UserProfile("a9", "Elena Rossi", CommunityRole.ATHLETE, sportKeys = listOf("cycling"), bio = "Wheels and patience.", avatarUri = "demo_avatar_elena"),
        UserProfile("a10", "Priya Shah", CommunityRole.ATHLETE, sportKeys = listOf("strength_training"), bio = "Pull-up project.", avatarUri = "demo_avatar_aisha"),
        UserProfile("coach-1", "Coach Rivera", CommunityRole.COACH, verifiedCoach = true, sportKeys = listOf("running", "cycling"), bio = "Easy days fund hard days.", avatarUri = "demo_avatar_ines"),
        UserProfile("coach-2", "Coach Maya", CommunityRole.COACH, verifiedCoach = true, sportKeys = listOf("running", "yoga"), bio = "Sleep first.", avatarUri = "demo_avatar_maya"),
        UserProfile(FeedEngine.OFFICIAL_ACCOUNT_ID, "FitConnect", CommunityRole.OFFICIAL, bio = "LOCAL_DEMO signal."),
    )

    private const val HOUR = 3_600_000L
    private const val DAY = 86_400_000L
}
