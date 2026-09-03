import { ArrowLeft, Pencil } from "lucide-react";
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
        sticky
        top-0
        z-40
        border-b
        border-slate-200/70
        bg-white/85
        backdrop-blur-xl
        dark:border-slate-800/70
        dark:bg-slate-950/85
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          max-w-3xl
          items-center
          justify-between
          px-4
          sm:px-6
        "
      >
        {/* ================= LEFT ================= */}

        <div className="flex items-center gap-2.5">
          {/* Back Button */}

          {showBackButton && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-900
                active:scale-95
                dark:text-slate-400
                dark:hover:bg-slate-800
                dark:hover:text-white
              "
            >
              <ArrowLeft size={17} />
            </button>
          )}

          {/* ================= UNIVIBE WORDMARK ================= */}

          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Go to home"
            className="
              rounded-xl
              text-left
              transition
              active:scale-[0.97]
            "
          >
            <div
              className="
                bg-gradient-to-r
                from-violet-600
                via-purple-600
                to-fuchsia-500
                bg-clip-text
                text-[20px]
                font-extrabold
                leading-none
                tracking-[-0.04em]
                text-transparent
                dark:from-violet-400
                dark:via-purple-400
                dark:to-fuchsia-400
              "
            >
              UniVibe
            </div>

            <div
              className="
                mt-1
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-400
                dark:text-slate-500
              "
            >
              Campus Community
            </div>
          </button>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="flex items-center gap-2">
          {/* Edit Profile */}

          <button
            type="button"
            onClick={() => navigate("/profile/edit")}
            className="
              group
              flex
              items-center
              gap-1.5
              rounded-xl
              border
              border-indigo-200
              bg-indigo-50
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-indigo-600
              shadow-sm
              transition-all
              hover:border-indigo-300
              hover:bg-indigo-100
              hover:shadow
              active:scale-95
              dark:border-indigo-500/20
              dark:bg-indigo-500/10
              dark:text-indigo-400
              dark:hover:border-indigo-500/30
              dark:hover:bg-indigo-500/20
            "
          >
            <Pencil
              size={13}
              className="
                transition-transform
                group-hover:-rotate-6
              "
            />

            <span>Edit Profile</span>
          </button>

          {/* Theme */}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default ProfileTopBar;
