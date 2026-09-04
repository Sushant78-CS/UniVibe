import { Plus, RefreshCw, Newspaper } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { usePostApi, type Post } from "../../api/postApi";

import PostCard from "../../components/posts/PostCard";
import FloatingTabs from "../../components/home/FloatingTabs";
import CreatePostModal from "../../components/posts/CreatePostModal";
import EditPostModal from "../../components/posts/EditPostModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { usePublishingStore } from "../../store/publishingStore";

const Posts = () => {
  const queryClient = useQueryClient();

  const { getPosts, getMyPosts, deletePost } = usePostApi();

  const publishingCompletedAt = usePublishingStore(
    (state) => state.completedAt,
  );

  /*
   * ============================================
   * REFS
   * ============================================
   */

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /*
   * ============================================
   * STATE
   * ============================================
   */

  const [view, setView] = useState<"all" | "my">("all");

  const [deletePostTarget, setDeletePostTarget] = useState<Post | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [error, setError] = useState("");

  /*
   * ============================================
   * POSTS QUERY
   * ============================================
   */

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useInfiniteQuery({
    queryKey: ["posts", view],

    queryFn: async ({ pageParam }) => {
      if (view === "all") {
        return getPosts(pageParam, 10);
      }

      return getMyPosts(pageParam, 10);
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;

      if (nextPage < lastPage.totalPages) {
        return nextPage;
      }

      return undefined;
    },

    staleTime: 1000 * 60 * 2,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /*
   * ============================================
   * FLATTEN POSTS
   * ============================================
   */

  const posts: Post[] = data?.pages.flatMap((page) => page.content) ?? [];

  /*
   * ============================================
   * ERROR
   * ============================================
   */

  useEffect(() => {
    if (isError) {
      setError("Unable to load posts. Please try again.");
    } else {
      setError("");
    }
  }, [isError]);

  /*
   * ============================================
   * NEW POST / PUBLISH COMPLETE
   * ============================================
   */

  useEffect(() => {
    if (!publishingCompletedAt) {
      return;
    }

    queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  }, [publishingCompletedAt, queryClient]);

  /*
   * ============================================
   * INFINITE SCROLL
   * ============================================
   */

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "400px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /*
   * ============================================
   * EDIT
   * ============================================
   */

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handlePostUpdated = async (_updatedPost: Post) => {
    setEditingPost(null);

    await queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  };

  /*
   * ============================================
   * DELETE
   * ============================================
   */

  const handleDelete = (post: Post) => {
    setDeletePostTarget(post);
  };

  const confirmDeletePost = async () => {
    if (!deletePostTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deletePost(deletePostTarget.id);

      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      setDeletePostTarget(null);
    } catch (err) {
      console.error("Failed to delete post:", err);

      setError("Failed to delete the post. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================
   * CREATE
   * ============================================
   */

  const handlePostCreated = async () => {
    setShowCreatePostModal(false);

    await queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  };

  /*
   * ============================================
   * REFRESH
   * ============================================
   */

  const handleRefresh = async () => {
    try {
      setError("");

      await refetch();
    } catch (err) {
      console.error("Failed to refresh posts:", err);

      setError("Unable to refresh posts. Please try again.");
    }
  };

  /*
   * ============================================
   * RENDER
   * ============================================
   */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-32
        text-slate-900
        transition-colors
        duration-200

        dark:bg-black
        dark:text-white
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-[680px]
          px-0
          pb-8
          sm:px-4
          sm:pt-5
        "
      >
        {/* ======================================
            PAGE HEADER
            ====================================== */}

        <div
          className="
            border-b
            border-slate-200
            bg-white
            px-4
            py-4

            dark:border-neutral-800
            dark:bg-black

            sm:border
            sm:rounded-2xl
            sm:px-5
            sm:py-4
            sm:shadow-sm
            dark:sm:bg-[#111111]
            dark:sm:shadow-none
          "
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  dark:text-white
                "
              >
                Campus Posts
              </h1>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-neutral-500
                "
              >
                Discover what&apos;s happening around your campus.
              </p>
            </div>

            {/* Refresh */}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label="Refresh posts"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-500
                transition-all
                hover:bg-slate-50
                hover:text-slate-800
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50

                dark:border-neutral-800
                dark:bg-[#171717]
                dark:text-neutral-400
                dark:hover:bg-neutral-800
                dark:hover:text-neutral-200
              "
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* ====================================
              FILTER TABS
              ==================================== */}

          <div
            className="
              mt-4
              flex
              w-full
              rounded-xl
              bg-slate-100
              p-1

              dark:bg-neutral-900
            "
          >
            {/* All */}

            <button
              type="button"
              onClick={() => setView("all")}
              className={`
                flex
                flex-1
                items-center
                justify-center
                rounded-lg
                px-3
                py-2
                text-xs
                font-semibold
                transition-all

                ${
                  view === "all"
                    ? `
                      bg-white
                      text-slate-900
                      shadow-sm
                      dark:bg-[#242424]
                      dark:text-white
                    `
                    : `
                      text-slate-500
                      hover:text-slate-800
                      dark:text-neutral-500
                      dark:hover:text-neutral-200
                    `
                }
              `}
            >
              All posts
            </button>

            {/* My Posts */}

            <button
              type="button"
              onClick={() => setView("my")}
              className={`
                flex
                flex-1
                items-center
                justify-center
                rounded-lg
                px-3
                py-2
                text-xs
                font-semibold
                transition-all

                ${
                  view === "my"
                    ? `
                      bg-white
                      text-slate-900
                      shadow-sm
                      dark:bg-[#242424]
                      dark:text-white
                    `
                    : `
                      text-slate-500
                      hover:text-slate-800
                      dark:text-neutral-500
                      dark:hover:text-neutral-200
                    `
                }
              `}
            >
              My posts
            </button>
          </div>
        </div>

        {/* ======================================
            ERROR
            ====================================== */}

        {error && (
          <div
            className="
              mx-3
              mt-4
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600

              dark:border-red-900/50
              dark:bg-red-950/30
              dark:text-red-400

              sm:mx-0
            "
          >
            {error}
          </div>
        )}

        {/* ======================================
            INITIAL LOADING
            ====================================== */}

        {isLoading && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                    overflow-hidden
                    border-y
                    border-slate-200
                    bg-white
                    sm:rounded-2xl
                    sm:border

                    dark:border-neutral-800
                    dark:bg-[#171717]
                  "
              >
                {/* Skeleton header */}

                <div className="flex items-center gap-3 px-4 py-4">
                  <div
                    className="
                        h-11
                        w-11
                        shrink-0
                        animate-pulse
                        rounded-full
                        bg-slate-200
                        dark:bg-neutral-800
                      "
                  />

                  <div className="flex-1">
                    <div
                      className="
                          h-3.5
                          w-28
                          animate-pulse
                          rounded
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                    />

                    <div
                      className="
                          mt-2
                          h-2.5
                          w-40
                          animate-pulse
                          rounded
                          bg-slate-100
                          dark:bg-neutral-900
                        "
                    />
                  </div>
                </div>

                {/* Skeleton text */}

                <div className="space-y-2 px-4 pb-4">
                  <div
                    className="
                        h-3
                        w-[85%]
                        animate-pulse
                        rounded
                        bg-slate-200
                        dark:bg-neutral-800
                      "
                  />

                  <div
                    className="
                        h-3
                        w-[65%]
                        animate-pulse
                        rounded
                        bg-slate-200
                        dark:bg-neutral-800
                      "
                  />
                </div>

                {/* Skeleton media */}

                <div
                  className="
                      h-64
                      animate-pulse
                      bg-slate-100
                      dark:bg-neutral-900
                    "
                />

                {/* Skeleton actions */}

                <div className="flex gap-3 px-4 py-3">
                  <div
                    className="
                        h-9
                        w-16
                        animate-pulse
                        rounded-xl
                        bg-slate-100
                        dark:bg-neutral-900
                      "
                  />

                  <div
                    className="
                        h-9
                        w-16
                        animate-pulse
                        rounded-xl
                        bg-slate-100
                        dark:bg-neutral-900
                      "
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================
            EMPTY STATE
            ====================================== */}

        {!isLoading && posts.length === 0 && (
          <div
            className="
                mx-3
                mt-5
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-6
                py-14
                text-center
                shadow-sm

                dark:border-neutral-800
                dark:bg-[#171717]
                dark:shadow-none

                sm:mx-0
              "
          >
            <div
              className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  text-slate-500

                  dark:bg-neutral-900
                  dark:text-neutral-400
                "
            >
              <Newspaper size={25} />
            </div>

            <h2
              className="
                  mt-5
                  text-base
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
            >
              No posts yet
            </h2>

            <p
              className="
                  mx-auto
                  mt-2
                  max-w-sm
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-neutral-500
                "
            >
              Nothing has been shared with the campus community yet. Start the
              conversation with your first post.
            </p>

            <button
              type="button"
              onClick={() => setShowCreatePostModal(true)}
              className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-violet-600
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-violet-700
                  active:scale-95
                  dark:bg-violet-600
                  dark:hover:bg-violet-500
                "
            >
              <Plus size={14} />
              Create a post
            </button>
          </div>
        )}

        {/* ======================================
            FEED
            ====================================== */}

        {!isLoading && posts.length > 0 && (
          <>
            <div
              className="
                  mt-4
                  space-y-3
                  sm:space-y-4
                "
            >
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwner={view === "my"}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* ==================================
                  INFINITE SCROLL
                  ================================== */}

            <div
              ref={loadMoreRef}
              className="
                  flex
                  min-h-20
                  items-center
                  justify-center
                "
            >
              {isFetchingNextPage && (
                <div
                  className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-2
                      text-xs
                      font-medium
                      text-slate-500

                      dark:border-neutral-800
                      dark:bg-[#171717]
                      dark:text-neutral-400
                    "
                >
                  <RefreshCw size={13} className="animate-spin" />
                  Loading more
                </div>
              )}

              {!hasNextPage && !isFetchingNextPage && posts.length > 0 && (
                <div
                  className="
                        flex
                        items-center
                        gap-2
                        py-5
                        text-[11px]
                        text-slate-400
                        dark:text-neutral-600
                      "
                >
                  <span
                    className="
                          h-px
                          w-8
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                  />
                  You&apos;re all caught up
                  <span
                    className="
                          h-px
                          w-8
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ========================================
          BOTTOM NAVIGATION
          ======================================== */}

      <FloatingTabs />

      {/* ========================================
          CREATE POST MODAL
          ======================================== */}

      <CreatePostModal
        open={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onCreated={handlePostCreated}
      />

      {/* ========================================
          EDIT POST MODAL
          ======================================== */}

      <EditPostModal
        open={editingPost !== null}
        post={editingPost!}
        onClose={() => setEditingPost(null)}
        onUpdated={handlePostUpdated}
      />

      {/* ========================================
          DELETE CONFIRMATION
          ======================================== */}

      <ConfirmModal
        open={deletePostTarget !== null}
        title="Delete post?"
        message={
          deletePostTarget
            ? "Are you sure you want to delete this post? This action cannot be undone."
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        loadingText="Deleting..."
        onCancel={() => {
          if (!deleting) {
            setDeletePostTarget(null);
          }
        }}
        onConfirm={confirmDeletePost}
      />
    </div>
  );
};

export default Posts;
