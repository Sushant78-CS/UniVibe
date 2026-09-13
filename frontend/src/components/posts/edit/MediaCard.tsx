import { Trash2, Video } from "lucide-react";

import type { PostMedia } from "../../../api/postApi";

interface MediaCardProps {
  media: PostMedia;
  disabled?: boolean;
  onRemove: () => void;
}

const MediaCard = ({ media, disabled = false, onRemove }: MediaCardProps) => {
  const isVideo = media.mediaType === "VIDEO";

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950">
      {isVideo ? (
        <video
          src={media.mediaUrl}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={media.mediaUrl}
          alt="Post media"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      )}

      {/* TYPE */}

      {isVideo && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[9px] font-medium text-white backdrop-blur-sm">
          <Video size={10} />
          Video
        </div>
      )}

      {/* DELETE */}

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white opacity-100 backdrop-blur-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Delete media"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default MediaCard;
