package com.fitconnect.android.community.media

import com.fitconnect.android.community.domain.MediaAttachment
import com.fitconnect.android.community.domain.MediaKind
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

enum class UploadState { QUEUED, UPLOADING, DONE, FAILED, CANCELLED }

data class MediaUpload(
    val attachment: MediaAttachment,
    val state: UploadState,
    val progressPct: Int,
    val attempts: Int,
    val lastError: String? = null,
)

/**
 * Binary transport abstraction — swap the CDN/storage backend without touching
 * the queue. Metadata and binary media are strictly separated: the domain only
 * ever stores [MediaAttachment] metadata.
 */
interface MediaTransport {
    /** Returns the remote URL + thumbnail URL, or throws on failure. */
    suspend fun upload(attachment: MediaAttachment, onProgress: (Int) -> Unit): Pair<String, String?>
}

/** Local stand-in transport until a real CDN backend is configured. */
class LoopbackMediaTransport : MediaTransport {
    override suspend fun upload(attachment: MediaAttachment, onProgress: (Int) -> Unit): Pair<String, String?> {
        onProgress(100)
        val url = "media://cdn/${attachment.id}"
        val thumb = if (attachment.kind == MediaKind.VIDEO || attachment.kind == MediaKind.IMAGE) "$url/thumb" else null
        return url to thumb
    }
}

/**
 * Upload queue: enqueue, process with retry + backoff-count, cancel, offline
 * queue semantics (uploads stay QUEUED until [processQueue] runs with network),
 * failure recovery via [retryFailed]. Observable for progress UI.
 */
class MediaPipeline(
    private val transport: MediaTransport,
    private val maxAttempts: Int = 3,
) {
    private val mutex = Mutex()
    private val _uploads = MutableStateFlow<Map<String, MediaUpload>>(emptyMap())
    val uploads: StateFlow<Map<String, MediaUpload>> = _uploads.asStateFlow()

    suspend fun enqueue(attachment: MediaAttachment): MediaUpload = mutex.withLock {
        val upload = MediaUpload(attachment, UploadState.QUEUED, progressPct = 0, attempts = 0)
        publish(upload)
        upload
    }

    suspend fun cancel(attachmentId: String): Boolean = mutex.withLock {
        val current = _uploads.value[attachmentId] ?: return@withLock false
        if (current.state == UploadState.DONE) return@withLock false
        publish(current.copy(state = UploadState.CANCELLED))
        true
    }

    suspend fun retryFailed(): List<String> = mutex.withLock {
        val failed = _uploads.value.values.filter { it.state == UploadState.FAILED && it.attempts < maxAttempts }
        failed.forEach { publish(it.copy(state = UploadState.QUEUED)) }
        failed.map { it.attachment.id }
    }

    /** Processes queued uploads. Call when online (foreground or background worker). */
    suspend fun processQueue(): List<MediaUpload> {
        val queued = mutex.withLock {
            _uploads.value.values.filter { it.state == UploadState.QUEUED }
        }
        return queued.map { upload -> process(upload) }
    }

    private suspend fun process(upload: MediaUpload): MediaUpload {
        mutex.withLock { publish(upload.copy(state = UploadState.UPLOADING, attempts = upload.attempts + 1)) }
        return try {
            val (url, thumb) = transport.upload(upload.attachment) { pct ->
                _uploads.value = _uploads.value + (
                    upload.attachment.id to
                        (_uploads.value.getValue(upload.attachment.id)).copy(progressPct = pct)
                    )
            }
            val done = upload.copy(
                attachment = upload.attachment.copy(remoteUrl = url, thumbnailUrl = thumb, localUri = null),
                state = UploadState.DONE,
                progressPct = 100,
                attempts = upload.attempts + 1,
            )
            mutex.withLock { publish(done) }
            done
        } catch (e: Exception) {
            val attempts = upload.attempts + 1
            val failed = upload.copy(
                state = if (attempts >= maxAttempts) UploadState.FAILED else UploadState.QUEUED,
                attempts = attempts,
                lastError = e.message,
            )
            mutex.withLock { publish(failed) }
            failed
        }
    }

    private fun publish(upload: MediaUpload) {
        _uploads.value = _uploads.value + (upload.attachment.id to upload)
    }
}
