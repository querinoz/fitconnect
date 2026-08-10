package com.fitconnect.android.coach.files

import com.fitconnect.android.coach.domain.CoachFileRef
import com.fitconnect.android.foundation.common.AppResult

enum class FileCategory {
    IMAGE,
    PDF,
    VIDEO,
    DOCUMENT,
    EXERCISE_LIBRARY,
    PROGRAM_ATTACHMENT,
}

interface CoachFileStore {
    suspend fun list(category: FileCategory? = null): AppResult<List<CoachFileRef>>
    suspend fun attachToProgram(programId: String, fileId: String): AppResult<Unit>
}

class LocalCoachFileStore : CoachFileStore {
    private val files = listOf(
        CoachFileRef("f1", "threshold-warmup.pdf", "application/pdf", 240_000, FileCategory.PDF.name),
        CoachFileRef("f2", "drill-video.mp4", "video/mp4", 12_000_000, FileCategory.VIDEO.name),
        CoachFileRef("f3", "form-check.jpg", "image/jpeg", 1_800_000, FileCategory.IMAGE.name),
        CoachFileRef("f4", "medical-clearance.pdf", "application/pdf", 420_000, FileCategory.DOCUMENT.name),
        CoachFileRef("f5", "A-skip library", "application/x-exercise", 0, FileCategory.EXERCISE_LIBRARY.name),
        CoachFileRef("f6", "week-3 attachment", "application/pdf", 88_000, FileCategory.PROGRAM_ATTACHMENT.name),
    )

    override suspend fun list(category: FileCategory?): AppResult<List<CoachFileRef>> {
        val filtered = if (category == null) files
        else files.filter { it.category == category.name }
        return AppResult.Ok(filtered)
    }

    override suspend fun attachToProgram(programId: String, fileId: String): AppResult<Unit> =
        AppResult.Ok(Unit)
}
