package com.fitconnect.android.athlete.ui.community

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
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
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import com.fitconnect.android.community.feed.FeedKind
import com.fitconnect.android.community.feed.FeedRequest
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * Athlete community feed backed by :community engines + deterministic seed.
 */
@Composable
fun CommunityScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var posts by remember { mutableStateOf<List<CommunityPost>>(emptyList()) }
    var emptyReason by remember { mutableStateOf<String?>(null) }
    var kind by remember { mutableStateOf(FeedKind.FOLLOWING) }
    var draftText by remember { mutableStateOf("") }
    var status by remember { mutableStateOf<String?>(null) }
    var commentDrafts by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var reactionTotals by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    suspend fun reload() {
        loading = true
        error = null
        try {
            container.community.seedIfNeeded()
            val page = container.community.feed.feed(
                FeedRequest(
                    viewerId = LocalAthleteRepository.ATHLETE_ID,
                    kind = kind,
                    limit = 30,
                ),
            )
            posts = page.items
            emptyReason = if (page.items.isEmpty()) "No posts yet for ${kind.name.lowercase()}" else null
            reactionTotals = page.items.associate { post ->
                post.id to container.community.reactions.total(ReactionTargetKind.POST, post.id)
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
        subtitle = "Feed · create · react · comment · ${DemoPersona.MODE_LABEL}",
        testTag = "athlete_community",
    ) {
        item {
            EliteFlowRow {
                EliteChip(label = "Following", onClick = { kind = FeedKind.FOLLOWING })
                EliteChip(label = "Official", onClick = { kind = FeedKind.OFFICIAL })
                EliteChip(label = "Sport", onClick = { kind = FeedKind.SPORT })
                EliteButton(
                    label = "Refresh",
                    variant = EliteButtonVariant.Ghost,
                    onClick = { scope.launch { reload() } },
                )
            }
        }
        item {
            EliteCard(modifier = Modifier.testTag("community_composer")) {
                Text("Create post", style = MaterialTheme.typography.titleMedium)
                EliteTextField(
                    value = draftText,
                    onValueChange = { draftText = it },
                    label = "What's on your mind?",
                    modifier = Modifier.testTag("community_post_input"),
                )
                EliteButton(
                    label = "Publish",
                    enabled = draftText.isNotBlank(),
                    onClick = {
                        scope.launch {
                            val result = container.community.posts.create(
                                PostDraft(
                                    idempotencyKey = UUID.randomUUID().toString(),
                                    authorId = LocalAthleteRepository.ATHLETE_ID,
                                    kind = PostKind.TEXT,
                                    text = draftText.trim(),
                                ),
                            )
                            status = when (result) {
                                is PostResult.Created -> "Published ${result.post.id}"
                                is PostResult.Duplicate -> "Duplicate blocked"
                                PostResult.RateLimited -> "Rate limited — wait a moment"
                                PostResult.Invalid -> "Invalid post"
                            }
                            if (result is PostResult.Created) {
                                draftText = ""
                                reload()
                            }
                        }
                    },
                )
                status?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
            }
        }
        if (loading) {
            item {
                EliteCard { Text("Loading feed…", style = MaterialTheme.typography.bodyLarge) }
            }
        }
        error?.let { reason ->
            item {
                EliteCard {
                    Text(reason, style = MaterialTheme.typography.bodyLarge)
                    EliteButton(label = "Retry", onClick = { scope.launch { reload() } })
                }
            }
        }
        emptyReason?.let { reason ->
            item {
                EliteCard {
                    Text(reason, style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
        items(posts, key = { it.id }) { post ->
            EliteCard {
                Text(post.kind.name, style = MaterialTheme.typography.labelLarge)
                Text(post.text, style = MaterialTheme.typography.bodyLarge)
                Text(
                    "by ${post.authorId} · ${reactionTotals[post.id] ?: 0} reactions",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    EliteButton(
                        label = "Like",
                        variant = EliteButtonVariant.Secondary,
                        onClick = {
                            scope.launch {
                                container.community.reactions.react(
                                    LocalAthleteRepository.ATHLETE_ID,
                                    ReactionTargetKind.POST,
                                    post.id,
                                    ReactionType.LIKE,
                                )
                                reload()
                            }
                        },
                    )
                    EliteButton(
                        label = "Fire",
                        variant = EliteButtonVariant.Ghost,
                        onClick = {
                            scope.launch {
                                container.community.reactions.react(
                                    LocalAthleteRepository.ATHLETE_ID,
                                    ReactionTargetKind.POST,
                                    post.id,
                                    ReactionType.FIRE,
                                )
                                reload()
                            }
                        },
                    )
                }
                val commentValue = commentDrafts[post.id].orEmpty()
                EliteTextField(
                    value = commentValue,
                    onValueChange = { commentDrafts = commentDrafts + (post.id to it) },
                    label = "Comment",
                )
                EliteButton(
                    label = "Comment",
                    enabled = commentValue.isNotBlank(),
                    onClick = {
                        scope.launch {
                            container.community.comments.add(
                                postId = post.id,
                                parentCommentId = null,
                                authorId = LocalAthleteRepository.ATHLETE_ID,
                                text = commentValue.trim(),
                            )
                            commentDrafts = commentDrafts - post.id
                            status = "Comment added on ${post.id}"
                        }
                    },
                )
            }
        }
    }
}
