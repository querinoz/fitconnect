package com.fitconnect.android.community.distribution

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Outbound social distribution. FitConnect post is source of truth;
 * per-platform publish is isolated (one failure must not fail FitConnect).
 */

enum class DistributionPlatform {
    FITCONNECT,
    INSTAGRAM,
    FACEBOOK,
    X,
    TIKTOK,
    LINKEDIN,
    THREADS,
    YOUTUBE,
    PINTEREST,
    BLUESKY,
    ZAPIER_GENERIC,
}

enum class DistributionStatus {
    QUEUED,
    PROCESSING,
    PUBLISHED,
    FAILED,
    RETRY,
}

data class PlatformCapabilities(
    val platform: DistributionPlatform,
    val text: Boolean,
    val image: Boolean,
    val video: Boolean,
    val link: Boolean,
    val activity: Boolean,
    val musicMetadata: Boolean,
    val location: Boolean,
    val notes: String = "",
)

data class DistributionJob(
    val id: String,
    val postId: String,
    val authorId: String,
    val platform: DistributionPlatform,
    val idempotencyKey: String,
    val status: DistributionStatus,
    val attempt: Int,
    val maxAttempts: Int = 5,
    val lastError: String? = null,
    val externalId: String? = null,
    val createdAtEpochMs: Long,
    val updatedAtEpochMs: Long,
)

data class FormattedPayload(
    val platform: DistributionPlatform,
    val caption: String,
    val mediaUrls: List<String> = emptyList(),
    val link: String? = null,
    val hashtags: List<String> = emptyList(),
    val musicUrl: String? = null,
    val locationLabel: String? = null,
)

interface PlatformFormatter {
    fun format(
        platform: DistributionPlatform,
        text: String,
        hashtags: List<String>,
        mediaUrls: List<String>,
        link: String?,
        musicUrl: String?,
        locationLabel: String?,
    ): FormattedPayload
}

class DefaultPlatformFormatter : PlatformFormatter {
    override fun format(
        platform: DistributionPlatform,
        text: String,
        hashtags: List<String>,
        mediaUrls: List<String>,
        link: String?,
        musicUrl: String?,
        locationLabel: String?,
    ): FormattedPayload {
        val tags = hashtags.joinToString(" ") { if (it.startsWith("#")) it else "#$it" }
        val caption = when (platform) {
            DistributionPlatform.X -> text.take(240).let { if (tags.isBlank()) it else "$it\n$tags".take(280) }
            DistributionPlatform.LINKEDIN -> buildString {
                append(text)
                if (locationLabel != null) append("\n\n📍 ").append(locationLabel)
                if (musicUrl != null) append("\n♫ ").append(musicUrl)
                if (tags.isNotBlank()) append("\n\n").append(tags)
            }
            DistributionPlatform.INSTAGRAM, DistributionPlatform.TIKTOK ->
                listOf(text, tags, musicUrl?.let { "♫ $it" }, locationLabel?.let { "📍 $it" })
                    .filterNotNull()
                    .filter { it.isNotBlank() }
                    .joinToString("\n\n")
            else -> listOf(text, tags, link, musicUrl).filterNotNull().filter { it.isNotBlank() }.joinToString("\n\n")
        }
        return FormattedPayload(
            platform = platform,
            caption = caption,
            mediaUrls = mediaUrls,
            link = link,
            hashtags = hashtags,
            musicUrl = musicUrl,
            locationLabel = locationLabel,
        )
    }
}

interface DistributionPublisher {
    suspend fun publish(job: DistributionJob, payload: FormattedPayload): Result<String>
}

/** Local/demo publisher — records success without calling external networks. */
class LocalDemoDistributionPublisher : DistributionPublisher {
    override suspend fun publish(job: DistributionJob, payload: FormattedPayload): Result<String> =
        Result.success("local-${job.platform.name.lowercase()}-${job.postId}")
}

interface DistributionEngine {
    suspend fun enqueue(
        postId: String,
        authorId: String,
        platforms: List<DistributionPlatform>,
        idempotencyKey: String,
    ): List<DistributionJob>

    suspend fun processNext(limit: Int = 10): List<DistributionJob>
    suspend fun jobsForPost(postId: String): List<DistributionJob>
    suspend fun retry(jobId: String): DistributionJob?
    fun capabilities(): List<PlatformCapabilities>
}

class InMemoryDistributionEngine(
    private val publisher: DistributionPublisher = LocalDemoDistributionPublisher(),
    private val formatter: PlatformFormatter = DefaultPlatformFormatter(),
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val payloadProvider: (String) -> FormattedPayload = { postId ->
        FormattedPayload(DistributionPlatform.FITCONNECT, caption = postId)
    },
) : DistributionEngine {
    private val mutex = Mutex()
    private val jobs = linkedMapOf<String, DistributionJob>()
    private var seq = 0L

    override fun capabilities(): List<PlatformCapabilities> = PLATFORM_CAPABILITIES

    override suspend fun enqueue(
        postId: String,
        authorId: String,
        platforms: List<DistributionPlatform>,
        idempotencyKey: String,
    ): List<DistributionJob> = mutex.withLock {
        val now = nowProvider()
        platforms.distinct().map { platform ->
            val key = "$authorId:$idempotencyKey:${platform.name}"
            jobs.values.firstOrNull { it.idempotencyKey == key }?.let { return@map it }
            val job = DistributionJob(
                id = "dist-${++seq}",
                postId = postId,
                authorId = authorId,
                platform = platform,
                idempotencyKey = key,
                status = if (platform == DistributionPlatform.FITCONNECT) {
                    DistributionStatus.PUBLISHED
                } else {
                    DistributionStatus.QUEUED
                },
                attempt = if (platform == DistributionPlatform.FITCONNECT) 1 else 0,
                createdAtEpochMs = now,
                updatedAtEpochMs = now,
                externalId = if (platform == DistributionPlatform.FITCONNECT) postId else null,
            )
            jobs[job.id] = job
            job
        }
    }

    override suspend fun processNext(limit: Int): List<DistributionJob> = mutex.withLock {
        val due = jobs.values
            .filter { it.status == DistributionStatus.QUEUED || it.status == DistributionStatus.RETRY }
            .take(limit)
        val out = mutableListOf<DistributionJob>()
        for (job in due) {
            val processing = job.copy(
                status = DistributionStatus.PROCESSING,
                attempt = job.attempt + 1,
                updatedAtEpochMs = nowProvider(),
            )
            jobs[job.id] = processing
            val caps = PLATFORM_CAPABILITIES.first { it.platform == job.platform }
            if (!caps.text && !caps.image && !caps.video) {
                val failed = processing.copy(
                    status = DistributionStatus.FAILED,
                    lastError = "unsupported_platform",
                    updatedAtEpochMs = nowProvider(),
                )
                jobs[job.id] = failed
                out += failed
                continue
            }
            val payload = formatter.format(
                platform = job.platform,
                text = payloadProvider(job.postId).caption,
                hashtags = emptyList(),
                mediaUrls = emptyList(),
                link = null,
                musicUrl = null,
                locationLabel = null,
            )
            val result = publisher.publish(processing, payload)
            val next = result.fold(
                onSuccess = { ext ->
                    processing.copy(
                        status = DistributionStatus.PUBLISHED,
                        externalId = ext,
                        lastError = null,
                        updatedAtEpochMs = nowProvider(),
                    )
                },
                onFailure = { err ->
                    val retry = processing.attempt < processing.maxAttempts
                    processing.copy(
                        status = if (retry) DistributionStatus.RETRY else DistributionStatus.FAILED,
                        lastError = err.message ?: "publish_failed",
                        updatedAtEpochMs = nowProvider(),
                    )
                },
            )
            jobs[job.id] = next
            out += next
        }
        out
    }

    override suspend fun jobsForPost(postId: String): List<DistributionJob> = mutex.withLock {
        jobs.values.filter { it.postId == postId }
    }

    override suspend fun retry(jobId: String): DistributionJob? = mutex.withLock {
        val job = jobs[jobId] ?: return@withLock null
        if (job.status != DistributionStatus.FAILED && job.status != DistributionStatus.RETRY) return@withLock job
        val next = job.copy(status = DistributionStatus.RETRY, updatedAtEpochMs = nowProvider())
        jobs[jobId] = next
        next
    }

    companion object {
        val PLATFORM_CAPABILITIES: List<PlatformCapabilities> = listOf(
            PlatformCapabilities(DistributionPlatform.FITCONNECT, true, true, true, true, true, true, true, "Canonical SoT"),
            PlatformCapabilities(DistributionPlatform.INSTAGRAM, true, true, true, false, false, true, true, "Zapier / Meta Business"),
            PlatformCapabilities(DistributionPlatform.FACEBOOK, true, true, true, true, false, true, true, "Zapier / Meta"),
            PlatformCapabilities(DistributionPlatform.X, true, true, true, true, false, true, false, "Character limits"),
            PlatformCapabilities(DistributionPlatform.TIKTOK, false, false, true, true, false, true, false, "Video-first"),
            PlatformCapabilities(DistributionPlatform.LINKEDIN, true, true, true, true, false, false, false, "Professional tone"),
            PlatformCapabilities(DistributionPlatform.THREADS, true, true, true, true, false, true, false, "Zapier where available"),
            PlatformCapabilities(DistributionPlatform.YOUTUBE, false, false, true, true, false, true, false, "Long-form video"),
            PlatformCapabilities(DistributionPlatform.PINTEREST, true, true, false, true, false, false, true, "Image + link"),
            PlatformCapabilities(DistributionPlatform.BLUESKY, true, true, false, true, false, true, false, "AT Protocol"),
            PlatformCapabilities(DistributionPlatform.ZAPIER_GENERIC, true, true, true, true, true, true, true, "Orchestration only"),
        )
    }
}
