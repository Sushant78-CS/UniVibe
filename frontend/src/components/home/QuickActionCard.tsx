interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickActionCard({ icon, title, description }: QuickActionCardProps) {
  return (
    <button
      type="button"
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-indigo-900">
        {icon}
      </div>

      <h4 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h4>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}

export default QuickActionCard;
