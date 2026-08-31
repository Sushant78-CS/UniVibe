import { useEffect, useRef, useState } from "react";
import { Plus, RefreshCw, Newspaper } from "lucide-react";

import { usePostApi, type Post } from "../../api/postApi";
import PostCard from "../../components/posts/PostCard";
import FloatingTabs from "../../components/home/FloatingTabs";
import CreatePostModal from "../../components/posts/CreatePostModal";
import EditPostModal from "../../components/posts/EditPostModal";
import ConfirmModal from "../../components/common/ConfirmModal";

const Posts = () => {
  const { getPosts, getMyPosts, deletePost } = usePostApi();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<"all" | "my">("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletePostTarget, setDeletePostTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async (pageNumber: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        view === "all"
          ? await getPosts(pageNumber, 10)
          : await getMyPosts(pageNumber, 10);

      if (append) {
        setPosts((prev) => [...prev, ...data.content]);
      } else {
        setPosts(data.content);
      }

      setTotalPages(data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Unable to load posts. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setPosts([]);
    setTotalPages(0);

    loadPosts(0, false);
  }, [view]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (
          target.isIntersecting &&
          !loading &&
          !loadingMore &&
          page < totalPages - 1
        ) {
          loadPosts(page + 1, true);
        }
      },
      {
        rootMargin: "300px",
      },
    );

    const element = loadMoreRef.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [page, totalPages, loading, loadingMore, view]);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
    );

    setEditingPost(null);
  };

  // const handleDelete = async (post: Post) => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete this post?",
  //   );

  //   if (!confirmed) {
  //     return;
  //   }

  //   try {
  //     await deletePost(post.id);

  //     setPosts((prev) => prev.filter((item) => item.id !== post.id));
  //   } catch (err) {
  //     console.error("Failed to delete post:", err);

  //     setError("Failed to delete the post.");
  //   }
  // };

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

      if (posts.length === 1 && page > 0) {
        setPage(page - 1);
        await loadPosts(page - 1);
      } else {
        setPosts((prev) =>
          prev.filter((item) => item.id !== deletePostTarget.id),
        );
      }

      setDeletePostTarget(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete the post. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePostCreated = async () => {
    setShowCreatePostModal(false);
    setPage(0);
    setPosts([]);
    setTotalPages(0);
    await loadPosts(0, false);
  };

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
              {/* <p className="text-[10px] font-semibold tracking-wider text-violet-600 dark:text-violet-400">
                COMMUNITY
              </p> */}

              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Campus Posts
              </h1>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Discover what's happening around campus.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setPage(0);
                setPosts([]);
                await loadPosts(0, false);
              }}
              disabled={loading}
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
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ================= POST FILTER ================= */}
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

        {/* ================= LOADING ================= */}
        {loading && (
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
        {!loading && posts.length === 0 && (
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
        {!loading && posts.length > 0 && (
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

            {/* Infinite scroll trigger */}
            <div
              ref={loadMoreRef}
              className="flex min-h-16 items-center justify-center"
            >
              {loadingMore && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <RefreshCw size={14} className="animate-spin" />
                  Loading more posts...
                </div>
              )}

              {/* {!loadingMore && page >= totalPages - 1 && posts.length > 0 && (
                <p className="py-4 text-xs text-slate-400">
                  You're all caught up.
                </p>
              )} */}
            </div>
          </>
        )}
      </main>

      {/* ================= CREATE POST BUTTON ================= */}

      {/* Create Post Button */}
      <div className="fixed bottom-23 right-4 z-40 sm:right-6">
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
      <EditPostModal
        open={editingPost !== null}
        post={editingPost!}
        onClose={() => setEditingPost(null)}
        onUpdated={handlePostUpdated}
      />
      <ConfirmModal
        open={deletePostTarget !== null}
        title="Delete Post?"
        message={
          deletePostTarget
            ? `Are you sure you want to delete this post? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
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
