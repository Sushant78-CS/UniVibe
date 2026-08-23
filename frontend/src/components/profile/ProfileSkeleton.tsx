const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse space-y-5">
      {/* Profile Hero */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />

          {/* Name */}
          <div className="mt-4 h-6 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />

          {/* Department */}
          <div className="mt-2 h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />

          {/* College */}
          <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>

      {/* About */}
      <section>
        <div className="mb-3 h-5 w-20 rounded bg-slate-200 dark:bg-slate-800" />

        <div className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </section>

      {/* Education */}
      <section>
        <div className="mb-3 h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-4 rounded-3xl bg-slate-200 p-5 dark:bg-slate-800">
          <div className="h-5 w-32 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-44 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-28 rounded bg-slate-300 dark:bg-slate-700" />
        </div>
      </section>

      {/* Interests */}
      <section>
        <div className="mb-3 h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />

        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    </div>
  );
};

export default ProfileSkeleton;
