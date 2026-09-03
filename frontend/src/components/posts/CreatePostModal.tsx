import { useEffect, useRef, useState } from "react";
import { ChevronDown, RotateCcw, Send, X } from "lucide-react";

import {
  usePostApi,
  type CreatePostData,
  type PostCategory,
} from "../../api/postApi";

import { compressImage } from "../../services/compressImage";
import { compressVideo } from "../../services/compressVideo";

import { useCloudinaryApi } from "../../api/cloudinary";

import { categories } from "./create/postCategories";
import MediaPicker from "./create/MediaPicker";
import CameraCapture from "./create/CameraCapture";
import MediaPreview from "./create/MediaPreview";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;

  onCreated: (
    post: Awaited<ReturnType<ReturnType<typeof usePostApi>["createPost"]>>,
  ) => void;
}

type MediaType = "IMAGE" | "VIDEO";

type CameraMode = "PHOTO" | "VIDEO" | null;

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const CreatePostModal = ({
  open,
  onClose,
  onCreated,
}: CreatePostModalProps) => {
  const { createPost } = usePostApi();

  const { uploadPostImageToCloudinary, uploadPostVideoToCloudinary } =
    useCloudinaryApi();

  // =========================================================
  // FILE INPUT REFS
  // =========================================================

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // =========================================================
  // FORM
  // =========================================================

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState<PostCategory>("GENERAL");

  // =========================================================
  // MEDIA
  // =========================================================

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [mediaType, setMediaType] = useState<MediaType | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // =========================================================
  // CAMERA
  // =========================================================

  const [cameraMode, setCameraMode] = useState<CameraMode>(null);

  const [recording, setRecording] = useState(false);

  // =========================================================
  // UI
  // =========================================================

  const [posting, setPosting] = useState(false);

  const [processingMedia, setProcessingMedia] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // CREATE PREVIEW URL
  // =========================================================

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  // =========================================================
  // RESET WHEN MODAL CLOSES
  // =========================================================

  useEffect(() => {
    if (!open) {
      setDescription("");
      setCategory("GENERAL");

      setSelectedFile(null);
      setMediaType(null);
      setPreviewUrl(null);

      setCameraMode(null);
      setRecording(false);

      setPosting(false);
      setProcessingMedia(false);
      setError("");
    }
  }, [open]);

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError("");

    setSelectedFile(file);
    setMediaType("IMAGE");

    event.target.value = "";
  };

  // =========================================================
  // SELECT VIDEO
  // =========================================================

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setError("");

    setSelectedFile(file);
    setMediaType("VIDEO");

    event.target.value = "";
  };

  // =========================================================
  // CAMERA CALLBACKS
  // =========================================================

  const handleCameraStart = (mode: Exclude<CameraMode, null>) => {
    setError("");
    setSelectedFile(null);
    setMediaType(null);
    setPreviewUrl(null);
    setCameraMode(mode);
  };

  const handleCameraClose = () => {
    setCameraMode(null);
    setRecording(false);
  };

  // =========================================================
  // PHOTO CAPTURED
  // =========================================================

  const handlePhotoCaptured = (file: File) => {
    setSelectedFile(file);
    setMediaType("IMAGE");
    setCameraMode(null);
    setRecording(false);
    setError("");
  };

  // =========================================================
  // VIDEO RECORDED
  // =========================================================

  const handleVideoRecorded = (file: File) => {
    if (file.size > MAX_VIDEO_SIZE) {
      setError("Recorded video is too large.");

      setCameraMode(null);
      setRecording(false);

      return;
    }

    setSelectedFile(file);
    setMediaType("VIDEO");
    setCameraMode(null);
    setRecording(false);
    setError("");
  };

  // =========================================================
  // RECORDING STATE
  // =========================================================

  const handleRecordingChange = (value: boolean) => {
    setRecording(value);
  };

  // =========================================================
  // REMOVE MEDIA
  // =========================================================

  const removeMedia = () => {
    setSelectedFile(null);
    setMediaType(null);
    setPreviewUrl(null);
    setError("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!description.trim()) {
      setError("Please write something about your post.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    try {
      setPosting(true);
      setError("");

      let mediaUrl: string | null = null;

      // =====================================================
      // IMAGE
      // =====================================================

      if (selectedFile && mediaType === "IMAGE") {
        setProcessingMedia(true);

        console.log(
          "Original image:",
          (selectedFile.size / 1024 / 1024).toFixed(2),
          "MB",
        );

        const compressedImage = await compressImage(selectedFile);

        console.log(
          "Compressed image:",
          (compressedImage.size / 1024 / 1024).toFixed(2),
          "MB",
        );

        setProcessingMedia(false);

        const result = await uploadPostImageToCloudinary(compressedImage);

        mediaUrl = result.secure_url;
      }

      // =====================================================
      // VIDEO
      // =====================================================

      if (selectedFile && mediaType === "VIDEO") {
        setProcessingMedia(true);

        console.log(
          "Original video:",
          (selectedFile.size / 1024 / 1024).toFixed(2),
          "MB",
        );

        const compressedVideo = await compressVideo(selectedFile);

        console.log(
          "Compressed video:",
          (compressedVideo.size / 1024 / 1024).toFixed(2),
          "MB",
        );

        setProcessingMedia(false);

        const result = await uploadPostVideoToCloudinary(compressedVideo);

        mediaUrl = result.secure_url;
      }

      // =====================================================
      // CREATE POST DATA
      // =====================================================

      const data: CreatePostData = {
        description: description.trim(),

        category,

        mediaUrl,

        mediaType,
      };

      // =====================================================
      // CREATE POST
      // =====================================================

      const createdPost = await createPost(data);

      onCreated(createdPost);

      onClose();
    } catch (err) {
      console.error("Failed to create post:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create post. Please try again.",
      );
    } finally {
      setPosting(false);
      setProcessingMedia(false);
    }
  };

  // =========================================================
  // CLOSED
  // =========================================================

  if (!open) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        px-3 py-4
        backdrop-blur-sm
      "
      onClick={() => {
        if (!posting) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[95vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex shrink-0
            items-center justify-between
            border-b
            border-slate-200
            px-5 py-4
            dark:border-slate-800
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Create Post
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-400
              "
            >
              Share something with your campus
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={posting}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              dark:hover:bg-slate-800
              dark:hover:text-white
              disabled:opacity-50
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            flex-1
            overflow-y-auto
            p-5
          "
        >
          <div
            className="
              grid
              gap-6
              lg:grid-cols-[1fr_1.15fr]
            "
          >
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div
              className="
                flex
                flex-col
                gap-5
              "
            >
              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  What's happening?
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={1000}
                  rows={7}
                  placeholder="
                    Share an event, news,
                    announcement or something
                    interesting...
                  "
                  disabled={posting}
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4 py-3
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-violet-500
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                  "
                />

                <div
                  className="
                    mt-1
                    text-right
                    text-xs
                    text-slate-400
                  "
                >
                  {description.length}/1000
                </div>
              </div>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as PostCategory)
                    }
                    disabled={posting}
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4 py-3 pr-10
                      text-sm
                      outline-none
                      focus:border-violet-500
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                    "
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  MEDIA PICKER
              ================================================= */}

              <MediaPicker
                imageInputRef={imageInputRef}
                videoInputRef={videoInputRef}
                disabled={posting}
                onImageSelect={handleImageSelect}
                onVideoSelect={handleVideoSelect}
                onTakePhoto={() => handleCameraStart("PHOTO")}
                onRecordVideo={() => handleCameraStart("VIDEO")}
              />

              {/* =================================================
                  INFO
              ================================================= */}

              <div
                className="
                  rounded-xl
                  bg-violet-50
                  px-4 py-3
                  text-xs
                  text-violet-700
                  dark:bg-violet-500/10
                  dark:text-violet-300
                "
              >
                Videos are compressed before uploading to Cloudinary. Maximum
                original video size is 100 MB.
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="w-full">
              {/* =================================================
                  CAMERA

                  ONLY SHOWN WHEN CAMERA IS ACTIVE
              ================================================= */}

              {cameraMode && (
                <CameraCapture
                  mode={cameraMode}
                  onClose={handleCameraClose}
                  onPhotoCaptured={handlePhotoCaptured}
                  onVideoRecorded={handleVideoRecorded}
                  onRecordingChange={handleRecordingChange}
                />
              )}

              {/* =================================================
                  PREVIEW

                  ONLY SHOWN WHEN MEDIA EXISTS
              ================================================= */}

              {!cameraMode && selectedFile && previewUrl && mediaType && (
                <MediaPreview
                  previewUrl={previewUrl}
                  mediaType={mediaType}
                  selectedFile={selectedFile}
                  disabled={posting}
                  onRemove={removeMedia}
                />
              )}
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mt-5
                rounded-xl
                bg-red-50
                px-4 py-3
                text-sm
                text-red-600
                dark:bg-red-500/10
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              PROCESSING
          ================================================= */}

          {processingMedia && (
            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-xl
                bg-violet-50
                px-4 py-3
                text-sm
                font-medium
                text-violet-700
                dark:bg-violet-500/10
                dark:text-violet-300
              "
            >
              <RotateCcw size={17} className="animate-spin" />

              {mediaType === "VIDEO"
                ? "Compressing video..."
                : "Compressing image..."}
            </div>
          )}

          {/* =================================================
              PUBLISH
          ================================================= */}

          <button
            type="submit"
            disabled={posting || recording || processingMedia}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-violet-600
              px-4 py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-violet-700
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Send size={17} />

            {processingMedia
              ? "Processing media..."
              : posting
                ? "Uploading & publishing..."
                : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
