import { useEffect, useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

import Header from "../components/home/Header";
import ConnectionsSection from "../components/home/ConnectionsSection";
import FloatingTabs from "../components/home/FloatingTabs";

import { useClubApi, type Club } from "../api/clubApi";

function Home() {
  const navigate = useNavigate();
  const { getClubs } = useClubApi();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await getClubs();
        setClubs(data);
      } catch (error) {
        console.error("Failed to load clubs:", error);
      } finally {
        setLoadingClubs(false);
      }
    };

    loadClubs();
  }, []);

  const displayedClubs = clubs.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {/* Welcome */}
        <section>
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            YOUR CAMPUS. YOUR PEOPLE.
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Find your people. ✨
          </h1>

          <p className="mb-4 mt-2 max-w-lg text-sm leading-5 text-slate-500 dark:text-slate-400">
            Discover students with similar interests and vibes around your
            campus.
          </p>
        </section>

        {/* Connections */}
        <ConnectionsSection />

        {/* Clubs */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Campus Clubs</h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Find communities that match your interests.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/clubs")}
              className="flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Loading */}
          {loadingClubs ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : displayedClubs.length === 0 ? (
            /* Empty */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <Users size={24} className="mx-auto text-slate-400" />

              <p className="mt-2 text-sm font-semibold">No clubs available</p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Check back later for campus communities.
              </p>
            </div>
          ) : (
            /* Club List */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {displayedClubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => navigate(`/clubs/${club.id}`)}
                  className="
                    flex items-center gap-3
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    p-3
                    text-left
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-md
                    dark:border-slate-800
                    dark:bg-slate-900
                  "
                >
                  {/* Club Image */}
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex h-14 w-14 shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-500
                        dark:bg-slate-800
                        dark:text-slate-400
                      "
                    >
                      <Users size={22} />
                    </div>
                  )}

                  {/* Club Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {club.name}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-violet-600 dark:text-violet-400">
                      {club.category || "Community"}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <Users size={12} />

                      <span>{club.memberCount ?? 0} members</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-slate-300 dark:text-slate-600"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <FloatingTabs />
    </div>
  );
}

export default Home;
