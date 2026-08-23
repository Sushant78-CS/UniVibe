import { Users } from "lucide-react";

interface ClubStatsProps {
  memberCount: number;
}

const ClubStats = ({ memberCount }: ClubStatsProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
          <Users size={19} />
        </div>

        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {memberCount}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">Members</p>
        </div>
      </div>
    </div>
  );
};

export default ClubStats;
