import { BookOpen, Building2, GraduationCap } from "lucide-react";

interface ProfileInfoProps {
  college: string;
  year: string;
  department?: string;
}

function ProfileInfo({ college, department, year }: ProfileInfoProps) {
  return (
    <section>
      <h3
        className="
          mb-2
          text-sm
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        Education
      </h3>

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3.5
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <div className="space-y-3.5">
          <InfoRow
            icon={<Building2 size={16} />}
            label="College"
            value={college}
          />

          <InfoRow
            icon={<BookOpen size={16} />}
            label="Department"
            value={department || "N/A"}
          />

          <InfoRow
            icon={<GraduationCap size={16} />}
            label="Year"
            value={year}
          />
        </div>
      </div>
    </section>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-indigo-50
          text-indigo-600
          dark:bg-indigo-950
          dark:text-indigo-400
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">{label}</p>

        <p
          className="
            mt-0.5
            truncate
            text-xs
            font-semibold
            text-slate-800
            dark:text-slate-200
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProfileInfo;
