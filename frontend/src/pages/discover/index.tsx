import { useState } from "react";
import { Search, X, Users, RefreshCw } from "lucide-react";

import { useNavigate } from "react-router";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import FloatingTabs from "../../components/home/FloatingTabs";
import PersonCard from "../../components/discover/PersonCard";

import { useRecommendationApi } from "../../api/recommendationApi";

import { useConnectionApi } from "../../api/connectionApi";

import type { DiscoverPerson } from "../../api/discoverApi";

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
   * Search is now completely local.
   * No search button and no backend search request.
   */
  const [query, setQuery] = useState("");

  /*
   * ============================================
   * RECOMMENDATIONS
   * ============================================
   */

  const {
    data: people = [],
    isLoading: loading,
    isError,
    refetch,
    isFetching,
  } = useQuery<DiscoverPerson[]>({
    queryKey: ["recommendations"],

    queryFn: async (): Promise<DiscoverPerson[]> => {
      const data = await getRecommendations();

      return data.recommendations.map(
        (person): DiscoverPerson => ({
          id: person.profileId,
          userId: person.userId,

          fullName: person.fullName,

          username: person.username,

          bio: person.bio,

          profileImage: person.profileImage,

          college: person.college || "",

          department: person.department || "",

          year: person.year || "",

          interests: person.interests || "",

          score: person.score,

          connectionStatus: person.connectionStatus as
            | "NONE"
            | "PENDING_SENT"
            | "PENDING_RECEIVED"
            | "CONNECTED",
        }),
      );
    },

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /*
   * ============================================
   * LOCAL SEARCH
   * ============================================
   *
   * Results update while typing.
   * No backend request is made.
   */

  const searchText = query.trim().toLowerCase();

  const filteredPeople = people.filter((person) => {
    if (!searchText) {
      return true;
    }

    return (
      person.fullName?.toLowerCase().includes(searchText) ||
      person.username?.toLowerCase().includes(searchText) ||
      person.bio?.toLowerCase().includes(searchText) ||
      person.college?.toLowerCase().includes(searchText) ||
      person.department?.toLowerCase().includes(searchText) ||
      person.year?.toLowerCase().includes(searchText) ||
      person.interests
        ?.split(",")
        .some((interest: string) =>
          interest.trim().toLowerCase().includes(searchText),
        )
    );
  });

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
       * Update only the person that was
       * connected/requested.
       */

      queryClient.setQueryData<DiscoverPerson[]>(
        ["recommendations"],
        (currentPeople) =>
          currentPeople?.map((person) =>
            person.userId === userId
              ? {
                  ...person,
                  connectionStatus: "PENDING_SENT",
                }
              : person,
          ) ?? [],
      );
    } catch (error) {
      console.error("Connection request failed:", error);
    } finally {
      setConnectingId(null);
    }
  };

  /*
   * ============================================
   * CLEAR SEARCH
   * ============================================
   */

  const clearSearch = () => {
    setQuery("");
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
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div className="min-w-0">
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
                  mt-1.5
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  dark:text-white
                "
              >
                Find your people
              </h1>

              <p
                className="
                  mt-1.5
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-neutral-500
                "
              >
                Meet students who share your campus, course and interests.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================
            SEARCH
            ====================================== */}

        <div className="mt-5">
          <div
            className="
              relative
              w-full
            "
          >
            <Search
              size={17}
              strokeWidth={2}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
                dark:text-neutral-500
              "
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students..."
              aria-label="Search students"
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                pl-11
                pr-10
                text-sm
                text-slate-900
                outline-none
                transition-all

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
                  right-3
                  top-1/2
                  flex
                  h-6
                  w-6
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition-colors
                  hover:bg-slate-100
                  hover:text-slate-700

                  dark:text-neutral-500
                  dark:hover:bg-neutral-800
                  dark:hover:text-neutral-200
                "
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ======================================
            RESULTS
            ====================================== */}

        <section className="mt-6">
          <div
            className="
              mb-3
              flex
              items-end
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-base
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                {query ? "Search results" : "People for you"}
              </h2>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-slate-400
                  dark:text-neutral-600
                "
              >
                {query ? `Matches for "${query}"` : "Suggested connections"}
              </p>
            </div>

            {!loading && !isError && (
              <span
                className="
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    text-slate-500

                    dark:bg-neutral-900
                    dark:text-neutral-500
                  "
              >
                {filteredPeople.length}
              </span>
            )}
          </div>

          {/* ====================================
              LOADING SKELETON
              ==================================== */}

          {loading && (
            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="
                      flex
                      min-h-[92px]
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-3
                      dark:border-neutral-800
                      dark:bg-[#171717]
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

                  {/* Content */}

                  <div
                    className="
                        min-w-0
                        flex-1
                      "
                  >
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
                          w-20
                          animate-pulse
                          rounded
                          bg-slate-100
                          dark:bg-neutral-900
                        "
                    />

                    <div
                      className="
                          mt-2
                          h-2.5
                          w-32
                          animate-pulse
                          rounded
                          bg-slate-100
                          dark:bg-neutral-900
                        "
                    />
                  </div>

                  {/* Button */}

                  <div
                    className="
                        h-8
                        w-20
                        shrink-0
                        animate-pulse
                        rounded-xl
                        bg-slate-100
                        dark:bg-neutral-900
                      "
                  />
                </div>
              ))}
            </div>
          )}

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
                Couldn&apos;t load people
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

          {!loading && !isError && filteredPeople.length === 0 && (
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
                {query ? "No students found" : "No people available"}
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
                {query
                  ? "Try searching for another name, username, college or interest."
                  : "There are no recommendations available right now."}
              </p>

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                      mt-4
                      text-xs
                      font-semibold
                      text-violet-600
                      hover:underline
                      dark:text-violet-400
                    "
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* ====================================
              PEOPLE
              ==================================== */}

          {!loading && !isError && filteredPeople.length > 0 && (
            <div
              className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
            >
              {filteredPeople.map((person) => (
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
          )}
        </section>
      </main>

      <FloatingTabs />
    </div>
  );
};

export default DiscoverPage;
