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
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative">
          <div
            className="
              flex
              h-20
              w-20
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-gradient-to-br
              from-indigo-500
              to-purple-600
              text-2xl
              font-bold
              text-white
              ring-4
              ring-indigo-50
              dark:ring-indigo-950
            "
          >
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

          <span
            className="
              absolute
              bottom-0.5
              right-0.5
              h-4
              w-4
              rounded-full
              border-[3px]
              border-white
              bg-emerald-500
              dark:border-slate-900
            "
          />
        </div>

        {/* Name */}
        <h2
          className="
            mt-3
            text-lg
            font-bold
            tracking-tight
            text-slate-900
            dark:text-white
          "
        >
          {fullName || "User"}
        </h2>

        {/* Department / Year */}
        {(department || year) && (
          <p
            className="
              mt-0.5
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            {[department, year].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* College */}
        {college && (
          <p
            className="
              mt-0.5
              max-w-[90%]
              truncate
              text-xs
              font-medium
              text-indigo-600
              dark:text-indigo-400
            "
          >
            {college}
          </p>
        )}
      </div>
    </section>
  );
}

export default ProfileHero;
