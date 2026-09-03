import { ArrowRight, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import {
  useConnectionApi,
  type ConnectedPerson,
} from "../../api/connectionApi";
import { useQuery } from "@tanstack/react-query";

const ConnectionsSection = () => {
  const navigate = useNavigate();
  const { getConnections } = useConnectionApi();

  const {
    data: connections = [],
    isLoading,
    isError,
  } = useQuery<ConnectedPerson[]>({
    queryKey: ["connections"],
    queryFn: getConnections,

    // Keep connections cached
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes

    // Don't refetch every time the user returns to the tab
    refetchOnWindowFocus: false,

    retry: 1,
  });

  // Only show the first 4 on Home
  const visibleConnections = connections.slice(0, 4);

  // Don't show the section if there are no connections
  if (!isLoading && !isError && visibleConnections.length === 0) {
    return null;
  }

  return (
    <section className="mt-0">
      {/* ================= HEADER ================= */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Your Connections
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            People you're connected with
          </p>
        </div>

        {!isLoading && visibleConnections.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/connections")}
            className="
              flex
              items-center
              gap-1
              text-xs
              font-semibold
              text-violet-600
              transition
              hover:text-violet-700
              dark:text-violet-400
            "
          >
            See all
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* ================= LOADING ================= */}

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                h-20
                min-w-[72px]
                animate-pulse
                rounded-2xl
                bg-slate-200
                dark:bg-slate-800
              "
            />
          ))}
        </div>
      ) : (
        /* ================= CONNECTIONS ================= */

        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {visibleConnections.map((person) => (
            <button
              key={person.connectionId}
              type="button"
              onClick={() => navigate(`/profile/${person.profileId}`)}
              className="
                group
                flex
                min-w-[76px]
                flex-col
                items-center
              "
            >
              {/* Avatar */}

              <div className="relative">
                {person.profileImage ? (
                  <img
                    src={person.profileImage}
                    alt={person.fullName}
                    className="
                      h-14
                      w-14
                      rounded-full
                      object-cover
                      ring-2
                      ring-white
                      transition
                      group-hover:ring-violet-500
                      dark:ring-slate-950
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-100
                      text-violet-600
                      ring-2
                      ring-white
                      dark:bg-violet-500/10
                      dark:text-violet-400
                      dark:ring-slate-950
                    "
                  >
                    <UserRound size={22} />
                  </div>
                )}
              </div>

              {/* Name */}

              <p
                className="
                  mt-2
                  w-full
                  truncate
                  text-center
                  text-[11px]
                  font-medium
                  text-slate-700
                  dark:text-slate-300
                "
              >
                {person.fullName}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ConnectionsSection;
