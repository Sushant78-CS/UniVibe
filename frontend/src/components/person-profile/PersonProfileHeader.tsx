import { ArrowLeft, MoreHorizontal } from "lucide-react";

interface PersonProfileHeaderProps {
  fullName: string;
  onBack: () => void;
}

const PersonProfileHeader = ({
  fullName,
  onBack,
}: PersonProfileHeaderProps) => {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-neutral-200
        bg-white
        dark:border-neutral-800
        dark:bg-black
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-full
          max-w-2xl
          items-center
          justify-between
          px-4
        "
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-neutral-800
            transition
            hover:bg-neutral-100
            dark:text-white
            dark:hover:bg-neutral-900
          "
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0 flex-1 px-3 text-center">
          <h1
            className="
              truncate
              text-sm
              font-semibold
              text-neutral-900
              dark:text-white
            "
          >
            {fullName}
          </h1>
        </div>

        <button
          type="button"
          aria-label="Profile options"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-neutral-700
            transition
            hover:bg-neutral-100
            dark:text-neutral-300
            dark:hover:bg-neutral-900
          "
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </header>
  );
};

export default PersonProfileHeader;
