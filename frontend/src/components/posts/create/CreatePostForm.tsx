import { Camera, ImagePlus, Send, Video } from "lucide-react";

import { useRef, type ChangeEvent } from "react";

import type { CreatePostData, PostCategory } from "../../../api/postApi";

interface CreatePostFormProps {
  description: string;
  category: PostCategory;
  selectedFile: File | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  previewUrl: string | null;

  processingMedia: boolean;
  posting: boolean;

  error: string | null;

  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: PostCategory) => void;

  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;

  onVideoSelect: (event: ChangeEvent<HTMLInputElement>) => void;

  onTakePhoto: () => void;
  onRecordVideo: () => void;

  onRemoveMedia: () => void;

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

const CreatePostForm = ({
  description,
  category,
  selectedFile,
  mediaType,
  previewUrl,
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

  const handleSubmit = () => {
    onSubmit({
      description: description.trim(),
      category,
      mediaUrl: null,
      mediaType,
    });
  };

  const mediaDisabled = posting || processingMedia;

  return (
    <div className="space-y-6">
      {/* ==========================================
          DESCRIPTION
          ========================================== */}

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

      {/* ==========================================
          CATEGORY
          ========================================== */}

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

      {/* ==========================================
          MEDIA
          ========================================== */}

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
            Add a photo or video from your device, or use your camera.
          </p>
        </div>

        {/* Hidden inputs */}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
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

        {/* Media buttons */}

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
            disabled={mediaDisabled}
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
              Select Photo
            </span>
          </button>

          {/* SELECT VIDEO */}

          <button
            type="button"
            disabled={mediaDisabled}
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
            disabled={mediaDisabled}
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
            disabled={mediaDisabled}
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

        {/* ========================================
            MEDIA PREVIEW
            ======================================== */}

        {selectedFile && previewUrl && mediaType && (
          <div
            className="
                mt-6
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                dark:border-slate-800
                dark:bg-slate-950
              "
          >
            <div
              className="
                  relative
                  aspect-video
                  bg-black
                "
            >
              {mediaType === "IMAGE" ? (
                <img
                  src={previewUrl}
                  alt="Post preview"
                  className="
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

            <div
              className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-slate-200
                  px-4
                  py-3
                  dark:border-slate-800
                "
            >
              <div className="min-w-0">
                <p
                  className="
                      truncate
                      text-sm
                      font-medium
                      text-slate-900
                      dark:text-white
                    "
                >
                  {selectedFile.name}
                </p>

                <p
                  className="
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                >
                  {mediaType === "IMAGE" ? "Photo" : "Video"} •{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                disabled={mediaDisabled}
                onClick={onRemoveMedia}
                className="
                    shrink-0
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
                Remove
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==========================================
          ERROR
          ========================================== */}

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

      {/* ==========================================
          PUBLISH
          ========================================== */}

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
