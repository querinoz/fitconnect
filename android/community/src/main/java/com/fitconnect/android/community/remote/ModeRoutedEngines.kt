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

/** Session-aware engine router — LOCAL_DEMO / REMOTE / FAIL_CLOSED. */
class ModeRoutedPostEngine(
    private val resolve: suspend () -> PostEngine,
) : PostEngine {
    override suspend fun create(draft: PostDraft): PostResult = resolve().create(draft)
    override suspend fun edit(postId: String, authorId: String, text: String): Boolean =
        resolve().edit(postId, authorId, text)
    override suspend fun delete(postId: String, actorId: String, isModerator: Boolean): Boolean =
        resolve().delete(postId, actorId, isModerator)
    override suspend fun get(postId: String): CommunityPost? = resolve().get(postId)
    override suspend fun byAuthor(authorId: String, cursor: String?, limit: Int): PostPage =
        resolve().byAuthor(authorId, cursor, limit)
    override suspend fun allVisibleCandidates(cursor: String?, limit: Int): PostPage =
        resolve().allVisibleCandidates(cursor, limit)
    override suspend fun save(userId: String, postId: String): Boolean =
        resolve().save(userId, postId)
    override suspend fun unsave(userId: String, postId: String): Boolean =
        resolve().unsave(userId, postId)
    override suspend fun saved(userId: String): List<CommunityPost> = resolve().saved(userId)
    override suspend fun share(
        actorId: String,
        postId: String,
        target: ShareTargetKind,
        targetId: String?,
    ): Share? = resolve().share(actorId, postId, target, targetId)
    override suspend fun saveDraft(draft: PostDraft) = resolve().saveDraft(draft)
    override suspend fun drafts(authorId: String): List<PostDraft> = resolve().drafts(authorId)
    override suspend fun discardDraft(authorId: String, idempotencyKey: String) =
        resolve().discardDraft(authorId, idempotencyKey)
}

class ModeRoutedCommentEngine(
    private val resolve: suspend () -> CommentEngine,
) : CommentEngine {
    override suspend fun add(
        postId: String,
        parentCommentId: String?,
        authorId: String,
        text: String,
        mentions: List<String>,
    ): Comment? = resolve().add(postId, parentCommentId, authorId, text, mentions)
    override suspend fun edit(commentId: String, authorId: String, text: String): Boolean =
        resolve().edit(commentId, authorId, text)
    override suspend fun delete(commentId: String, actorId: String, isModerator: Boolean): Boolean =
        resolve().delete(commentId, actorId, isModerator)
    override suspend fun forPost(postId: String, offset: Int, limit: Int): CommentPage =
        resolve().forPost(postId, offset, limit)
    override suspend fun replies(commentId: String, offset: Int, limit: Int): CommentPage =
        resolve().replies(commentId, offset, limit)
    override suspend fun count(postId: String): Int = resolve().count(postId)
}

class ModeRoutedReactionEngine(
    private val resolve: suspend () -> ReactionEngine,
) : ReactionEngine {
    override suspend fun react(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
        type: ReactionType,
    ): Boolean = resolve().react(actorId, targetKind, targetId, type)
    override suspend fun unreact(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
    ): Boolean = resolve().unreact(actorId, targetKind, targetId)
    override suspend fun counts(
        targetKind: ReactionTargetKind,
        targetId: String,
    ): Map<ReactionType, Int> = resolve().counts(targetKind, targetId)
    override suspend fun of(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
    ): ReactionType? = resolve().of(actorId, targetKind, targetId)
    override suspend fun total(targetKind: ReactionTargetKind, targetId: String): Int =
        resolve().total(targetKind, targetId)
}
