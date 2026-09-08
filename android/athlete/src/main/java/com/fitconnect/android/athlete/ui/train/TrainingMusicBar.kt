package com.fitconnect.android.athlete.ui.train

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.connections.SpotifyNowPlaying
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

/** In-session music context — metadata/link only (no audio sync). */
@Composable
fun TrainingMusicBar(
    nowPlaying: SpotifyNowPlaying?,
    modifier: Modifier = Modifier,
) {
    if (nowPlaying == null) return
    val uriHandler = LocalUriHandler.current
    EosPremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("training_music_bar"),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(EliteSpace.Md),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "♫ Spotify",
                    style = MaterialTheme.typography.labelMedium,
                    color = EliteSurfaceColors.VOLTLINE.toColor(),
                )
                Text(nowPlaying.trackName, style = MaterialTheme.typography.titleSmall)
                Text(nowPlaying.artist, style = MaterialTheme.typography.bodySmall)
            }
            TextButton(onClick = { uriHandler.openUri(nowPlaying.spotifyUrl) }) {
                Text("Open Spotify")
            }
        }
    }
}
