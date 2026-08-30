import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        px-4
        backdrop-blur-sm
      "
      onClick={onCancel}
    >
      <div
        className="
          w-full max-w-sm
          rounded-3xl
          border border-slate-200
          bg-white
          p-6
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-red-100
              text-red-600
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-4 py-3
              text-sm font-semibold
              text-slate-700
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:hover:bg-slate-700
            "
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              rounded-xl
              bg-red-600
              px-4 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Removing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
