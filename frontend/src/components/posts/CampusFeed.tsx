import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { usePostApi, type Post } from "../../api/postApi";
import PostCard from "./PostCard";

const CampusFeed = () => {
  const { getPosts } = usePostApi();

  /*
   * Sentinel element used for infinite scrolling.
   *
   * When this element becomes visible near the bottom
   * of the screen, we load the next page.
   */
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", "all"],

      queryFn: ({ pageParam }) => {
        return getPosts(pageParam, 10);
      },

      initialPageParam: 0,

      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },

      staleTime: 1000 * 60 * 2,

      gcTime: 1000 * 60 * 30,

      refetchOnWindowFocus: false,

      retry: 1,
    });

  /*
   * Flatten all loaded pages into one posts array.
   */
  const posts: Post[] = data?.pages.flatMap((page) => page.content) ?? [];

  /*
   * ================================
   * INFINITE SCROLL
   * ================================
   *
   * Watch the invisible element near the bottom.
   *
   * When it enters the viewport, fetch another page.
   */
  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel) {
      return;
    }

    /*
     * Don't create the observer when there is
     * nothing left to load.
     */
    if (!hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry?.isIntersecting) {
          return;
        }

        /*
         * Prevent duplicate requests.
         */
        if (isFetchingNextPage) {
          return;
        }

        fetchNextPage();
      },
      {
        /*
         * Start loading slightly before the user
         * actually reaches the bottom.
         */
        rootMargin: "400px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /*
   * ================================
   * LOADING
   * ================================
   */

  if (isLoading) {
    return (
      <section className="mt-0">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Campus Posts
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            What's happening around campus.
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="
                h-48
                animate-pulse
                rounded-2xl
                bg-slate-200
                dark:bg-slate-800
              "
            />
          ))}
        </div>
      </section>
    );
  }

  /*
   * ================================
   * EMPTY STATE
   * ================================
   */

  if (posts.length === 0) {
    return (
      <section className="mt-0">
        {/* <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Campus Posts
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            What's happening around campus.
          </p>
        </div> */}

        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-5
            py-8
            text-center
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No posts yet
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Be the first to share something with your campus.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-0">
      {/* ================================
          HEADER
          ================================ */}

      {/* <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Campus Posts
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            What's happening around campus.
          </p>
        </div>
      </div> */}

      {/* ================================
          POSTS
          ================================ */}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* ================================
          INFINITE SCROLL SENTINEL
          ================================ */}

      {hasNextPage && (
        <div ref={loadMoreRef} className="h-10 w-full" aria-hidden="true" />
      )}

      {/* ================================
          AUTO LOADING INDICATOR
          ================================ */}

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4">
          <RefreshCw size={14} className="animate-spin text-violet-500" />

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Loading more posts...
          </span>
        </div>
      )}

      {/* ================================
          MANUAL LOAD BUTTON
          ================================ */}

      {hasNextPage && !isFetchingNextPage && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-xs
              font-semibold
              text-slate-600
              transition

              hover:bg-slate-50

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            <RefreshCw size={13} />
            Load more posts
          </button>
        </div>
      )}

      {/* ================================
          ALL CAUGHT UP
          ================================ */}

      {!hasNextPage && (
        <p className="py-5 text-center text-xs text-slate-400">
          You're all caught up
        </p>
      )}
    </section>
  );
};

export default CampusFeed;
