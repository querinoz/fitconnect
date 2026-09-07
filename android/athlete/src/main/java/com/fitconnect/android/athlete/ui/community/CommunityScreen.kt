package com.fitconnect.android.athlete.ui.community

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.data.canonicalAthleteId
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.CommunityRole
import com.fitconnect.android.community.domain.MediaKind
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import com.fitconnect.android.community.domain.UserProfile
import com.fitconnect.android.community.feed.FeedKind
import com.fitconnect.android.community.feed.FeedRequest
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteFeedComment
import com.fitconnect.android.designui.components.EliteFeedPost
import com.fitconnect.android.designui.components.EliteFeedReaction
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * Athlete community feed backed by :community engines + cinematic LOCAL_DEMO seed.
 */
@Composable
fun CommunityScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var isLocalDemo by remember { mutableStateOf(false) }
    var posts by remember { mutableStateOf<List<CommunityPost>>(emptyList()) }
    var emptyReason by remember { mutableStateOf<String?>(null) }
    var kind by remember { mutableStateOf(FeedKind.FOLLOWING) }
    var draftText by remember { mutableStateOf("") }
    var draftKind by remember { mutableStateOf(PostKind.TEXT) }
    var status by remember { mutableStateOf<String?>(null) }
    var commentDrafts by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var reactionCounts by remember { mutableStateOf<Map<String, Map<ReactionType, Int>>>(emptyMap()) }
    var myReactions by remember { mutableStateOf<Map<String, ReactionType?>>(emptyMap()) }
    var comments by remember { mutableStateOf<Map<String, List<Comment>>>(emptyMap()) }
    var profiles by remember { mutableStateOf<Map<String, UserProfile>>(emptyMap()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val remote = remember {
        com.fitconnect.android.athlete.community.RemoteCommunityPosts(
            api = { container.platform.apiClient },
        )
    }
    val viewerId = remember {
        mutableStateOf("")
    }

    suspend fun reload() {
        loading = true
        error = null
        try {
            isLocalDemo = container.platform.sessionStore.snapshot().isLocalDemo
            viewerId.value = container.platform.sessionStore.canonicalAthleteId()
            if (isLocalDemo) {
                container.community.seedIfNeeded()
                val page = container.community.feed.feed(
                    FeedRequest(
                        viewerId = viewerId.value,
                        kind = kind,
                        contextId = if (kind == FeedKind.SPORT) "running" else null,
                        limit = 40,
                    ),
                )
                posts = page.items
                emptyReason = if (page.items.isEmpty()) "No posts yet for ${kind.name.lowercase()}" else null
                reactionCounts = page.items.associate { post ->
                    post.id to container.community.reactions.counts(ReactionTargetKind.POST, post.id)
                }
                myReactions = page.items.associate { post ->
                    post.id to container.community.reactions.of(
                        viewerId.value,
                        ReactionTargetKind.POST,
                        post.id,
                    )
                }
                comments = page.items.associate { post ->
                    post.id to container.community.comments.forPost(post.id, limit = 3).items
                }
                val authorIds = page.items.map { it.authorId } +
                    comments.values.flatten().map { it.authorId }
                profiles = authorIds.distinct().associateWith { id ->
                    container.community.profiles.get(id) ?: UserProfile(id, id, CommunityRole.ATHLETE)
                }
            } else {
                when (val result = remote.list()) {
                    is com.fitconnect.android.foundation.common.AppResult.Ok -> {
                        posts = result.value
                        emptyReason = if (result.value.isEmpty()) {
                            "No community posts yet"
                        } else {
                            null
                        }
                        val remoteComments = mutableMapOf<String, List<Comment>>()
                        val remoteCounts = mutableMapOf<String, Map<ReactionType, Int>>()
                        for (post in result.value.take(20)) {
                            when (val c = remote.listComments(post.id)) {
                                is com.fitconnect.android.foundation.common.AppResult.Ok ->
                                    remoteComments[post.id] = c.value
                                is com.fitconnect.android.foundation.common.AppResult.Err -> Unit
                            }
                            when (val r = remote.listReactions(post.id)) {
                                is com.fitconnect.android.foundation.common.AppResult.Ok -> {
                                    remoteCounts[post.id] = ReactionType.entries.associateWith { type ->
                                        r.value[type.name] ?: 0
                                    }
                                }
                                is com.fitconnect.android.foundation.common.AppResult.Err -> Unit
                            }
                        }
                        comments = remoteComments
                        reactionCounts = remoteCounts
                        myReactions = emptyMap()
                        profiles = result.value.associate { post ->
                            post.authorId to UserProfile(
                                post.authorId,
                                post.authorId,
                                CommunityRole.ATHLETE,
                            )
                        }
                    }
                    is com.fitconnect.android.foundation.common.AppResult.Err -> {
                        error = result.error.toString()
                        posts = emptyList()
                    }
                }
            }
        } catch (t: Throwable) {
            error = t.message ?: "Community feed failed"
        } finally {
            loading = false
        }
    }

    LaunchedEffect(kind) {
        container.platform.analytics.screen("athlete_community")
        reload()
    }

    AthleteScreenScaffold(
        title = "Community",
        subtitle = if (isLocalDemo) {
            "LOCAL_DEMO community · seed feed"
        } else {
            "Canonical community posts"
        },
        testTag = "athlete_community",
    ) {
        item {
            EliteFlowRow {
                EliteChip(label = "Following", selected = kind == FeedKind.FOLLOWING, onClick = { kind = FeedKind.FOLLOWING })
                EliteChip(label = "Official", selected = kind == FeedKind.OFFICIAL, onClick = { kind = FeedKind.OFFICIAL })
                EliteChip(label = "Sport", selected = kind == FeedKind.SPORT, onClick = { kind = FeedKind.SPORT })
                EliteButton(
                    label = "Refresh",
                    variant = EliteButtonVariant.Ghost,
                    onClick = { scope.launch { reload() } },
                )
            }
        }
        item {
            EliteCard(modifier = Modifier.testTag("community_composer"), variant = EliteCardVariant.Glass) {
                Text("What happened today?", style = MaterialTheme.typography.titleMedium)
                EliteFlowRow {
                    composerKinds.forEach { option ->
                        EliteChip(
                            label = option.name,
                            selected = draftKind == option,
                            onClick = { draftKind = option },
                        )
                    }
                }
                EliteTextField(
                    value = draftText,
                    onValueChange = { draftText = it },
                    label = "Training, recovery, mindset…",
                    modifier = Modifier.testTag("community_post_input"),
                )
                EliteButton(
                    label = "Publish",
                    enabled = draftText.isNotBlank(),
                    onClick = {
                        scope.launch {
                            if (isLocalDemo) {
                                val result = container.community.posts.create(
                                    PostDraft(
                                        idempotencyKey = UUID.randomUUID().toString(),
                                        authorId = viewerId.value,
                                        kind = draftKind,
                                        text = draftText.trim(),
                                    ),
                                )
                                status = when (result) {
                                    is PostResult.Created -> "Published ${result.post.id}"
                                    is PostResult.Duplicate -> "Duplicate blocked"
                                    PostResult.RateLimited -> "Rate limited — wait a moment"
                                    PostResult.Invalid -> "Invalid post"
                                }
                            } else {
                                when (
                                    val result = remote.create(
                                        text = draftText.trim(),
                                        authorId = viewerId.value,
                                    )
                                ) {
                                    is com.fitconnect.android.foundation.common.AppResult.Ok -> {
                                        status = "Published ${result.value.id}"
                                        draftText = ""
                                    }
                                    is com.fitconnect.android.foundation.common.AppResult.Err -> {
                                        status = result.error.toString()
                                    }
                                }
                            }
                            reload()
                        }
                    },
                )
                status?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
            }
        }
        if (loading) {
            item { EliteLoading(label = "SYS.FEED") }
        }
        error?.let { reason ->
            item {
                EliteErrorView(
                    title = "Feed unavailable",
                    body = reason,
                    onRetry = { scope.launch { reload() } },
                )
            }
        }
        emptyReason?.let { reason ->
            item {
                EliteEmptyState(
                    title = "No signal yet",
                    body = reason,
                    actionLabel = "Refresh",
                    onAction = { scope.launch { reload() } },
                )
            }
        }
        items(posts, key = { it.id }) { post ->
            val author = profiles[post.authorId]
            val media = post.media.firstOrNull()
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteFeedPost(
                authorId = post.authorId,
                authorName = author?.displayName ?: post.authorId,
                authorInitials = initialsOf(author?.displayName ?: post.authorId),
                avatarName = author?.avatarUri,
                kindLabel = post.kind.name,
                timeLabel = relativeTime(post.audit.createdAtEpochMs),
                body = post.text,
                imageName = media?.thumbnailUrl ?: media?.localUri,
                videoRawName = media?.takeIf { it.kind == MediaKind.VIDEO }?.localUri,
                facts = workoutFactPairs(post),
                verified = author?.verifiedCoach == true,
                reactions = ReactionType.entries.map { type ->
                    EliteFeedReaction(
                        id = type.name,
                        label = type.chipLabel,
                        count = reactionCounts[post.id]?.get(type) ?: 0,
                        selected = myReactions[post.id] == type,
                    )
                },
                comments = comments[post.id].orEmpty().map { comment ->
                    EliteFeedComment(
                        author = profiles[comment.authorId]?.displayName ?: comment.authorId,
                        text = comment.text,
                    )
                },
                onReact = { typeName ->
                    scope.launch {
                        val type = ReactionType.entries.first { it.name == typeName }
                        if (isLocalDemo) {
                            container.community.reactions.react(
                                viewerId.value,
                                ReactionTargetKind.POST,
                                post.id,
                                type,
                            )
                        } else {
                            when (val r = remote.react(post.id, type.name)) {
                                is com.fitconnect.android.foundation.common.AppResult.Ok -> Unit
                                is com.fitconnect.android.foundation.common.AppResult.Err -> {
                                    status = r.error.toString()
                                    return@launch
                                }
                            }
                        }
                        reload()
                    }
                },
            )
            val commentValue = commentDrafts[post.id].orEmpty()
                EliteTextField(
                    value = commentValue,
                    onValueChange = { commentDrafts = commentDrafts + (post.id to it) },
                    label = "Reply",
                )
                EliteButton(
                    label = "Comment",
                    enabled = commentValue.isNotBlank(),
                    onClick = {
                        scope.launch {
                            if (isLocalDemo) {
                                container.community.comments.add(
                                    postId = post.id,
                                    parentCommentId = null,
                                    authorId = viewerId.value,
                                    text = commentValue.trim(),
                                )
                                commentDrafts = commentDrafts - post.id
                                status = "Comment added"
                            } else {
                                when (
                                    val r = remote.addComment(post.id, commentValue.trim())
                                ) {
                                    is com.fitconnect.android.foundation.common.AppResult.Ok -> {
                                        commentDrafts = commentDrafts - post.id
                                        status = "Comment added"
                                    }
                                    is com.fitconnect.android.foundation.common.AppResult.Err -> {
                                        status = r.error.toString()
                                        return@launch
                                    }
                                }
                            }
                            reload()
                        }
                    },
                )
            }
        }
    }
}

private val composerKinds = listOf(
    PostKind.TEXT,
    PostKind.WORKOUT,
    PostKind.PROGRESS,
    PostKind.ACHIEVEMENT,
)

private val ReactionType.chipLabel: String
    get() = when (this) {
        ReactionType.LIKE -> "Like"
        ReactionType.FIRE -> "Fire"
        ReactionType.STRONG -> "Strong"
        ReactionType.CELEBRATE -> "Yes"
        ReactionType.SUPPORT -> "Support"
        ReactionType.INSIGHTFUL -> "Insight"
    }

private fun initialsOf(name: String): String =
    name.split(" ").mapNotNull { it.firstOrNull()?.uppercaseChar()?.toString() }.take(2).joinToString("").ifBlank { "FC" }

private fun relativeTime(createdAtEpochMs: Long, now: Long = System.currentTimeMillis()): String {
    val minutes = ((now - createdAtEpochMs).coerceAtLeast(0) / 60_000L)
    return when {
        minutes < 1 -> "now"
        minutes < 60 -> "${minutes}m"
        minutes < 1_440 -> "${minutes / 60}h"
        else -> "${minutes / 1_440}d"
    }
}

private fun workoutFactPairs(post: CommunityPost): List<Pair<String, String>> {
    val facts = post.workoutFacts ?: return emptyList()
    if (!post.shareTelemetryFacts) return emptyList()
    return listOfNotNull(
        facts.distanceMeters?.let { "KM" to "%.1f".format(it / 1000.0) },
        "MIN" to facts.durationMinutes.toString(),
        facts.avgHeartRate?.let { "HR" to "${it.toInt()}" },
    )
}
