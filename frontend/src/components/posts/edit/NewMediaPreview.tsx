import { Trash2, Video } from "lucide-react";

import type { MediaType } from "../../../api/postApi";

interface NewMediaPreviewProps {
  file: File;
  preview: string;
  mediaType: MediaType;

  disabled?: boolean;

  onRemove: () => void;
}

const NewMediaPreview = ({
  file,
  preview,
  mediaType,
  disabled = false,
  onRemove,
}: NewMediaPreviewProps) => {
  const isVideo = mediaType === "VIDEO";

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-violet-200 bg-slate-100 dark:border-violet-900/50 dark:bg-slate-950">
      {isVideo ? (
        <video
          src={preview}
          playsInline
          controls
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={preview}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      )}

      {/* NEW BADGE */}

      <div className="absolute bottom-2 left-2 rounded-full bg-violet-600/90 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
        New
      </div>

      {/* VIDEO */}

      {isVideo && (
        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm">
          <Video size={12} />
        </div>
      )}

      {/* REMOVE */}

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-red-600 disabled:opacity-50"
        aria-label="Remove selected media"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default NewMediaPreview;
