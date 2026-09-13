import { ArrowLeft } from "lucide-react";

interface EditPostHeaderProps {
  onBack: () => void;
  disabled?: boolean;
}

const EditPostHeader = ({ onBack, disabled = false }: EditPostHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Go back"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Edit Post
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Make changes to your post
          </p>
        </div>
      </div>
    </header>
  );
};

export default EditPostHeader;
