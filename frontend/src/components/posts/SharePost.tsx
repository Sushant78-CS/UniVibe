import { Copy, X, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface SharePostProps {
  open: boolean;
  postId: number;
  description?: string;
  onClose: () => void;
}

const SharePost = ({ open, postId, description, onClose }: SharePostProps) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts?post=${postId}`
      : "";

  const shareText = description?.trim() || "Check out this post on UniVibe.";

  /*
   * Automatically open the native phone share sheet
   * when the component becomes open.
   */
  useEffect(() => {
    if (!open) {
      setCopied(false);
      setSharing(false);
      return;
    }

    const openNativeShare = async () => {
      if (typeof navigator === "undefined" || !navigator.share) {
        return;
      }

      try {
        setSharing(true);

        await navigator.share({
          title: "UniVibe Post",
          text: shareText,
          url: shareUrl,
        });

        onClose();
      } catch (error) {
        /*
         * User closing the native share sheet is normal.
         * Keep the fallback modal open in that case.
         */
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to share post:", error);
      } finally {
        setSharing(false);
      }
    };

    /*
     * Small delay allows the modal state/navigation event
     * to finish before opening the native share UI.
     */
    const timeout = window.setTimeout(() => {
      void openNativeShare();
    }, 50);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, shareText, shareUrl, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to copy post link:", error);
    }
  };

  /*
   * Don't render anything when closed.
   *
   * On phones, native share will open automatically.
   * This UI is primarily the fallback for browsers
   * where navigator.share() is unavailable.
   */
  if (!open) {
    return null;
  }

  /*
   * Native sharing is supported, so don't show the
   * fallback UI while the native sheet is opening.
   */
  const nativeShareSupported =
    typeof navigator !== "undefined" && !!navigator.share;

  if (nativeShareSupported) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-end
        justify-center
        bg-black/50
        p-0
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-t-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-neutral-800
          dark:bg-[#171717]
          sm:rounded-3xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-4
            dark:border-neutral-800
          "
        >
          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Share post
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
                dark:text-neutral-500
              "
            >
              Share this post with others
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              dark:text-neutral-500
              dark:hover:bg-neutral-800
              dark:hover:text-neutral-200
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Copy Link */}
        <div className="p-5">
          <button
            type="button"
            onClick={handleCopy}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2.5
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              py-3.5
              text-sm
              font-semibold
              text-slate-700
              transition-all
              hover:border-violet-200
              hover:bg-violet-50
              hover:text-violet-600
              active:scale-[0.99]
              dark:border-neutral-800
              dark:bg-neutral-900
              dark:text-neutral-200
              dark:hover:border-violet-500/20
              dark:hover:bg-violet-500/10
              dark:hover:text-violet-400
            "
          >
            {copied ? (
              <>
                <Check
                  size={17}
                  className="text-violet-600 dark:text-violet-400"
                />
                Copied
              </>
            ) : (
              <>
                <Copy
                  size={17}
                  className="text-violet-600 dark:text-violet-400"
                />
                Copy link
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={sharing}
            className="
              mt-3
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              py-3
              text-xs
              font-semibold
              text-slate-600
              transition
              hover:bg-slate-50
              disabled:opacity-60
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:text-neutral-300
              dark:hover:bg-neutral-800
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePost;
