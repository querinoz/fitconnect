package com.fitconnect.android.designui.identity

/**
 * Proposed patent thresholds — not calibrated. Swap this object from remote config later.
 * Losing consistency freezes the next grade; it never removes an earned patent.
 */
data class PatentThresholds(
    val iniciadoSessions: Int = 10,
    val ativoStreakDays: Int = 21,
    val constanteMonths: Int = 3,
    val constanteConsistencyPct: Int = 60,
    val forteMonths: Int = 6,
    val fortePrCount: Int = 3,
    val eliteMonths: Int = 12,
    val eliteConsistencyPct: Int = 75,
    val lendaYears: Int = 2,
)

data class PatentSignals(
    val sessionCount: Int,
    val streakDays: Int,
    val consistencyPct: Int? = null,
    val monthsActive: Int? = null,
    val prCount: Int = 0,
    val uninterruptedYears: Int? = null,
)

enum class Patent {
    INICIADO,
    ATIVO,
    CONSTANTE,
    FORTE,
    ELITE,
    LENDA,
}

data class PatentRank(
    val patent: Patent,
    val grade: Int,
) {
    init {
        require(grade in 1..5)
    }

    fun outranks(other: PatentRank?): Boolean {
        if (other == null) return true
        if (patent.ordinal != other.patent.ordinal) return patent.ordinal > other.patent.ordinal
        return grade > other.grade
    }
}

data class PatentStatus(
    val rank: PatentRank?,
    val progressToNext: Float,
    val remainingLabel: String,
    val nextPatent: Patent?,
) {
    companion object {
        fun none(remainingLabel: String = "First sessions unlock INICIADO"): PatentStatus =
            PatentStatus(rank = null, progressToNext = 0f, remainingLabel = remainingLabel, nextPatent = Patent.INICIADO)
    }
}

object PatentLogic {
    val proposedThresholds: PatentThresholds = PatentThresholds()

    fun evaluate(signals: PatentSignals, thresholds: PatentThresholds = proposedThresholds): PatentRank? {
        var best: PatentRank? = null
        iniciado(signals, thresholds)?.let { best = it }
        if (signals.sessionCount >= thresholds.iniciadoSessions) {
            ativo(signals, thresholds)?.let { if (it.outranks(best)) best = it }
        }
        if (best?.patent?.ordinal ?: -1 >= Patent.ATIVO.ordinal) {
            constante(signals, thresholds)?.let { if (it.outranks(best)) best = it }
        }
        if (best?.patent?.ordinal ?: -1 >= Patent.CONSTANTE.ordinal) {
            forte(signals, thresholds)?.let { if (it.outranks(best)) best = it }
        }
        if (best?.patent?.ordinal ?: -1 >= Patent.FORTE.ordinal) {
            elite(signals, thresholds)?.let { if (it.outranks(best)) best = it }
        }
        if (best?.patent?.ordinal ?: -1 >= Patent.ELITE.ordinal) {
            lenda(signals, thresholds)?.let { if (it.outranks(best)) best = it }
        }
        return best
    }

    /** Never demote. Frozen progress still shows the stored floor. */
    fun applyFloor(earned: PatentRank?, floor: PatentRank?): PatentRank? =
        if (earned.outranks(floor)) earned else floor

    fun status(
        rank: PatentRank?,
        signals: PatentSignals,
        thresholds: PatentThresholds = proposedThresholds,
    ): PatentStatus {
        if (rank == null) {
            val target = thresholds.iniciadoSessions
            val p = (signals.sessionCount / target.toFloat()).coerceIn(0f, 1f)
            val left = (target - signals.sessionCount).coerceAtLeast(0)
            return PatentStatus(
                rank = null,
                progressToNext = p,
                remainingLabel = if (left == 0) "INICIADO ready" else "$left sessions to INICIADO",
                nextPatent = Patent.INICIADO,
            )
        }
        val next = nextAfter(rank)
        val (progress, remaining) = progressWithin(rank, next, signals, thresholds)
        return PatentStatus(rank, progress, remaining, next?.patent)
    }

    fun parseFloor(raw: String?): PatentRank? {
        if (raw.isNullOrBlank()) return null
        val parts = raw.split(":")
        if (parts.size != 2) return null
        val patent = runCatching { Patent.valueOf(parts[0]) }.getOrNull() ?: return null
        val grade = parts[1].toIntOrNull()?.takeIf { it in 1..5 } ?: return null
        return PatentRank(patent, grade)
    }

    fun encodeFloor(rank: PatentRank): String = "${rank.patent.name}:${rank.grade}"

    fun roman(grade: Int): String = when (grade) {
        1 -> "I"
        2 -> "II"
        3 -> "III"
        4 -> "IV"
        5 -> "V"
        else -> ""
    }

    fun spokenGrade(grade: Int): String = when (grade) {
        1 -> "one"
        2 -> "two"
        3 -> "three"
        4 -> "four"
        5 -> "five"
        else -> ""
    }

    private fun PatentRank?.outranks(other: PatentRank?): Boolean = this?.outranks(other) == true

    private fun iniciado(signals: PatentSignals, t: PatentThresholds): PatentRank? {
        if (signals.sessionCount < 1) return null
        val grade = gradeFrom(signals.sessionCount, t.iniciadoSessions)
        return PatentRank(Patent.INICIADO, grade)
    }

    private fun ativo(signals: PatentSignals, t: PatentThresholds): PatentRank? {
        if (signals.streakDays < 1) return null
        val grade = gradeFrom(signals.streakDays, t.ativoStreakDays)
        return PatentRank(Patent.ATIVO, grade)
    }

    private fun constante(signals: PatentSignals, t: PatentThresholds): PatentRank? {
        val months = signals.monthsActive ?: return null
        val consistency = signals.consistencyPct ?: return null
        if (months < 1 || consistency < 1) return null
        if (consistency < t.constanteConsistencyPct && months < t.constanteMonths) return null
        val monthGrade = gradeFrom(months, t.constanteMonths)
        return if (consistency >= t.constanteConsistencyPct) {
            PatentRank(Patent.CONSTANTE, monthGrade)
        } else {
            null
        }
    }

    private fun forte(signals: PatentSignals, t: PatentThresholds): PatentRank? {
        val months = signals.monthsActive ?: return null
        if (signals.prCount < 1 || months < 1) return null
        if (signals.prCount < t.fortePrCount && months < t.forteMonths) return null
        if (signals.prCount < t.fortePrCount) return null
        return PatentRank(Patent.FORTE, gradeFrom(months, t.forteMonths))
    }

    private fun elite(signals: PatentSignals, t: PatentThresholds): PatentRank? {
        val months = signals.monthsActive ?: return null
        val consistency = signals.consistencyPct ?: return null
        if (months < t.eliteMonths || consistency < t.eliteConsistencyPct) return null
        return PatentRank(Patent.ELITE, 5)
    }

    private fun lenda(signals: PatentSignals, t: PatentThresholds): PatentRank? {
        val years = signals.uninterruptedYears ?: return null
        if (years < t.lendaYears) return null
        return PatentRank(Patent.LENDA, 5)
    }

    private fun gradeFrom(current: Int, target: Int): Int {
        if (current <= 0) return 1
        if (current >= target) return 5
        return ((current * 5) / target).coerceIn(1, 4)
    }

    private fun nextAfter(rank: PatentRank): PatentRank? {
        if (rank.grade < 5) return PatentRank(rank.patent, rank.grade + 1)
        val next = Patent.entries.getOrNull(rank.patent.ordinal + 1) ?: return null
        return PatentRank(next, 1)
    }

    private fun progressWithin(
        rank: PatentRank,
        next: PatentRank?,
        signals: PatentSignals,
        t: PatentThresholds,
    ): Pair<Float, String> {
        if (next == null) return 1f to "LENDA held"
        return when (next.patent) {
            Patent.INICIADO, Patent.ATIVO -> {
                if (rank.patent == Patent.INICIADO && next.patent == Patent.INICIADO) {
                    val p = (signals.sessionCount / t.iniciadoSessions.toFloat()).coerceIn(0f, 1f)
                    val left = (t.iniciadoSessions - signals.sessionCount).coerceAtLeast(0)
                    p to "$left sessions to grade ${roman(next.grade)}"
                } else {
                    val p = (signals.streakDays / t.ativoStreakDays.toFloat()).coerceIn(0f, 1f)
                    val left = (t.ativoStreakDays - signals.streakDays).coerceAtLeast(0)
                    p to "$left days to ATIVO"
                }
            }
            Patent.CONSTANTE -> {
                if (signals.consistencyPct == null || signals.monthsActive == null) {
                    0f to "Consistency not measured — not invented"
                } else {
                    val p = (signals.monthsActive / t.constanteMonths.toFloat()).coerceIn(0f, 1f)
                    p to "Toward CONSTANTE"
                }
            }
            Patent.FORTE -> 0f to "Toward FORTE"
            Patent.ELITE -> 0f to "Toward ELITE"
            Patent.LENDA -> 0f to "Toward LENDA"
        }
    }
}
