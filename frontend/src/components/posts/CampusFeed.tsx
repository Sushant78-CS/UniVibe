import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { usePostApi, type Post } from "../../api/postApi";
import PostCard from "./PostCard";

const CampusFeed = () => {
  const { getPosts } = usePostApi();

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

  const posts: Post[] = data?.pages.flatMap((page) => page.content) ?? [];

  if (isLoading) {
    return (
      <section className="mt-7">
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

  if (posts.length === 0) {
    return (
      <section className="mt-7">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Campus Posts
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            What's happening around campus.
          </p>
        </div>

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
    <section className="mt-7">
      {/* HEADER */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Campus Posts
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            What's happening around campus.
          </p>
        </div>
      </div>

      {/* POSTS */}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* LOAD MORE */}

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
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
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            {isFetchingNextPage && (
              <RefreshCw size={13} className="animate-spin" />
            )}

            {isFetchingNextPage ? "Loading..." : "Load more posts"}
          </button>
        </div>
      )}

      {!hasNextPage && (
        <p className="py-5 text-center text-xs text-slate-400">
          You're all caught up ✨
        </p>
      )}
    </section>
  );
};

export default CampusFeed;
