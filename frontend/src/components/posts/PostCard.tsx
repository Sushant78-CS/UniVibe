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
} from "lucide-react";

import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router";

import { usePostApi, type Post } from "../../api/postApi";

import CommentsModal from "./CommentsModal";
import SharePost from "./SharePost";
import PostMedia from "./PostMedia";
import PostActions from "./PostActions";

import { optimizeCloudinaryImage } from "../../utils/cloudinary";

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

/* ============================================
   CATEGORY
============================================ */

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

/* ============================================
   COMPONENT
============================================ */

const PostCard = ({
  post,
  isOwner = false,
  onEdit,
  onDelete,
}: PostCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { likePost, unlikePost } = usePostApi();

  /* ==========================================
     STATE
  ========================================== */

  const [imagePreview, setImagePreview] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [showShare, setShowShare] = useState(false);

  const [liked, setLiked] = useState(post.likedByMe);

  const [likeCount, setLikeCount] = useState(post.likeCount);

  const [commentCount, setCommentCount] = useState(post.commentCount);

  const [liking, setLiking] = useState(false);

  const [commentsLoading, setCommentsLoading] = useState(false);

  /* ==========================================
     SYNC
  ========================================== */

  useEffect(() => {
    setLiked(post.likedByMe);

    setLikeCount(post.likeCount);

    setCommentCount(post.commentCount);
  }, [post.likedByMe, post.likeCount, post.commentCount]);

  /* ==========================================
     CATEGORY
  ========================================== */

  const category = categoryConfig[post.category] ?? categoryConfig.GENERAL;

  const CategoryIcon = category.icon;

  /* ==========================================
     DATE
  ========================================== */

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

  /* ==========================================
     EDITED
  ========================================== */

  const isEdited =
    !!post.updatedAt &&
    new Date(post.updatedAt).getTime() >
      new Date(post.createdAt).getTime() + 1000;

  /* ==========================================
     LIKE
  ========================================== */

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

    setLiked(nextLiked);
    setLikeCount(nextCount);
    setLiking(true);

    try {
      if (previousLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }

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
    } catch (error) {
      console.error("Failed to update like:", error);

      setLiked(previousLiked);

      setLikeCount(previousCount);
    } finally {
      setLiking(false);
    }
  };

  /* ==========================================
     COMMENTS
  ========================================== */

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);

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

  /* ==========================================
     PROFILE
  ========================================== */

  const openProfile = () => {
    if (!post.profileId) {
      return;
    }

    navigate(`/profile/${post.profileId}`);
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <>
      <article
        className="
          overflow-hidden
          border-y
          border-neutral-200
          bg-white
          transition-colors

          sm:rounded-2xl
          sm:border
          sm:shadow-[0_1px_4px_rgba(0,0,0,0.04)]

          dark:border-neutral-800
          dark:bg-black
          dark:shadow-none
        "
      >
        {/* ======================================
            HEADER
        ====================================== */}

        <div
          className="
            px-4
            pb-2
            pt-3.5
            sm:px-5
          "
        >
          <div className="flex items-start gap-3">
            {/* AVATAR */}

            <button
              type="button"
              onClick={openProfile}
              aria-label={`View ${post.fullName ?? "user"}'s profile`}
              className="
                shrink-0
                rounded-full
                focus:outline-none
                focus:ring-4
                focus:ring-neutral-900/10
                dark:focus:ring-white/10
              "
            >
              {post.profileImage ? (
                <img
                  src={post.profileImage}
                  alt={post.fullName ?? "User"}
                  loading="lazy"
                  decoding="async"
                  className="
                    h-10
                    w-10
                    rounded-full
                    object-cover
                    ring-1
                    ring-neutral-200
                    dark:ring-neutral-700
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-neutral-100
                    text-neutral-500
                    dark:bg-neutral-900
                    dark:text-neutral-400
                  "
                >
                  <UserRound size={18} />
                </div>
              )}
            </button>

            {/* USER */}

            <div
              className="
                min-w-0
                flex-1
                pt-0.5
              "
            >
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
                  text-neutral-900
                  hover:text-neutral-600
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
                  text-neutral-400
                  dark:text-neutral-500
                "
              >
                <span className="max-w-[100px] truncate">
                  @{post.username ?? "user"}
                </span>

                <span>·</span>

                <span>{formattedDate}</span>

                <span>·</span>

                <span>{formattedTime}</span>

                {isEdited && (
                  <>
                    <span>·</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>

            {/* CATEGORY */}

            <div
              className="
                hidden
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-neutral-200
                bg-neutral-50
                px-2.5
                py-1.5
                text-[10px]
                font-semibold
                text-neutral-600
                sm:flex
                dark:border-neutral-800
                dark:bg-neutral-900
                dark:text-neutral-300
              "
            >
              <CategoryIcon size={12} />
              <span>{category.label}</span>
            </div>

            {/* OWNER MENU */}

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
                    text-neutral-400
                    hover:bg-neutral-100
                    hover:text-neutral-700
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
                    border-neutral-200
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
                      text-neutral-700
                      hover:bg-neutral-50
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
        </div>

        {/* ======================================
            DESCRIPTION
        ====================================== */}

        <div className="px-4 pb-3 sm:px-5">
          <p
            className="
              break-words
              whitespace-pre-wrap
              text-[14px]
              leading-[1.5]
              text-neutral-700
              dark:text-neutral-300
              line-clamp-4
            "
          >
            {post.description}
          </p>
        </div>

        {/* ======================================
            MEDIA
        ====================================== */}

        <PostMedia
          mediaUrl={post.mediaUrl}
          mediaType={post.mediaType}
          onImageOpen={() => setImagePreview(true)}
        />

        {/* ======================================
            ACTIONS
        ====================================== */}

        <PostActions
          liked={liked}
          likeCount={likeCount}
          commentCount={commentCount}
          liking={liking}
          commentsLoading={commentsLoading}
          onLike={handleLike}
          onComments={() => setShowComments(true)}
          onShare={() => setShowShare(true)}
        />
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
            "
          onClick={() => setImagePreview(false)}
        >
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
                hover:bg-white/20
              "
          >
            <X size={22} />
          </button>

          <img
            src={optimizeCloudinaryImage(post.mediaUrl, 1600) ?? ""}
            alt="Post attachment preview"
            onClick={(event) => event.stopPropagation()}
            className="
                max-h-[92vh]
                max-w-[96vw]
                rounded-xl
                object-contain
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
        onLoadingChange={setCommentsLoading}
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
