import { FcGoogle } from "react-icons/fc";

interface GoogleButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const GoogleButton = ({ onClick, loading = false }: GoogleButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        py-3.5
        text-sm
        font-semibold
        text-slate-800
        shadow-sm
        transition-all
        duration-200

        hover:border-slate-300
        hover:bg-slate-50
        hover:shadow-md

        disabled:cursor-not-allowed
        disabled:opacity-50

        dark:border-slate-700
        dark:bg-slate-900
        dark:text-white
        dark:hover:border-slate-600
        dark:hover:bg-slate-800
      "
    >
      <FcGoogle size={20} />

      {loading ? (
        <div
          className="
            h-5
            w-5
            animate-spin
            rounded-full
            border-2
            border-slate-300
            border-t-violet-600
            dark:border-slate-600
            dark:border-t-violet-400
          "
        />
      ) : (
        "Continue with Google"
      )}
    </button>
  );
};

export default GoogleButton;
