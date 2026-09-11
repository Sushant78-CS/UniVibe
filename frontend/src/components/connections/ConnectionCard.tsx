import { MessageCircle, UserRound } from "lucide-react";

export interface ConnectedPerson {
  connectionId: number;
  profileId: number;
  fullName: string;
  username: string;
  profileImage?: string | null;
}

interface ConnectionCardProps {
  person: ConnectedPerson;
  onViewProfile?: () => void;
  onMessage?: () => void;
}

const ConnectionCard = ({
  person,
  onViewProfile,
  onMessage,
}: ConnectionCardProps) => {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3

        transition-all
        duration-150

        hover:bg-slate-50

        dark:border-neutral-900
        dark:bg-neutral-950
        dark:hover:bg-neutral-900
      "
    >
      {/* =====================================
          AVATAR
          ===================================== */}

      <button
        type="button"
        onClick={onViewProfile}
        className="
          shrink-0
          rounded-full
          outline-none
          transition-transform
          duration-150
          active:scale-95

          focus-visible:ring-2
          focus-visible:ring-violet-500/40
        "
        aria-label={`View ${person.fullName}'s profile`}
      >
        {person.profileImage ? (
          <img
            src={person.profileImage}
            alt={person.fullName}
            draggable={false}
            loading="lazy"
            className="
              h-11
              w-11
              rounded-full
              object-cover

              ring-1
              ring-slate-200

              transition-all
              duration-150

              group-hover:ring-2
              group-hover:ring-violet-500

              dark:ring-neutral-800
              dark:group-hover:ring-violet-500
            "
          />
        ) : (
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full

              border
              border-violet-200
              bg-violet-50
              text-violet-600

              dark:border-violet-500/20
              dark:bg-violet-500/10
              dark:text-violet-400
            "
          >
            <UserRound size={20} strokeWidth={1.8} />
          </div>
        )}
      </button>

      {/* =====================================
          USER INFO
          ===================================== */}

      <button
        type="button"
        onClick={onViewProfile}
        className="
          min-w-0
          flex-1
          rounded-lg
          text-left
          outline-none

          focus-visible:ring-2
          focus-visible:ring-violet-500/30
        "
      >
        <p
          className="
            truncate
            text-sm
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          {person.fullName}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-xs
            text-slate-500
            dark:text-neutral-500
          "
        >
          @{person.username}
        </p>
      </button>

      {/* =====================================
          MESSAGE
          ===================================== */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onMessage?.();
        }}
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl

          border
          border-slate-200
          bg-slate-50
          text-slate-600

          transition-all
          duration-150

          hover:border-violet-200
          hover:bg-violet-50
          hover:text-violet-600

          active:scale-95

          dark:border-neutral-800
          dark:bg-neutral-900
          dark:text-neutral-400

          dark:hover:border-violet-500/20
          dark:hover:bg-violet-500/10
          dark:hover:text-violet-400
        "
        aria-label={`Message ${person.fullName}`}
      >
        <MessageCircle size={16} strokeWidth={1.9} />
      </button>
    </div>
  );
};

export default ConnectionCard;
