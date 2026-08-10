package com.fitconnect.android.community.moderation

import com.fitconnect.android.community.domain.ModerationAction
import com.fitconnect.android.community.domain.ModerationActionKind
import com.fitconnect.android.community.domain.ModerationStatus
import com.fitconnect.android.community.domain.Report
import com.fitconnect.android.community.domain.ReportReason
import com.fitconnect.android.community.domain.ReportTargetKind
import com.fitconnect.android.community.safety.ActionRateLimiter
import com.fitconnect.android.community.safety.CommunityAction
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Interface for future moderation services (human review queues, AI
 * classification). This phase ships the local review queue only — the correct
 * seams exist so an external service can replace it without touching callers.
 */
interface ModerationService {
    suspend fun report(reporterId: String, targetKind: ReportTargetKind, targetId: String, reason: ReportReason, note: String? = null): Report?
    suspend fun pending(): List<Report>
    suspend fun review(reportId: String, moderatorId: String, action: ModerationActionKind): ModerationAction?
    suspend fun appeal(reportId: String): Boolean
    suspend fun isHidden(targetKind: ReportTargetKind, targetId: String): Boolean
}

class LocalModerationQueue(
    private val rateLimiter: ActionRateLimiter,
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : ModerationService {
    private val mutex = Mutex()
    private val reports = linkedMapOf<String, Report>()
    private val actions = mutableListOf<ModerationAction>()
    private val hidden = mutableSetOf<String>()
    private var sequence = 0L

    override suspend fun report(
        reporterId: String,
        targetKind: ReportTargetKind,
        targetId: String,
        reason: ReportReason,
        note: String?,
    ): Report? = mutex.withLock {
        // Repeated-report abuse guard: same reporter+target collapses to one open report.
        reports.values.firstOrNull {
            it.reporterId == reporterId && it.targetKind == targetKind && it.targetId == targetId &&
                it.status == ModerationStatus.PENDING
        }?.let { return@withLock it }
        if (!rateLimiter.tryAcquire(reporterId, CommunityAction.REPORT)) return@withLock null
        val report = Report(
            id = "rep-${++sequence}",
            reporterId = reporterId,
            targetKind = targetKind,
            targetId = targetId,
            reason = reason,
            note = note,
            status = ModerationStatus.PENDING,
            atEpochMs = nowProvider(),
        )
        reports[report.id] = report
        report
    }

    override suspend fun pending(): List<Report> = mutex.withLock {
        reports.values.filter { it.status == ModerationStatus.PENDING }
    }

    override suspend fun review(reportId: String, moderatorId: String, action: ModerationActionKind): ModerationAction? =
        mutex.withLock {
            val report = reports[reportId] ?: return@withLock null
            if (report.status != ModerationStatus.PENDING && report.status != ModerationStatus.APPEALED) return@withLock null
            val record = ModerationAction(
                id = "act-${actions.size + 1}",
                reportId = reportId,
                moderatorId = moderatorId,
                kind = action,
                atEpochMs = nowProvider(),
            )
            actions.add(record)
            reports[reportId] = report.copy(
                status = if (action == ModerationActionKind.NO_ACTION) ModerationStatus.DISMISSED else ModerationStatus.ACTIONED,
            )
            if (action in setOf(ModerationActionKind.HIDE_CONTENT, ModerationActionKind.REMOVE_CONTENT)) {
                hidden.add("${report.targetKind}:${report.targetId}")
            }
            record
        }

    override suspend fun appeal(reportId: String): Boolean = mutex.withLock {
        val report = reports[reportId] ?: return@withLock false
        if (report.status != ModerationStatus.ACTIONED) return@withLock false
        reports[reportId] = report.copy(status = ModerationStatus.APPEALED)
        true
    }

    override suspend fun isHidden(targetKind: ReportTargetKind, targetId: String): Boolean = mutex.withLock {
        "$targetKind:$targetId" in hidden
    }
}
