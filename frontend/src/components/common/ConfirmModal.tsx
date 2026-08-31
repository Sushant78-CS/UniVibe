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
  loadingText?: string;
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  loadingText = "Loading...",
}: ConfirmModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        backdrop-blur-sm
      "
      onClick={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-sm
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-end
            px-4
            pt-4
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Icon */}
        <div className="flex justify-center px-6 pt-1">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-red-100
              text-red-600
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            <AlertTriangle size={25} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 text-center">
          <h2
            className="
              text-base
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-5
              text-slate-500
              dark:text-slate-400
            "
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6 pt-6">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
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

          {/* Delete */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
