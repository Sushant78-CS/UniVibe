import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import CreatePostForm from "../../components/posts/create/CreatePostForm";

import { compressImage } from "../../services/compressImage";
import { compressVideo } from "../../services/compressVideo";

import { useCreatePostDraftStore } from "../../store/createPostDraftStore";
import { usePostApi } from "../../api/postApi";
import { useCloudinaryApi } from "../../api/cloudinary";
import { usePublishingStore } from "../../store/publishingStore";

export default function CreatePostPage() {
  const navigate = useNavigate();

  const {
    description,
    category,
    selectedFile,
    mediaType,
    setDescription,
    setCategory,
    setMedia,
    clearMedia,
    resetDraft,
  } = useCreatePostDraftStore();

  const {
    startCompressing,
    startUploading,
    setUploadProgress,
    startCreating,
    success,
    fail,
  } = usePublishingStore();

  const { createPost } = usePostApi();

  const { uploadPostMediaToCloudinaryWithProgress } = useCloudinaryApi();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  /*
   * ==========================================
   * PREVIEW URL
   * ==========================================
   */

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    console.log(setProcessingMedia);

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  /*
   * ==========================================
   * IMAGE PICKER
   * ==========================================
   */

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setError("");

    setMedia(file, "IMAGE");
  };

  /*
   * ==========================================
   * VIDEO PICKER
   * ==========================================
   */

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setError("");

    setMedia(file, "VIDEO");
  };

  /*
   * ==========================================
   * TAKE PHOTO
   * ==========================================
   */

  const handleTakePhoto = () => {
    setError("");

    navigate("/posts/create/camera?mode=photo");
  };

  /*
   * ==========================================
   * RECORD VIDEO
   * ==========================================
   */

  const handleRecordVideo = () => {
    setError("");

    navigate("/posts/create/camera?mode=video");
  };

  /*
   * ==========================================
   * REMOVE MEDIA
   * ==========================================
   */

  const handleRemoveMedia = () => {
    clearMedia();
    setError("");
  };

  /*
   * ==========================================
   * PUBLISH POST
   * ==========================================
   */

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Please write something about your post.");
      return;
    }

    if (description.trim().length > 5000) {
      setError("Description cannot exceed 5000 characters.");
      return;
    }

    if (posting) {
      return;
    }

    setError("");
    setPosting(true);

    /*
     * Save everything BEFORE navigating away.
     */

    const postDescription = description.trim();
    const postCategory = category;
    const postFile = selectedFile;
    const postMediaType = mediaType;

    /*
     * Navigate immediately.
     *
     * Publishing continues in the background.
     */

    navigate("/home", {
      replace: true,
    });

    /*
     * ==========================================
     * BACKGROUND PUBLISHING
     * ==========================================
     */

    try {
      let uploadFile = postFile;

      /*
       * ========================================
       * STEP 1 — COMPRESS MEDIA
       * ========================================
       */

      if (uploadFile && postMediaType) {
        startCompressing();

        if (postMediaType === "IMAGE") {
          uploadFile = await compressImage(uploadFile);
        }

        if (postMediaType === "VIDEO") {
          uploadFile = await compressVideo(uploadFile);
        }
      }

      /*
       * ========================================
       * STEP 2 — CLOUDINARY UPLOAD
       * ========================================
       */

      let mediaUrl: string | null = null;
      let finalMediaType: "IMAGE" | "VIDEO" | null = null;

      if (uploadFile && postMediaType) {
        startUploading();

        const uploaded = await uploadPostMediaToCloudinaryWithProgress(
          uploadFile,
          postMediaType,
          (progress) => {
            setUploadProgress(progress);
          },
        );

        mediaUrl = uploaded.secure_url;
        finalMediaType = postMediaType;
      }

      /*
       * ========================================
       * STEP 3 — CREATE DATABASE POST
       * ========================================
       */

      startCreating();

      await createPost({
        description: postDescription,
        category: postCategory,
        mediaUrl,
        mediaType: finalMediaType,
      });

      /*
       * ========================================
       * STEP 4 — SUCCESS
       * ========================================
       */

      success();

      /*
       * Clear draft only after successful publishing.
       */

      resetDraft();
    } catch (err) {
      console.error("Background publishing failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to publish post. Please try again.";

      fail(message);
    } finally {
      setPosting(false);
    }
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        transition-colors
        dark:bg-slate-950
        dark:text-white
      "
    >
      {/* ======================================
          HEADER
          ====================================== */}

      <header
        className="
          sticky
          top-0
          z-30
          border-b
          border-slate-200/80
          bg-slate-50/95
          backdrop-blur-xl
          transition-colors
          dark:border-slate-800/80
          dark:bg-slate-950/95
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-4xl
            items-center
            gap-3
            px-4
            sm:px-6
          "
        >
          {/* Back button */}

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="
              flex
              h-10
              w-10
              shrink-0
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-slate-700
              transition
              hover:bg-slate-200
              active:scale-95
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* Title */}

          <div>
            <h1
              className="
                text-lg
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Create Post
            </h1>

            <p
              className="
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              Share something with your campus
            </p>
          </div>
        </div>
      </header>

      {/* ======================================
          MAIN
          ====================================== */}

      <main
        className="
          mx-auto
          w-full
          max-w-4xl
          px-4
          py-6
          sm:px-6
          sm:py-8
        "
      >
        <CreatePostForm
          description={description}
          category={category}
          selectedFile={selectedFile}
          mediaType={mediaType}
          previewUrl={previewUrl}
          processingMedia={processingMedia}
          posting={posting}
          error={error}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
          onImageSelect={handleImageSelect}
          onVideoSelect={handleVideoSelect}
          onTakePhoto={handleTakePhoto}
          onRecordVideo={handleRecordVideo}
          onRemoveMedia={handleRemoveMedia}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
