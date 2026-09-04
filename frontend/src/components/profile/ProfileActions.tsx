import { LogOut } from "lucide-react";

interface ProfileActionsProps {
  onLogout: () => void;
}

function ProfileActions({ onLogout }: ProfileActionsProps) {
  return (
    <section className="space-y-2">
      {/* Account Settings */}
      {/*
      <button
        type="button"
        className="
          flex
          w-full
          items-center
          gap-2.5
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3.5
          py-2.5
          text-left
          transition-all
          hover:border-violet-200
          hover:bg-violet-50
          dark:border-neutral-800
          dark:bg-[#171717]
          dark:hover:border-violet-500/20
          dark:hover:bg-violet-500/10
        "
      >
        <Settings
          size={16}
          className="
            text-slate-500
            dark:text-neutral-400
          "
        />

        <span
          className="
            text-xs
            font-semibold
            text-slate-700
            dark:text-neutral-300
          "
        >
          Account Settings
        </span>
      </button>
      */}

      {/* Sign Out */}
      <button
        type="button"
        onClick={onLogout}
        className="
          flex
          w-full
          items-center
          gap-2.5
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-3.5
          py-2.5
          text-left
          text-red-600
          transition-all
          hover:border-red-300
          hover:bg-red-100
          active:scale-[0.99]
          dark:border-red-500/20
          dark:bg-red-500/10
          dark:text-red-400
          dark:hover:border-red-500/30
          dark:hover:bg-red-500/15
        "
      >
        <LogOut size={16} />

        <span className="text-xs font-semibold">Sign Out</span>
      </button>
    </section>
  );
}

export default ProfileActions;
