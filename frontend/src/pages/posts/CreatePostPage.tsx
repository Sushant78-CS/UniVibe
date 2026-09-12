import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import CreatePostForm from "../../components/posts/create/CreatePostForm";

import { compressImage } from "../../services/compressImage";
import { compressVideo } from "../../services/compressVideo";

import { useCreatePostDraftStore } from "../../store/createPostDraftStore";

import { usePostApi, type MediaType } from "../../api/postApi";

import { useCloudinaryApi } from "../../api/cloudinary";

import { usePublishingStore } from "../../store/publishingStore";
import { useState } from "react";

const MAX_IMAGES = 10;

export default function CreatePostPage() {
  const navigate = useNavigate();

  // =========================================================
  // DRAFT STORE
  // =========================================================

  const {
    description,
    category,

    selectedFiles,
    mediaTypes,

    setDescription,
    setCategory,
    setMedia,
    clearMedia,
    resetDraft,
  } = useCreatePostDraftStore();

  // =========================================================
  // PUBLISHING STORE
  // =========================================================

  const {
    startCompressing,
    startUploading,
    setUploadProgress,
    startCreating,
    success,
    fail,
  } = usePublishingStore();

  // =========================================================
  // APIs
  // =========================================================

  const { createPost } = usePostApi();

  const { uploadPostMediaToCloudinaryWithProgress } = useCloudinaryApi();

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [processingMedia, setProcessingMedia] = useState(false);

  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // IMAGE PICKER
  // =========================================================

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    // -------------------------------------------------------
    // Validate every file
    // -------------------------------------------------------

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setError("Please select valid image files only.");

      return;
    }

    // -------------------------------------------------------
    // Don't allow images with a video
    // -------------------------------------------------------

    if (selectedFiles.some((_, index) => mediaTypes[index] === "VIDEO")) {
      setError("A post can contain either photos or one video, not both.");

      return;
    }

    // -------------------------------------------------------
    // Maximum 10 images
    // -------------------------------------------------------

    const remainingSlots = MAX_IMAGES - selectedFiles.length;

    if (remainingSlots <= 0) {
      setError(`You can add a maximum of ${MAX_IMAGES} photos.`);

      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more photo${
          remainingSlots === 1 ? "" : "s"
        } can be added.`,
      );
    } else {
      setError("");
    }

    // -------------------------------------------------------
    // Add files
    // -------------------------------------------------------

    setMedia(
      [...selectedFiles, ...filesToAdd],
      [...mediaTypes, ...filesToAdd.map(() => "IMAGE" as MediaType)],
    );
  };

  // =========================================================
  // VIDEO PICKER
  // =========================================================

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    // -------------------------------------------------------
    // Validate type
    // -------------------------------------------------------

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video.");

      return;
    }

    // -------------------------------------------------------
    // Don't allow video with photos
    // -------------------------------------------------------

    if (selectedFiles.length > 0) {
      setError("A post can contain either photos or one video, not both.");

      return;
    }

    // -------------------------------------------------------
    // Maximum video size
    // -------------------------------------------------------

    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be smaller than 100 MB.");

      return;
    }

    setError("");

    setMedia([file], ["VIDEO"]);
  };

  // =========================================================
  // TAKE PHOTO
  // =========================================================

  const handleTakePhoto = () => {
    setError("");

    navigate("/posts/create/camera?mode=photo");
  };

  // =========================================================
  // RECORD VIDEO
  // =========================================================

  const handleRecordVideo = () => {
    setError("");

    navigate("/posts/create/camera?mode=video");
  };

  // =========================================================
  // REMOVE MEDIA
  // =========================================================

  const handleRemoveMedia = (index?: number) => {
    // -------------------------------------------------------
    // Remove everything
    // -------------------------------------------------------

    if (index === undefined) {
      clearMedia();

      setError("");

      return;
    }

    // -------------------------------------------------------
    // Remove one item
    // -------------------------------------------------------

    const newFiles = selectedFiles.filter(
      (_, fileIndex) => fileIndex !== index,
    );

    const newMediaTypes = mediaTypes.filter(
      (_, mediaIndex) => mediaIndex !== index,
    );

    setMedia(newFiles, newMediaTypes);

    setError("");
  };

  // =========================================================
  // PUBLISH POST
  // =========================================================

  const handleSubmit = async () => {
    // -------------------------------------------------------
    // Validate description
    // -------------------------------------------------------

    if (!description.trim()) {
      setError("Please write something about your post.");

      return;
    }

    if (description.trim().length > 5000) {
      setError("Description cannot exceed 5000 characters.");

      return;
    }

    // -------------------------------------------------------
    // Prevent duplicate publishing
    // -------------------------------------------------------

    if (posting) {
      return;
    }

    setError("");

    setPosting(true);

    // =======================================================
    // SAVE DATA BEFORE NAVIGATION
    // =======================================================

    const postDescription = description.trim();

    const postCategory = category;

    const postFiles = [...selectedFiles];

    const postMediaTypes = [...mediaTypes];

    // =======================================================
    // NAVIGATE IMMEDIATELY
    // =======================================================

    navigate("/home", {
      replace: true,
    });

    // =======================================================
    // BACKGROUND PUBLISHING
    // =======================================================

    try {
      // -----------------------------------------------------
      // STEP 1 — COMPRESS MEDIA
      // -----------------------------------------------------

      const compressedFiles: File[] = [];

      if (postFiles.length > 0) {
        startCompressing();

        setProcessingMedia(true);

        for (let index = 0; index < postFiles.length; index++) {
          const file = postFiles[index];

          const mediaType = postMediaTypes[index];

          if (!file || !mediaType) {
            continue;
          }

          let compressedFile = file;

          if (mediaType === "IMAGE") {
            compressedFile = await compressImage(file);
          }

          if (mediaType === "VIDEO") {
            compressedFile = await compressVideo(file);
          }

          compressedFiles.push(compressedFile);
        }

        setProcessingMedia(false);
      }

      // -----------------------------------------------------
      // STEP 2 — UPLOAD MEDIA
      // -----------------------------------------------------

      const uploadedMedia: {
        mediaUrl: string;
        mediaType: MediaType;
        displayOrder: number;
      }[] = [];

      if (compressedFiles.length > 0) {
        startUploading();

        setUploadProgress(0);

        const totalFiles = compressedFiles.length;

        for (let index = 0; index < totalFiles; index++) {
          const file = compressedFiles[index];

          const mediaType = postMediaTypes[index];

          if (!file || !mediaType) {
            continue;
          }

          const baseProgress = (index / totalFiles) * 100;

          const fileProgressWeight = 100 / totalFiles;

          const uploaded = await uploadPostMediaToCloudinaryWithProgress(
            file,
            mediaType,
            (progress) => {
              const overallProgress =
                baseProgress + (progress / 100) * fileProgressWeight;

              setUploadProgress(Math.round(overallProgress));
            },
          );

          uploadedMedia.push({
            mediaUrl: uploaded.secure_url,

            mediaType,

            displayOrder: index,
          });

          setUploadProgress(Math.round(((index + 1) / totalFiles) * 100));
        }
      }

      // =====================================================
      // STEP 3 — CREATE DATABASE POST
      // =====================================================

      startCreating();

      await createPost({
        description: postDescription,

        category: postCategory,

        media: uploadedMedia,
      });

      // =====================================================
      // STEP 4 — SUCCESS
      // =====================================================

      success();

      // -----------------------------------------------------
      // Clear local draft only after successful publishing
      // -----------------------------------------------------

      resetDraft();
    } catch (err) {
      console.error("Background publishing failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to publish post. Please try again.";

      fail(message);
    } finally {
      setProcessingMedia(false);

      setPosting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

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
      {/* =====================================================
          HEADER
          ===================================================== */}

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
          {/* BACK */}

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

          {/* TITLE */}

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

      {/* =====================================================
          MAIN
          ===================================================== */}

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
          selectedFiles={selectedFiles}
          mediaTypes={mediaTypes}
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
