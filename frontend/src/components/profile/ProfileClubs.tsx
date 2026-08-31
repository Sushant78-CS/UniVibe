import { ChevronRight, Users } from "lucide-react";

interface Club {
  id: string;
  name: string;
  category: string;
  members: number;
  logo?: string;
}

interface ProfileClubsProps {
  clubs: Club[];
}

function ProfileClubs({ clubs }: ProfileClubsProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3
          className="
            text-sm
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          My Clubs
        </h3>

        <button
          type="button"
          className="
            text-[11px]
            font-semibold
            text-indigo-600
            dark:text-indigo-400
          "
        >
          Explore
        </button>
      </div>

      <div className="space-y-2">
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <button
              key={club.id}
              type="button"
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-white
                p-2.5
                text-left
                transition
                hover:border-indigo-200
                hover:shadow-sm
                dark:border-slate-800
                dark:bg-slate-900
                dark:hover:border-indigo-800
              "
            >
              {/* Logo */}
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-lg
                  bg-gradient-to-br
                  from-indigo-500
                  to-purple-600
                  text-sm
                  font-bold
                  text-white
                "
              >
                {club.logo ? (
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  club.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h4
                  className="
                    truncate
                    text-xs
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {club.name}
                </h4>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {club.category}
                </p>

                <div
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1
                    text-[10px]
                    text-slate-400
                  "
                >
                  <Users size={11} />
                  {club.members} members
                </div>
              </div>

              <ChevronRight size={15} className="shrink-0 text-slate-400" />
            </button>
          ))
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-6
              text-center
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <Users size={22} className="mx-auto text-slate-400" />

            <p
              className="
                mt-2
                text-xs
                font-medium
                text-slate-600
                dark:text-slate-300
              "
            >
              You haven't joined any clubs yet.
            </p>

            <button
              type="button"
              className="
                mt-2
                text-[11px]
                font-semibold
                text-indigo-600
                dark:text-indigo-400
              "
            >
              Discover Clubs
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProfileClubs;
