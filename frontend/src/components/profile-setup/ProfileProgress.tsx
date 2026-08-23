interface ProfileProgressProps {
  current: number;
  total: number;
}

function ProfileProgress({ current, total }: ProfileProgressProps) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="mt-6">
      {/* Progress Header */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className="
            text-xs
            font-medium
            text-slate-500
            dark:text-slate-400
          "
        >
          Profile completion
        </span>

        <span
          className="
            text-xs
            font-semibold
            text-indigo-600
            dark:text-indigo-400
          "
        >
          {percentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div
        className="
          h-2
          w-full
          overflow-hidden
          rounded-full

          bg-slate-100

          dark:bg-slate-800
        "
      >
        {/* Progress */}
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-indigo-600
            to-purple-600

            transition-all
            duration-500
            ease-out

            dark:from-indigo-500
            dark:to-purple-500
          "
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default ProfileProgress;
