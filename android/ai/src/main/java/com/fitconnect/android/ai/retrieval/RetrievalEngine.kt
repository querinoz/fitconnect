package com.fitconnect.android.ai.retrieval

import com.fitconnect.android.ai.domain.KnowledgeSourceKind

data class KnowledgeDoc(
    val id: String,
    val title: String,
    val section: String,
    val body: String,
    val kind: KnowledgeSourceKind,
    val ownerId: String?,
    val version: String,
    val updatedAtEpochMs: Long,
    val permissions: Set<String>,
)

data class RetrievedChunk(
    val doc: KnowledgeDoc,
    val excerpt: String,
    val score: Double,
)

/**
 * Controlled retrieval with provenance. Does not embed raw health series.
 */
class RetrievalEngine {
    private val docs = mutableListOf<KnowledgeDoc>()

    fun upsert(doc: KnowledgeDoc) {
        docs.removeAll { it.id == doc.id }
        docs += doc
    }

    fun search(query: String, limit: Int = 5, allowedKinds: Set<KnowledgeSourceKind> = KnowledgeSourceKind.entries.toSet()): List<RetrievedChunk> {
        val q = query.lowercase()
        return docs
            .filter { it.kind in allowedKinds }
            .map { doc ->
                val hay = (doc.title + " " + doc.section + " " + doc.body).lowercase()
                val score = q.split(Regex("\\s+")).count { token -> token.length > 2 && hay.contains(token) }.toDouble()
                RetrievedChunk(doc, doc.body.take(280), score)
            }
            .filter { it.score > 0 }
            .sortedByDescending { it.score }
            .take(limit)
    }

    fun provenanceLine(chunk: RetrievedChunk): String =
        "source=${chunk.doc.kind} id=${chunk.doc.id} section=${chunk.doc.section} v=${chunk.doc.version} owner=${chunk.doc.ownerId}"
}
