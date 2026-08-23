interface ProfileStatsProps {
  connections: number;
  clubs: number;
  events: number;
}

function ProfileStats({ connections, clubs, events }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat value={connections} label="Connections" />

      <Stat value={clubs} label="Clubs" />

      <Stat value={events} label="Events" />
    </div>
  );
}

interface StatProps {
  value: number;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

export default ProfileStats;
