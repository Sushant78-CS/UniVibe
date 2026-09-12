import { Camera, ImagePlus, Send, Video, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import type {
  CreatePostData,
  MediaType,
  PostCategory,
} from "../../../api/postApi";

interface CreatePostFormProps {
  description: string;
  category: PostCategory;

  selectedFiles: File[];
  mediaTypes: MediaType[];

  processingMedia: boolean;
  posting: boolean;

  error: string | null;

  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: PostCategory) => void;

  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onVideoSelect: (event: ChangeEvent<HTMLInputElement>) => void;

  onTakePhoto: () => void;
  onRecordVideo: () => void;

  onRemoveMedia: (index?: number) => void;

  onSubmit: (data: CreatePostData) => void;
}

const categories: {
  value: PostCategory;
  label: string;
}[] = [
  {
    value: "EVENT",
    label: "Event",
  },
  {
    value: "NEWS",
    label: "News",
  },
  {
    value: "ANNOUNCEMENT",
    label: "Announcement",
  },
  {
    value: "ACHIEVEMENT",
    label: "Achievement",
  },
  {
    value: "GENERAL",
    label: "General",
  },
];

const MAX_IMAGES = 10;

const CreatePostForm = ({
  description,
  category,
  selectedFiles,
  mediaTypes,
  processingMedia,
  posting,
  error,
  onDescriptionChange,
  onCategoryChange,
  onImageSelect,
  onVideoSelect,
  onTakePhoto,
  onRecordVideo,
  onRemoveMedia,
  onSubmit,
}: CreatePostFormProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  /*
   * =========================================================
   * CREATE PREVIEW URLS
   * =========================================================
   */

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles]);

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = () => {
    onSubmit({
      description: description.trim(),
      category,
      media: [],
    });
  };

  const mediaDisabled = posting || processingMedia;

  const imageCount = selectedFiles.filter(
    (_, index) => mediaTypes[index] === "IMAGE",
  ).length;

  const hasVideo = selectedFiles.some(
    (_, index) => mediaTypes[index] === "VIDEO",
  );

  return (
    <div className="space-y-6">
      {/* =====================================================
          DESCRIPTION
          ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          transition-colors
          dark:border-slate-800
          dark:bg-slate-900
          sm:p-6
        "
      >
        <div className="mb-3">
          <h2
            className="
              text-base
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            What's happening?
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Share an event, update, achievement, or anything happening around
            your campus.
          </p>
        </div>

        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Write something for your campus community..."
          maxLength={2000}
          rows={6}
          disabled={mediaDisabled}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-sm
            text-slate-900
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-violet-500
            focus:ring-2
            focus:ring-violet-500/20
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:border-slate-700
            dark:bg-slate-950
            dark:text-white
            dark:placeholder:text-slate-500
          "
        />

        <div className="mt-2 flex justify-end">
          <span
            className="
              text-xs
              text-slate-400
              dark:text-slate-500
            "
          >
            {description.length}/2000
          </span>
        </div>
      </section>

      {/* =====================================================
          CATEGORY
          ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          transition-colors
          dark:border-slate-800
          dark:bg-slate-900
          sm:p-6
        "
      >
        <div className="mb-3">
          <h2
            className="
              text-base
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            Category
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Choose a category for your post.
          </p>
        </div>

        <select
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as PostCategory)
          }
          disabled={mediaDisabled}
          className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-sm
            text-slate-900
            outline-none
            transition
            focus:border-violet-500
            focus:ring-2
            focus:ring-violet-500/20
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:border-slate-700
            dark:bg-slate-950
            dark:text-white
          "
        >
          {categories.map((item) => (
            <option
              key={item.value}
              value={item.value}
              className="
                bg-white
                text-slate-900
                dark:bg-slate-950
                dark:text-white
              "
            >
              {item.label}
            </option>
          ))}
        </select>
      </section>

      {/* =====================================================
          MEDIA
          ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          transition-colors
          dark:border-slate-800
          dark:bg-slate-900
          sm:p-6
        "
      >
        <div className="mb-5">
          <h2
            className="
              text-base
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            Add media
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Add up to {MAX_IMAGES} photos or one video.
          </p>
        </div>

        {/* ===================================================
            HIDDEN INPUTS
            =================================================== */}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onImageSelect}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={onVideoSelect}
        />

        {/* ===================================================
            MEDIA BUTTONS
            =================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
          "
        >
          {/* SELECT PHOTO */}

          <button
            type="button"
            disabled={mediaDisabled || hasVideo || imageCount >= MAX_IMAGES}
            onClick={() => imageInputRef.current?.click()}
            className="
              group
              flex
              min-h-24
              flex-col
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-4
              text-center
              transition
              hover:border-violet-500
              hover:bg-violet-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-950
              dark:hover:bg-violet-500/10
            "
          >
            <ImagePlus
              className="
                h-6
                w-6
                text-violet-600
                transition
                group-hover:scale-110
                dark:text-violet-400
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-slate-900
                dark:text-white
              "
            >
              Select Photos
            </span>
          </button>

          {/* SELECT VIDEO */}

          <button
            type="button"
            disabled={mediaDisabled || selectedFiles.length > 0}
            onClick={() => videoInputRef.current?.click()}
            className="
              group
              flex
              min-h-24
              flex-col
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-4
              text-center
              transition
              hover:border-violet-500
              hover:bg-violet-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-950
              dark:hover:bg-violet-500/10
            "
          >
            <Video
              className="
                h-6
                w-6
                text-violet-600
                transition
                group-hover:scale-110
                dark:text-violet-400
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-slate-900
                dark:text-white
              "
            >
              Select Video
            </span>
          </button>

          {/* TAKE PHOTO */}

          <button
            type="button"
            disabled={mediaDisabled || hasVideo}
            onClick={onTakePhoto}
            className="
              group
              flex
              min-h-24
              flex-col
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-4
              text-center
              transition
              hover:border-violet-500
              hover:bg-violet-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-950
              dark:hover:bg-violet-500/10
            "
          >
            <Camera
              className="
                h-6
                w-6
                text-violet-600
                transition
                group-hover:scale-110
                dark:text-violet-400
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-slate-900
                dark:text-white
              "
            >
              Take Photo
            </span>
          </button>

          {/* RECORD VIDEO */}

          <button
            type="button"
            disabled={mediaDisabled || selectedFiles.length > 0}
            onClick={onRecordVideo}
            className="
              group
              flex
              min-h-24
              flex-col
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-4
              text-center
              transition
              hover:border-violet-500
              hover:bg-violet-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-950
              dark:hover:bg-violet-500/10
            "
          >
            <Video
              className="
                h-6
                w-6
                text-violet-600
                transition
                group-hover:scale-110
                dark:text-violet-400
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-slate-900
                dark:text-white
              "
            >
              Record Video
            </span>
          </button>
        </div>

        {/* ===================================================
            MEDIA COUNT
            =================================================== */}

        {selectedFiles.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasVideo
                ? "1 video selected"
                : `${imageCount}/${MAX_IMAGES} photos selected`}
            </p>

            {selectedFiles.length < MAX_IMAGES && !hasVideo && (
              <button
                type="button"
                disabled={mediaDisabled}
                onClick={() => imageInputRef.current?.click()}
                className="
                    text-xs
                    font-semibold
                    text-violet-600
                    hover:text-violet-700
                    dark:text-violet-400
                  "
              >
                Add more
              </button>
            )}
          </div>
        )}

        {/* ===================================================
            MEDIA PREVIEW
            =================================================== */}

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
              "
            >
              {selectedFiles.map((file, index) => {
                const previewUrl = previewUrls[index];
                const type = mediaTypes[index];

                if (!previewUrl || !type) {
                  return null;
                }

                return (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-black
                      dark:border-slate-800
                    "
                  >
                    <div
                      className="  relative
    flex
    aspect-square
    items-center
    justify-center
    overflow-hidden
    bg-slate-100
    dark:bg-slate-950"
                    >
                      {type === "IMAGE" ? (
                        <img
                          src={previewUrl}
                          alt={`Post preview ${index + 1}`}
                          className="
                            block
  h-full
  w-full
  object-contain
                          "
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="
                            h-full
                            w-full
                            object-contain
                          "
                        />
                      )}
                    </div>

                    {/* ORDER */}

                    <div
                      className="
                        absolute
                        left-2
                        top-2
                        flex
                        h-7
                        min-w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-black/70
                        px-2
                        text-xs
                        font-semibold
                        text-white
                        backdrop-blur-sm
                      "
                    >
                      {index + 1}
                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      disabled={mediaDisabled}
                      onClick={() => onRemoveMedia(index)}
                      aria-label={`Remove media ${index + 1}`}
                      className="
                        absolute
                        right-2
                        top-2
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-black/70
                        text-white
                        opacity-100
                        backdrop-blur-sm
                        transition
                        hover:bg-red-600
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* FILE INFORMATION */}

            <div
              className="
                mt-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                dark:border-slate-800
                dark:bg-slate-950
              "
            >
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-info`}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    py-1
                  "
                >
                  <p
                    className="
                      min-w-0
                      truncate
                      text-xs
                      font-medium
                      text-slate-700
                      dark:text-slate-300
                    "
                  >
                    {index + 1}. {file.name}
                  </p>

                  <span
                    className="
                      shrink-0
                      text-xs
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>

            {/* REMOVE ALL */}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={mediaDisabled}
                onClick={() => onRemoveMedia()}
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-red-600
                  transition
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:text-red-400
                  dark:hover:bg-red-500/10
                "
              >
                Remove all
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
            dark:border-red-900/50
            dark:bg-red-500/10
            dark:text-red-400
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          PUBLISH
          ===================================================== */}

      <div className="flex justify-end pb-8">
        <button
          type="button"
          disabled={posting || processingMedia || !description.trim()}
          onClick={handleSubmit}
          className="
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-violet-600
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-violet-700
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
            dark:bg-violet-500
            dark:hover:bg-violet-600
          "
        >
          <Send className="h-4 w-4" />

          {processingMedia
            ? "Preparing media..."
            : posting
              ? "Publishing..."
              : "Publish Post"}
        </button>
      </div>
    </div>
  );
};

export default CreatePostForm;
