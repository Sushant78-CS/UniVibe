import {
  X,
  Save,
  ImagePlus,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  usePostApi,
  type Post,
  type CreatePostData,
  type PostMedia,
  type MediaType,
} from "../../api/postApi";

import { compressImage } from "../../services/compressImage";
import { compressVideo } from "../../services/compressVideo";
import { useCloudinaryApi } from "../../api/cloudinary";

/* ============================================
   PROPS
============================================ */

interface EditPostModalProps {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onUpdated: (post: Post) => void;
}

/* ============================================
   CONSTANTS
============================================ */

const MAX_IMAGES = 10;

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

/* ============================================
   COMPONENT
============================================ */

const EditPostModal = ({
  open,
  post,
  onClose,
  onUpdated,
}: EditPostModalProps) => {
  const { updatePost } = usePostApi();

  const { uploadPostMediaToCloudinaryWithProgress } = useCloudinaryApi();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ==========================================
     FORM
  ========================================== */

  const [description, setDescription] = useState("");

  const [category, setCategory] =
    useState<CreatePostData["category"]>("GENERAL");

  /* ==========================================
     EXISTING MEDIA
  ========================================== */

  const [existingMedia, setExistingMedia] = useState<PostMedia[]>([]);

  /*
   * Media selected by the user to replace
   * the existing media.
   */
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [selectedMediaTypes, setSelectedMediaTypes] = useState<MediaType[]>([]);

  /*
   * Local preview URLs for newly selected files.
   */
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);

  /*
   * Existing media is removed only when
   * the user explicitly chooses remove.
   */
  const [removeMedia, setRemoveMedia] = useState(false);

  /* ==========================================
     CAROUSEL
  ========================================== */

  const [existingIndex, setExistingIndex] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  /* ==========================================
     UI STATE
  ========================================== */

  const [uploadProgress, setUploadProgress] = useState(0);

  const [saving, setSaving] = useState(false);

  const [processingMedia, setProcessingMedia] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================
     LOAD POST
  ========================================== */

  useEffect(() => {
    if (!post) {
      return;
    }

    setDescription(post.description ?? "");

    setCategory(post.category);

    /*
     * Load new media structure.
     *
     * This works for:
     *
     * old migrated posts
     * new single image posts
     * multiple image posts
     * videos
     */
    const media = [...(post.media ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    setExistingMedia(media);

    setSelectedFiles([]);
    setSelectedMediaTypes([]);
    setSelectedPreviews([]);

    setExistingIndex(0);
    setSelectedIndex(0);

    setRemoveMedia(false);

    setUploadProgress(0);

    setError("");
  }, [post]);

  /* ==========================================
     CLEANUP LOCAL PREVIEWS
  ========================================== */

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [selectedPreviews]);

  /* ==========================================
     SELECT MEDIA
  ========================================== */

  const handleMediaSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    /*
     * Allow selecting the same file again.
     */
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    /*
     * ========================================
     * CHECK VIDEO
     * ========================================
     */

    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    /*
     * Only image OR video.
     */
    if (videoFiles.length > 0 && imageFiles.length > 0) {
      setError("Please select images or one video, not both.");
      return;
    }

    /*
     * ========================================
     * VIDEO
     * ========================================
     */

    if (videoFiles.length > 0) {
      if (videoFiles.length > 1) {
        setError("You can select only one video.");
        return;
      }

      const video = videoFiles[0];

      if (video.size > MAX_VIDEO_SIZE) {
        setError("Video must be smaller than 100 MB.");
        return;
      }

      /*
       * Revoke old previews.
       */
      selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

      setSelectedFiles([video]);

      setSelectedMediaTypes(["VIDEO"]);

      setSelectedPreviews([URL.createObjectURL(video)]);

      setSelectedIndex(0);

      setRemoveMedia(false);

      setUploadProgress(0);

      setError("");

      return;
    }

    /*
     * ========================================
     * IMAGES
     * ========================================
     */

    if (imageFiles.length > MAX_IMAGES) {
      setError(`You can select a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    if (imageFiles.length === 0) {
      setError("Please select an image or video.");
      return;
    }

    /*
     * Revoke old previews.
     */
    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedFiles(imageFiles);

    setSelectedMediaTypes(imageFiles.map(() => "IMAGE"));

    setSelectedPreviews(imageFiles.map((file) => URL.createObjectURL(file)));

    setSelectedIndex(0);

    setRemoveMedia(false);

    setUploadProgress(0);

    setError("");
  };

  /* ==========================================
     REMOVE SELECTED FILE
  ========================================== */

  const handleRemoveSelectedFile = (index: number) => {
    if (saving) {
      return;
    }

    const preview = selectedPreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const nextFiles = selectedFiles.filter((_, i) => i !== index);

    const nextTypes = selectedMediaTypes.filter((_, i) => i !== index);

    const nextPreviews = selectedPreviews.filter((_, i) => i !== index);

    setSelectedFiles(nextFiles);

    setSelectedMediaTypes(nextTypes);

    setSelectedPreviews(nextPreviews);

    if (selectedIndex >= nextFiles.length) {
      setSelectedIndex(Math.max(0, nextFiles.length - 1));
    }

    setUploadProgress(0);

    setError("");
  };

  /* ==========================================
     REMOVE ALL SELECTED MEDIA
  ========================================== */

  const handleClearSelectedMedia = () => {
    if (saving) {
      return;
    }

    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedFiles([]);
    setSelectedMediaTypes([]);
    setSelectedPreviews([]);

    setSelectedIndex(0);

    setUploadProgress(0);

    setError("");
  };

  /* ==========================================
     REMOVE EXISTING MEDIA
  ========================================== */

  const handleRemoveExistingMedia = () => {
    if (saving) {
      return;
    }

    handleClearSelectedMedia();

    setRemoveMedia(true);

    setExistingIndex(0);

    setError("");
  };

  /* ==========================================
     CHANGE MEDIA
  ========================================== */

  const handleChangeMedia = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  /* ==========================================
     EXISTING MEDIA NAVIGATION
  ========================================== */

  const showPreviousExisting = () => {
    if (existingMedia.length <= 1) {
      return;
    }

    setExistingIndex((current) =>
      current === 0 ? existingMedia.length - 1 : current - 1,
    );
  };

  const showNextExisting = () => {
    if (existingMedia.length <= 1) {
      return;
    }

    setExistingIndex((current) =>
      current === existingMedia.length - 1 ? 0 : current + 1,
    );
  };

  /* ==========================================
     SELECTED MEDIA NAVIGATION
  ========================================== */

  const showPreviousSelected = () => {
    if (selectedFiles.length <= 1) {
      return;
    }

    setSelectedIndex((current) =>
      current === 0 ? selectedFiles.length - 1 : current - 1,
    );
  };

  const showNextSelected = () => {
    if (selectedFiles.length <= 1) {
      return;
    }

    setSelectedIndex((current) =>
      current === selectedFiles.length - 1 ? 0 : current + 1,
    );
  };

  /* ==========================================
     SUBMIT
  ========================================== */

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!post) {
      return;
    }

    /* ========================================
       VALIDATION
    ======================================== */

    if (!description.trim()) {
      setError("Post description cannot be empty.");
      return;
    }

    if (description.trim().length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setUploadProgress(0);

      let finalMedia: PostMedia[] = [];

      /*
       * ======================================
       * CASE 1:
       * REMOVE MEDIA
       * ======================================
       */

      if (removeMedia && selectedFiles.length === 0) {
        finalMedia = [];
      } else if (selectedFiles.length > 0) {
        /*
         * ======================================
         * CASE 2:
         * NEW MEDIA SELECTED
         *
         * Replace existing media completely.
         * ======================================
         */
        setProcessingMedia(true);

        const totalFiles = selectedFiles.length;

        const uploadedMedia: PostMedia[] = [];

        for (let index = 0; index < totalFiles; index++) {
          const file = selectedFiles[index];

          const mediaType = selectedMediaTypes[index];

          if (!file || !mediaType) {
            continue;
          }

          /*
           * ==================================
           * COMPRESS
           * ==================================
           */

          let processedFile = file;

          if (mediaType === "IMAGE") {
            processedFile = await compressImage(file);
          }

          if (mediaType === "VIDEO") {
            processedFile = await compressVideo(file);
          }

          /*
           * ==================================
           * UPLOAD
           * ==================================
           */

          const fileWeight = 100 / totalFiles;

          const baseProgress = index * fileWeight;

          const uploaded = await uploadPostMediaToCloudinaryWithProgress(
            processedFile,
            mediaType,
            (progress) => {
              const overallProgress =
                baseProgress + (progress / 100) * fileWeight;

              setUploadProgress(Math.round(overallProgress));
            },
          );

          uploadedMedia.push({
            mediaUrl: uploaded.secure_url,
            mediaType,
            displayOrder: index,
          });
        }

        setProcessingMedia(false);

        finalMedia = uploadedMedia;
      } else {
        /*
         * ======================================
         * CASE 3:
         * MEDIA UNCHANGED
         *
         * Preserve current media.
         * ======================================
         */
        finalMedia = existingMedia.map((item, index) => ({
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          displayOrder: index,
        }));
      }

      /*
       * ======================================
       * CREATE UPDATE DATA
       * ======================================
       */

      const data: CreatePostData = {
        description: description.trim(),

        category,

        media: finalMedia.map((item) => ({
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          displayOrder: item.displayOrder,
        })),
      };

      /*
       * ======================================
       * UPDATE BACKEND
       *
       * ONE REQUEST ONLY
       * ======================================
       */

      const updatedPost = await updatePost(
        post.id,
        data,
        removeMedia && selectedFiles.length === 0,
      );

      /*
       * ======================================
       * SUCCESS
       * ======================================
       */

      onUpdated(updatedPost);

      onClose();
    } catch (err) {
      console.error("Failed to update post:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update post. Please try again.",
      );
    } finally {
      setSaving(false);
      setProcessingMedia(false);
    }
  };

  /* ==========================================
     CLOSED
  ========================================== */

  if (!open || !post) {
    return null;
  }

  /* ==========================================
     CURRENT EXISTING MEDIA
  ========================================== */

  const currentExistingMedia = existingMedia[existingIndex];

  const currentSelectedPreview = selectedPreviews[selectedIndex];

  const selectedIsVideo = selectedMediaTypes[selectedIndex] === "VIDEO";

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-sm
        sm:p-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          if (!saving) {
            onClose();
          }
        }
      }}
    >
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            bg-white
            px-4
            py-3
            dark:border-slate-800
            dark:bg-slate-900
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
              Edit Post
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
                dark:text-slate-400
              "
            >
              Update your post
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              dark:hover:bg-slate-800
              dark:hover:text-slate-200
              disabled:opacity-50
            "
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* =====================================
            FORM
        ===================================== */}

        <form onSubmit={handleSubmit} className="space-y-5 p-4">
          {/* ===================================
              DESCRIPTION
          =================================== */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={1000}
              disabled={saving}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-xs
                leading-5
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-500
                focus:ring-2
                focus:ring-violet-500/20
                dark:border-slate-700
                dark:bg-slate-950
                dark:text-white
                dark:placeholder:text-slate-500
                disabled:opacity-60
              "
              placeholder="What's happening around campus?"
            />

            <div className="mt-1 flex justify-end">
              <span
                className="
                  text-[10px]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {description.length}/1000
              </span>
            </div>
          </div>

          {/* ===================================
              CATEGORY
          =================================== */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as CreatePostData["category"])
              }
              disabled={saving}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-xs
                text-slate-900
                outline-none
                transition
                focus:border-violet-500
                focus:ring-2
                focus:ring-violet-500/20
                dark:border-slate-700
                dark:bg-slate-950
                dark:text-white
              "
            >
              <option value="GENERAL">General</option>

              <option value="EVENT">Event</option>

              <option value="NEWS">News</option>

              <option value="ANNOUNCEMENT">Announcement</option>

              <option value="ACHIEVEMENT">Achievement</option>
            </select>
          </div>

          {/* ===================================
              MEDIA
          =================================== */}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Post Media
              </label>

              <span
                className="
                  text-[10px]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Up to {MAX_IMAGES} images
              </span>
            </div>

            {/* FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaSelect}
              className="hidden"
            />

            {/* =================================
                NEW SELECTED MEDIA
            ================================= */}

            {selectedFiles.length > 0 && !removeMedia && (
              <div>
                <div
                  className="
                      relative
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-black
                      dark:border-slate-700
                    "
                >
                  {/* IMAGE */}

                  {!selectedIsVideo && currentSelectedPreview ? (
                    <div className="relative">
                      <img
                        src={currentSelectedPreview}
                        alt={`Selected image ${selectedIndex + 1}`}
                        className="
                            h-[280px]
                            w-full
                            object-contain
                            bg-black
                            sm:h-[320px]
                          "
                      />
                    </div>
                  ) : currentSelectedPreview ? (
                    <video
                      src={currentSelectedPreview}
                      controls
                      playsInline
                      preload="metadata"
                      className="
                          h-[280px]
                          w-full
                          object-contain
                          bg-black
                          sm:h-[320px]
                        "
                    />
                  ) : null}

                  {/* REMOVE CURRENT */}

                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(selectedIndex)}
                    disabled={saving}
                    className="
                        absolute
                        right-2
                        top-2
                        z-10
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-black/65
                        text-white
                        backdrop-blur-sm
                        transition
                        hover:bg-red-600
                        disabled:opacity-50
                      "
                    aria-label="Remove selected media"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* PREVIOUS */}

                  {selectedFiles.length > 1 && (
                    <button
                      type="button"
                      onClick={showPreviousSelected}
                      className="
                          absolute
                          left-2
                          top-1/2
                          flex
                          h-8
                          w-8
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white/90
                          text-black
                          shadow
                          sm:hidden
                        "
                      aria-label="Previous selected media"
                    >
                      <ChevronLeft size={17} />
                    </button>
                  )}

                  {/* NEXT */}

                  {selectedFiles.length > 1 && (
                    <button
                      type="button"
                      onClick={showNextSelected}
                      className="
                          absolute
                          right-2
                          top-1/2
                          flex
                          h-8
                          w-8
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white/90
                          text-black
                          shadow
                          sm:hidden
                        "
                      aria-label="Next selected media"
                    >
                      <ChevronRight size={17} />
                    </button>
                  )}

                  {/* COUNTER */}

                  {selectedFiles.length > 1 && (
                    <div
                      className="
                          absolute
                          right-12
                          top-3
                          rounded-full
                          bg-black/65
                          px-2.5
                          py-1
                          text-[10px]
                          font-medium
                          text-white
                        "
                    >
                      {selectedIndex + 1}/{selectedFiles.length}
                    </div>
                  )}
                </div>

                {/* SELECTED DOTS */}

                {selectedFiles.length > 1 && (
                  <div className="mt-2 flex justify-center gap-1.5">
                    {selectedFiles.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={`
                              h-1.5
                              rounded-full
                              transition-all
                              ${
                                selectedIndex === index
                                  ? "w-4 bg-violet-500"
                                  : "w-1.5 bg-slate-300 dark:bg-slate-700"
                              }
                            `}
                        aria-label={`Show selected media ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="
                        text-[10px]
                        text-slate-400
                        dark:text-slate-500
                      "
                  >
                    {selectedFiles.length}{" "}
                    {selectedFiles.length === 1 ? "item" : "items"} selected
                  </span>

                  <button
                    type="button"
                    onClick={handleClearSelectedMedia}
                    disabled={saving}
                    className="
                        text-[10px]
                        font-medium
                        text-red-500
                        hover:text-red-600
                        disabled:opacity-50
                      "
                  >
                    Remove all
                  </button>
                </div>
              </div>
            )}

            {/* =================================
                EXISTING MEDIA
            ================================= */}

            {selectedFiles.length === 0 &&
              !removeMedia &&
              existingMedia.length > 0 &&
              currentExistingMedia && (
                <div>
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-black
                      dark:border-slate-700
                    "
                  >
                    {currentExistingMedia.mediaType === "IMAGE" ? (
                      <img
                        src={currentExistingMedia.mediaUrl}
                        alt={`Existing post image ${existingIndex + 1}`}
                        className="
                          h-[280px]
                          w-full
                          object-contain
                          bg-black
                          sm:h-[320px]
                        "
                      />
                    ) : (
                      <video
                        src={currentExistingMedia.mediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="
                          h-[280px]
                          w-full
                          object-contain
                          bg-black
                          sm:h-[320px]
                        "
                      />
                    )}

                    {/* PREVIOUS */}

                    {existingMedia.length > 1 && (
                      <button
                        type="button"
                        onClick={showPreviousExisting}
                        className="
                          absolute
                          left-2
                          top-1/2
                          flex
                          h-8
                          w-8
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white/90
                          text-black
                          shadow
                          sm:hidden
                        "
                        aria-label="Previous existing media"
                      >
                        <ChevronLeft size={17} />
                      </button>
                    )}

                    {/* NEXT */}

                    {existingMedia.length > 1 && (
                      <button
                        type="button"
                        onClick={showNextExisting}
                        className="
                          absolute
                          right-2
                          top-1/2
                          flex
                          h-8
                          w-8
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-full
                          bg-white/90
                          text-black
                          shadow
                          sm:hidden
                        "
                        aria-label="Next existing media"
                      >
                        <ChevronRight size={17} />
                      </button>
                    )}

                    {/* COUNTER */}

                    {existingMedia.length > 1 && (
                      <div
                        className="
                          absolute
                          right-3
                          top-3
                          rounded-full
                          bg-black/65
                          px-2.5
                          py-1
                          text-[10px]
                          font-medium
                          text-white
                        "
                      >
                        {existingIndex + 1}/{existingMedia.length}
                      </div>
                    )}
                  </div>

                  {/* EXISTING DOTS */}

                  {existingMedia.length > 1 && (
                    <div className="mt-2 flex justify-center gap-1.5">
                      {existingMedia.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setExistingIndex(index)}
                          className={`
                              h-1.5
                              rounded-full
                              transition-all
                              ${
                                existingIndex === index
                                  ? "w-4 bg-violet-500"
                                  : "w-1.5 bg-slate-300 dark:bg-slate-700"
                              }
                            `}
                          aria-label={`Show existing media ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="
                        text-[10px]
                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      Existing media
                      {existingMedia.length > 1
                        ? ` • ${existingMedia.length} items`
                        : ""}
                    </span>

                    <button
                      type="button"
                      onClick={handleRemoveExistingMedia}
                      disabled={saving}
                      className="
                        flex
                        items-center
                        gap-1
                        text-[10px]
                        font-medium
                        text-red-500
                        hover:text-red-600
                        disabled:opacity-50
                      "
                    >
                      <Trash2 size={12} />
                      Remove media
                    </button>
                  </div>
                </div>
              )}

            {/* =================================
                MEDIA REMOVED
            ================================= */}

            {removeMedia && selectedFiles.length === 0 && (
              <div
                className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-6
                    text-center
                    dark:border-red-900/50
                    dark:bg-red-500/10
                  "
              >
                <Trash2
                  size={22}
                  className="
                      mx-auto
                      text-red-500
                    "
                />

                <p
                  className="
                      mt-2
                      text-xs
                      font-semibold
                      text-red-600
                      dark:text-red-400
                    "
                >
                  Media will be removed
                </p>

                <p
                  className="
                      mt-1
                      text-[10px]
                      text-red-500/80
                      dark:text-red-400/80
                    "
                >
                  Save the post to confirm.
                </p>
              </div>
            )}

            {/* =================================
                EMPTY MEDIA
            ================================= */}

            {existingMedia.length === 0 &&
              selectedFiles.length === 0 &&
              !removeMedia && (
                <button
                  type="button"
                  onClick={handleChangeMedia}
                  disabled={saving}
                  className="
                    flex
                    w-full
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    py-8
                    text-slate-500
                    transition
                    hover:border-violet-400
                    hover:bg-violet-50
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-slate-400
                    dark:hover:bg-violet-500/5
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <ImagePlus size={24} />

                  <span
                    className="
                      mt-2
                      text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Add photo or video
                  </span>

                  <span
                    className="
                      mt-1
                      text-[10px]
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    Up to {MAX_IMAGES} images or one video
                  </span>
                </button>
              )}

            {/* =================================
                CHANGE MEDIA
            ================================= */}

            {(selectedFiles.length > 0 ||
              existingMedia.length > 0 ||
              removeMedia) && (
              <button
                type="button"
                onClick={handleChangeMedia}
                disabled={saving}
                className="
                  mt-2
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-violet-600
                  transition
                  hover:text-violet-700
                  dark:text-violet-400
                  dark:hover:text-violet-300
                  disabled:opacity-50
                "
              >
                <ImagePlus size={14} />
                Replace media
              </button>
            )}

            {/* =================================
                INFO
            ================================= */}

            <p
              className="
                mt-2
                text-[10px]
                leading-4
                text-slate-400
                dark:text-slate-500
              "
            >
              Selecting new media replaces all existing media. You can add up to{" "}
              {MAX_IMAGES} images or one video up to 100 MB.
            </p>
          </div>

          {/* ===================================
              PROCESSING
          =================================== */}

          {processingMedia && (
            <div
              className="
                rounded-xl
                bg-violet-50
                px-3
                py-2.5
                dark:bg-violet-500/10
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-violet-700
                  dark:text-violet-300
                "
              >
                <RotateCcw size={15} className="animate-spin" />
                Compressing media...
              </div>
            </div>
          )}

          {/* ===================================
              UPLOAD
          =================================== */}

          {saving && !processingMedia && selectedFiles.length > 0 && (
            <div
              className="
                  rounded-xl
                  bg-slate-100
                  p-3
                  dark:bg-slate-800
                "
            >
              <div
                className="
                    mb-1.5
                    flex
                    items-center
                    justify-between
                    text-[10px]
                    font-medium
                    text-slate-600
                    dark:text-slate-300
                  "
              >
                <span>Uploading media...</span>

                <span>{Math.round(uploadProgress)}%</span>
              </div>

              <div
                className="
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-slate-200
                    dark:bg-slate-700
                  "
              >
                <div
                  className="
                      h-full
                      rounded-full
                      bg-violet-600
                      transition-[width]
                      duration-150
                      dark:bg-violet-500
                    "
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ===================================
              ERROR
          =================================== */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-3
                py-2
                text-xs
                text-red-600
                dark:border-red-900/50
                dark:bg-red-500/10
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* ===================================
              ACTIONS
          =================================== */}

          <div
            className="
              flex
              gap-2
              pt-1
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                flex-1
                rounded-xl
                border
                border-slate-200
                px-4
                py-2.5
                text-xs
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-100
                disabled:opacity-50
                dark:border-slate-700
                dark:text-slate-300
                dark:hover:bg-slate-800
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || processingMedia}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-violet-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-violet-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:bg-violet-500
                dark:hover:bg-violet-600
              "
            >
              <Save size={14} />

              {processingMedia
                ? "Processing..."
                : saving
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
