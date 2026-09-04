interface ProfileHeroProps {
  profileImage?: string | null;
  fullName?: string;
  department?: string;
  year?: string;
  college?: string;
  onImageClick?: () => void;
}

function ProfileHero({
  profileImage,
  fullName = "",
  department = "",
  year = "",
  college = "",
  onImageClick,
}: ProfileHeroProps) {
  const initials = fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_1px_4px_rgba(15,23,42,0.04)]
        transition-colors

        dark:border-neutral-800
        dark:bg-[#171717]
        dark:shadow-none
      "
    >
      <div className="flex flex-col items-center text-center">
        {/* =====================================
            PROFILE IMAGE
            ===================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={onImageClick}
            aria-label="View profile picture"
            className="
              block
              rounded-full
              outline-none
              transition-transform
              duration-150
              hover:scale-[1.03]
              active:scale-95
              focus-visible:ring-4
              focus-visible:ring-violet-500/20
            "
          >
            <div
              className="
                flex
                h-28
                w-28
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-slate-100
                text-4xl
                font-bold
                text-violet-600
                ring-4
                ring-violet-100
                transition-colors

                dark:bg-neutral-900
                dark:text-violet-400
                dark:ring-violet-500/15
              "
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName || "Profile"}
                  draggable={false}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                initials
              )}
            </div>
          </button>
        </div>

        {/* =====================================
            NAME
            ===================================== */}

        <h2
          className="
            mt-4
            text-lg
            font-bold
            tracking-tight
            text-slate-900

            dark:text-white
          "
        >
          {fullName || "User"}
        </h2>

        {/* =====================================
            DEPARTMENT / YEAR
            ===================================== */}

        {(department || year) && (
          <p
            className="
              mt-1
              text-xs
              text-slate-500

              dark:text-neutral-500
            "
          >
            {[department, year].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* =====================================
            COLLEGE
            ===================================== */}

        {college && (
          <p
            className="
              mt-1
              max-w-[90%]
              truncate
              text-xs
              font-medium
              text-violet-600

              dark:text-violet-400
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
