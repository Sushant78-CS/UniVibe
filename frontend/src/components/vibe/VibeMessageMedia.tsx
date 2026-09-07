import { FileText } from "lucide-react";
import type { VibeMediaType } from "../../api/vibeApi";

interface VibeMessageMediaProps {
  mediaUrl: string | null;
  localMediaUrl?: string | null;
  mediaType: VibeMediaType | null;
  pending?: boolean;
  localFileName?: string | null;
  onMediaClick?: (url: string, type: "IMAGE" | "GIF") => void;
}

const VibeMessageMedia = ({
  mediaUrl,
  localMediaUrl,
  mediaType,
  pending,
  localFileName,
  onMediaClick,
}: VibeMessageMediaProps) => {
  /*
   * Nothing to render.
   */
  if (!mediaUrl && !localMediaUrl && mediaType !== "PDF") {
    return null;
  }

  const displayUrl = localMediaUrl || mediaUrl;

  /*
   * =========================================================
   * IMAGE
   * =========================================================
   */

  if (mediaType === "IMAGE") {
    if (!displayUrl) {
      return null;
    }

    return (
      <div className="mt-3 overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => onMediaClick?.(displayUrl, "IMAGE")}
          className="
            block
            w-full
            overflow-hidden
            rounded-2xl
            bg-black/5
            dark:bg-white/5
          "
          aria-label="View image"
        >
          <img
            src={displayUrl}
            alt="Anonymous shared image"
            className="
              max-h-[420px]
              w-full
              rounded-2xl
              object-contain
            "
          />
        </button>
      </div>
    );
  }

  /*
   * =========================================================
   * GIF
   * =========================================================
   */

  if (mediaType === "GIF") {
    if (!displayUrl) {
      return null;
    }

    return (
      <div className="mt-3 overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => onMediaClick?.(displayUrl, "GIF")}
          className="
            block
            w-full
            overflow-hidden
            rounded-2xl
            bg-black/5
            dark:bg-white/5
          "
          aria-label="View GIF"
        >
          <img
            src={displayUrl}
            alt="Anonymous shared GIF"
            className="
              max-h-[420px]
              w-full
              rounded-2xl
              object-contain
            "
          />
        </button>
      </div>
    );
  }

  /*
   * =========================================================
   * STICKER
   * =========================================================
   *
   * Stickers are displayed directly inside the message.
   * They do not open the media viewer.
   */

  if (mediaType === "STICKER") {
    if (!displayUrl) {
      return null;
    }

    return (
      <div className="mt-2 flex items-center justify-start">
        <img
          src={displayUrl}
          alt="Anonymous shared sticker"
          className="
            h-32
            w-32
            object-contain
            sm:h-36
            sm:w-36
            select-none
          "
          draggable={false}
        />
      </div>
    );
  }

  /*
   * =========================================================
   * PDF
   * =========================================================
   */

  if (mediaType === "PDF") {
    /*
     * Optimistic PDF message while uploading.
     */

    if (pending && !mediaUrl) {
      return (
        <div
          className="
            mt-3
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-purple-200
            bg-purple-50
            p-3
            dark:border-purple-900
            dark:bg-purple-950/30
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-purple-100
              text-purple-600
              dark:bg-purple-950
              dark:text-purple-300
            "
          >
            <FileText size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                truncate
                text-xs
                font-semibold
                text-purple-800
                dark:text-purple-200
              "
            >
              {localFileName || "Shared PDF"}
            </p>

            <p
              className="
                mt-0.5
                text-[10px]
                text-purple-500
                dark:text-purple-400
              "
            >
              Sending...
            </p>
          </div>
        </div>
      );
    }

    /*
     * Uploaded PDF.
     */

    if (!mediaUrl) {
      return null;
    }

    return (
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-3
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-neutral-200
          bg-white
          p-3
          transition
          hover:bg-neutral-100
          dark:border-neutral-700
          dark:bg-neutral-900
          dark:hover:bg-neutral-800
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-purple-100
            text-purple-600
            dark:bg-purple-950
            dark:text-purple-300
          "
        >
          <FileText size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-sm
              font-semibold
              text-neutral-800
              dark:text-neutral-100
            "
          >
            Shared PDF
          </p>

          <p className="mt-0.5 text-xs text-neutral-500">Tap to open</p>
        </div>
      </a>
    );
  }

  return null;
};

export default VibeMessageMedia;
