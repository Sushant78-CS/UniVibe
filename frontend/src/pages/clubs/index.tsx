import { useEffect, useState } from "react";
import { ArrowLeft, Users, Search, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import { useClubApi, type Club } from "../../api/clubApi";

const ClubsPage = () => {
  const navigate = useNavigate();
  const { getClubs } = useClubApi();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await getClubs();
        setClubs(data);
      } catch (error) {
        console.error("Failed to load clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const value = search.toLowerCase();

    return (
      club.name.toLowerCase().includes(value) ||
      club.category?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-8 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="ml-3">
            <h1 className="text-sm font-bold">Clubs</h1>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Find your community
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        {/* Intro */}
        <section>
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            CAMPUS COMMUNITIES
          </p>

          <h2 className="mt-1 text-2xl font-bold">Find your club.</h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Join communities that match your interests.
          </p>
        </section>

        {/* Search */}
        <div className="relative mt-5">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-violet-500"
          />
        </div>

        {/* My Clubs */}
        <button
          type="button"
          onClick={() => navigate("/clubs/my")}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left transition hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:hover:bg-violet-500/15"
        >
          <div>
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
              My Clubs
            </p>

            <p className="mt-0.5 text-xs text-violet-600/70 dark:text-violet-400/70">
              View the communities you've joined
            </p>
          </div>

          <Users size={18} className="text-violet-600 dark:text-violet-400" />
        </button>

        {/* Clubs */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Explore clubs</h2>

            {!loading && (
              <span className="text-xs text-slate-400">
                {filteredClubs.length} clubs
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <UserRound size={28} className="mx-auto text-slate-400" />

              <p className="mt-3 text-sm font-semibold">No clubs found</p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try another search.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => navigate(`/clubs/${club.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Image */}
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                      <Users size={22} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold">{club.name}</h3>

                    <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-400">
                      {club.category || "Community"}
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {club.description || "Join this campus community."}
                    </p>
                  </div>

                  {/* Members */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">{club.memberCount}</p>

                    <p className="text-[10px] text-slate-400">members</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ClubsPage;
