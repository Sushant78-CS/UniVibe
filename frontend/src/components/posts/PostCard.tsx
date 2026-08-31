import {
  MoreHorizontal,
  UserRound,
  CalendarDays,
  Newspaper,
  Megaphone,
  Trophy,
  MessageSquare,
  Pencil,
  Trash2,
  X,
  Heart,
} from "lucide-react";

import { useEffect, useState } from "react";

import { usePostApi, type Post } from "../../api/postApi";

import CommentsModal from "./CommentsModal";

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

const categoryConfig = {
  EVENT: {
    label: "Event",
    icon: CalendarDays,
  },

  NEWS: {
    label: "News",
    icon: Newspaper,
  },

  ANNOUNCEMENT: {
    label: "Announcement",
    icon: Megaphone,
  },

  ACHIEVEMENT: {
    label: "Achievement",
    icon: Trophy,
  },

  GENERAL: {
    label: "General",
    icon: MessageSquare,
  },
};

const PostCard = ({
  post,
  isOwner = false,
  onEdit,
  onDelete,
}: PostCardProps) => {
  /*
   * ================================
   * STATE
   * ================================
   */

  const [imagePreview, setImagePreview] = useState<boolean>(false);

  const [showComments, setShowComments] = useState<boolean>(false);

  const [liked, setLiked] = useState<boolean>(post.likedByMe);

  const [likeCount, setLikeCount] = useState<number>(post.likeCount);

  const [commentCount, setCommentCount] = useState<number>(post.commentCount);

  const [liking, setLiking] = useState<boolean>(false);

  /*
   * ================================
   * API
   * ================================
   */

  const { likePost, unlikePost } = usePostApi();

  /*
   * ================================
   * SYNC WITH POST
   * ================================
   */

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikeCount(post.likeCount);
    setCommentCount(post.commentCount);
  }, [post.likedByMe, post.likeCount, post.commentCount]);

  /*
   * ================================
   * CATEGORY
   * ================================
   */

  const category = categoryConfig[post.category] ?? categoryConfig.GENERAL;

  const CategoryIcon = category.icon;

  /*
   * ================================
   * DATE / TIME
   * ================================
   */

  const createdDate = new Date(post.createdAt);

  const formattedDate = createdDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = createdDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  /*
   * ================================
   * EDITED
   * ================================
   */

  const isEdited =
    post.updatedAt &&
    new Date(post.updatedAt).getTime() >
      new Date(post.createdAt).getTime() + 1000;

  /*
   * ================================
   * LIKE HANDLER
   * ================================
   */

  const handleLike = async () => {
    if (liking) {
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;

    /*
     * Optimistic update
     */
    setLiked(!previousLiked);

    setLikeCount(
      previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1,
    );

    try {
      setLiking(true);

      if (previousLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error("Failed to update like:", error);

      /*
       * Rollback if request fails
       */
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setLiking(false);
    }
  };

  /*
   * ================================
   * COMMENT COUNT
   * ================================
   */

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  /*
   * ================================
   * RENDER
   * ================================
   */

  return (
    <>
      {/* ================================= */}
      {/* POST CARD */}
      {/* ================================= */}

      <article
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div
          className="
            flex
            items-center
            gap-2.5
            px-3.5
            py-3
          "
        >
          {/* ================================= */}
          {/* AVATAR */}
          {/* ================================= */}

          {post.profileImage ? (
            <img
              src={post.profileImage}
              alt={post.fullName ?? "User"}
              className="
                h-9
                w-9
                shrink-0
                rounded-full
                object-cover
              "
            />
          ) : (
            <div
              className="
                flex
                h-9
                w-9
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
              <UserRound size={17} />
            </div>
          )}

          {/* ================================= */}
          {/* USER INFORMATION */}
          {/* ================================= */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <h3
              className="
                truncate
                text-xs
                font-semibold
                leading-4
                text-slate-900
                dark:text-white
              "
            >
              {post.fullName ?? "Unknown User"}
            </h3>

            <div
              className="
                mt-0.5
                flex
                min-w-0
                items-center
                gap-1
                overflow-hidden
                whitespace-nowrap
                text-[10px]
                leading-4
                text-slate-500
                dark:text-slate-400
              "
            >
              <span
                className="
                  max-w-[110px]
                  truncate
                "
              >
                @{post.username ?? "user"}
              </span>

              <span>·</span>

              <span className="shrink-0">{formattedDate}</span>

              <span>·</span>

              <span className="shrink-0">{formattedTime}</span>

              {isEdited && (
                <>
                  <span>·</span>

                  <span className="shrink-0">Edited</span>
                </>
              )}
            </div>
          </div>

          {/* ================================= */}
          {/* CATEGORY */}
          {/* ================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-violet-200
              bg-violet-50
              px-2.5
              py-1
              text-[11px]
              font-semibold
              text-violet-600
              dark:border-violet-500/20
              dark:bg-violet-500/10
              dark:text-violet-400
            "
          >
            <CategoryIcon size={12} />

            <span className="hidden xs:inline">{category.label}</span>
          </div>

          {/* ================================= */}
          {/* OWNER MENU */}
          {/* ================================= */}

          {isOwner && (
            <div className="group relative">
              <button
                type="button"
                aria-label="Post options"
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
                  dark:hover:text-slate-200
                "
              >
                <MoreHorizontal size={18} />
              </button>

              {/* MENU */}

              <div
                className="
                  invisible
                  absolute
                  right-0
                  top-9
                  z-20
                  w-32
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-1
                  opacity-0
                  shadow-lg
                  transition
                  group-focus-within:visible
                  group-focus-within:opacity-100
                  group-hover:visible
                  group-hover:opacity-100
                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                {/* EDIT */}

                <button
                  type="button"
                  onClick={() => onEdit?.(post)}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-left
                    text-xs
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-slate-100
                    dark:text-slate-200
                    dark:hover:bg-slate-800
                  "
                >
                  <Pencil size={14} />
                  Edit
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() => onDelete?.(post)}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-left
                    text-xs
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    dark:text-red-400
                    dark:hover:bg-red-500/10
                  "
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* DESCRIPTION */}
        {/* ================================= */}

        <div
          className="
            px-3.5
            pb-3
            pt-2
          "
        >
          <p
            className="
              whitespace-pre-wrap
              break-words
              text-[13px]
              leading-5
              text-slate-700
              dark:text-slate-300
            "
          >
            {post.description}
          </p>
        </div>

        {/* ================================= */}
        {/* POST IMAGE */}
        {/* ================================= */}

        {post.imageUrl && (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => setImagePreview(true)}
              aria-label="View image"
              className="
                group
                block
                w-full
                cursor-zoom-in
                overflow-hidden
                rounded-xl
                bg-slate-100
                text-left
                dark:bg-slate-800
              "
            >
              <img
                src={post.imageUrl}
                alt="Post attachment"
                loading="lazy"
                className="
                  max-h-[380px]
                  w-full
                  object-cover
                  transition-transform
                  duration-300
                  group-hover:scale-[1.02]
                "
              />
            </button>
          </div>
        )}

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <div
          className="
            flex
            items-center
            border-t
            border-slate-100
            px-3.5
            py-2
            dark:border-slate-800
          "
        >
          {/* ================================= */}
          {/* LIKE BUTTON */}
          {/* ================================= */}

          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            aria-label={liked ? "Unlike post" : "Like post"}
            className={`
              flex
              items-center
              gap-1.5
              rounded-lg
              px-2
              py-1.5
              text-[11px]
              font-medium
              transition
              disabled:cursor-not-allowed

              ${
                liked
                  ? `
                    text-violet-600
                    dark:text-violet-400
                  `
                  : `
                    text-slate-500
                    hover:bg-slate-100
                    hover:text-violet-600
                    dark:text-slate-400
                    dark:hover:bg-slate-800
                    dark:hover:text-violet-400
                  `
              }
            `}
          >
            <Heart
              size={15}
              strokeWidth={2}
              fill={liked ? "currentColor" : "none"}
            />

            <span>{likeCount}</span>
          </button>

          {/* ================================= */}
          {/* COMMENT BUTTON */}
          {/* ================================= */}

          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="
              ml-1
              flex
              items-center
              gap-1.5
              rounded-lg
              px-2
              py-1.5
              text-[11px]
              font-medium
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-violet-600
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-violet-400
            "
          >
            <MessageSquare size={15} />

            <span>{commentCount}</span>
          </button>
        </div>
      </article>

      {/* ================================= */}
      {/* IMAGE PREVIEW */}
      {/* ================================= */}

      {imagePreview && post.imageUrl && (
        <div
          className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/80
              p-4
              backdrop-blur-sm
            "
          onClick={() => setImagePreview(false)}
        >
          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={() => setImagePreview(false)}
            aria-label="Close image preview"
            className="
                absolute
                right-4
                top-4
                z-10
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur-md
                transition
                hover:bg-white/20
              "
          >
            <X size={22} />
          </button>

          {/* PREVIEW IMAGE */}

          <img
            src={post.imageUrl}
            alt="Post attachment preview"
            onClick={(e) => e.stopPropagation()}
            className="
                max-h-[90vh]
                max-w-[95vw]
                rounded-xl
                object-contain
                shadow-2xl
              "
          />
        </div>
      )}

      {/* ================================= */}
      {/* COMMENTS MODAL */}
      {/* ================================= */}

      <CommentsModal
        open={showComments}
        post={post}
        onClose={() => setShowComments(false)}
        onCommentCountChange={handleCommentCountChange}
      />
    </>
  );
};

export default PostCard;
