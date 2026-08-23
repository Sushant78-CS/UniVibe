import { Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import ThemeToggle from "../common/ThemeToggle";

interface ProfileTopBarProps {
  showBackButton?: boolean;
}

const ProfileTopBar = ({ showBackButton = false }: ProfileTopBarProps) => {
  const navigate = useNavigate();

  return (
    <header
      className="
        sticky top-0 z-40
        border-b border-slate-200
        bg-white/80 backdrop-blur-xl
        dark:border-slate-800
        dark:bg-slate-950/80
      "
    >
      <div
        className="
          mx-auto flex h-16 max-w-3xl
          items-center justify-between
          px-4 sm:px-6
        "
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl
                text-slate-600
                transition
                hover:bg-slate-100
                dark:text-slate-300
                dark:hover:bg-slate-800
              "
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div>
            <h1
              className="
                text-lg font-bold tracking-tight
                text-slate-900
                dark:text-white
              "
            >
              UniVibe
            </h1>

            <p
              className="
                text-[11px]
                text-slate-500
                dark:text-slate-400
              "
            >
              Your profile
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative flex h-9 w-9
              items-center justify-center
              rounded-xl
              text-slate-600
              transition
              hover:bg-slate-100
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            <Bell size={18} />

            {/* Notification dot */}
            <span
              className="
                absolute right-2 top-2
                h-1.5 w-1.5
                rounded-full
                bg-violet-500
              "
            />
          </button>

          {/* Theme */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default ProfileTopBar;
