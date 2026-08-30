import { Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import FloatingTabs from "../../components/home/FloatingTabs";

const AdminPage = () => {
  const navigate = useNavigate();

  // Temporary club list.
  // Later we can load this from the backend.
  const clubs = [
    {
      id: 1,
      name: "Coding Club",
      category: "Technical",
    },
    {
      id: 2,
      name: "Photography Club",
      category: "Creative",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <div>
            <h1 className="text-sm font-semibold">Admin</h1>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Club administration
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        {/* Intro */}
        <section>
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            CLUB ADMIN
          </p>

          <h2 className="mt-1 text-2xl font-bold">Manage your clubs</h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select a club to manage membership applications.
          </p>
        </section>

        {/* Clubs */}
        <section className="mt-6 space-y-3">
          {clubs.map((club) => (
            <button
              key={club.id}
              type="button"
              onClick={() => navigate(`/admin/clubs/${club.id}/applications`)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <Users size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{club.name}</h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {club.category}
                </p>
              </div>

              <ChevronRight size={18} className="text-slate-400" />
            </button>
          ))}
        </section>

        <p className="pt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          UniVibe · Club administration
        </p>
      </main>
      <FloatingTabs />
    </div>
  );
};

export default AdminPage;
