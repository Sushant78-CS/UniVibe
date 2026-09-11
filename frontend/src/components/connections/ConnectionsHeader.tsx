import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router";

const ConnectionsHeader = () => {
  const navigate = useNavigate();

  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-slate-200
        bg-white/95
        backdrop-blur-xl

        dark:border-neutral-900
        dark:bg-black/95
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          max-w-2xl
          items-center
          px-4
          sm:px-6
        "
      >
        {/* Back */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl

            text-slate-600
            transition-all
            duration-150

            hover:bg-slate-100
            hover:text-slate-900

            active:scale-95

            dark:text-neutral-400
            dark:hover:bg-neutral-900
            dark:hover:text-white
          "
        >
          <ArrowLeft size={19} strokeWidth={1.9} />
        </button>

        {/* Header */}

        <div
          className="
            ml-3
            flex
            items-center
            gap-2.5
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl

              border
              border-violet-200
              bg-violet-50
              text-violet-600

              dark:border-violet-500/20
              dark:bg-violet-500/10
              dark:text-violet-400
            "
          >
            <Users size={18} strokeWidth={1.9} />
          </div>

          <div className="min-w-0">
            <h1
              className="
                truncate
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Connections
            </h1>

            <p
              className="
                truncate
                text-[10px]
                font-medium
                text-slate-500
                dark:text-neutral-500
              "
            >
              Your campus network
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ConnectionsHeader;
