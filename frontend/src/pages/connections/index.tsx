import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, UsersRound, RefreshCw } from "lucide-react";

import ConnectionsHeader from "../../components/connections/ConnectionsHeader";
import ConnectionCard, {
  type ConnectedPerson,
} from "../../components/connections/ConnectionCard";
import ConnectionsSkeleton from "../../components/connections/ConnectionsSkeleton";
import EmptyConnections from "../../components/connections/EmptyConnections";

import {
  useConnectionApi,
  type ConnectionPageResponse,
} from "../../api/connectionApi";
import { useState } from "react";

const Connections = () => {
  const navigate = useNavigate();

  const { getConnections } = useConnectionApi();

  const [page, setPage] = useState(0);

  const PAGE_SIZE = 10;

  // ==========================================
  // LOAD PAGINATED CONNECTIONS
  // ==========================================

  const { data, isLoading, isFetching, isError, refetch } =
    useQuery<ConnectionPageResponse>({
      queryKey: ["connections", page, PAGE_SIZE],

      queryFn: () => getConnections(page, PAGE_SIZE),

      staleTime: 1000 * 60 * 5,

      gcTime: 1000 * 60 * 30,

      refetchOnWindowFocus: false,

      retry: 1,

      placeholderData: (previousData) => previousData,
    });

  const connections: ConnectedPerson[] = data?.connections ?? [];

  const totalElements = data?.totalElements ?? 0;

  const totalPages = data?.totalPages ?? 0;

  const isLast = data?.last ?? true;

  // ==========================================
  // PAGE HANDLERS
  // ==========================================

  const goToPreviousPage = () => {
    if (page > 0) {
      setPage((current) => current - 1);
    }
  };

  const goToNextPage = () => {
    if (!isLast) {
      setPage((current) => current + 1);
    }
  };

  // ==========================================
  // PROFILE
  // ==========================================

  const handleViewProfile = (profileId: number) => {
    navigate(`/profile/${profileId}`);
  };

  // ==========================================
  // MESSAGE
  // ==========================================

  const handleMessage = (person: ConnectedPerson) => {
    console.log("Message user:", person.username);

    // Later:
    // navigate(`/messages/${person.profileId}`);
  };

  return (
    <div
      className="
    min-h-screen
    bg-white
    pb-28
    text-slate-900
    transition-colors

    dark:bg-black
    dark:text-white
  "
    >
      {/* =====================================
          HEADER
          ===================================== */}

      <ConnectionsHeader />

      <main
        className="
          mx-auto
          w-full
          max-w-2xl
          px-4
          py-5
          sm:px-6
        "
      >
        {/* =====================================
            INTRO
            ===================================== */}

        <section className="mb-6">
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div>
              <div
                className="
                  mb-1.5
                  flex
                  items-center
                  gap-2
                "
              >
                <UsersRound
                  size={15}
                  strokeWidth={2}
                  className="
                    text-violet-600
                    dark:text-violet-400
                  "
                />

                <p
                  className="
                    text-[11px]
                    font-bold
                    tracking-[0.16em]
                    text-violet-600
                    dark:text-violet-400
                  "
                >
                  YOUR NETWORK
                </p>
              </div>

              <h2
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Your Connections
              </h2>
              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-neutral-400
                "
              >
                People you're connected with on UniVibe.
              </p>
            </div>

            {/* TOTAL COUNT */}

            {!isLoading && !isError && (
              <span
                className="
                  shrink-0
                  rounded-full
                  border
                  border-violet-200
                  bg-violet-50
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-violet-600

                  dark:border-violet-500/20
                  dark:bg-violet-500/10
                  dark:text-violet-400
                "
              >
                {totalElements}
              </span>
            )}
          </div>
        </section>

        {/* =====================================
            LOADING
            ===================================== */}

        {isLoading && <ConnectionsSkeleton />}

        {/* =====================================
            ERROR
            ===================================== */}

        {!isLoading && isError && (
          <div
            className="
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-6
              text-center

              dark:border-red-900/50
              dark:bg-red-950/20
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
                rounded-xl
                bg-red-100
                text-red-600

                dark:bg-red-500/10
                dark:text-red-400
              "
            >
              !
            </div>

            <h3
              className="
                mt-3
                text-sm
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Couldn't load connections
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              We couldn't load your connections. Please try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
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
                active:scale-95
              "
            >
              <RefreshCw size={13} strokeWidth={2} />
              Try Again
            </button>
          </div>
        )}

        {/* =====================================
            EMPTY
            ===================================== */}

        {!isLoading && !isError && totalElements === 0 && <EmptyConnections />}

        {/* =====================================
            CONNECTION LIST
            ===================================== */}

        {!isLoading && !isError && connections.length > 0 && (
          <section
            className="
                space-y-3
              "
          >
            {connections.map((person) => (
              <ConnectionCard
                key={person.connectionId}
                person={person}
                onViewProfile={() => handleViewProfile(person.profileId)}
                onMessage={() => handleMessage(person)}
              />
            ))}
          </section>
        )}

        {/* =====================================
            PAGINATION
            ===================================== */}

        {!isLoading && !isError && totalPages > 1 && (
          <section
            className="
                mt-7
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2

                dark:border-neutral-900
                dark:bg-neutral-950
                "
          >
            {/* PREVIOUS */}

            <button
              type="button"
              disabled={page === 0 || isFetching}
              onClick={goToPreviousPage}
              className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-xl
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-slate-600
                  transition

                  hover:bg-slate-100
                  hover:text-slate-900

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                 dark:text-neutral-300
dark:hover:bg-neutral-900
dark:hover:text-white
                "
            >
              <ChevronLeft size={16} strokeWidth={2} />
              Previous
            </button>

            {/* PAGE NUMBER */}

            <div
              className="
                  flex
                  items-center
                  gap-2
                "
            >
              <span
                className="
                    rounded-lg
                    bg-violet-100
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-violet-700

                    dark:bg-violet-500/10
                    dark:text-violet-400
                  "
              >
                {page + 1}
              </span>

              <span
                className="
                    text-xs
                    font-medium
                    text-slate-400
                    dark:text-slate-500
                  "
              >
                of {totalPages}
              </span>
            </div>

            {/* NEXT */}

            <button
              type="button"
              disabled={isLast || isFetching}
              onClick={goToNextPage}
              className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-xl
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-slate-600
                  transition

                  hover:bg-slate-100
                  hover:text-slate-900

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                 dark:text-neutral-300
                 dark:hover:bg-neutral-900
                 dark:hover:text-white
                "
            >
              Next
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </section>
        )}

        {/* =====================================
            FETCHING INDICATOR
            ===================================== */}

        {isFetching && !isLoading && (
          <div
            className="
    mt-3
    text-center
    text-[11px]
    font-medium
    text-slate-400
    dark:text-neutral-500
  "
          >
            Loading page...
          </div>
        )}
      </main>
    </div>
  );
};

export default Connections;
