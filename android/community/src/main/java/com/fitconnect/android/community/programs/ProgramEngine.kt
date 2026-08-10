package com.fitconnect.android.community.programs

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.EnrollmentState
import com.fitconnect.android.community.domain.ProgramDefinition
import com.fitconnect.android.community.domain.ProgramEnrollment
import com.fitconnect.android.community.domain.ProgramStatus
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class ProgramProgress(
    val enrollment: ProgramEnrollment,
    val totalSessions: Int,
    val completedSessions: Int,
    val completionPercent: Int,
    val currentWeek: Int,
    val nextSession: String?,
)

/**
 * Structured training programs: lifecycle (draft → review → published →
 * unpublished/archived), immutable published versions (editing published
 * content creates a new draft version), cloning, enrollment with duplicate
 * guards, and progress that only aggregates — training data authority stays
 * with the Sports/Telemetry engines.
 */
interface ProgramEngine {
    // Authoring
    suspend fun upsertDraft(definition: ProgramDefinition): ProgramDefinition
    suspend fun submitForReview(programId: String, coachId: String): Boolean
    suspend fun publish(programId: String, coachId: String): Boolean
    suspend fun unpublish(programId: String, coachId: String): Boolean
    suspend fun archive(programId: String, coachId: String): Boolean
    suspend fun clone(programId: String, coachId: String): ProgramDefinition?
    /** Editing a published program forks a new draft version; published stays stable. */
    suspend fun editPublished(programId: String, coachId: String, mutate: (ProgramDefinition) -> ProgramDefinition): ProgramDefinition?

    // Catalog
    suspend fun published(): List<ProgramDefinition>
    suspend fun byCoach(coachId: String): List<ProgramDefinition>
    suspend fun get(programId: String): ProgramDefinition?
    suspend fun latestVersion(programId: String): ProgramDefinition?

    // Participation
    suspend fun enroll(athleteId: String, programId: String): ProgramEnrollment?
    suspend fun start(enrollmentId: String): Boolean
    suspend fun pause(enrollmentId: String): Boolean
    suspend fun resume(enrollmentId: String): Boolean
    suspend fun leave(enrollmentId: String): Boolean
    suspend fun restart(enrollmentId: String): ProgramEnrollment?
    suspend fun completeSession(enrollmentId: String, sessionId: String): Boolean
    suspend fun addCoachFeedback(enrollmentId: String, coachId: String, feedback: String): Boolean
    suspend fun enrollmentsOf(athleteId: String): List<ProgramEnrollment>
    suspend fun progress(enrollmentId: String): ProgramProgress?
}

class InMemoryProgramEngine(
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : ProgramEngine {
    private val mutex = Mutex()

    // Versions are separate records: key = "$programId@v$version".
    private val versions = linkedMapOf<String, ProgramDefinition>()
    private val enrollments = linkedMapOf<String, ProgramEnrollment>()
    private var enrollmentSeq = 0L

    private fun key(programId: String, version: Int) = "$programId@v$version"

    override suspend fun upsertDraft(definition: ProgramDefinition): ProgramDefinition = mutex.withLock {
        require(definition.status == ProgramStatus.DRAFT) { "upsertDraft requires DRAFT status" }
        val stamped = definition.copy(
            audit = definition.audit.copy(updatedAtEpochMs = nowProvider()),
        )
        versions[key(stamped.id, stamped.version)] = stamped
        stamped
    }

    override suspend fun submitForReview(programId: String, coachId: String): Boolean =
        transition(programId, coachId, from = setOf(ProgramStatus.DRAFT), to = ProgramStatus.REVIEW)

    override suspend fun publish(programId: String, coachId: String): Boolean =
        transition(programId, coachId, from = setOf(ProgramStatus.DRAFT, ProgramStatus.REVIEW), to = ProgramStatus.PUBLISHED)

    override suspend fun unpublish(programId: String, coachId: String): Boolean =
        transition(programId, coachId, from = setOf(ProgramStatus.PUBLISHED), to = ProgramStatus.UNPUBLISHED)

    override suspend fun archive(programId: String, coachId: String): Boolean =
        transition(programId, coachId, from = ProgramStatus.entries.toSet() - ProgramStatus.ARCHIVED, to = ProgramStatus.ARCHIVED)

    private suspend fun transition(programId: String, coachId: String, from: Set<ProgramStatus>, to: ProgramStatus): Boolean =
        mutex.withLock {
            val latest = latestVersionLocked(programId) ?: return@withLock false
            if (latest.coachId != coachId || latest.status !in from) return@withLock false
            versions[key(programId, latest.version)] = latest.copy(
                status = to,
                audit = latest.audit.copy(updatedAtEpochMs = nowProvider()),
            )
            true
        }

    override suspend fun clone(programId: String, coachId: String): ProgramDefinition? = mutex.withLock {
        val source = latestVersionLocked(programId) ?: return@withLock null
        val now = nowProvider()
        val clone = source.copy(
            id = "$programId-clone-$now",
            version = 1,
            coachId = coachId,
            title = "${source.title} (copy)",
            status = ProgramStatus.DRAFT,
            template = false,
            audit = Audit(now, now),
        )
        versions[key(clone.id, 1)] = clone
        clone
    }

    override suspend fun editPublished(
        programId: String,
        coachId: String,
        mutate: (ProgramDefinition) -> ProgramDefinition,
    ): ProgramDefinition? = mutex.withLock {
        val latest = latestVersionLocked(programId) ?: return@withLock null
        if (latest.coachId != coachId) return@withLock null
        if (latest.status != ProgramStatus.PUBLISHED) return@withLock null
        val now = nowProvider()
        val next = mutate(latest).copy(
            id = latest.id,
            version = latest.version + 1,
            status = ProgramStatus.DRAFT,
            audit = Audit(now, now),
        )
        versions[key(programId, next.version)] = next
        next
    }

    override suspend fun published(): List<ProgramDefinition> = mutex.withLock {
        versions.values
            .groupBy { it.id }
            .mapNotNull { (_, all) -> all.filter { it.status == ProgramStatus.PUBLISHED }.maxByOrNull { it.version } }
    }

    override suspend fun byCoach(coachId: String): List<ProgramDefinition> = mutex.withLock {
        versions.values
            .filter { it.coachId == coachId }
            .groupBy { it.id }
            .mapNotNull { (_, all) -> all.maxByOrNull { it.version } }
    }

    override suspend fun get(programId: String): ProgramDefinition? = mutex.withLock {
        latestVersionLocked(programId)
    }

    override suspend fun latestVersion(programId: String): ProgramDefinition? = get(programId)

    private fun latestVersionLocked(programId: String): ProgramDefinition? =
        versions.values.filter { it.id == programId }.maxByOrNull { it.version }

    // -- Participation ------------------------------------------------------

    override suspend fun enroll(athleteId: String, programId: String): ProgramEnrollment? = mutex.withLock {
        val program = versions.values
            .filter { it.id == programId && it.status == ProgramStatus.PUBLISHED }
            .maxByOrNull { it.version }
            ?: return@withLock null
        // Duplicate-enrollment guard: one live enrollment per athlete+program.
        enrollments.values.firstOrNull {
            it.athleteId == athleteId && it.programId == programId &&
                it.state in setOf(EnrollmentState.ENROLLED, EnrollmentState.ACTIVE, EnrollmentState.PAUSED)
        }?.let { return@withLock it } // idempotent
        val now = nowProvider()
        val enrollment = ProgramEnrollment(
            id = "enr-${++enrollmentSeq}",
            athleteId = athleteId,
            programId = programId,
            programVersion = program.version, // pinned: later published versions don't shift the athlete mid-program
            state = EnrollmentState.ENROLLED,
            audit = Audit(now, now),
        )
        enrollments[enrollment.id] = enrollment
        enrollment
    }

    override suspend fun start(enrollmentId: String): Boolean =
        setState(enrollmentId, from = setOf(EnrollmentState.ENROLLED), to = EnrollmentState.ACTIVE)

    override suspend fun pause(enrollmentId: String): Boolean =
        setState(enrollmentId, from = setOf(EnrollmentState.ACTIVE), to = EnrollmentState.PAUSED)

    override suspend fun resume(enrollmentId: String): Boolean =
        setState(enrollmentId, from = setOf(EnrollmentState.PAUSED), to = EnrollmentState.ACTIVE)

    override suspend fun leave(enrollmentId: String): Boolean =
        setState(
            enrollmentId,
            from = setOf(EnrollmentState.ENROLLED, EnrollmentState.ACTIVE, EnrollmentState.PAUSED),
            to = EnrollmentState.LEFT,
        )

    override suspend fun restart(enrollmentId: String): ProgramEnrollment? = mutex.withLock {
        val old = enrollments[enrollmentId] ?: return@withLock null
        val now = nowProvider()
        val fresh = old.copy(
            id = "enr-${++enrollmentSeq}",
            state = EnrollmentState.ACTIVE,
            completedSessionIds = emptySet(),
            currentWeek = 1,
            streakDays = 0,
            audit = Audit(now, now),
        )
        enrollments[fresh.id] = fresh
        fresh
    }

    private suspend fun setState(enrollmentId: String, from: Set<EnrollmentState>, to: EnrollmentState): Boolean =
        mutex.withLock {
            val enrollment = enrollments[enrollmentId] ?: return@withLock false
            if (enrollment.state !in from) return@withLock false
            enrollments[enrollmentId] = enrollment.copy(
                state = to,
                audit = enrollment.audit.copy(updatedAtEpochMs = nowProvider()),
            )
            true
        }

    override suspend fun completeSession(enrollmentId: String, sessionId: String): Boolean = mutex.withLock {
        val enrollment = enrollments[enrollmentId] ?: return@withLock false
        if (enrollment.state != EnrollmentState.ACTIVE) return@withLock false
        val program = versions[key(enrollment.programId, enrollment.programVersion)] ?: return@withLock false
        val validSession = program.weeks.any { week -> week.sessions.any { it.id == sessionId } }
        if (!validSession) return@withLock false
        if (sessionId in enrollment.completedSessionIds) return@withLock true // idempotent
        val completed = enrollment.completedSessionIds + sessionId
        val currentWeek = program.weeks
            .firstOrNull { week -> week.sessions.any { it.id !in completed } }
            ?.index
            ?: program.weeks.size
        val done = completed.size >= program.totalSessions
        enrollments[enrollmentId] = enrollment.copy(
            completedSessionIds = completed,
            currentWeek = currentWeek,
            state = if (done) EnrollmentState.COMPLETED else enrollment.state,
            audit = enrollment.audit.copy(updatedAtEpochMs = nowProvider()),
        )
        true
    }

    override suspend fun addCoachFeedback(enrollmentId: String, coachId: String, feedback: String): Boolean =
        mutex.withLock {
            val enrollment = enrollments[enrollmentId] ?: return@withLock false
            val program = versions[key(enrollment.programId, enrollment.programVersion)] ?: return@withLock false
            if (program.coachId != coachId || feedback.isBlank()) return@withLock false
            enrollments[enrollmentId] = enrollment.copy(
                coachFeedback = enrollment.coachFeedback + feedback.trim(),
                audit = enrollment.audit.copy(updatedAtEpochMs = nowProvider()),
            )
            true
        }

    override suspend fun enrollmentsOf(athleteId: String): List<ProgramEnrollment> = mutex.withLock {
        enrollments.values.filter { it.athleteId == athleteId }
    }

    override suspend fun progress(enrollmentId: String): ProgramProgress? = mutex.withLock {
        val enrollment = enrollments[enrollmentId] ?: return@withLock null
        val program = versions[key(enrollment.programId, enrollment.programVersion)] ?: return@withLock null
        val total = program.totalSessions
        val completed = enrollment.completedSessionIds.size
        val next = program.weeks
            .flatMap { it.sessions }
            .firstOrNull { it.id !in enrollment.completedSessionIds }
        ProgramProgress(
            enrollment = enrollment,
            totalSessions = total,
            completedSessions = completed,
            completionPercent = if (total == 0) 0 else (completed * 100) / total,
            currentWeek = enrollment.currentWeek,
            nextSession = next?.title,
        )
    }
}
