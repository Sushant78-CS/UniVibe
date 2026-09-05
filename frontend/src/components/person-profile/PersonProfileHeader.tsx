import { ArrowLeft } from "lucide-react";

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
          px-4
        "
      >
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="
            flex
            h-9
            w-9
            shrink-0
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

        {/* Profile name */}
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

        {/* Empty space to keep the name perfectly centered */}
        <div className="h-9 w-9 shrink-0" />
      </div>
    </header>
  );
};

export default PersonProfileHeader;
