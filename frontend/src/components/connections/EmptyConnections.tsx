import { Users } from "lucide-react";
import { useNavigate } from "react-router";

const EmptyConnections = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
        <Users size={22} />
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        No connections yet
      </h2>

      <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-slate-500 dark:text-slate-400">
        Discover students with similar interests and start building your campus
        network.
      </p>

      <button
        type="button"
        onClick={() => navigate("/discover")}
        className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 active:scale-95"
      >
        Discover People
      </button>
    </div>
  );
};

export default EmptyConnections;
