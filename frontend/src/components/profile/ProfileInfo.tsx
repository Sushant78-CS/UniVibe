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
          dark:border-neutral-800
          dark:bg-[#171717]
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
          border
          border-violet-200
          bg-violet-50
          text-violet-600
          dark:border-violet-500/20
          dark:bg-violet-500/10
          dark:text-violet-400
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[10px]
            text-slate-400
            dark:text-neutral-500
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-xs
            font-semibold
            text-slate-800
            dark:text-neutral-200
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProfileInfo;
