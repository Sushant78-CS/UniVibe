import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import ConnectionsHeader from "../../components/connections/ConnectionsHeader";
import ConnectionCard, {
  type ConnectedPerson,
} from "../../components/connections/ConnectionCard";
import ConnectionsSkeleton from "../../components/connections/ConnectionsSkeleton";
import EmptyConnections from "../../components/connections/EmptyConnections";

import { useConnectionApi } from "../../api/connectionApi";

const Connections = () => {
  const navigate = useNavigate();

  const { getConnections } = useConnectionApi();

  const [connections, setConnections] = useState<ConnectedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getConnections();

      setConnections(data);
    } catch (error) {
      console.error("Failed to load connections:", error);
      setError("We couldn't load your connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleViewProfile = (profileId: number) => {
    navigate(`/profile/${profileId}`);
  };

  const handleMessage = (person: ConnectedPerson) => {
    console.log("Message user:", person.username);

    // Later:
    // navigate(`/messages/${person.profileId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <ConnectionsHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6">
        {/* Intro */}
        <section className="mb-5">
          <p className="text-xs font-semibold tracking-wide text-violet-600 dark:text-violet-400">
            YOUR NETWORK
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Your Connections
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                People you're connected with on UniVibe.
              </p>
            </div>

            {!loading && !error && connections.length > 0 && (
              <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                {connections.length}
              </span>
            )}
          </div>
        </section>

        {/* Loading */}
        {loading && <ConnectionsSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              !
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              Couldn't load connections
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadConnections}
              className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && connections.length === 0 && <EmptyConnections />}

        {/* Connection list */}
        {!loading && !error && connections.length > 0 && (
          <section className="space-y-3">
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
      </main>
    </div>
  );
};

export default Connections;
