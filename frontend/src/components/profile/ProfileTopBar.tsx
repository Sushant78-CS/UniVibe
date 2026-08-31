import { ArrowLeft, Pencil, Sparkles } from "lucide-react";
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
        {/* Left */}
        <div className="flex items-center gap-2.5">
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

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="
              flex
              items-center
              gap-2
              text-left
              transition
              active:scale-[0.98]
            "
          >
            {/* Logo mark */}
            <div
              className="
    flex
    h-8
    w-8
    items-center
    justify-center
    rounded-xl
    bg-gradient-to-br
    from-indigo-600
    to-violet-600
    text-white
    shadow-sm
  "
            >
              <Sparkles size={16} />
            </div>

            {/* Brand */}
            <div className="leading-none">
              <h1
                className="
                  text-sm
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                UniVibe
              </h1>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  font-medium
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Your campus. Your people.
              </p>
            </div>
          </button>
        </div>

        {/* Right */}
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
