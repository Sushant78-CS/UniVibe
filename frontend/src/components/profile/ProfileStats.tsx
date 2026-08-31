interface ProfileStatsProps {
  connections: number;
  clubs: number;
  events: number;
}

function ProfileStats({ connections, clubs, events }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
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
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-2
        py-2.5
        text-center
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <p
        className="
          text-base
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          font-medium
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}

export default ProfileStats;
