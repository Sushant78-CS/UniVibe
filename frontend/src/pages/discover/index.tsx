import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import FloatingTabs from "../../components/home/FloatingTabs";
import PersonCard from "../../components/discover/PersonCard";

import { useRecommendationApi } from "../../api/recommendationApi";

import { useConnectionApi } from "../../api/connectionApi";
import { useSearchApi } from "../../api/searchApi";
import type { DiscoverPerson } from "../../api/discoverApi";

const DiscoverPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { getRecommendations } = useRecommendationApi();
  const { sendConnection } = useConnectionApi();
  const { searchProfiles } = useSearchApi();

  const [connectingId, setConnectingId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  // ================= RECOMMENDATIONS =================

  const {
    data: people = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery<DiscoverPerson[]>({
    queryKey: ["recommendations"],
    queryFn: async (): Promise<DiscoverPerson[]> => {
      const data = await getRecommendations();

      console.log("Recommendations from backend:", data);

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

  // ================= FILTERED PEOPLE =================

  const filteredPeople = people.filter((person) => {
    // Search
    if (query.trim()) {
      const searchText = query.toLowerCase();

      const matchesSearch =
        person.fullName?.toLowerCase().includes(searchText) ||
        person.username?.toLowerCase().includes(searchText) ||
        person.bio?.toLowerCase().includes(searchText) ||
        person.department?.toLowerCase().includes(searchText) ||
        person.college?.toLowerCase().includes(searchText) ||
        person.interests
          ?.split(",")
          .some((interest: string) =>
            interest.toLowerCase().includes(searchText),
          );

      if (!matchesSearch) {
        return false;
      }
    }

    // College
    if (
      college.trim() &&
      person.college?.toLowerCase() !== college.toLowerCase()
    ) {
      return false;
    }

    // Department
    if (
      department.trim() &&
      person.department?.toLowerCase() !== department.toLowerCase()
    ) {
      return false;
    }

    // Year
    if (year && person.year !== year) {
      return false;
    }

    return true;
  });

  // ================= CONNECT =================

  const handleConnect = async (userId: number) => {
    try {
      setConnectingId(userId);

      await sendConnection(userId);

      // Update cached recommendations
      queryClient.setQueryData(
        ["recommendations"],
        (currentPeople: typeof people) =>
          currentPeople.map((person) =>
            person.userId === userId
              ? {
                  ...person,
                  connectionStatus: "PENDING_SENT",
                }
              : person,
          ),
      );
    } catch (error) {
      console.error("Connection request failed:", error);
    } finally {
      setConnectingId(null);
    }
  };

  // ================= SEARCH =================

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    try {
      const searchResponse = await searchProfiles(query.trim());

      console.log("Linear Search response:", searchResponse);

      const resultIds = new Set(
        searchResponse.results.map((result) => result.profileId),
      );

      // Update the query-filtered result using
      // the cached recommendation data.
      queryClient.setQueryData(
        ["recommendations"],
        (currentPeople: typeof people) =>
          currentPeople.filter((person) => resultIds.has(person.id)),
      );

      console.log("Algorithm:", searchResponse.algorithm);

      console.log("Time Complexity:", searchResponse.timeComplexity);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // ================= CLEAR FILTERS =================

  const clearFilters = () => {
    setQuery("");
    setCollege("");
    setDepartment("");
    setYear("");

    // Restore fresh recommendations
    refetch();
  };

  // ================= UI =================

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-28
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4
          py-6
          sm:px-6
        "
      >
        {/* Header */}

        <section>
          <p
            className="
              text-sm
              font-semibold
              text-violet-600
              dark:text-violet-400
            "
          >
            DISCOVER
          </p>

          <h1
            className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            "
          >
            Find your people. ✨
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            Discover students who share your interests, course, college and
            vibe.
          </p>
        </section>

        {/* Search */}

        <form onSubmit={handleSearch} className="mt-6 flex h-12 gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              strokeWidth={2}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, interests or department..."
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white
                pl-11
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-500
                focus:ring-4
                focus:ring-violet-500/10
                dark:border-slate-800
                dark:bg-slate-900
                dark:text-white
                dark:placeholder:text-slate-500
              "
            />
          </div>

          <button
            type="submit"
            className="
              flex
              h-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-violet-600
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-violet-700
              active:scale-[0.98]
            "
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-label="Open filters"
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:bg-slate-50
              active:scale-[0.98]
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {/* Filters */}

        {showFilters && (
          <div
            className="
              mt-4
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>

              <button
                type="button"
                onClick={clearFilters}
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-slate-500
                  hover:text-violet-600
                "
              >
                <X size={14} />
                Clear
              </button>
            </div>

            <div
              className="
                mt-4
                grid
                gap-3
                sm:grid-cols-3
              "
            >
              <input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="College"
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-violet-500
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                "
              />

              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department"
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-violet-500
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                "
              />

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-violet-500
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                "
              >
                <option value="">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="
                mt-4
                w-full
                rounded-xl
                bg-slate-900
                py-3
                text-sm
                font-semibold
                text-white
                dark:bg-white
                dark:text-slate-900
              "
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Results */}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">People</h2>

            {!loading && (
              <span
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {filteredPeople.length} found
              </span>
            )}
          </div>

          {/* Loading */}

          {loading && (
            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="
                      h-64
                      animate-pulse
                      rounded-3xl
                      bg-slate-200
                      dark:bg-slate-800
                    "
                />
              ))}
            </div>
          )}

          {/* Error */}

          {!loading && isError && (
            <div
              className="
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <h3 className="font-semibold">Failed to load people</h3>

              <button
                type="button"
                onClick={() => refetch()}
                className="
                  mt-4
                  rounded-xl
                  bg-violet-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}

          {!loading && !isError && filteredPeople.length === 0 && (
            <div
              className="
                  rounded-3xl
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  p-10
                  text-center
                  dark:border-slate-700
                  dark:bg-slate-900
                "
            >
              <h3 className="font-semibold">No people found</h3>

              <p
                className="
                    mt-2
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
              >
                Try changing your search or filters.
              </p>
            </div>
          )}

          {/* People */}

          {!loading && !isError && filteredPeople.length > 0 && (
            <div
              className="
                  grid
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
            >
              {filteredPeople.map((person) => (
                <div key={person.id}>
                  <PersonCard
                    person={person}
                    onClick={() => navigate(`/profile/${person.id}`)}
                    onConnect={() => handleConnect(person.userId)}
                    connectionStatus={person.connectionStatus}
                    connecting={connectingId === person.userId}
                  />
                </div>
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
