import { Search, Users, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import FloatingTabs from "../../components/home/FloatingTabs";
import PersonCard from "../../components/discover/PersonCard";

import { useRecommendationApi } from "../../api/recommendationApi";
import { useConnectionApi } from "../../api/connectionApi";

import type { RecommendationPageResponse } from "../../api/recommendationApi";
import type { DiscoverPerson } from "../../api/discoverApi";

const PAGE_SIZE = 10;

const DiscoverPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { getRecommendations } = useRecommendationApi();

  const { sendConnection } = useConnectionApi();

  /*
   * ============================================
   * STATE
   * ============================================
   */

  const [connectingId, setConnectingId] = useState<number | null>(null);

  /*
   * Element at the bottom of the people list.
   * IntersectionObserver watches this element.
   */

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /*
   * ============================================
   * RECOMMENDATIONS
   * ============================================
   */

  const {
    data,
    isLoading: loading,
    isError,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery<RecommendationPageResponse>({
    queryKey: ["recommendations"],

    /*
     * First request:
     *
     * /recommendations?page=0&size=10
     */

    initialPageParam: 0,

    queryFn: ({ pageParam }) =>
      getRecommendations(pageParam as number, PAGE_SIZE),

    /*
     * Load the next page when available.
     */

    getNextPageParam: (lastPage) => {
      if (lastPage.last) {
        return undefined;
      }

      return lastPage.page + 1;
    },

    /*
     * Cache recommendations for 5 minutes.
     */

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /*
   * ============================================
   * FLATTEN RESULTS
   * ============================================
   */

  const people: DiscoverPerson[] =
    data?.pages.flatMap((page) =>
      page.recommendations.map(
        (person): DiscoverPerson => ({
          id: person.profileId,

          userId: person.userId,

          fullName: person.fullName,

          username: person.username,

          bio: person.bio,

          profileImage: person.profileImage || "",

          college: person.college || "",

          department: person.department || "",

          year: person.year || "",

          interests: person.interests || "",

          score: person.score,

          connectionStatus: person.connectionStatus,
        }),
      ),
    ) ?? [];

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

    /*
     * No more pages.
     */

    if (!hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        /*
         * Start loading before reaching
         * the absolute bottom.
         */

        rootMargin: "300px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /*
   * ============================================
   * CONNECT
   * ============================================
   */

  const handleConnect = async (userId: number) => {
    try {
      setConnectingId(userId);

      await sendConnection(userId);

      /*
       * Immediately update the cached
       * recommendation.
       */

      queryClient.setQueryData(["recommendations"], (currentData: any) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,

          pages: currentData.pages.map((page: RecommendationPageResponse) => ({
            ...page,

            recommendations: page.recommendations.map((person) =>
              person.userId === userId
                ? {
                    ...person,

                    connectionStatus: "PENDING_SENT",
                  }
                : person,
            ),
          })),
        };
      });
    } catch (error) {
      console.error("Connection request failed:", error);
    } finally {
      setConnectingId(null);
    }
  };

  /*
   * ============================================
   * SEARCH
   * ============================================
   */

  const openSearch = () => {
    navigate("/discover/search");
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
        pb-28
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
          px-4
          pb-8
          pt-5

          sm:px-0
          sm:pt-6
        "
      >
        {/* ======================================
            HEADER
            ====================================== */}

        <section>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-violet-600

              dark:text-violet-400
            "
          >
            Discover
          </p>

          <h1
            className="
              mt-1
              text-xl
              font-bold
              tracking-tight
              text-slate-950

              dark:text-white
            "
          >
            Find your people
          </h1>
        </section>

        {/* ======================================
            SEARCH
            ====================================== */}

        <button
          type="button"
          onClick={openSearch}
          aria-label="Search people"
          className="
            mt-4
            flex
            h-10.5
            w-full
            items-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-left
            outline-none

            transition-all
            duration-150

            hover:border-slate-300

            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-500/10

            dark:border-neutral-800
            dark:bg-[#171717]
            dark:hover:border-neutral-700
          "
        >
          <Search
            size={16}
            strokeWidth={2}
            className="
              ml-3.5
              shrink-0
              text-slate-400

              dark:text-neutral-500
            "
          />

          <span
            className="
              ml-3
              text-[13px]
              font-medium
              text-slate-400

              dark:text-neutral-500
            "
          >
            Search people...
          </span>
        </button>

        {/* ======================================
            RESULTS
            ====================================== */}

        <section className="mt-5">
          {/* ====================================
              INITIAL LOADING
              ==================================== */}

          {loading && <RecommendationSkeleton />}

          {/* ====================================
              ERROR
              ==================================== */}

          {!loading && isError && (
            <div
              className="
                rounded-2xl
                border
                border-red-200
                bg-white
                px-6
                py-10
                text-center

                dark:border-red-900/50
                dark:bg-[#171717]
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full

                  bg-red-50
                  text-red-500

                  dark:bg-red-500/10
                  dark:text-red-400
                "
              >
                <RefreshCw size={18} />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-slate-900

                  dark:text-white
                "
              >
                Couldn't load people
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500

                  dark:text-neutral-500
                "
              >
                Something went wrong while loading recommendations.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="
                  mt-4
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

                  transition

                  hover:bg-violet-700
                  disabled:opacity-60

                  dark:hover:bg-violet-500
                "
              >
                <RefreshCw
                  size={13}
                  className={isFetching ? "animate-spin" : ""}
                />
                Try again
              </button>
            </div>
          )}

          {/* ====================================
              EMPTY
              ==================================== */}

          {!loading && !isError && people.length === 0 && (
            <div
              className="
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-200
                  bg-white
                  px-6
                  py-12
                  text-center

                  dark:border-neutral-800
                  dark:bg-[#171717]
                "
            >
              <div
                className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full

                    bg-slate-100
                    text-slate-500

                    dark:bg-neutral-900
                    dark:text-neutral-400
                  "
              >
                <Users size={21} />
              </div>

              <h3
                className="
                    mt-4
                    text-sm
                    font-semibold
                    text-slate-900

                    dark:text-white
                  "
              >
                No people available
              </h3>

              <p
                className="
                    mx-auto
                    mt-1.5
                    max-w-xs
                    text-xs
                    leading-5
                    text-slate-500

                    dark:text-neutral-500
                  "
              >
                There are no recommendations available right now.
              </p>
            </div>
          )}

          {/* ====================================
              PEOPLE
              ==================================== */}

          {!loading && !isError && people.length > 0 && (
            <>
              {/*
               * Instagram-style vertical list.
               *
               * No cards.
               * No grid.
               * PersonCard handles its own
               * bottom divider.
               */}

              <div className="w-full">
                {people.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onClick={() => navigate(`/profile/${person.id}`)}
                    onConnect={() => handleConnect(person.userId)}
                    connectionStatus={person.connectionStatus}
                    connecting={connectingId === person.userId}
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
                    min-h-[80px]
                    items-center
                    justify-center
                  "
              >
                {/* Loading */}

                {isFetchingNextPage && (
                  <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2.5
                        py-4
                      "
                    aria-label="Loading more"
                  >
                    <div
                      className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-slate-300
                          border-t-violet-600

                          dark:border-neutral-700
                          dark:border-t-violet-400
                        "
                    />

                    <span
                      className="
                          text-xs
                          font-bold
                          tracking-wide
                          text-slate-600

                          dark:text-neutral-300
                        "
                    >
                      Loading more...
                    </span>
                  </div>
                )}

                {/* Finished */}

                {!hasNextPage && people.length > 0 && (
                  <span
                    className="
                          text-[11px]
                          font-medium
                          text-slate-400

                          dark:text-neutral-600
                        "
                  >
                    No more people
                  </span>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ========================================
          BOTTOM NAVIGATION
          ======================================== */}

      <FloatingTabs />
    </div>
  );
};

export default DiscoverPage;

/*
 * =====================================================
 * RECOMMENDATION SKELETON
 * =====================================================
 *
 * Matches the Instagram-style person rows.
 * No cards or large rounded containers.
 */

const RecommendationSkeleton = () => {
  return (
    <div className="w-full">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="
              flex
              min-h-[72px]
              w-full
              items-center
              gap-3.5
              border-b
              border-slate-200/80
              px-1
              py-3

              dark:border-neutral-800/80
            "
        >
          {/* Avatar */}

          <div
            className="
                h-14
                w-14
                shrink-0
                animate-pulse
                rounded-full
                bg-slate-200

                dark:bg-neutral-800
              "
          />

          {/* User information */}

          <div className="min-w-0 flex-1">
            <div
              className="
                  h-3.5
                  w-32
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
                  w-20
                  animate-pulse
                  rounded
                  bg-slate-100

                  dark:bg-neutral-900
                "
            />
          </div>

          {/* Connect button */}

          <div
            className="
                h-8
                w-[68px]
                shrink-0
                animate-pulse
                rounded-lg
                bg-slate-100

                dark:bg-neutral-900
              "
          />
        </div>
      ))}
    </div>
  );
};
