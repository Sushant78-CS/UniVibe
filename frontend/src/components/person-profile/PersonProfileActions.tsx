import { MessageCircle } from "lucide-react";

interface PersonProfileActionsProps {
  fullName: string;
  loading: boolean;
  onMessage: () => void;
}

const PersonProfileActions = ({
  fullName,
  loading,
  onMessage,
}: PersonProfileActionsProps) => {
  return (
    <div className="mt-4 px-4">
      <button
        type="button"
        onClick={onMessage}
        disabled={loading}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-violet-600
          px-4
          py-2.5
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-violet-700
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
          dark:hover:bg-violet-500
        "
      >
        {loading ? (
          <>
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-white/30
                border-t-white
              "
            />
            Opening chat...
          </>
        ) : (
          <>
            <MessageCircle size={17} />
            Message {fullName.split(" ")[0]}
          </>
        )}
      </button>
    </div>
  );
};

export default PersonProfileActions;
