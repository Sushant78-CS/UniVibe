import { LogOut, Settings } from "lucide-react";

interface ProfileActionsProps {
  onLogout: () => void;
}

function ProfileActions({ onLogout }: ProfileActionsProps) {
  return (
    <section className="space-y-3">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <Settings size={19} className="text-slate-500" />

        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Account Settings
        </span>
      </button>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-left text-red-600 transition hover:bg-red-100 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
      >
        <LogOut size={19} />

        <span className="text-sm font-semibold">Sign Out</span>
      </button>
    </section>
  );
}

export default ProfileActions;
