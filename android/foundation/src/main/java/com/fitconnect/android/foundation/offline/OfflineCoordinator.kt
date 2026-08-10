package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.network.ConnectivityMonitor

/**
 * Drains the sync queue when connectivity returns.
 * Default executor FAILS CLOSED — work is never acknowledged without a
 * registered handler. Silent discard is a correctness bug.
 */
interface OfflineCoordinator {
    suspend fun enqueue(work: SyncWork): AppResult<Unit>
    suspend fun flush(): Int
    suspend fun pendingCount(): Int
}

fun interface OfflineWorkExecutor {
    suspend fun execute(work: SyncWork): AppResult<Unit>
}

/** Fail-closed default: keeps items queued until a real handler is wired. */
class FailClosedOfflineExecutor(
    private val logger: Logger,
) : OfflineWorkExecutor {
    override suspend fun execute(work: SyncWork): AppResult<Unit> {
        logger.w("OfflineExecutor", "No handler for type=${work.type}; keeping queued")
        return AppResult.Err(AppError.Unexpected("No offline handler for ${work.type}"))
    }
}

/**
 * Registry executor: features register typed handlers. Unknown types fail closed.
 * Handlers must be idempotent (keyed by SyncWork.idempotencyKey).
 */
class RegistryOfflineExecutor(
    private val logger: Logger,
) : OfflineWorkExecutor {
    private val handlers =
        java.util.concurrent.ConcurrentHashMap<String, OfflineWorkExecutor>()

    fun register(type: String, handler: OfflineWorkExecutor) {
        handlers[type] = handler
    }

    override suspend fun execute(work: SyncWork): AppResult<Unit> {
        val handler = handlers[work.type]
        if (handler == null) {
            logger.w("OfflineExecutor", "No handler for type=${work.type}")
            return AppResult.Err(AppError.Unexpected("No offline handler for ${work.type}"))
        }
        return handler.execute(work)
    }
}

/** Test / demo handler that applies local-only mutations already reflected in UI. */
object AcknowledgingOfflineExecutor : OfflineWorkExecutor {
    override suspend fun execute(work: SyncWork): AppResult<Unit> = AppResult.Ok(Unit)
}

class DefaultOfflineCoordinator(
    private val queue: SyncQueue,
    private val connectivity: ConnectivityMonitor,
    private val featureFlags: FeatureFlagStore,
    private val logger: Logger,
    private val executor: OfflineWorkExecutor = FailClosedOfflineExecutor(logger),
    private val maxAttempts: Int = 8,
) : OfflineCoordinator {
    override suspend fun enqueue(work: SyncWork): AppResult<Unit> {
        if (!featureFlags.isEnabled(FeatureFlag.OFFLINE_SYNC)) {
            return executor.execute(work)
        }
        return queue.enqueue(work)
    }

    override suspend fun flush(): Int {
        if (!connectivity.online.value) return 0
        var done = 0
        queue.peek(50).forEach { work ->
            if (work.attempts >= maxAttempts) {
                logger.w("OfflineCoordinator", "dead-letter ${work.type} id=${work.id}")
                queue.acknowledge(work.id)
                return@forEach
            }
            when (val result = executor.execute(work)) {
                is AppResult.Ok -> {
                    queue.acknowledge(work.id)
                    done++
                }
                is AppResult.Err -> {
                    logger.w("OfflineCoordinator", "flush failed for ${work.type}: ${result.error}")
                }
            }
        }
        return done
    }

    override suspend fun pendingCount(): Int = queue.size()
}
