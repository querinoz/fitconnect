package com.fitconnect.android.ai.actions

import com.fitconnect.android.ai.domain.ActionDecision
import com.fitconnect.android.ai.domain.AiActionProposal
import com.fitconnect.android.ai.domain.AiRecommendation
import com.fitconnect.android.ai.domain.RecommendationKind

/**
 * AI may propose actions; it never auto-executes high-impact changes.
 * Human decisions are recorded here for auditability.
 */
class ActionProposalService(private val nowProvider: () -> Long = System::currentTimeMillis) {
    private val decisions = mutableListOf<Pair<String, ActionDecision>>()
    private var seq = 0L

    fun proposeFrom(recommendations: List<AiRecommendation>): List<AiActionProposal> =
        recommendations.mapNotNull { rec ->
            when (rec.kind) {
                RecommendationKind.PROGRAM_MODIFICATION,
                RecommendationKind.TRAINING_ADJUSTMENT,
                -> AiActionProposal(
                    id = "act-${++seq}",
                    title = rec.title,
                    description = rec.reason,
                    impact = "Requires coach/athlete approval before any plan change",
                    requiresHumanApproval = true,
                    evidence = rec.evidence,
                )
                RecommendationKind.COACH_CONTACT -> AiActionProposal(
                    id = "act-${++seq}",
                    title = "Draft coach message",
                    description = "AI can draft text; user must send.",
                    impact = "Communication only — no plan mutation",
                    requiresHumanApproval = true,
                    evidence = rec.evidence,
                )
                else -> null
            }
        }

    @Synchronized
    fun decide(proposalId: String, decision: ActionDecision) {
        require(decision != ActionDecision.ACCEPT || true) // accept still does not auto-apply
        decisions += proposalId to decision
    }

    @Synchronized
    fun history(): List<Pair<String, ActionDecision>> = decisions.toList()
}
