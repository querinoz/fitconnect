package com.fitconnect.android.community.remote

import com.fitconnect.android.community.comments.CommentEngine
import com.fitconnect.android.community.comments.CommentPage
import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import com.fitconnect.android.community.domain.Share
import com.fitconnect.android.community.domain.ShareTargetKind
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostEngine
import com.fitconnect.android.community.posts.PostPage
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.community.reactions.ReactionEngine

/**
 * Empty community surface when remote API/Supabase is unavailable.
 * Creates refuse; lists stay empty — never falls back to LOCAL_DEMO seed.
 */
class FailClosedPostEngine : PostEngine {
    override suspend fun create(draft: PostDraft): PostResult = PostResult.Invalid
    override suspend fun edit(postId: String, authorId: String, text: String): Boolean = false
    override suspend fun delete(postId: String, actorId: String, isModerator: Boolean): Boolean = false
    override suspend fun get(postId: String): CommunityPost? = null
    override suspend fun byAuthor(authorId: String, cursor: String?, limit: Int): PostPage =
        PostPage(emptyList(), null)
    override suspend fun allVisibleCandidates(cursor: String?, limit: Int): PostPage =
        PostPage(emptyList(), null)
    override suspend fun save(userId: String, postId: String): Boolean = false
    override suspend fun unsave(userId: String, postId: String): Boolean = false
    override suspend fun saved(userId: String): List<CommunityPost> = emptyList()
    override suspend fun share(
        actorId: String,
        postId: String,
        target: ShareTargetKind,
        targetId: String?,
    ): Share? = null
    override suspend fun saveDraft(draft: PostDraft) = Unit
    override suspend fun drafts(authorId: String): List<PostDraft> = emptyList()
    override suspend fun discardDraft(authorId: String, idempotencyKey: String) = Unit
}

class FailClosedCommentEngine : CommentEngine {
    override suspend fun add(
        postId: String,
        parentCommentId: String?,
        authorId: String,
        text: String,
        mentions: List<String>,
    ): Comment? = null
    override suspend fun edit(commentId: String, authorId: String, text: String): Boolean = false
    override suspend fun delete(commentId: String, actorId: String, isModerator: Boolean): Boolean = false
    override suspend fun forPost(postId: String, offset: Int, limit: Int): CommentPage =
        CommentPage(emptyList(), null)
    override suspend fun replies(commentId: String, offset: Int, limit: Int): CommentPage =
        CommentPage(emptyList(), null)
    override suspend fun count(postId: String): Int = 0
}

class FailClosedReactionEngine : ReactionEngine {
    override suspend fun react(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
        type: ReactionType,
    ): Boolean = false
    override suspend fun unreact(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
    ): Boolean = false
    override suspend fun counts(
        targetKind: ReactionTargetKind,
        targetId: String,
    ): Map<ReactionType, Int> = emptyMap()
    override suspend fun of(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
    ): ReactionType? = null
    override suspend fun total(targetKind: ReactionTargetKind, targetId: String): Int = 0
}
