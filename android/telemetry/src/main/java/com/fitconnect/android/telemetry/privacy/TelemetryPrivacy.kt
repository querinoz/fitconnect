package com.fitconnect.android.telemetry.privacy

import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryClock
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

enum class ConsentScope { PROVIDER_CONNECTION, COACH_SHARING, ANALYTICS }

data class ConsentRecord(
    val athleteId: String,
    val scope: ConsentScope,
    val target: String,
    val granted: Boolean,
    val atEpochMs: Long,
)

data class AuditEntry(
    val actorId: String,
    val athleteId: String,
    val action: String,
    val atEpochMs: Long,
)

/**
 * Consent + access control for health data. Every read on behalf of a coach
 * goes through [coachMayRead]; every state change is audit-trailed. Analytics
 * consent is separate from provider consent (data minimization).
 */
class TelemetryPrivacyManager(
    private val store: TelemetryStore,
    private val clock: TelemetryClock,
) {
    private val mutex = Mutex()
    private val consents = mutableListOf<ConsentRecord>()
    private val audit = mutableListOf<AuditEntry>()
    private val sharedMetrics = mutableMapOf<String, MutableSet<MetricType>>() // athleteId:coachId -> metrics

    private fun shareKey(athleteId: String, coachId: String) = "$athleteId:$coachId"

    suspend fun grantProviderConsent(athleteId: String, provider: ProviderId) = mutex.withLock {
        consents += ConsentRecord(athleteId, ConsentScope.PROVIDER_CONNECTION, provider.name, true, clock.nowEpochMs())
        audit += AuditEntry(athleteId, athleteId, "consent_granted:${provider.name}", clock.nowEpochMs())
    }

    suspend fun revokeProviderConsent(athleteId: String, provider: ProviderId) = mutex.withLock {
        consents += ConsentRecord(athleteId, ConsentScope.PROVIDER_CONNECTION, provider.name, false, clock.nowEpochMs())
        audit += AuditEntry(athleteId, athleteId, "consent_revoked:${provider.name}", clock.nowEpochMs())
    }

    suspend fun hasProviderConsent(athleteId: String, provider: ProviderId): Boolean = mutex.withLock {
        consents.lastOrNull {
            it.athleteId == athleteId && it.scope == ConsentScope.PROVIDER_CONNECTION && it.target == provider.name
        }?.granted == true
    }

    /**
     * Grant coach share. [actorId] must equal [athleteId] — only the athlete
     * (or a future server-side admin path) may mutate their sharing consent.
     */
    suspend fun shareWithCoach(
        athleteId: String,
        coachId: String,
        metrics: Set<MetricType>,
        actorId: String,
    ): Boolean = mutex.withLock {
        if (actorId != athleteId) {
            audit += AuditEntry(actorId, athleteId, "coach_share_denied:actor_mismatch", clock.nowEpochMs())
            return@withLock false
        }
        sharedMetrics.getOrPut(shareKey(athleteId, coachId)) { mutableSetOf() }.addAll(metrics)
        consents += ConsentRecord(athleteId, ConsentScope.COACH_SHARING, coachId, true, clock.nowEpochMs())
        audit += AuditEntry(actorId, athleteId, "coach_share_granted:$coachId", clock.nowEpochMs())
        true
    }

    suspend fun revokeCoachSharing(athleteId: String, coachId: String) = mutex.withLock {
        sharedMetrics.remove(shareKey(athleteId, coachId))
        consents += ConsentRecord(athleteId, ConsentScope.COACH_SHARING, coachId, false, clock.nowEpochMs())
        audit += AuditEntry(athleteId, athleteId, "coach_share_revoked:$coachId", clock.nowEpochMs())
    }

    suspend fun coachMayRead(coachId: String, athleteId: String, metric: MetricType): Boolean = mutex.withLock {
        audit += AuditEntry(coachId, athleteId, "coach_read_check:${metric.name}", clock.nowEpochMs())
        sharedMetrics[shareKey(athleteId, coachId)]?.contains(metric) == true
    }

    suspend fun sharedMetricsFor(coachId: String, athleteId: String): Set<MetricType> = mutex.withLock {
        sharedMetrics[shareKey(athleteId, coachId)].orEmpty().toSet()
    }

    /** Deletes everything imported from a provider (GDPR-style source deletion). */
    suspend fun deleteProviderData(athleteId: String, provider: ProviderId): Int {
        val deleted = store.deleteByProvider(athleteId, provider)
        mutex.withLock {
            audit += AuditEntry(athleteId, athleteId, "provider_data_deleted:${provider.name}:$deleted", clock.nowEpochMs())
        }
        return deleted
    }

    suspend fun auditTrail(athleteId: String): List<AuditEntry> = mutex.withLock {
        audit.filter { it.athleteId == athleteId }.toList()
    }
}
