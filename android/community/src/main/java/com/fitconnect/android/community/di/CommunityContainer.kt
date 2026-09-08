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
import com.fitconnect.android.community.remote.CommunityPostsApi
import com.fitconnect.android.community.remote.FailClosedCommentEngine
import com.fitconnect.android.community.remote.FailClosedPostEngine
import com.fitconnect.android.community.remote.FailClosedReactionEngine
import com.fitconnect.android.community.remote.ModeRoutedCommentEngine
import com.fitconnect.android.community.remote.ModeRoutedPostEngine
import com.fitconnect.android.community.remote.ModeRoutedReactionEngine
import com.fitconnect.android.community.remote.RemoteCommentEngine
import com.fitconnect.android.community.remote.RemotePostEngine
import com.fitconnect.android.community.remote.RemoteReactionEngine
import com.fitconnect.android.community.safety.ActionRateLimiter
import com.fitconnect.android.foundation.network.ApiClient
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Runtime mode for community engines.
 * - [LOCAL_DEMO]: in-memory + [CommunitySeed] (DEBUG demo personas only)
 * - [REMOTE]: HTTP /api/v1/community when API base URL is configured
 * - [FAIL_CLOSED]: empty engines — never invent seed content
 */
enum class CommunityRuntimeMode {
    LOCAL_DEMO,
    REMOTE,
    FAIL_CLOSED,
}

/**
 * Community module composition root.
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

    /** Applies [CommunitySeed] exactly once — only in [CommunityRuntimeMode.LOCAL_DEMO]. */
    suspend fun seedIfNeeded()

    /** Current backend mode (for UI copy / diagnostics). */
    suspend fun runtimeMode(): CommunityRuntimeMode
}

class DefaultCommunityContainer(
    activityFacts: ActivityFactsPort = NoActivityFactsPort(),
    private val nowProvider: () -> Long = System::currentTimeMillis,
    /**
     * Resolves backend per call. Defaults to LOCAL_DEMO so unit tests that
     * construct [DefaultCommunityContainer] without wiring still seed.
     */
    private val resolveMode: suspend () -> CommunityRuntimeMode = { CommunityRuntimeMode.LOCAL_DEMO },
    api: (() -> ApiClient)? = null,
) : CommunityContainer {

    private val seeded = AtomicBoolean(false)

    override val rateLimiter: ActionRateLimiter = ActionRateLimiter(nowProvider)

    override val profiles: ProfileDirectory = InMemoryProfileDirectory()
    override val graph: SocialGraph = InMemorySocialGraph()
    override val groups: GroupEngine = InMemoryGroupEngine()

    private val localReactions: ReactionEngine = InMemoryReactionEngine()
    private val localComments: CommentEngine = InMemoryCommentEngine()
    private val localPosts: PostEngine = InMemoryPostEngine(
        rateLimiter = rateLimiter,
        nowProvider = nowProvider,
    )

    private val communityApi: CommunityPostsApi? = api?.let { CommunityPostsApi(it) }
    private val remotePosts: PostEngine? = communityApi?.let { RemotePostEngine(it, nowProvider) }
    private val remoteComments: CommentEngine? = communityApi?.let { RemoteCommentEngine(it) }
    private val remoteReactions: ReactionEngine? = communityApi?.let { RemoteReactionEngine(it) }

    private val failPosts: PostEngine = FailClosedPostEngine()
    private val failComments: CommentEngine = FailClosedCommentEngine()
    private val failReactions: ReactionEngine = FailClosedReactionEngine()

    override val posts: PostEngine = ModeRoutedPostEngine {
        when (resolveMode()) {
            CommunityRuntimeMode.LOCAL_DEMO -> localPosts
            CommunityRuntimeMode.REMOTE -> remotePosts ?: failPosts
            CommunityRuntimeMode.FAIL_CLOSED -> failPosts
        }
    }

    override val comments: CommentEngine = ModeRoutedCommentEngine {
        when (resolveMode()) {
            CommunityRuntimeMode.LOCAL_DEMO -> localComments
            CommunityRuntimeMode.REMOTE -> remoteComments ?: failComments
            CommunityRuntimeMode.FAIL_CLOSED -> failComments
        }
    }

    override val reactions: ReactionEngine = ModeRoutedReactionEngine {
        when (resolveMode()) {
            CommunityRuntimeMode.LOCAL_DEMO -> localReactions
            CommunityRuntimeMode.REMOTE -> remoteReactions ?: failReactions
            CommunityRuntimeMode.FAIL_CLOSED -> failReactions
        }
    }

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

    override suspend fun runtimeMode(): CommunityRuntimeMode = resolveMode()

    override suspend fun seedIfNeeded() {
        if (resolveMode() != CommunityRuntimeMode.LOCAL_DEMO) return
        if (!seeded.compareAndSet(false, true)) return
        CommunitySeed.apply(
            profiles = profiles,
            graph = graph,
            groups = groups,
            posts = localPosts,
            programs = programs,
            challenges = challenges,
            reactions = localReactions,
            comments = localComments,
            nowEpochMs = nowProvider(),
        )
    }
}
