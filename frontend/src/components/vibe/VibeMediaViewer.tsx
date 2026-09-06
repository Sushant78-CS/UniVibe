import { X } from "lucide-react";
import { useEffect } from "react";

interface VibeMediaViewerProps {
  media: {
    url: string;
    type: "IMAGE" | "GIF";
  } | null;

  onClose: () => void;
}

const VibeMediaViewer = ({ media, onClose }: VibeMediaViewerProps) => {
  useEffect(() => {
    if (!media) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = previousOverflow;
    };
  }, [media, onClose]);

  if (!media) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black
        p-3
        sm:p-6
      "
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close media viewer"
        className="
          absolute
          right-3
          top-3
          z-10
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          bg-white/10
          text-white
          backdrop-blur-sm
          transition
          hover:bg-white/20
          active:scale-95
          sm:right-5
          sm:top-5
        "
      >
        <X size={23} />
      </button>

      {/* Media */}
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
        "
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={media.url}
          alt={media.type === "GIF" ? "Vibe GIF" : "Vibe image"}
          className="
            max-h-full
            max-w-full
            rounded-lg
            object-contain
            sm:max-h-[92vh]
            sm:max-w-[94vw]
          "
        />
      </div>
    </div>
  );
};

export default VibeMediaViewer;
