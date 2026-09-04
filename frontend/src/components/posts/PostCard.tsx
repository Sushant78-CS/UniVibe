import {
  MoreHorizontal,
  UserRound,
  CalendarDays,
  Newspaper,
  Megaphone,
  Trophy,
  MessageCircle,
  Pencil,
  Trash2,
  X,
  Heart,
  Send,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { usePostApi, type Post } from "../../api/postApi";
import CommentsModal from "./CommentsModal";
import SharePost from "./SharePost";

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

/*
 * ============================================
 * CATEGORY CONFIG
 * ============================================
 */

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
    icon: MessageCircle,
  },
};

/*
 * ============================================
 * COMPONENT
 * ============================================
 */

const PostCard = ({
  post,
  isOwner = false,
  onEdit,
  onDelete,
}: PostCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [imagePreview, setImagePreview] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [showShare, setShowShare] = useState(false);

  const [liked, setLiked] = useState<boolean>(post.likedByMe);

  const [likeCount, setLikeCount] = useState<number>(post.likeCount);

  const [commentCount, setCommentCount] = useState<number>(post.commentCount);

  const [liking, setLiking] = useState(false);

  /*
   * ==========================================
   * API
   * ==========================================
   */

  const { likePost, unlikePost } = usePostApi();

  /*
   * ==========================================
   * SYNC WITH QUERY DATA
   * ==========================================
   */

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikeCount(post.likeCount);
    setCommentCount(post.commentCount);
  }, [post.likedByMe, post.likeCount, post.commentCount]);

  /*
   * ==========================================
   * CATEGORY
   * ==========================================
   */

  const category = categoryConfig[post.category] ?? categoryConfig.GENERAL;

  const CategoryIcon = category.icon;

  /*
   * ==========================================
   * DATE / TIME
   * ==========================================
   */

  const createdDate = new Date(post.createdAt);

  const formattedDate = createdDate.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = createdDate.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });

  /*
   * ==========================================
   * EDITED
   * ==========================================
   */

  const isEdited =
    !!post.updatedAt &&
    new Date(post.updatedAt).getTime() >
      new Date(post.createdAt).getTime() + 1000;

  /*
   * ==========================================
   * LIKE HANDLER
   * ==========================================
   */

  const handleLike = async () => {
    if (liking) {
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;

    const nextLiked = !previousLiked;

    const nextCount = previousLiked
      ? Math.max(0, previousCount - 1)
      : previousCount + 1;

    /*
     * Optimistic update
     */
    setLiked(nextLiked);
    setLikeCount(nextCount);
    setLiking(true);

    try {
      if (previousLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }

      /*
       * ======================================
       * UPDATE ALL CACHED POST FEEDS
       * ======================================
       */

      queryClient.setQueriesData(
        {
          queryKey: ["posts"],
        },
        (oldData: any) => {
          if (!oldData?.pages) {
            return oldData;
          }

          return {
            ...oldData,

            pages: oldData.pages.map((page: any) => ({
              ...page,

              content: page.content.map((item: Post) =>
                item.id === post.id
                  ? {
                      ...item,
                      likedByMe: nextLiked,
                      likeCount: nextCount,
                    }
                  : item,
              ),
            })),
          };
        },
      );

      /*
       * Background verification
       */
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    } catch (error) {
      console.error("Failed to update like:", error);

      /*
       * Rollback
       */
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setLiking(false);
    }
  };

  /*
   * ==========================================
   * COMMENT COUNT
   * ==========================================
   */

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);

    /*
     * Keep React Query cache synchronized
     */
    queryClient.setQueriesData(
      {
        queryKey: ["posts"],
      },
      (oldData: any) => {
        if (!oldData?.pages) {
          return oldData;
        }

        return {
          ...oldData,

          pages: oldData.pages.map((page: any) => ({
            ...page,

            content: page.content.map((item: Post) =>
              item.id === post.id
                ? {
                    ...item,
                    commentCount: count,
                  }
                : item,
            ),
          })),
        };
      },
    );
  };

  /*
   * ==========================================
   * PROFILE NAVIGATION
   * ==========================================
   */

  const openProfile = () => {
    if (!post.profileId) {
      return;
    }

    navigate(`/profile/${post.profileId}`);
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <>
      <article
        className="
          overflow-hidden
          border-y
          border-slate-200
          bg-white
          transition-colors
          sm:rounded-2xl
          sm:border
          sm:shadow-[0_1px_4px_rgba(15,23,42,0.04)]

          dark:border-neutral-800
          dark:bg-black
          dark:shadow-none
        "
      >
        {/* ========================================
            HEADER
            ======================================== */}

        <div className="px-4 pb-3 pt-4 sm:px-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}

            <button
              type="button"
              onClick={openProfile}
              aria-label={`View ${post.fullName ?? "user"}'s profile`}
              className="
                shrink-0
                rounded-full
                focus:outline-none
                focus:ring-4
                focus:ring-slate-900/10
                dark:focus:ring-white/10
              "
            >
              {post.profileImage ? (
                <img
                  src={post.profileImage}
                  alt={post.fullName ?? "User"}
                  className="
                    h-11
                    w-11
                    rounded-full
                    object-cover
                    ring-1
                    ring-slate-200
                    dark:ring-neutral-700
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    text-slate-500
                    ring-1
                    ring-slate-200
                    dark:bg-neutral-900
                    dark:text-neutral-400
                    dark:ring-neutral-700
                  "
                >
                  <UserRound size={19} />
                </div>
              )}
            </button>

            {/* ===================================
                USER INFO
                =================================== */}

            <div className="min-w-0 flex-1 pt-0.5">
              <button
                type="button"
                onClick={openProfile}
                className="
                  block
                  max-w-full
                  truncate
                  text-left
                  text-sm
                  font-semibold
                  leading-5
                  text-slate-900
                  transition-colors
                  hover:text-slate-600
                  dark:text-white
                  dark:hover:text-neutral-300
                "
              >
                {post.fullName ?? "Unknown User"}
              </button>

              <div
                className="
                  mt-0.5
                  flex
                  min-w-0
                  flex-wrap
                  items-center
                  gap-x-1.5
                  gap-y-0.5
                  text-[11px]
                  leading-4
                  text-slate-400
                  dark:text-neutral-500
                "
              >
                <span className="max-w-[100px] truncate">
                  @{post.username ?? "user"}
                </span>

                <span aria-hidden="true">·</span>

                <span className="shrink-0">{formattedDate}</span>

                <span aria-hidden="true">·</span>

                <span className="shrink-0">{formattedTime}</span>

                {isEdited && (
                  <>
                    <span aria-hidden="true">·</span>

                    <span className="shrink-0">Edited</span>
                  </>
                )}
              </div>
            </div>

            {/* ===================================
                CATEGORY
                =================================== */}

            <div
              className="
                hidden
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-2.5
                py-1.5
                text-[10px]
                font-semibold
                text-slate-600
                sm:flex

                dark:border-neutral-800
                dark:bg-neutral-900
                dark:text-neutral-300
              "
            >
              <CategoryIcon size={12} />
              <span>{category.label}</span>
            </div>

            {/* ===================================
                OWNER MENU
                =================================== */}

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
                    transition-colors
                    hover:bg-slate-100
                    hover:text-slate-700
                    dark:text-neutral-500
                    dark:hover:bg-neutral-900
                    dark:hover:text-neutral-200
                  "
                >
                  <MoreHorizontal size={19} />
                </button>

                <div
                  className="
                    invisible
                    absolute
                    right-0
                    top-9
                    z-30
                    w-36
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-1
                    opacity-0
                    shadow-xl
                    transition-all

                    group-hover:visible
                    group-hover:opacity-100
                    group-focus-within:visible
                    group-focus-within:opacity-100

                    dark:border-neutral-800
                    dark:bg-black
                  "
                >
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
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-700
                      transition-colors
                      hover:bg-slate-50
                      dark:text-neutral-200
                      dark:hover:bg-neutral-900
                    "
                  >
                    <Pencil size={14} />
                    Edit post
                  </button>

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
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-red-600
                      transition-colors
                      hover:bg-red-50
                      dark:text-red-400
                      dark:hover:bg-red-500/10
                    "
                  >
                    <Trash2 size={14} />
                    Delete post
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =====================================
              MOBILE CATEGORY
              ===================================== */}
          {/* 
          <div
            className="
              mt-3
              flex
              w-fit
              items-center
              gap-1.5
              rounded-full
              border
              border-slate-200
              bg-slate-50
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-slate-600
              sm:hidden

              dark:border-neutral-800
              dark:bg-neutral-900
              dark:text-neutral-300
            "
          >
            <CategoryIcon size={11} />
            <span>{category.label}</span>
          </div> */}
        </div>

        {/* ========================================
            DESCRIPTION
            ======================================== */}

        <div className="px-4 pb-4 sm:px-5">
          <p
            className="
              whitespace-pre-wrap
              break-words
              text-[14px]
              leading-[1.55]
              text-slate-700
              dark:text-neutral-300
            "
          >
            {post.description}
          </p>
        </div>

        {/* ========================================
            IMAGE
            ======================================== */}

        {post.mediaUrl && post.mediaType === "IMAGE" && (
          <div
            className="
                overflow-hidden
                bg-slate-100
                dark:bg-neutral-950
              "
          >
            <button
              type="button"
              onClick={() => setImagePreview(true)}
              aria-label="View image"
              className="
                  group
                  block
                  w-full
                  cursor-zoom-in
                "
            >
              <img
                src={post.mediaUrl}
                alt="Post attachment"
                loading="lazy"
                className="
                    max-h-[650px]
                    w-full
                    object-cover
                    transition-transform
                    duration-300
                    group-hover:scale-[1.01]
                  "
              />
            </button>
          </div>
        )}

        {/* ========================================
            VIDEO
            ======================================== */}

        {post.mediaUrl && post.mediaType === "VIDEO" && (
          <div
            className="
                overflow-hidden
                bg-black
              "
          >
            <video
              src={post.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="
                  max-h-[650px]
                  w-full
                  object-contain
                  bg-black
                "
            />
          </div>
        )}

        {/* ========================================
            ACTION BAR
            ======================================== */}

        {/* ========================================
    ACTION BAR
    ======================================== */}

        <div
          className="
    border-t
    border-slate-100
    px-3
    py-2.5

    dark:border-neutral-800
  "
        >
          <div className="flex items-center gap-1">
            {/* ======================================
        LIKE
        ====================================== */}

            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              aria-label={liked ? "Unlike post" : "Like post"}
              className={`
        group
        flex
        min-h-10
        items-center
        gap-2
        rounded-xl
        px-3
        py-2
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
              text-slate-500
              hover:bg-slate-100
              hover:text-slate-700
              dark:text-neutral-400
              dark:hover:bg-neutral-900
              dark:hover:text-neutral-200
            `
        }
      `}
            >
              <Heart
                size={19}
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

            {/* ======================================
        COMMENTS
        ====================================== */}

            <button
              type="button"
              onClick={() => setShowComments(true)}
              aria-label="View comments"
              className="
        flex
        min-h-10
        items-center
        gap-2
        rounded-xl
        px-3
        py-2
        text-xs
        font-semibold
        text-slate-500
        transition-all
        duration-150
        hover:bg-slate-100
        hover:text-slate-700
        active:scale-95

        dark:text-neutral-400
        dark:hover:bg-neutral-900
        dark:hover:text-neutral-200
      "
            >
              <MessageCircle size={19} strokeWidth={2} />

              <span>{commentCount}</span>
            </button>

            {/* ======================================
        SHARE
        ====================================== */}

            <button
              type="button"
              onClick={() => setShowShare(true)}
              aria-label="Share post"
              className="
        flex
        min-h-10
        items-center
        gap-2
        rounded-xl
        px-3
        py-2
        text-xs
        font-semibold
        text-slate-500
        transition-all
        duration-150
        hover:bg-slate-100
        hover:text-slate-700
        active:scale-95

        dark:text-neutral-400
        dark:hover:bg-neutral-900
        dark:hover:text-neutral-200
      "
            >
              <Send size={19} strokeWidth={2} />

              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </article>

      {/* ========================================
          IMAGE PREVIEW
          ======================================== */}

      {imagePreview && post.mediaUrl && post.mediaType === "IMAGE" && (
        <div
          className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/90
              p-4
              backdrop-blur-sm
            "
          onClick={() => setImagePreview(false)}
        >
          {/* Close */}

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
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur-md
                transition-colors
                hover:bg-white/20
              "
          >
            <X size={22} />
          </button>

          {/* Image */}

          <img
            src={post.mediaUrl}
            alt="Post attachment preview"
            onClick={(event) => event.stopPropagation()}
            className="
                max-h-[92vh]
                max-w-[96vw]
                rounded-xl
                object-contain
                shadow-2xl
              "
          />
        </div>
      )}

      {/* ========================================
          COMMENTS
          ======================================== */}

      <CommentsModal
        open={showComments}
        post={post}
        onClose={() => setShowComments(false)}
        onCommentCountChange={handleCommentCountChange}
      />

      {/* ========================================
          SHARE
          ======================================== */}

      <SharePost
        open={showShare}
        postId={post.id}
        description={post.description}
        onClose={() => setShowShare(false)}
      />
    </>
  );
};

export default PostCard;
