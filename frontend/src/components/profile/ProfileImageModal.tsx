import { X } from "lucide-react";

interface ProfileImageModalProps {
  open: boolean;
  image?: string | null;
  name?: string;
  onClose: () => void;
}

const ProfileImageModal = ({
  open,
  image,
  name,
  onClose,
}: ProfileImageModalProps) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/80
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className="
            absolute -right-2 -top-2 z-10
            flex h-9 w-9 items-center justify-center
            rounded-full
            bg-white
            text-slate-700
            shadow-lg
            transition
            hover:bg-slate-100
            active:scale-95
            dark:bg-slate-900
            dark:text-white
            dark:hover:bg-slate-800
          "
        >
          <X size={18} />
        </button>

        {image ? (
          <img
            src={image}
            alt={name ? `${name}'s profile` : "Profile"}
            className="
              max-h-[85vh]
              max-w-[85vw]
              rounded-2xl
              object-contain
              shadow-2xl
            "
          />
        ) : (
          <div
            className="
              flex h-64 w-64
              items-center justify-center
              rounded-full
              bg-gradient-to-br
              from-indigo-500
              to-purple-600
              text-7xl
              font-bold
              text-white
              shadow-2xl
            "
          >
            {name?.trim().charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageModal;
