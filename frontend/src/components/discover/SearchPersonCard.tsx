import type { SearchPerson } from "../../api/searchApi";

interface SearchPersonCardProps {
  person: SearchPerson;
  onClick: () => void;
}

export default function SearchPersonCard({
  person,
  onClick,
}: SearchPersonCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3
        text-left
        transition
        duration-150
        hover:border-slate-300
        hover:bg-slate-50
        active:scale-[0.99]

        dark:border-neutral-800
        dark:bg-[#171717]
        dark:hover:border-neutral-700
        dark:hover:bg-[#1b1b1b]
      "
    >
      {/* PROFILE IMAGE */}

      {person.profileImage ? (
        <img
          src={person.profileImage}
          alt={person.fullName}
          className="
            h-12
            w-12
            shrink-0
            rounded-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-violet-100
            text-sm
            font-bold
            text-violet-600
            dark:bg-violet-500/10
            dark:text-violet-400
          "
        >
          {person.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}

      {/* NAME + USERNAME */}

      <div className="min-w-0 flex-1">
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

        {person.username && (
          <p
            className="
              mt-0.5
              truncate
              text-xs
              font-medium
              text-slate-500
              dark:text-neutral-500
            "
          >
            @{person.username}
          </p>
        )}
      </div>
    </button>
  );
}
