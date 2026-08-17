package com.fitconnect.ascend.store

import com.fitconnect.ascend.domain.AscendPrefs
import com.fitconnect.ascend.domain.StoredEvent

interface AscendStore {
    fun events(userId: String): List<StoredEvent>
    /** @return false when [eventId] was already recorded for this user. */
    fun append(event: StoredEvent): Boolean
    fun prefs(userId: String): AscendPrefs
    fun savePrefs(userId: String, prefs: AscendPrefs)
    fun queued(userId: String): List<StoredEvent>
    fun enqueueOffline(event: StoredEvent)
    fun drainQueue(userId: String): List<StoredEvent>
}

class InMemoryAscendStore : AscendStore {
    private val log = LinkedHashMap<String, MutableList<StoredEvent>>()
    private val seen = HashSet<String>()
    private val prefMap = HashMap<String, AscendPrefs>()
    private val queue = LinkedHashMap<String, MutableList<StoredEvent>>()

    override fun events(userId: String): List<StoredEvent> =
        log[userId]?.toList().orEmpty()

    override fun append(event: StoredEvent): Boolean {
        val key = "${event.event.userId}|${event.event.eventId}"
        if (!seen.add(key)) return false
        log.getOrPut(event.event.userId) { mutableListOf() }.add(event)
        return true
    }

    override fun prefs(userId: String): AscendPrefs = prefMap[userId] ?: AscendPrefs()

    override fun savePrefs(userId: String, prefs: AscendPrefs) {
        prefMap[userId] = prefs
    }

    override fun queued(userId: String): List<StoredEvent> = queue[userId]?.toList().orEmpty()

    override fun enqueueOffline(event: StoredEvent) {
        queue.getOrPut(event.event.userId) { mutableListOf() }.add(event)
    }

    override fun drainQueue(userId: String): List<StoredEvent> {
        val pending = queue.remove(userId).orEmpty()
        return pending
    }
}
