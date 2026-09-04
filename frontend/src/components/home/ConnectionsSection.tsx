import { UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import {
  useConnectionApi,
  type ConnectedPerson,
} from "../../api/connectionApi";

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

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
    retry: 1,
  });

  const visibleConnections = connections.slice(0, 10);

  /*
   * No connections = no section.
   */
  if (!isLoading && !isError && visibleConnections.length === 0) {
    return null;
  }

  return (
    <section
      className="
        w-full
        border-b
        border-slate-100
        bg-white
        py-2.5

        dark:border-neutral-900
        dark:bg-black
      "
    >
      {isLoading ? (
        /* =====================================
           LOADING
           ===================================== */

        <div
          className="
            flex
            gap-4
            overflow-hidden
            px-4
            sm:px-0
          "
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="
                flex
                w-[60px]
                shrink-0
                flex-col
                items-center
              "
            >
              <div
                className="
                  h-[52px]
                  w-[52px]
                  animate-pulse
                  rounded-full
                  bg-slate-200

                  dark:bg-neutral-800
                "
              />

              <div
                className="
                  mt-1.5
                  h-2
                  w-10
                  animate-pulse
                  rounded-full
                  bg-slate-200

                  dark:bg-neutral-800
                "
              />
            </div>
          ))}
        </div>
      ) : (
        /* =====================================
           CONNECTIONS
           ===================================== */

        <div
          className="
            flex
            w-full
            gap-4
            overflow-x-auto
            overflow-y-hidden
            overscroll-x-contain
            px-4
            py-0.5

            scrollbar-hide

            sm:px-0
          "
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {visibleConnections.map((person) => (
            <button
              key={person.connectionId}
              type="button"
              onClick={() => navigate(`/profile/${person.profileId}`)}
              className="
                group
                flex
                w-[60px]
                shrink-0
                flex-col
                items-center
                rounded-xl
                outline-none
                transition-transform
                duration-150
                active:scale-[0.95]
                focus-visible:ring-2
                focus-visible:ring-violet-500/30
              "
            >
              {/* Avatar */}

              {person.profileImage ? (
                <img
                  src={person.profileImage}
                  alt={person.fullName}
                  draggable={false}
                  className="
                    h-[52px]
                    w-[52px]
                    rounded-full
                    object-cover
                    ring-1
                    ring-slate-200
                    transition-all
                    duration-200
                    group-hover:ring-2
                    group-hover:ring-violet-500

                    dark:ring-neutral-700
                    dark:group-hover:ring-violet-500
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-[52px]
                    w-[52px]
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    text-slate-500
                    ring-1
                    ring-slate-200
                    transition-all
                    duration-200
                    group-hover:ring-2
                    group-hover:ring-violet-500

                    dark:bg-neutral-900
                    dark:text-neutral-400
                    dark:ring-neutral-700
                    dark:group-hover:ring-violet-500
                  "
                >
                  <UserRound size={19} strokeWidth={1.8} />
                </div>
              )}

              {/* Name */}

              <span
                className="
                  mt-1
                  w-full
                  truncate
                  px-0.5
                  text-center
                  text-[10px]
                  font-medium
                  leading-3
                  text-slate-600

                  dark:text-neutral-400
                "
              >
                {person.fullName}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ConnectionsSection;
