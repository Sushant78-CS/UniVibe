import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router";

const ConnectionsHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ArrowLeft size={19} />
        </button>

        <div className="ml-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <Users size={18} />
          </div>

          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">
              Connections
            </h1>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Your campus network
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ConnectionsHeader;
