package com.fitconnect.android.sports.registry

import com.fitconnect.android.sports.domain.SportCategory
import com.fitconnect.android.sports.domain.SportDefinition
import com.fitconnect.android.sports.domain.SportId
import java.util.concurrent.ConcurrentHashMap

data class RegistryEntry(
    val definition: SportDefinition,
    val registeredAtEpochMs: Long,
    val pluginId: String? = null,
)

sealed class RegistryValidation {
    data object Ok : RegistryValidation()
    data class Err(val reasons: List<String>) : RegistryValidation()
}

/**
 * Sports Registry — registration, discovery, versioning, deprecation,
 * capabilities, dependencies, validation, future plugin support.
 */
interface SportsRegistry {
    fun register(definition: SportDefinition, pluginId: String? = null): RegistryValidation
    fun deprecate(id: SportId): Boolean
    fun get(id: SportId): SportDefinition?
    fun require(id: SportId): SportDefinition
    fun all(includeDeprecated: Boolean = false): List<SportDefinition>
    fun byCategory(category: SportCategory): List<SportDefinition>
    fun discover(query: String): List<SportDefinition>
    fun capabilities(id: SportId): Set<String>
    fun dependencies(id: SportId): Set<SportId>
    fun version(id: SportId): Int?
    fun validate(definition: SportDefinition): RegistryValidation
    fun snapshotJson(): String
}

class DefaultSportsRegistry : SportsRegistry {
    private val entries = ConcurrentHashMap<String, RegistryEntry>()

    override fun validate(definition: SportDefinition): RegistryValidation {
        val reasons = mutableListOf<String>()
        if (definition.displayName.isBlank()) reasons += "displayName blank"
        if (definition.requiredMetrics.any { it.key.isBlank() }) reasons += "blank required metric key"
        definition.dependencies.forEach { dep ->
            if (!entries.containsKey(dep.value) && dep != definition.id) {
                reasons += "missing dependency ${dep.value}"
            }
        }
        return if (reasons.isEmpty()) RegistryValidation.Ok else RegistryValidation.Err(reasons)
    }

    override fun register(definition: SportDefinition, pluginId: String?): RegistryValidation {
        when (val v = validate(definition)) {
            is RegistryValidation.Err -> return v
            RegistryValidation.Ok -> Unit
        }
        entries[definition.id.value] = RegistryEntry(
            definition = definition,
            registeredAtEpochMs = System.currentTimeMillis(),
            pluginId = pluginId,
        )
        return RegistryValidation.Ok
    }

    override fun deprecate(id: SportId): Boolean {
        val current = entries[id.value] ?: return false
        entries[id.value] = current.copy(definition = current.definition.copy(deprecated = true))
        return true
    }

    override fun get(id: SportId): SportDefinition? = entries[id.value]?.definition

    override fun require(id: SportId): SportDefinition =
        get(id) ?: get(SportId.OTHER)
            ?: error("Sports registry empty — seed catalog not loaded")

    override fun all(includeDeprecated: Boolean): List<SportDefinition> =
        entries.values.map { it.definition }
            .filter { includeDeprecated || !it.deprecated }
            .sortedBy { it.displayName }

    override fun byCategory(category: SportCategory): List<SportDefinition> =
        all().filter { it.category == category }

    override fun discover(query: String): List<SportDefinition> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return all()
        return all().filter {
            it.displayName.lowercase().contains(q) ||
                it.id.value.contains(q) ||
                it.stravaType?.lowercase()?.contains(q) == true ||
                it.category.name.lowercase().contains(q)
        }
    }

    override fun capabilities(id: SportId): Set<String> = get(id)?.capabilities.orEmpty()

    override fun dependencies(id: SportId): Set<SportId> = get(id)?.dependencies.orEmpty()

    override fun version(id: SportId): Int? = get(id)?.version

    override fun snapshotJson(): String = buildString {
        append('[')
        all(includeDeprecated = true).forEachIndexed { index, def ->
            if (index > 0) append(',')
            append('{')
            append("\"id\":\"${def.id.value}\",")
            append("\"name\":\"${def.displayName}\",")
            append("\"version\":${def.version},")
            append("\"deprecated\":${def.deprecated}")
            append('}')
        }
        append(']')
    }
}

/** Facade kept for Athlete/Coach DI — discovers profiles via registry. */
interface SportsEngine {
    fun all(): List<SportDefinition>
    fun profile(id: SportId): SportDefinition
    fun metricsFor(ids: List<SportId>): List<com.fitconnect.android.sports.domain.MetricDefinition>
    fun registry(): SportsRegistry
}

class RegistrySportsEngine(
    private val registry: SportsRegistry,
) : SportsEngine {
    override fun all(): List<SportDefinition> = registry.all()
    override fun profile(id: SportId): SportDefinition = registry.require(id)
    override fun metricsFor(ids: List<SportId>): List<com.fitconnect.android.sports.domain.MetricDefinition> =
        ids.flatMap { profile(it).allMetrics() }.distinctBy { it.key }
    override fun registry(): SportsRegistry = registry
}
