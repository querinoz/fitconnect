package com.fitconnect.android.designui.components

import android.net.Uri
import android.widget.VideoView
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.foundation.a11y.Accessibility

data class EliteFeedReaction(
    val id: String,
    val label: String,
    val count: Int,
    val selected: Boolean = false,
)

data class EliteFeedComment(
    val author: String,
    val text: String,
)

@Composable
fun EliteFeedPost(
    authorName: String,
    authorInitials: String,
    kindLabel: String,
    timeLabel: String,
    body: String,
    onReact: (String) -> Unit,
    modifier: Modifier = Modifier,
    authorId: String? = null,
    avatarName: String? = null,
    imageName: String? = null,
    videoRawName: String? = null,
    facts: List<Pair<String, String>> = emptyList(),
    reactions: List<EliteFeedReaction> = emptyList(),
    comments: List<EliteFeedComment> = emptyList(),
    compact: Boolean = false,
    verified: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val mediaHeight = if (compact) 160.dp else 220.dp
    EliteCard(modifier = modifier.testTag("elite_feed_post"), variant = EliteCardVariant.Glass, onClick = onClick) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (authorId != null) {
                EliteHexatar(
                    userId = authorId,
                    contentDescription = authorName,
                    diameter = EliteHexatarFeed,
                )
            } else {
                EliteAvatar(initials = authorInitials, imageName = avatarName, size = 40)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(authorName, style = MaterialTheme.typography.titleMedium)
                Text(
                    listOf(kindLabel, timeLabel).filter { it.isNotBlank() }.joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            if (verified) {
                EliteBadge(text = "COACH")
            }
        }
        val poster = imageName
        val hasVideo = !videoRawName.isNullOrBlank()
        val hasImage = !poster.isNullOrBlank() && EliteLocalImageExists(poster)
        if (hasVideo || hasImage) {
            EliteFeedMedia(
                imageName = poster,
                videoRawName = videoRawName,
                facts = facts,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(mediaHeight)
                    .clip(RoundedCornerShape(EliteRadius.Lg)),
            )
        }
        if (body.isNotBlank()) {
            Text(body, style = MaterialTheme.typography.bodyLarge)
        }
        if (!compact && reactions.isNotEmpty()) {
            EliteFlowRow {
                reactions.forEach { reaction ->
                    EliteChip(
                        label = if (reaction.count > 0) {
                            "${reaction.label} ${reaction.count}"
                        } else {
                            reaction.label
                        },
                        selected = reaction.selected,
                        onClick = { onReact(reaction.id) },
                    )
                }
            }
        }
        if (!compact) {
            comments.take(2).forEach { comment ->
                Text(
                    "${comment.author}  ${comment.text}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun EliteFeedMedia(
    imageName: String?,
    videoRawName: String?,
    facts: List<Pair<String, String>>,
    modifier: Modifier = Modifier,
) {
    val reduceMotion = reduceMotionEnabled()
    val rawId = videoRawName?.let { eliteRawId(it) } ?: 0
    var playing by remember { mutableStateOf(false) }
    val pulse by rememberInfiniteTransition(label = "feed-media").animateFloat(
        initialValue = 1f,
        targetValue = if (reduceMotion || playing) 1f else 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 9000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "kenburns",
    )
    Box(modifier = modifier.background(MaterialTheme.colorScheme.surfaceVariant)) {
        if (playing && rawId != 0) {
            val context = LocalContext.current
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    VideoView(ctx).apply {
                        setVideoURI(Uri.parse("android.resource://${context.packageName}/$rawId"))
                        setOnPreparedListener { player ->
                            player.isLooping = true
                            start()
                        }
                    }
                },
            )
        } else if (!imageName.isNullOrBlank()) {
            EliteLocalImage(
                name = imageName,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        scaleX = pulse
                        scaleY = pulse
                    },
                contentScale = ContentScale.Crop,
            )
        }
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.background.copy(alpha = 0f),
                            MaterialTheme.colorScheme.background.copy(alpha = 0.72f),
                        ),
                    ),
                ),
        )
        if (facts.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(EliteSpace.Md),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Lg),
            ) {
                facts.take(3).forEach { (label, value) ->
                    Column {
                        EliteSysLabel(label)
                        Text(value, style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
        if (rawId != 0) {
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.background.copy(alpha = 0.55f))
                    .clickable { playing = !playing },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = if (playing) "Pause motion" else "Play motion",
                    tint = MaterialTheme.colorScheme.primary,
                )
            }
        }
    }
}
