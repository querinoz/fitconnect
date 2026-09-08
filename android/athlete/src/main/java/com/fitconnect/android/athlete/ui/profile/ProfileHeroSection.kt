package com.fitconnect.android.athlete.ui.profile

import android.graphics.BitmapFactory
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material.icons.outlined.DirectionsRun
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteLocalImage
import com.fitconnect.android.designui.components.EliteLocalImageExists
import com.fitconnect.android.designui.components.EliteTierBadge
import com.fitconnect.android.designui.identity.PatentRank
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility
import java.io.File

private val BannerHeight = 168.dp
private val AvatarSize = 112.dp
private val AvatarRing = 4.dp

/**
 * Marina-reference profile hero: full-bleed banner + Voltline-ring avatar,
 * with Photo Picker slots for both (no READ_MEDIA_*).
 */
@Composable
fun ProfileHeroSection(
    userId: String,
    displayName: String,
    level: Int,
    totalXp: Int,
    rank: PatentRank?,
    email: String?,
    roleLabel: String = "ATHLETE",
    avatarPath: String?,
    bannerPath: String?,
    onAvatarPathChanged: (String) -> Unit,
    onBannerPathChanged: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val floor = EliteSurfaceColors.FLOOR.toColor()

    val pickAvatar = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia(),
    ) { uri: Uri? ->
        uri ?: return@rememberLauncherForActivityResult
        ProfileMediaStore.copyFromUri(
            context,
            uri,
            ProfileMediaStore.avatarFile(context),
        )?.let(onAvatarPathChanged)
    }
    val pickBanner = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia(),
    ) { uri: Uri? ->
        uri ?: return@rememberLauncherForActivityResult
        ProfileMediaStore.copyFromUri(
            context,
            uri,
            ProfileMediaStore.bannerFile(context),
        )?.let(onBannerPathChanged)
    }

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(BannerHeight + AvatarSize / 2)
                .testTag("profile_hero_media"),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(BannerHeight)
                    .align(Alignment.TopCenter)
                    .clip(RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp))
                    .clickable {
                        pickBanner.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
                        )
                    }
                    .semantics { contentDescription = "Change profile banner" }
                    .testTag("profile_banner"),
            ) {
                ProfileBitmapOrDrawable(
                    path = bannerPath,
                    drawableName = "fc_profile_banner",
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(floor.copy(alpha = 0.28f)),
                )
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(EliteSpace.Sm)
                        .sizeIn(
                            minWidth = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                            minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                        )
                        .clip(CircleShape)
                        .background(floor.copy(alpha = 0.72f))
                        .border(1.dp, volt.copy(alpha = 0.55f), CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Outlined.CameraAlt,
                        contentDescription = null,
                        tint = volt,
                        modifier = Modifier.size(20.dp),
                    )
                }
            }

            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .offset(y = (-4).dp)
                    .size(AvatarSize)
                    .border(AvatarRing, volt, CircleShape)
                    .padding(AvatarRing)
                    .clip(CircleShape)
                    .background(EliteSurfaceColors.MOLD_SURFACE.toColor())
                    .clickable {
                        pickAvatar.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
                        )
                    }
                    .semantics { contentDescription = "Change profile photo" }
                    .testTag("profile_avatar"),
                contentAlignment = Alignment.Center,
            ) {
                when {
                    !avatarPath.isNullOrBlank() && File(avatarPath).exists() -> {
                        val bmp = remember(avatarPath) {
                            BitmapFactory.decodeFile(avatarPath)?.asImageBitmap()
                        }
                        if (bmp != null) {
                            Image(
                                bitmap = bmp,
                                contentDescription = displayName,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop,
                            )
                        } else {
                            ProfileAvatarFallback(userId = userId, name = displayName)
                        }
                    }
                    else -> ProfileAvatarFallback(userId = userId, name = displayName)
                }
                EliteTierBadge(
                    rank = rank,
                    modifier = Modifier.align(Alignment.BottomEnd),
                )
            }
        }

        Spacer(modifier = Modifier.height(EliteSpace.Sm))

        Text(
            text = displayName,
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("elite_player_card"),
        )

        Spacer(modifier = Modifier.height(EliteSpace.Xs))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = EliteSpace.Md),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(volt)
                    .padding(horizontal = EliteSpace.Sm, vertical = EliteSpace.Xxs)
                    .testTag("profile_role_pill"),
            ) {
                Icon(
                    imageVector = Icons.Outlined.DirectionsRun,
                    contentDescription = null,
                    tint = floor,
                    modifier = Modifier.size(14.dp),
                )
                Spacer(modifier = Modifier.size(EliteSpace.Xxs))
                Text(
                    text = roleLabel,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = floor,
                )
            }
            if (!email.isNullOrBlank()) {
                Spacer(modifier = Modifier.size(EliteSpace.Sm))
                Text(
                    text = email,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .weight(1f, fill = false)
                        .testTag("profile_email"),
                )
            }
        }

        Spacer(modifier = Modifier.height(EliteSpace.Xs))
        Text(
            text = "LEVEL ${level.toString().padStart(2, '0')} · $totalXp XP",
            style = MaterialTheme.typography.labelMedium,
            color = volt,
            modifier = Modifier.testTag("profile_level_line"),
        )
    }
}

@Composable
private fun ProfileAvatarFallback(userId: String, name: String) {
    // Silhouette placeholder matching Marina reference (not Hexatar geometry).
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(EliteSurfaceColors.MOLD_SURFACE.toColor())
            .semantics { contentDescription = name.ifBlank { userId } },
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = Icons.Outlined.Person,
            contentDescription = null,
            tint = EliteSurfaceColors.VOLTLINE.toColor(),
            modifier = Modifier.size(56.dp),
        )
    }
}

@Composable
private fun ProfileBitmapOrDrawable(
    path: String?,
    drawableName: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
) {
    when {
        !path.isNullOrBlank() && File(path).exists() -> {
            val bmp = remember(path) {
                BitmapFactory.decodeFile(path)?.asImageBitmap()
            }
            if (bmp != null) {
                Image(
                    bitmap = bmp,
                    contentDescription = contentDescription,
                    modifier = modifier,
                    contentScale = ContentScale.Crop,
                )
            } else if (EliteLocalImageExists(drawableName)) {
                EliteLocalImage(
                    name = drawableName,
                    contentDescription = contentDescription,
                    modifier = modifier,
                )
            } else {
                Box(modifier = modifier.background(EliteSurfaceColors.FLOOR.toColor()))
            }
        }
        EliteLocalImageExists(drawableName) -> EliteLocalImage(
            name = drawableName,
            contentDescription = contentDescription,
            modifier = modifier,
        )
        else -> Box(modifier = modifier.background(EliteSurfaceColors.FLOOR.toColor()))
    }
}
