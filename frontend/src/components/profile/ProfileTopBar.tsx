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
        border-slate-200
        bg-white/90
        backdrop-blur-xl
        dark:border-neutral-800
        dark:bg-black/90
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
                transition-all
                hover:bg-slate-100
                hover:text-slate-900
                active:scale-95
                dark:text-neutral-400
                dark:hover:bg-[#171717]
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
                text-[20px]
                font-extrabold
                leading-none
                tracking-[-0.04em]
                text-violet-600
                dark:text-violet-400
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
                dark:text-neutral-500
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
              border-violet-200
              bg-violet-50
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-violet-600
              transition-all
              hover:border-violet-300
              hover:bg-violet-100
              active:scale-95
              dark:border-violet-500/20
              dark:bg-violet-500/10
              dark:text-violet-400
              dark:hover:border-violet-500/30
              dark:hover:bg-violet-500/15
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
