import { ChevronRight } from "lucide-react";

interface CampusCardProps {
  emoji: string;
  title: string;
  members: string;
  description: string;
}

function CampusCard({ emoji, title, members, description }: CampusCardProps) {
  return (
    <button
      type="button"
      className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
          {emoji}
        </div>

        <div className="min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {members}
          </p>
        </div>

        <ChevronRight
          size={18}
          className="ml-auto shrink-0 text-slate-400 transition group-hover:translate-x-1"
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}

export default CampusCard;
