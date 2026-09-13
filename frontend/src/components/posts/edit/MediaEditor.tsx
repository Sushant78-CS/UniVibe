import { ImagePlus, Trash2, RotateCcw } from "lucide-react";

import type { PostMedia, MediaType } from "../../../api/postApi";

import MediaCard from "./MediaCard";
import NewMediaPreview from "./NewMediaPreview";

interface MediaEditorProps {
  existingMedia: PostMedia[];
  removedMedia: PostMedia[];

  selectedFiles: File[];
  selectedMediaTypes: MediaType[];
  selectedPreviews: string[];

  saving: boolean;

  onAddMedia: () => void;

  onRemoveExistingMedia: (mediaUrl: string) => void;

  onRestoreExistingMedia: (mediaUrl: string) => void;

  onRemoveSelectedFile: (index: number) => void;
}

const MAX_IMAGES = 10;

const MediaEditor = ({
  existingMedia,
  removedMedia,
  selectedFiles,
  selectedMediaTypes,
  selectedPreviews,
  saving,
  onAddMedia,
  onRemoveExistingMedia,
  onRestoreExistingMedia,
  onRemoveSelectedFile,
}: MediaEditorProps) => {
  const totalMedia = existingMedia.length + selectedFiles.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* HEADER */}

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Media
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage the photos and videos attached to this post.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {totalMedia} / {MAX_IMAGES}
        </span>
      </div>

      {/* EXISTING MEDIA */}

      {existingMedia.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current media
            </span>

            <span className="text-[11px] text-slate-400">
              {existingMedia.length}{" "}
              {existingMedia.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {existingMedia.map((media) => (
              <MediaCard
                key={media.mediaUrl}
                media={media}
                disabled={saving}
                onRemove={() => onRemoveExistingMedia(media.mediaUrl)}
              />
            ))}
          </div>
        </div>
      )}

      {/* REMOVED MEDIA */}

      {removedMedia.length > 0 && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-500/10">
              <Trash2 size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                {removedMedia.length}{" "}
                {removedMedia.length === 1 ? "media item" : "media items"}{" "}
                marked for deletion
              </p>

              <p className="mt-1 text-[11px] leading-4 text-red-600/80 dark:text-red-400/70">
                They will be permanently removed when you save the post.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {removedMedia.map((media) => (
                  <button
                    key={media.mediaUrl}
                    type="button"
                    onClick={() => onRestoreExistingMedia(media.mediaUrl)}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400"
                  >
                    <RotateCcw size={11} />
                    Undo
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MEDIA */}

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              New media
            </span>

            <span className="text-[11px] text-slate-400">
              Added to this post
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedFiles.map((file, index) => (
              <NewMediaPreview
                key={`${file.name}-${index}`}
                file={file}
                preview={selectedPreviews[index]}
                mediaType={selectedMediaTypes[index]}
                disabled={saving}
                onRemove={() => onRemoveSelectedFile(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ADD MEDIA */}

      <button
        type="button"
        onClick={onAddMedia}
        disabled={saving}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-semibold text-slate-600 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:bg-violet-500/5 dark:hover:text-violet-400"
      >
        <ImagePlus size={17} />
        Add media
      </button>

      {/* INFO */}

      <p className="mt-3 text-[11px] leading-5 text-slate-400 dark:text-slate-500">
        You can attach up to {MAX_IMAGES} images or one video up to 100 MB.
        Removing media takes effect only after you save the post.
      </p>
    </section>
  );
};

export default MediaEditor;
