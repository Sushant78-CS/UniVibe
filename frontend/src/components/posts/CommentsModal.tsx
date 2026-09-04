import {
  Send,
  Trash2,
  UserRound,
  X,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

import { useEffect, useState } from "react";

import { usePostApi, type Comment, type Post } from "../../api/postApi";

interface CommentsModalProps {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onCommentCountChange: (count: number) => void;

  // Used by PostCard to show loading on the comment button
  onLoadingChange?: (loading: boolean) => void;
}

const CommentsModal = ({
  open,
  post,
  onClose,
  onCommentCountChange,
  onLoadingChange,
}: CommentsModalProps) => {
  const { getComments, addComment, deleteComment } = usePostApi();

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  useEffect(() => {
    if (!open || !post) {
      return;
    }

    let cancelled = false;

    const loadComments = async () => {
      try {
        setLoading(true);
        onLoadingChange?.(true);
        setError("");

        const data = await getComments(post.id);

        if (cancelled) {
          return;
        }

        setComments(data);
        onCommentCountChange(data.length);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load comments:", error);
        setError("Unable to load comments.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };

    // Only reload when the modal opens or the post changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // ==========================================
  // CLOSE
  // ==========================================

  const handleClose = () => {
    if (submitting || deletingId !== null) {
      return;
    }

    onClose();
  };

  // ==========================================
  // ADD COMMENT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();

    if (!trimmed || !post || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const newComment = await addComment(post.id, trimmed);

      setComments((prev) => [...prev, newComment]);

      // Update parent OUTSIDE the setState callback.
      onCommentCountChange(comments.length + 1);

      setContent("");
    } catch (error) {
      console.error("Failed to add comment:", error);

      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE COMMENT
  // ==========================================

  const handleDelete = async (commentId: number) => {
    if (deletingId !== null) {
      return;
    }

    try {
      setDeletingId(commentId);
      setError("");

      await deleteComment(commentId);

      const newCount = Math.max(0, comments.length - 1);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      // Again, update parent OUTSIDE setState.
      onCommentCountChange(newCount);
    } catch (error) {
      console.error("Failed to delete comment:", error);

      setError("Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // CLOSED
  // ==========================================

  if (!open || !post) {
    return null;
  }

  return (
    <div
      className="
  fixed
  inset-0
  z-[110]
  flex
  items-end
  justify-center
  bg-black/80
  backdrop-blur-sm
  sm:items-center
  sm:p-4
"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !submitting &&
          deletingId === null
        ) {
          onClose();
        }
      }}
    >
      {/* ====================================== */}
      {/* MODAL */}
      {/* ====================================== */}

      <div
        className="
          flex
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-neutral-800
          dark:bg-[#171717]
          sm:max-h-[650px]
          sm:rounded-3xl
        "
      >
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-4
            py-3
            dark:border-neutral-800
          "
        >
          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Comments
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
                dark:text-neutral-400
              "
            >
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting || deletingId !== null}
            aria-label="Close comments"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:text-neutral-400
              dark:hover:bg-neutral-900
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ====================================== */}
        {/* COMMENTS */}
        {/* ====================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-3
          "
        >
          {/* LOADING */}
          {loading && (
            <div className="space-y-4 py-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-2.5">
                  <div
                    className="
                      h-8
                      w-8
                      shrink-0
                      animate-pulse
                      rounded-full
                      bg-slate-200
                      dark:bg-neutral-800
                    "
                  />

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        rounded-2xl
                        bg-slate-100
                        px-3
                        py-3
                        dark:bg-neutral-900
                      "
                    >
                      <div
                        className="
                          h-3
                          w-24
                          animate-pulse
                          rounded
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                      />

                      <div className="mt-2 space-y-1.5">
                        <div
                          className="
                            h-2.5
                            w-full
                            animate-pulse
                            rounded
                            bg-slate-200
                            dark:bg-neutral-800
                          "
                        />

                        <div
                          className="
                            h-2.5
                            w-3/5
                            animate-pulse
                            rounded
                            bg-slate-200
                            dark:bg-neutral-800
                          "
                        />
                      </div>
                    </div>

                    <div
                      className="
                        mt-2
                        h-2
                        w-20
                        animate-pulse
                        rounded
                        bg-slate-100
                        dark:bg-neutral-900
                      "
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && comments.length === 0 && (
            <div
              className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  py-14
                  text-center
                "
            >
              <div
                className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-violet-50
                    text-violet-600
                    dark:bg-violet-500/10
                    dark:text-violet-400
                  "
              >
                <MessageSquare size={22} />
              </div>

              <p
                className="
                    mt-3
                    text-sm
                    font-medium
                    text-slate-700
                    dark:text-neutral-200
                  "
              >
                No comments yet
              </p>

              <p
                className="
                    mt-1
                    text-xs
                    text-slate-400
                    dark:text-neutral-500
                  "
              >
                Be the first to comment.
              </p>
            </div>
          )}

          {/* COMMENT LIST */}
          {!loading && comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isDeleting = deletingId === comment.id;

                return (
                  <div key={comment.id} className="flex gap-2.5">
                    {/* AVATAR */}
                    {comment.profileImage ? (
                      <img
                        src={comment.profileImage}
                        alt={comment.fullName ?? "User"}
                        className="
                            h-8
                            w-8
                            shrink-0
                            rounded-full
                            object-cover
                            ring-1
                            ring-slate-200
                            dark:ring-neutral-800
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-violet-50
                            text-violet-600
                            ring-1
                            ring-violet-100
                            dark:bg-violet-500/10
                            dark:text-violet-400
                            dark:ring-violet-500/20
                          "
                      >
                        <UserRound size={15} />
                      </div>
                    )}

                    {/* COMMENT */}
                    <div className="min-w-0 flex-1">
                      <div
                        className="
                            rounded-2xl
                            bg-slate-100
                            px-3
                            py-2
                            dark:bg-neutral-900
                          "
                      >
                        <div
                          className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                        >
                          <p
                            className="
                                min-w-0
                                truncate
                                text-xs
                                font-semibold
                                text-slate-900
                                dark:text-neutral-100
                              "
                          >
                            {comment.fullName ?? "Unknown User"}
                          </p>

                          {/* DELETE — POST OWNER ONLY */}
                          {/* DELETE — COMMENT OWNER ONLY */}
                          {comment.isOwner && (
                            <button
                              type="button"
                              onClick={() => handleDelete(comment.id)}
                              disabled={isDeleting || submitting}
                              aria-label="Delete comment"
                              className="
      flex
      h-7
      w-7
      shrink-0
      items-center
      justify-center
      rounded-lg
      text-slate-400
      transition
      hover:bg-red-50
      hover:text-red-600
      disabled:cursor-not-allowed
      disabled:opacity-50
      dark:text-neutral-500
      dark:hover:bg-red-500/10
      dark:hover:text-red-400
    "
                            >
                              {isDeleting ? (
                                <RefreshCw size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          )}
                        </div>

                        <p
                          className="
                              mt-1
                              whitespace-pre-wrap
                              break-words
                              text-xs
                              leading-5
                              text-slate-700
                              dark:text-neutral-300
                            "
                        >
                          {comment.content}
                        </p>
                      </div>

                      <p
                        className="
                            mt-1
                            px-2
                            text-[10px]
                            text-slate-400
                            dark:text-neutral-500
                          "
                      >
                        @{comment.username ?? "user"} ·{" "}
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            timeZone: "Asia/Kolkata",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ====================================== */}
        {/* ERROR */}
        {/* ====================================== */}

        {error && (
          <div
            className="
              mx-4
              mb-2
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-3
              py-2
              text-xs
              text-red-600
              dark:border-red-500/20
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* ====================================== */}
        {/* INPUT */}
        {/* ====================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            border-t
            border-slate-100
            p-3
            dark:border-neutral-800
          "
        >
          <div
            className="
              flex
              items-end
              gap-2
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-1.5
              transition-colors
              focus-within:border-violet-400
              dark:border-neutral-800
              dark:bg-black
              dark:focus-within:border-violet-500
            "
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              rows={1}
              maxLength={500}
              disabled={submitting}
              className="
                min-h-9
                flex-1
                resize-none
                bg-transparent
                px-2
                py-2
                text-xs
                text-slate-900
                outline-none
                placeholder:text-slate-400
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:text-white
                dark:placeholder:text-neutral-600
              "
            />

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              aria-label="Send comment"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-violet-600
                text-white
                transition
                hover:bg-violet-700
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>

          <div
            className="
              mt-1.5
              flex
              justify-end
              px-1
            "
          >
            <span
              className="
                text-[9px]
                text-slate-400
                dark:text-neutral-600
              "
            >
              {content.length}/500
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;
