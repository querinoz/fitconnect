package com.fitconnect.android.athlete.ui.profile

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.FileOutputStream

/**
 * Copies Photo Picker URIs into app-private files so profile media survives
 * without READ_MEDIA_* and without relying on persistable URI grants.
 */
object ProfileMediaStore {
    private const val DIR = "profile_media"
    private const val AVATAR = "avatar.jpg"
    private const val BANNER = "banner.jpg"

    fun avatarFile(context: Context): File =
        File(File(context.filesDir, DIR).also { it.mkdirs() }, AVATAR)

    fun bannerFile(context: Context): File =
        File(File(context.filesDir, DIR).also { it.mkdirs() }, BANNER)

    fun copyFromUri(context: Context, uri: Uri, target: File): String? {
        return runCatching {
            context.contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(target).use { output -> input.copyTo(output) }
            } ?: return null
            target.absolutePath
        }.getOrNull()
    }
}
