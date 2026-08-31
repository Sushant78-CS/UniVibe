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
}

const CommentsModal = ({
  open,
  post,
  onClose,
  onCommentCountChange,
}: CommentsModalProps) => {
  const { getComments, addComment, deleteComment } = usePostApi();

  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !post) {
      return;
    }

    const loadComments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getComments(post.id);

        setComments(data);
        onCommentCountChange?.(data.length);
      } catch (error) {
        console.error("Failed to load comments:", error);

        setError("Unable to load comments.");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [open, post?.id]);

  if (!open || !post) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const newComment = await addComment(post.id, trimmed);

      setComments((prev) => [...prev, newComment]);

      // Update PostCard count OUTSIDE the state updater
      onCommentCountChange?.(comments.length + 1);

      setContent("");
    } catch (error) {
      console.error("Failed to add comment:", error);

      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (deletingId !== null) {
      return;
    }

    try {
      setDeletingId(commentId);
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      // Update PostCard count OUTSIDE the state updater
      onCommentCountChange?.(Math.max(0, comments.length - 1));
    } catch (error) {
      console.error("Failed to delete comment:", error);

      setError("Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-end
        justify-center
        bg-black/50
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
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
          dark:border-slate-800
          dark:bg-slate-900
          sm:max-h-[650px]
          sm:rounded-3xl
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-4
            py-3
            dark:border-slate-800
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
                dark:text-slate-400
              "
            >
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Comments */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-3
          "
        >
          {loading && (
            <div
              className="
                flex
                items-center
                justify-center
                py-10
              "
            >
              <RefreshCw size={18} className="animate-spin text-violet-500" />
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div
              className="
                  py-12
                  text-center
                "
            >
              <MessageSquare
                size={24}
                className="
                    mx-auto
                    text-slate-300
                    dark:text-slate-600
                  "
              />

              <p
                className="
                    mt-3
                    text-sm
                    font-medium
                    text-slate-600
                    dark:text-slate-300
                  "
              >
                No comments yet
              </p>

              <p
                className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
              >
                Be the first to comment.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="
                  flex
                  gap-2.5
                "
              >
                {/* Avatar */}
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
                      bg-violet-100
                      text-violet-600
                      dark:bg-violet-500/10
                      dark:text-violet-400
                    "
                  >
                    <UserRound size={15} />
                  </div>
                )}

                {/* Content */}
                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <div
                    className="
                      rounded-2xl
                      bg-slate-100
                      px-3
                      py-2
                      dark:bg-slate-800
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
                          truncate
                          text-xs
                          font-semibold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {comment.fullName ?? "Unknown User"}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="
                          shrink-0
                          text-slate-400
                          transition
                          hover:text-red-500
                          disabled:opacity-50
                        "
                        aria-label="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p
                      className="
                        mt-1
                        whitespace-pre-wrap
                        break-words
                        text-xs
                        leading-5
                        text-slate-700
                        dark:text-slate-300
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
                    "
                  >
                    @{comment.username ?? "user"} ·{" "}
                    {new Date(comment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
              mx-4
              mb-2
              rounded-xl
              bg-red-50
              px-3
              py-2
              text-xs
              text-red-600
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="
            border-t
            border-slate-100
            p-3
            dark:border-slate-800
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
              focus-within:border-violet-400
              dark:border-slate-700
              dark:bg-slate-950
            "
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              rows={1}
              maxLength={500}
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
                dark:text-white
              "
            />

            <button
              type="submit"
              disabled={submitting || !content.trim()}
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="Send comment"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;
