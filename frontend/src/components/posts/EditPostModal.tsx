import { X, Save, ImagePlus, Video, Trash2, RotateCcw } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { usePostApi, type Post, type CreatePostData } from "../../api/postApi";

import { compressImage } from "../../services/compressImage";

import { compressVideo } from "../../services/compressVideo";

import { useCloudinaryApi } from "../../api/cloudinary";

interface EditPostModalProps {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onUpdated: (post: Post) => void;
}

type MediaType = "IMAGE" | "VIDEO";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const EditPostModal = ({
  open,
  post,
  onClose,
  onUpdated,
}: EditPostModalProps) => {
  const { updatePost } = usePostApi();

  const { uploadPostMediaToCloudinaryWithProgress } = useCloudinaryApi();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * ==========================================
   * FORM
   * ==========================================
   */

  const [description, setDescription] = useState("");

  const [category, setCategory] =
    useState<CreatePostData["category"]>("GENERAL");

  /*
   * ==========================================
   * MEDIA
   * ==========================================
   */

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [mediaType, setMediaType] = useState<MediaType | null>(null);

  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const [removeMedia, setRemoveMedia] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  /*
   * ==========================================
   * UI STATE
   * ==========================================
   */

  const [saving, setSaving] = useState(false);

  const [processingMedia, setProcessingMedia] = useState(false);

  const [error, setError] = useState("");

  /*
   * ==========================================
   * LOAD POST
   * ==========================================
   */

  useEffect(() => {
    if (!post) {
      return;
    }

    setDescription(post.description ?? "");

    setCategory(post.category);

    setSelectedFile(null);

    setRemoveMedia(false);

    setMediaPreview(post.mediaUrl ?? null);

    setMediaType(post.mediaType ?? null);

    setUploadProgress(0);

    setError("");
  }, [post]);

  /*
   * ==========================================
   * CREATE LOCAL PREVIEW
   * ==========================================
   */

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setMediaPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  /*
   * ==========================================
   * SELECT MEDIA
   * ==========================================
   */

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    /*
     * IMAGE
     */

    if (file.type.startsWith("image/")) {
      setError("");
      setSelectedFile(file);
      setMediaType("IMAGE");
      setRemoveMedia(false);
      setUploadProgress(0);
      return;
    }

    /*
     * VIDEO
     */

    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_SIZE) {
        setError("Video must be smaller than 100 MB.");
        return;
      }

      setError("");
      setSelectedFile(file);
      setMediaType("VIDEO");
      setRemoveMedia(false);
      setUploadProgress(0);

      return;
    }

    setError("Please select an image or video.");
  };

  /*
   * ==========================================
   * REMOVE MEDIA
   * ==========================================
   */

  const handleRemoveMedia = () => {
    if (saving) {
      return;
    }

    setSelectedFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setRemoveMedia(true);
    setUploadProgress(0);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
   * ==========================================
   * CHANGE MEDIA
   * ==========================================
   */

  const handleChangeMedia = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!post) {
      return;
    }

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

      let mediaUrl: string | null | undefined = undefined;

      let finalMediaType: MediaType | null | undefined = undefined;

      /*
       * ========================================
       * NEW MEDIA
       * ========================================
       */

      if (selectedFile && mediaType) {
        setProcessingMedia(true);

        let processedFile = selectedFile;

        /*
         * IMAGE
         */

        if (mediaType === "IMAGE") {
          processedFile = await compressImage(selectedFile);
        }

        /*
         * VIDEO
         */

        if (mediaType === "VIDEO") {
          processedFile = await compressVideo(selectedFile);
        }

        setProcessingMedia(false);

        /*
         * ======================================
         * CLOUDINARY
         * ======================================
         */

        const uploaded = await uploadPostMediaToCloudinaryWithProgress(
          processedFile,
          mediaType,
          (progress) => {
            setUploadProgress(progress);
          },
        );

        mediaUrl = uploaded.secure_url;

        finalMediaType = mediaType;
      }

      /*
       * ========================================
       * UPDATE DATA
       * ========================================
       */

      const data: CreatePostData = {
        description: description.trim(),
        category,
        mediaUrl,
        mediaType: finalMediaType,
      };

      /*
       * ========================================
       * SAVE
       * ========================================
       */

      const updatedPost = await updatePost(post.id, data, removeMedia);

      /*
       * ========================================
       * SUCCESS
       * ========================================
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

  /*
   * ==========================================
   * CLOSED
   * ==========================================
   */

  if (!open || !post) {
    return null;
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

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
        p-4
        backdrop-blur-sm
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
          max-h-[90vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          transition-colors
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
            z-10
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
              Post Media
            </label>

            {/* FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />

            {/* =================================
                PREVIEW
                ================================= */}

            {mediaPreview && mediaType && (
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
                {mediaType === "IMAGE" ? (
                  <img
                    src={mediaPreview}
                    alt="Post preview"
                    className="
                        max-h-80
                        w-full
                        object-contain
                      "
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    playsInline
                    preload="metadata"
                    className="
                        max-h-80
                        w-full
                        object-contain
                        bg-black
                      "
                  />
                )}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  disabled={saving}
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
                      bg-black/60
                      text-white
                      transition
                      hover:bg-red-600
                      disabled:opacity-50
                    "
                  aria-label="Remove media"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}

            {/* =================================
                EMPTY MEDIA
                ================================= */}

            {!mediaPreview && (
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
                  Images or videos up to 100MB
                </span>
              </button>
            )}

            {/* =================================
                CHANGE MEDIA
                ================================= */}

            {mediaPreview && (
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
                {mediaType === "IMAGE" ? (
                  <ImagePlus size={14} />
                ) : (
                  <Video size={14} />
                )}
                Change media
              </button>
            )}

            {/* =================================
                REMOVE MESSAGE
                ================================= */}

            {removeMedia && (
              <p
                className="
                  mt-2
                  text-[10px]
                  font-medium
                  text-red-500
                  dark:text-red-400
                "
              >
                Media will be removed when you save the post.
              </p>
            )}
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

                {mediaType === "VIDEO"
                  ? "Compressing video..."
                  : "Compressing image..."}
              </div>
            </div>
          )}

          {/* ===================================
              UPLOAD
              =================================== */}

          {saving && !processingMedia && selectedFile && (
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
