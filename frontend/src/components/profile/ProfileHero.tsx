interface ProfileHeroProps {
  profileImage?: string | null;
  fullName?: string;
  department?: string;
  year?: string;
  college?: string;
}

function ProfileHero({
  profileImage,
  fullName = "",
  department = "",
  year = "",
  college = "",
}: ProfileHeroProps) {
  const initials = fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-center text-center">
        {/* Profile Image */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold text-white shadow-xl ring-4 ring-indigo-100 dark:ring-indigo-950">
            {profileImage ? (
              <img
                src={profileImage}
                alt={fullName || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* Online indicator */}
          <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 dark:border-slate-900" />
        </div>

        {/* Name */}
        <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
          {fullName || "User"}
        </h2>

        {/* Course */}
        {(department || year) && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {[department, year].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* College */}
        {college && (
          <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {college}
          </p>
        )}
      </div>
    </section>
  );
}

export default ProfileHero;
