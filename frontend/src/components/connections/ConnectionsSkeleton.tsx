const ConnectionsSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-800" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
};

export default ConnectionsSkeleton;
