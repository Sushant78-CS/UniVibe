import { Image as ImageIcon, Video, X } from "lucide-react";

type MediaType = "IMAGE" | "VIDEO";

interface MediaPreviewProps {
  previewUrl: string;

  mediaType: MediaType;

  selectedFile: File;

  disabled?: boolean;

  onRemove: () => void;
}

const MediaPreview = ({
  previewUrl,
  mediaType,
  selectedFile,
  disabled = false,
  onRemove,
}: MediaPreviewProps) => {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-black
        shadow-xl
        dark:border-slate-700
      "
    >
      {/* =====================================================
          PREVIEW HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          bg-black
          px-4
          py-3
          text-white
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {mediaType === "IMAGE" ? (
            <ImageIcon size={17} />
          ) : (
            <Video size={17} />
          )}

          <span
            className="
              text-sm
              font-semibold
            "
          >
            Preview
          </span>
        </div>

        {/* REMOVE */}

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white/10
            transition

            hover:bg-white/20

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={17} />
        </button>
      </div>

      {/* =====================================================
          MEDIA
      ===================================================== */}

      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center
          bg-black
          sm:min-h-[520px]
        "
      >
        {/* ===================================================
            IMAGE
        =================================================== */}

        {mediaType === "IMAGE" && (
          <img
            src={previewUrl}
            alt="Post preview"
            className="
              max-h-[65vh]
              w-full
              object-contain
            "
          />
        )}

        {/* ===================================================
            VIDEO
        =================================================== */}

        {mediaType === "VIDEO" && (
          <video
            src={previewUrl}
            controls
            playsInline
            preload="metadata"
            className="
              max-h-[65vh]
              w-full
              object-contain
              bg-black
            "
          />
        )}
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          bg-black
          px-4
          py-3
          text-xs
          text-white
        "
      >
        <span>{mediaType === "IMAGE" ? "Photo" : "Video"}</span>

        <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    </div>
  );
};

export default MediaPreview;
