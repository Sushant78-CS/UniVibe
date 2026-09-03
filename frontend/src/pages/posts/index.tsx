import { useEffect, useRef, useState } from "react";
import { Plus, RefreshCw, Newspaper } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { usePostApi, type Post } from "../../api/postApi";
import PostCard from "../../components/posts/PostCard";
import FloatingTabs from "../../components/home/FloatingTabs";
import CreatePostModal from "../../components/posts/CreatePostModal";
import EditPostModal from "../../components/posts/EditPostModal";
import ConfirmModal from "../../components/common/ConfirmModal";

const Posts = () => {
  /*
   * ================================
   * API / QUERY
   * ================================
   */

  const queryClient = useQueryClient();

  const { getPosts, getMyPosts, deletePost } = usePostApi();

  /*
   * ================================
   * REFS
   * ================================
   */

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /*
   * ================================
   * STATE
   * ================================
   */

  const [view, setView] = useState<"all" | "my">("all");

  const [deletePostTarget, setDeletePostTarget] = useState<Post | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [error, setError] = useState("");

  /*
   * ================================
   * POSTS QUERY
   * ================================
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
    /*
     * Different cache for:
     *
     * ["posts", "all"]
     * ["posts", "my"]
     */
    queryKey: ["posts", view],

    /*
     * Fetch the requested page
     */
    queryFn: async ({ pageParam }) => {
      return view === "all"
        ? getPosts(pageParam, 10)
        : getMyPosts(pageParam, 10);
    },

    /*
     * First page
     */
    initialPageParam: 0,

    /*
     * Determine whether another page exists
     */
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;

      if (nextPage < lastPage.totalPages) {
        return nextPage;
      }

      return undefined;
    },

    /*
     * Data is considered fresh for 2 minutes.
     *
     * If the user leaves Posts and comes back
     * within 2 minutes, React Query uses the
     * cached data instead of requesting it again.
     */
    staleTime: 1000 * 60 * 2,

    /*
     * Keep unused post cache for 30 minutes.
     */
    gcTime: 1000 * 60 * 30,

    /*
     * Don't automatically refetch simply because
     * the browser window gets focus.
     */
    refetchOnWindowFocus: false,

    /*
     * Retry failed requests once.
     */
    retry: 1,
  });

  /*
   * ================================
   * FLATTEN POSTS
   * ================================
   *
   * React Query stores:
   *
   * pages = [
   *   page 0,
   *   page 1,
   *   page 2
   * ]
   *
   * We turn them into one array for PostCard.
   */

  const posts: Post[] = data?.pages.flatMap((page) => page.content) ?? [];

  /*
   * ================================
   * ERROR
   * ================================
   */

  useEffect(() => {
    if (isError) {
      setError("Unable to load posts. Please try again.");
    } else {
      setError("");
    }
  }, [isError]);

  /*
   * ================================
   * INFINITE SCROLL
   * ================================
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
        rootMargin: "300px",
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /*
   * ================================
   * EDIT
   * ================================
   */

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handlePostUpdated = async (_updatedPost: Post) => {
    setEditingPost(null);

    /*
     * The server has the latest version.
     *
     * Mark cached posts as stale and fetch
     * the updated data.
     */
    await queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  };

  /*
   * ================================
   * DELETE
   * ================================
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

      /*
       * Refresh all post caches.
       *
       * This keeps:
       *
       * All Posts
       * My Posts
       *
       * synchronized after deletion.
       */
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
   * ================================
   * CREATE POST
   * ================================
   */

  const handlePostCreated = async () => {
    setShowCreatePostModal(false);

    /*
     * A new post has been created.
     *
     * Invalidate both:
     *
     * ["posts", "all"]
     * ["posts", "my"]
     *
     * so the feed gets the newest data.
     */
    await queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  };

  /*
   * ================================
   * REFRESH
   * ================================
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
   * ================================
   * RENDER
   * ================================
   */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-32
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-2xl
          px-4
          py-6
          sm:px-6
        "
      >
        {/* ================= HEADER ================= */}

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1
                className="
                  mt-0.5
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Campus Posts
              </h1>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Discover what's happening around campus.
              </p>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label="Refresh posts"
              className="
                ml-3
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:bg-slate-100
                active:scale-95
                disabled:cursor-not-allowed
                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-400
              "
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* ================= POST FILTER ================= */}

        <div
          className="
            mb-3
            flex
            w-full
            rounded-lg
            bg-slate-100
            p-0.5
            dark:bg-slate-800
          "
        >
          {/* ALL POSTS */}

          <button
            type="button"
            onClick={() => setView("all")}
            className={`
              flex-1
              rounded-md
              px-3
              py-1.5
              text-[11px]
              font-semibold
              transition-all

              ${
                view === "all"
                  ? `
                    bg-white
                    text-violet-600
                    shadow-sm
                    dark:bg-slate-900
                    dark:text-violet-400
                  `
                  : `
                    text-slate-500
                    hover:text-slate-700
                    dark:text-slate-400
                    dark:hover:text-slate-200
                  `
              }
            `}
          >
            All Posts
          </button>

          {/* MY POSTS */}

          <button
            type="button"
            onClick={() => setView("my")}
            className={`
              flex-1
              rounded-md
              px-3
              py-1.5
              text-[11px]
              font-semibold
              transition-all

              ${
                view === "my"
                  ? `
                    bg-white
                    text-violet-600
                    shadow-sm
                    dark:bg-slate-900
                    dark:text-violet-400
                  `
                  : `
                    text-slate-500
                    hover:text-slate-700
                    dark:text-slate-400
                    dark:hover:text-slate-200
                  `
              }
            `}
          >
            My Posts
          </button>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div
            className="
              mb-5
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-600
              dark:border-red-900/50
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* ================= INITIAL LOADING ================= */}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-56
                  animate-pulse
                  rounded-3xl
                  bg-slate-200
                  dark:bg-slate-800
                "
              />
            ))}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!isLoading && posts.length === 0 && (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              py-14
              text-center
              dark:border-slate-700
              dark:bg-slate-900
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
                bg-violet-100
                text-violet-600
                dark:bg-violet-500/10
                dark:text-violet-400
              "
            >
              <Newspaper size={26} />
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
                dark:text-slate-400
              "
            >
              Nothing has been shared with the community yet. Be the first to
              share what's happening on campus.
            </p>

            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-medium
                text-violet-600
                dark:text-violet-400
              "
            >
              <Plus size={14} />
              Use the + button below to post
            </div>
          </div>
        )}

        {/* ================= FEED ================= */}

        {!isLoading && posts.length > 0 && (
          <>
            <div className="space-y-4">
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

            {/* ================= INFINITE SCROLL ================= */}

            <div
              ref={loadMoreRef}
              className="
                flex
                min-h-16
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
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  <RefreshCw size={14} className="animate-spin" />
                  Loading more posts...
                </div>
              )}

              {!hasNextPage && !isFetchingNextPage && posts.length > 0 && (
                <p
                  className="
                      py-4
                      text-xs
                      text-slate-400
                    "
                >
                  You're all caught up.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* ================= CREATE POST BUTTON ================= */}

      <div
        className="
          fixed
          bottom-23
          right-4
          z-40
          sm:right-6
        "
      >
        <button
          type="button"
          onClick={() => setShowCreatePostModal(true)}
          aria-label="Create post"
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-violet-600
            text-white
            shadow-md
            transition-all
            duration-200
            hover:scale-105
            hover:bg-violet-700
            active:scale-95
            dark:bg-violet-500
            dark:hover:bg-violet-600
          "
        >
          <Plus size={27} strokeWidth={2.5} />
        </button>
      </div>

      {/* ================= BOTTOM NAV ================= */}

      <FloatingTabs />

      {/* ================= CREATE POST MODAL ================= */}

      <CreatePostModal
        open={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onCreated={handlePostCreated}
      />

      {/* ================= EDIT POST MODAL ================= */}

      <EditPostModal
        open={editingPost !== null}
        post={editingPost!}
        onClose={() => setEditingPost(null)}
        onUpdated={handlePostUpdated}
      />

      {/* ================= DELETE CONFIRMATION ================= */}

      <ConfirmModal
        open={deletePostTarget !== null}
        title="Delete Post?"
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
