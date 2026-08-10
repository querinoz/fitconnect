package com.fitconnect.android.community.di

import com.fitconnect.android.community.catalog.CommunitySeed
import com.fitconnect.android.community.challenges.ChallengeEngine
import com.fitconnect.android.community.challenges.InMemoryChallengeEngine
import com.fitconnect.android.community.comments.CommentEngine
import com.fitconnect.android.community.comments.InMemoryCommentEngine
import com.fitconnect.android.community.feed.ChronoEngagementRanker
import com.fitconnect.android.community.feed.FeedEngine
import com.fitconnect.android.community.graph.InMemoryProfileDirectory
import com.fitconnect.android.community.graph.InMemorySocialGraph
import com.fitconnect.android.community.graph.ProfileDirectory
import com.fitconnect.android.community.graph.SocialGraph
import com.fitconnect.android.community.groups.GroupEngine
import com.fitconnect.android.community.groups.InMemoryGroupEngine
import com.fitconnect.android.community.integration.ActivityFactsPort
import com.fitconnect.android.community.integration.NoActivityFactsPort
import com.fitconnect.android.community.moderation.LocalModerationQueue
import com.fitconnect.android.community.moderation.ModerationService
import com.fitconnect.android.community.posts.InMemoryPostEngine
import com.fitconnect.android.community.posts.PendingActionQueue
import com.fitconnect.android.community.posts.PostEngine
import com.fitconnect.android.community.privacy.VisibilityResolver
import com.fitconnect.android.community.programs.InMemoryProgramEngine
import com.fitconnect.android.community.programs.ProgramEngine
import com.fitconnect.android.community.reactions.InMemoryReactionEngine
import com.fitconnect.android.community.reactions.ReactionEngine
import com.fitconnect.android.community.safety.ActionRateLimiter
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Community module composition root. Wires in-memory engines for demo/seeded
 * feeds; swap ports (e.g. [ActivityFactsPort]) at the app layer for production
 * telemetry without changing callers.
 */
interface CommunityContainer {
    val feed: FeedEngine
    val posts: PostEngine
    val profiles: ProfileDirectory
    val graph: SocialGraph
    val groups: GroupEngine
    val reactions: ReactionEngine
    val comments: CommentEngine
    val programs: ProgramEngine
    val challenges: ChallengeEngine
    val moderation: ModerationService
    val pendingActions: PendingActionQueue
    val rateLimiter: ActionRateLimiter
    val visibility: VisibilityResolver

    /** Applies [CommunitySeed] exactly once for this container instance. */
    suspend fun seedIfNeeded()
}

class DefaultCommunityContainer(
    activityFacts: ActivityFactsPort = NoActivityFactsPort(),
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : CommunityContainer {

    private val seeded = AtomicBoolean(false)

    override val rateLimiter: ActionRateLimiter = ActionRateLimiter(nowProvider)

    override val profiles: ProfileDirectory = InMemoryProfileDirectory()
    override val graph: SocialGraph = InMemorySocialGraph()
    override val groups: GroupEngine = InMemoryGroupEngine()
    override val reactions: ReactionEngine = InMemoryReactionEngine()
    override val comments: CommentEngine = InMemoryCommentEngine()

    override val posts: PostEngine = InMemoryPostEngine(
        rateLimiter = rateLimiter,
        nowProvider = nowProvider,
    )

    override val visibility: VisibilityResolver = VisibilityResolver(
        graph = graph,
        groups = groups,
    )

    override val programs: ProgramEngine = InMemoryProgramEngine(nowProvider = nowProvider)

    override val challenges: ChallengeEngine = InMemoryChallengeEngine(
        facts = activityFacts,
        rateLimiter = rateLimiter,
        nowProvider = nowProvider,
    )

    override val moderation: ModerationService = LocalModerationQueue(
        rateLimiter = rateLimiter,
        nowProvider = nowProvider,
    )

    override val pendingActions: PendingActionQueue = PendingActionQueue(nowProvider = nowProvider)

    override val feed: FeedEngine = FeedEngine(
        posts = posts,
        graph = graph,
        groups = groups,
        reactions = reactions,
        commentCounts = comments::count,
        visibility = visibility,
        ranker = ChronoEngagementRanker(),
        nowProvider = nowProvider,
    )

    override suspend fun seedIfNeeded() {
        if (!seeded.compareAndSet(false, true)) return
        CommunitySeed.apply(
            profiles = profiles,
            graph = graph,
            groups = groups,
            posts = posts,
            programs = programs,
            challenges = challenges,
            nowEpochMs = nowProvider(),
        )
    }
}
