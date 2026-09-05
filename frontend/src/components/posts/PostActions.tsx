import { Heart, MessageCircle, Send, RefreshCw } from "lucide-react";

interface PostActionsProps {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  liking: boolean;
  commentsLoading: boolean;
  onLike: () => void;
  onComments: () => void;
  onShare: () => void;
}

const PostActions = ({
  liked,
  likeCount,
  commentCount,
  liking,
  commentsLoading,
  onLike,
  onComments,
  onShare,
}: PostActionsProps) => {
  return (
    <div
      className="
        border-t
        border-neutral-200
        px-3
        py-2
        dark:border-neutral-800
      "
    >
      <div className="flex items-center gap-1">
        {/* LIKE */}

        <button
          type="button"
          onClick={onLike}
          disabled={liking}
          aria-label={liked ? "Unlike post" : "Like post"}
          className={`
            group
            flex
            min-h-9
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-xs
            font-semibold
            transition-all
            duration-150
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-60

            ${
              liked
                ? `
                  text-violet-600
                  hover:bg-violet-50
                  dark:text-violet-400
                  dark:hover:bg-violet-500/10
                `
                : `
                  text-neutral-500
                  hover:bg-neutral-100
                  hover:text-neutral-700
                  dark:text-neutral-400
                  dark:hover:bg-neutral-900
                  dark:hover:text-neutral-200
                `
            }
          `}
        >
          <Heart
            size={18}
            strokeWidth={2}
            fill={liked ? "currentColor" : "none"}
            className={`
              transition-transform
              duration-150
              ${liked ? "scale-105" : "group-hover:scale-105"}
              group-active:scale-125
            `}
          />

          <span>{likeCount}</span>
        </button>

        {/* COMMENTS */}

        <button
          type="button"
          onClick={onComments}
          disabled={commentsLoading}
          aria-label="View comments"
          className="
            flex
            min-h-9
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-xs
            font-semibold
            text-neutral-500
            transition-all
            duration-150
            hover:bg-neutral-100
            hover:text-neutral-700
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:text-neutral-400
            dark:hover:bg-neutral-900
            dark:hover:text-neutral-200
          "
        >
          {commentsLoading ? (
            <RefreshCw size={18} strokeWidth={2} className="animate-spin" />
          ) : (
            <MessageCircle size={18} strokeWidth={2} />
          )}

          <span>{commentCount}</span>
        </button>

        {/* SHARE */}

        <button
          type="button"
          onClick={onShare}
          aria-label="Share post"
          className="
            flex
            min-h-9
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-xs
            font-semibold
            text-neutral-500
            transition-all
            duration-150
            hover:bg-neutral-100
            hover:text-neutral-700
            active:scale-95
            dark:text-neutral-400
            dark:hover:bg-neutral-900
            dark:hover:text-neutral-200
          "
        >
          <Send size={18} strokeWidth={2} />

          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
