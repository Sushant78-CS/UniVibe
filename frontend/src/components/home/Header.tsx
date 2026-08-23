import { Bell } from "lucide-react";

function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/85">
      <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950">
              U
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                UniVibe
              </h1>
            </div>
          </div>

          {/* Notification */}
          <button
            type="button"
            onClick={() => {
              window.location.href = "/connections/requests";
            }}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
