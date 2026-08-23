import { useEffect, useState } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import {
  useConnectionApi,
  type ConnectedPerson,
} from "../../api/connectionApi";

const ConnectionsSection = () => {
  const navigate = useNavigate();
  const { getConnections } = useConnectionApi();

  const [connections, setConnections] = useState<ConnectedPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const data = await getConnections();

        // Only show the first 4 on Home
        setConnections(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to load connections:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConnections();
  }, []);

  // Don't show the section if there are no connections
  if (!loading && connections.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Your Connections
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            People you're connected with
          </p>
        </div>

        {!loading && connections.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/connections")}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400"
          >
            See all
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-20 min-w-[72px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        /* Connections */
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {connections.map((person) => (
            <button
              key={person.connectionId}
              type="button"
              onClick={() => navigate(`/profile/${person.profileId}`)}
              className="group flex min-w-[76px] flex-col items-center"
            >
              {/* Avatar */}
              <div className="relative">
                {person.profileImage ? (
                  <img
                    src={person.profileImage}
                    alt={person.fullName}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-white transition group-hover:ring-violet-500 dark:ring-slate-950"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-2 ring-white dark:bg-violet-500/10 dark:text-violet-400 dark:ring-slate-950">
                    <UserRound size={22} />
                  </div>
                )}

                {/* Online dot */}
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
              </div>

              {/* Name */}
              <p className="mt-2 w-full truncate text-center text-[11px] font-medium text-slate-700 dark:text-slate-300">
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
