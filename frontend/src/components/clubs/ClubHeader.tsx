import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface ClubHeaderProps {
  name: string;
  category?: string;
  image?: string;
}

const ClubHeader = ({ name, category, image }: ClubHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative overflow-hidden">
      {/* Cover */}
      <div
        className="
          relative
          h-52
          overflow-hidden
          bg-gradient-to-br
          from-violet-200
          via-indigo-100
          to-slate-100
          sm:h-64
          dark:from-violet-950
          dark:via-indigo-950
          dark:to-slate-950
        "
      >
        {/* Cover Image */}
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="
              absolute inset-0
              bg-gradient-to-br
              from-violet-200
              via-indigo-100
              to-slate-100
              dark:from-violet-950
              dark:via-indigo-950
              dark:to-slate-950
            "
          />
        )}

        {/* Dim overlay */}
        <div
          className="
            absolute inset-0
            bg-black/20
            dark:bg-black/35
          "
        />

        {/* Bottom fade */}
        <div
          className="
            absolute inset-x-0 bottom-0 h-32
            bg-gradient-to-t
            from-black/50
            via-black/10
            to-transparent
          "
        />

        {/* Top navigation */}
        <div
          className="
            absolute left-0 right-0 top-0
            z-10
            mx-auto flex h-16 max-w-3xl
            items-center
            px-4 sm:px-6
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-white/30
              bg-black/20
              text-white
              shadow-sm
              backdrop-blur-md
              transition-all
              hover:bg-black/30
              active:scale-95
            "
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Club information */}
        <div
          className="
            absolute
            bottom-5
            left-0
            right-0
            z-10
            mx-auto
            max-w-3xl
            px-4
            sm:px-6
          "
        >
          <p className="text-xs font-medium text-white/75">
            {category || "Campus Community"}
          </p>

          <h1
            className="
              mt-1
              truncate
              text-2xl
              font-bold
              tracking-tight
              text-white
              sm:text-3xl
            "
          >
            {name}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default ClubHeader;
