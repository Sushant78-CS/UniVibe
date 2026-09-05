import { UserRound } from "lucide-react";

interface PersonProfileInfoProps {
  profileImage?: string | null;
  fullName: string;
  username: string;

  posts: number;
  connections: number;
  clubs: number;

  onImageClick: () => void;
}

const PersonProfileInfo = ({
  profileImage,
  fullName,
  username,
  posts,
  connections,
  clubs,
  onImageClick,
}: PersonProfileInfoProps) => {
  return (
    <section className="px-4 pt-5">
      {/* ======================================
          PHOTO + STATS
      ====================================== */}

      <div className="flex items-center gap-6">
        {/* PROFILE IMAGE */}

        <button
          type="button"
          onClick={onImageClick}
          aria-label={`View ${fullName}'s profile photo`}
          className="
            shrink-0
            rounded-full
            focus:outline-none
            focus:ring-2
            focus:ring-violet-500
            focus:ring-offset-2
            focus:ring-offset-white
            dark:focus:ring-offset-black
          "
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={fullName}
              className="
                h-20
                w-20
                rounded-full
                object-cover
                ring-1
                ring-neutral-200
                dark:ring-neutral-700
              "
            />
          ) : (
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-neutral-100
                text-neutral-500
                dark:bg-neutral-900
                dark:text-neutral-400
              "
            >
              <UserRound size={28} />
            </div>
          )}
        </button>

        {/* STATS */}

        <div className="grid flex-1 grid-cols-3">
          <Stat value={posts} label="Posts" />

          <Stat value={connections} label="Connections" />

          <Stat value={clubs} label="Clubs" />
        </div>
      </div>

      {/* ======================================
          NAME
      ====================================== */}

      <div className="mt-4">
        <h2
          className="
            text-sm
            font-semibold
            text-neutral-900
            dark:text-white
          "
        >
          {fullName}
        </h2>

        <p
          className="
            mt-0.5
            text-xs
            text-violet-600
            dark:text-violet-400
          "
        >
          @{username}
        </p>
      </div>
    </section>
  );
};

interface StatProps {
  value: number;
  label: string;
}

const Stat = ({ value, label }: StatProps) => {
  return (
    <div className="text-center">
      <p
        className="
          text-base
          font-semibold
          text-neutral-900
          dark:text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-0.5
          text-[11px]
          text-neutral-500
          dark:text-neutral-500
        "
      >
        {label}
      </p>
    </div>
  );
};

export default PersonProfileInfo;
