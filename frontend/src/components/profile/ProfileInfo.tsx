import { BookOpen, Building2, GraduationCap } from "lucide-react";

interface ProfileInfoProps {
  college: string;
  year: string;
  department?: string;
}

function ProfileInfo({ college, department, year }: ProfileInfoProps) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
        Education
      </h3>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-5">
          {/* College */}
          <InfoRow
            icon={<Building2 size={19} />}
            label="College"
            value={college}
          />

          {/* Department */}
          <InfoRow
            icon={<BookOpen size={19} />}
            label="Department"
            value={department || "N/A"}
          />

          {/* Year */}
          <InfoRow
            icon={<GraduationCap size={19} />}
            label="Year"
            value={year}
          />

          {/* {department && (
            <InfoRow
              icon={<BookOpen size={19} />}
              label="Department"
              value={department}
            />
          )} */}
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
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProfileInfo;
