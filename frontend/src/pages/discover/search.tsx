import { Search, X, ArrowLeft, RefreshCw, SearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useSearchApi } from "../../api/searchApi";
import type { SearchPerson } from "../../api/searchApi";
import SearchPersonCard from "../../components/discover/SearchPersonCard";
import SearchSkeleton from "../../components/discover/SearchSkeleton";

const PAGE_SIZE = 10;

const SearchPage = () => {
  const navigate = useNavigate();

  const { searchPeople } = useSearchApi();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /*
   * ============================================
   * DEBOUNCE SEARCH
   * ============================================
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  /*
   * ============================================
   * SEARCH QUERY
   * ============================================
   */

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["people-search", debouncedQuery],

    initialPageParam: 0,

    enabled: debouncedQuery.length >= 2,

    queryFn: ({ pageParam }) =>
      searchPeople(debouncedQuery, pageParam as number, PAGE_SIZE),

    getNextPageParam: (lastPage) => {
      if (lastPage.last) {
        return undefined;
      }

      return lastPage.page + 1;
    },

    staleTime: 1000 * 60 * 2,

    gcTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /*
   * ============================================
   * FLATTEN RESULTS
   * ============================================
   */

  const people: SearchPerson[] =
    data?.pages.flatMap((page) => page.results) ?? [];

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
   * CLEAR SEARCH
   * ============================================
   */

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
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

        <section className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
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
              shadow-sm
              transition
              hover:border-slate-300
              hover:text-slate-900
              active:scale-95
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:text-neutral-400
              dark:hover:border-neutral-700
              dark:hover:text-white
            "
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
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
              Search
            </p>

            <h1
              className="
                text-lg
                font-bold
                leading-tight
                tracking-tight
                text-slate-950
                dark:text-white
              "
            >
              Find people
            </h1>
          </div>
        </section>

        {/* ======================================
            SEARCH INPUT
            ====================================== */}

        <div className="mt-5">
          <div className="relative w-full">
            <Search
              size={16}
              strokeWidth={2}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
                dark:text-neutral-500
              "
            />

            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people..."
              aria-label="Search people"
              className="
                h-10.5
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                pl-10.5
                pr-10
                text-[13px]
                font-medium
                text-slate-900
                outline-none
                transition-all
                duration-150

                placeholder:text-slate-400

                hover:border-slate-300

                focus:border-violet-500
                focus:ring-4
                focus:ring-violet-500/10

                dark:border-neutral-800
                dark:bg-[#171717]
                dark:text-white
                dark:placeholder:text-neutral-600
                dark:hover:border-neutral-700
                dark:focus:border-violet-500
              "
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="
                  absolute
                  right-2.5
                  top-1/2
                  flex
                  h-6
                  w-6
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition-all
                  duration-150
                  hover:bg-slate-100
                  hover:text-slate-700
                  active:scale-90
                  dark:text-neutral-500
                  dark:hover:bg-neutral-800
                  dark:hover:text-neutral-200
                "
              >
                <X size={13} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>

        {/* ======================================
            RESULTS
            ====================================== */}

        <section className="mt-6">
          {/* ====================================
              WAITING FOR SEARCH
              ==================================== */}

          {query.trim().length < 2 && (
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-white
                px-6
                py-14
                text-center
                dark:border-neutral-800
                dark:bg-[#141414]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -top-16
                  left-1/2
                  h-40
                  w-40
                  -translate-x-1/2
                  rounded-full
                  bg-violet-500/10
                  blur-3xl
                  dark:bg-violet-500/10
                "
              />

              <div
                className="
                  relative
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-violet-50
                  to-fuchsia-50
                  text-violet-600
                  ring-1
                  ring-inset
                  ring-violet-100
                  dark:from-violet-500/10
                  dark:to-fuchsia-500/10
                  dark:text-violet-400
                  dark:ring-violet-500/20
                "
              >
                <Search size={22} />
              </div>

              <h3
                className="
                  relative
                  mt-4
                  text-sm
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Search for people
              </h3>

              <p
                className="
                  relative
                  mx-auto
                  mt-1.5
                  max-w-[220px]
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-neutral-500
                "
              >
                Enter at least 2 characters to start searching by name or
                username.
              </p>
            </div>
          )}

          {/* ====================================
              INITIAL LOADING
              ==================================== */}

          {debouncedQuery.length >= 2 && isLoading && <SearchSkeleton />}

          {/* ====================================
              ERROR
              ==================================== */}

          {debouncedQuery.length >= 2 && !isLoading && isError && (
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
                Couldn't search people
              </p>

              <p
                className="
                    mt-1
                    text-xs
                    text-slate-500
                    dark:text-neutral-500
                  "
              >
                Something went wrong while searching.
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

          {debouncedQuery.length >= 2 &&
            !isLoading &&
            !isError &&
            people.length === 0 && (
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-200
                  bg-white
                  px-6
                  py-14
                  text-center
                  dark:border-neutral-800
                  dark:bg-[#141414]
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
                    text-slate-400
                    ring-1
                    ring-inset
                    ring-slate-200/70
                    dark:bg-neutral-900
                    dark:text-neutral-500
                    dark:ring-neutral-800
                  "
                >
                  <SearchX size={22} />
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
                  No people found
                </h3>

                <p
                  className="
                    mx-auto
                    mt-1.5
                    max-w-[240px]
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-neutral-500
                  "
                >
                  Nothing matches{" "}
                  <span className="font-semibold text-slate-700 dark:text-neutral-300">
                    "{debouncedQuery}"
                  </span>
                  . Try another name or username.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                    relative
                    mt-4
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-slate-700
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    dark:border-neutral-800
                    dark:bg-[#171717]
                    dark:text-neutral-300
                    dark:hover:border-neutral-700
                    dark:hover:bg-neutral-900
                  "
                >
                  <X size={12} />
                  Clear search
                </button>
              </div>
            )}

          {/* ====================================
              PEOPLE
              ==================================== */}

          {!isLoading && !isError && people.length > 0 && (
            <div className="space-y-2">
              {people.map((person) => (
                <SearchPersonCard
                  key={person.profileId}
                  person={person}
                  onClick={() => navigate(`/profile/${person.profileId}`)}
                />
              ))}

              {/* ==================================
                    INFINITE SCROLL SENTINEL
                    ================================== */}

              <div
                ref={loadMoreRef}
                className="flex min-h-[64px] items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2">
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
                          font-medium
                          text-slate-500
                          dark:text-neutral-500
                        "
                    >
                      Loading more...
                    </span>
                  </div>
                )}

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
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchPage;
