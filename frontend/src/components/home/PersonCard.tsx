import { ChevronRight } from "lucide-react";

interface PersonCardProps {
  name: string;
  course: string;
  year: string;
  interests: string[];
  match: string;
}

function PersonCard({ name, course, year, interests, match }: PersonCardProps) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {/* Top */}
      <div className="flex items-start justify-between">
        {/* Avatar */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Match percentage */}
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          {match} match
        </div>
      </div>

      {/* User info */}
      <div className="mt-4">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
          {name}
        </h4>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {course} · {year}
        </p>
      </div>

      {/* Interests */}
      <div className="mt-4 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <span
            key={interest}
            className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          >
            {interest}
          </span>
        ))}
      </div>

      {/* Button */}
      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
      >
        View Profile
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default PersonCard;
