package com.fitconnect.android.foundation.programs

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONArray
import org.json.JSONObject

/** Wire row from GET/POST `/api/v1/athletes/programs`. */
data class RemoteAthleteProgramEnrollment(
    val id: String,
    val programId: String,
    val title: String,
    val currentWeek: Int,
    val totalWeeks: Int,
    val progressPercent: Int,
    val nextWorkoutTitle: String,
    val milestones: List<String>,
    val source: String? = null,
)

/** Wire row from GET/POST `/api/v1/coaches/programs`. */
data class RemoteCoachProgramRow(
    val id: String,
    val title: String,
    val weeks: Int,
    val state: String,
    val version: Int,
    val source: String? = null,
)

data class AthleteProgramsSnapshot(
    val enrollments: List<RemoteAthleteProgramEnrollment>,
    val source: String,
)

data class CoachProgramsSnapshot(
    val programs: List<RemoteCoachProgramRow>,
    val source: String,
)

enum class CoachProgramRemoteAction { PUBLISH, DRAFT, CLONE }

/**
 * HTTP contract for athlete/coach programs.
 * Athlete: GET|POST /api/v1/athletes/programs
 * Coach: GET|POST /api/v1/coaches/programs
 *
 * Path A: never treat `source=seed` as production data.
 */
interface ProgramRemote {
    suspend fun listAthletePrograms(): AppResult<AthleteProgramsSnapshot>

    suspend fun enrollAthlete(programId: String): AppResult<RemoteAthleteProgramEnrollment>

    suspend fun listCoachPrograms(): AppResult<CoachProgramsSnapshot>

    suspend fun coachAction(
        action: CoachProgramRemoteAction,
        programId: String,
    ): AppResult<RemoteCoachProgramRow>
}

/**
 * Fail-closed empty remote when no API base URL / programs API is unavailable.
 * Returns honest empty lists — never fabricates enrollments or coach plans.
 */
class EmptyProgramRemote : ProgramRemote {
    override suspend fun listAthletePrograms(): AppResult<AthleteProgramsSnapshot> =
        AppResult.Ok(AthleteProgramsSnapshot(enrollments = emptyList(), source = "empty"))

    override suspend fun enrollAthlete(programId: String): AppResult<RemoteAthleteProgramEnrollment> =
        AppResult.Err(AppError.Unexpected("programs_api_unavailable"))

    override suspend fun listCoachPrograms(): AppResult<CoachProgramsSnapshot> =
        AppResult.Ok(CoachProgramsSnapshot(programs = emptyList(), source = "empty"))

    override suspend fun coachAction(
        action: CoachProgramRemoteAction,
        programId: String,
    ): AppResult<RemoteCoachProgramRow> =
        AppResult.Err(AppError.Unexpected("programs_api_unavailable"))
}

class HttpProgramRemote(
    private val api: () -> ApiClient,
) : ProgramRemote {
    override suspend fun listAthletePrograms(): AppResult<AthleteProgramsSnapshot> {
        return when (val raw = api().get("/api/v1/athletes/programs")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("athlete_programs_seed_forbidden_in_remote_path"),
                    )
                }
                val arr = root.optJSONArray("enrollments") ?: JSONArray()
                val rows = buildList {
                    for (i in 0 until arr.length()) {
                        add(parseAthleteEnrollment(arr.getJSONObject(i), source))
                    }
                }
                AppResult.Ok(AthleteProgramsSnapshot(enrollments = rows, source = source))
            }
        }
    }

    override suspend fun enrollAthlete(programId: String): AppResult<RemoteAthleteProgramEnrollment> {
        val body = JSONObject().put("programId", programId).toString()
        return when (val raw = api().post("/api/v1/athletes/programs", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("athlete_programs_seed_forbidden_in_remote_path"),
                    )
                }
                val enrollment = root.optJSONObject("enrollment")
                    ?: return AppResult.Err(AppError.Unexpected("enroll_failed"))
                AppResult.Ok(parseAthleteEnrollment(enrollment, source))
            }
        }
    }

    override suspend fun listCoachPrograms(): AppResult<CoachProgramsSnapshot> {
        return when (val raw = api().get("/api/v1/coaches/programs")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("coach_programs_seed_forbidden_in_remote_path"),
                    )
                }
                val arr = root.optJSONArray("programs") ?: JSONArray()
                val rows = buildList {
                    for (i in 0 until arr.length()) {
                        add(parseCoachProgram(arr.getJSONObject(i), source))
                    }
                }
                AppResult.Ok(CoachProgramsSnapshot(programs = rows, source = source))
            }
        }
    }

    override suspend fun coachAction(
        action: CoachProgramRemoteAction,
        programId: String,
    ): AppResult<RemoteCoachProgramRow> {
        val apiAction = when (action) {
            CoachProgramRemoteAction.PUBLISH -> "publish"
            CoachProgramRemoteAction.DRAFT -> "draft"
            CoachProgramRemoteAction.CLONE -> "clone"
        }
        val body = JSONObject()
            .put("action", apiAction)
            .put("programId", programId)
            .toString()
        return when (val raw = api().post("/api/v1/coaches/programs", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("coach_programs_seed_forbidden_in_remote_path"),
                    )
                }
                val program = root.optJSONObject("program")
                    ?: return AppResult.Err(AppError.Unexpected("coach_program_action_failed"))
                AppResult.Ok(parseCoachProgram(program, source))
            }
        }
    }

    private fun parseAthleteEnrollment(o: JSONObject, source: String): RemoteAthleteProgramEnrollment {
        val milestones = buildList {
            val m = o.optJSONArray("milestones")
            if (m != null) {
                for (j in 0 until m.length()) add(m.getString(j))
            }
        }
        val programId = o.optString("programId", o.optString("id", ""))
        return RemoteAthleteProgramEnrollment(
            id = o.optString("id", programId),
            programId = programId,
            title = o.optString("title", "Program"),
            currentWeek = o.optInt("currentWeek", 1),
            totalWeeks = o.optInt("totalWeeks", 1),
            progressPercent = o.optInt("progressPercent", 0),
            nextWorkoutTitle = o.optString("nextWorkoutTitle", "Next workout"),
            milestones = milestones,
            source = source.takeIf { it.isNotBlank() },
        )
    }

    private fun parseCoachProgram(o: JSONObject, source: String): RemoteCoachProgramRow =
        RemoteCoachProgramRow(
            id = o.getString("id"),
            title = o.optString("title", "Program"),
            weeks = o.optInt("weeks", 4),
            state = o.optString("state", "published"),
            version = o.optInt("version", 1),
            source = source.takeIf { it.isNotBlank() },
        )
}
