import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";

import CreatePostForm from "./CreatePostForm";

import {
  usePostApi,
  type CreatePostData,
  type MediaType,
  type PostCategory,
} from "../../../api/postApi";

import { useCloudinaryApi } from "../../../api/cloudinary";

import { compressImage } from "../../../services/compressImage";
import { compressVideo } from "../../../services/compressVideo";

import { ArrowLeft } from "lucide-react";

const MAX_IMAGES = 10;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const CreatePostPage = () => {
  const navigate = useNavigate();

  const { createPost } = usePostApi();

  const { uploadPostMediaToCloudinary } = useCloudinaryApi();

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState<PostCategory>("GENERAL");

  /* =========================================================
     MEDIA STATE
     
     IMPORTANT:
     The form supports multiple images, therefore these
     MUST be arrays.
  ========================================================= */

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([]);

  /* =========================================================
     UI STATE
  ========================================================= */

  const [processingMedia, setProcessingMedia] = useState(false);

  const [posting, setPosting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =========================================================
     SELECT IMAGES
  ========================================================= */

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    /*
     * Reset input so the same file can be selected again.
     */
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setError(null);

    /*
     * Only accept actual image files.
     */
    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setError(`"${invalidFile.name}" is not a valid image file.`);
      return;
    }

    /*
     * Never allow more than MAX_IMAGES.
     */
    const remainingSlots = MAX_IMAGES - selectedFiles.length;

    if (remainingSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} photos.`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    /*
     * Avoid accidentally mixing video and images.
     */
    if (selectedFiles.some((_, index) => mediaTypes[index] === "VIDEO")) {
      setError("Remove the video before adding photos.");
      return;
    }

    setSelectedFiles((previous) => [...previous, ...filesToAdd]);

    setMediaTypes((previous) => [
      ...previous,
      ...filesToAdd.map(() => "IMAGE" as MediaType),
    ]);

    /*
     * Inform the user if they selected more than
     * the remaining available slots.
     */
    if (files.length > filesToAdd.length) {
      setError(`Only ${MAX_IMAGES} photos can be added to one post.`);
    }
  };

  /* =========================================================
     SELECT VIDEO
  ========================================================= */

  const handleVideoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);

    /*
     * Validate MIME type.
     */
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    /*
     * Validate size.
     */
    if (file.size > MAX_VIDEO_SIZE) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    /*
     * A post can contain either:
     *
     *   photos
     *
     * OR
     *
     *   one video
     *
     * Never both.
     */
    if (selectedFiles.length > 0) {
      setError("A video cannot be combined with photos.");
      return;
    }

    setSelectedFiles([file]);

    setMediaTypes(["VIDEO"]);
  };

  /* =========================================================
     TAKE PHOTO
  ========================================================= */

  const handleTakePhoto = () => {
    if (posting || processingMedia) {
      return;
    }

    setError(null);

    /*
     * Camera flow will return to this create-post flow.
     */
    navigate("/posts/create/camera?mode=photo");
  };

  /* =========================================================
     RECORD VIDEO
  ========================================================= */

  const handleRecordVideo = () => {
    if (posting || processingMedia) {
      return;
    }

    setError(null);

    navigate("/posts/create/camera?mode=video");
  };

  /* =========================================================
     REMOVE MEDIA
     
     index supplied:
       remove one item
     
     index omitted:
       remove everything
  ========================================================= */

  const handleRemoveMedia = (index?: number) => {
    if (posting || processingMedia) {
      return;
    }

    setError(null);

    /*
     * Remove everything.
     */
    if (index === undefined || index < 0) {
      setSelectedFiles([]);
      setMediaTypes([]);
      return;
    }

    /*
     * Remove only one file.
     */
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );

    setMediaTypes((previous) =>
      previous.filter((_, typeIndex) => typeIndex !== index),
    );
  };

  /* =========================================================
     CREATE POST
  ========================================================= */

  const handleSubmit = async (data: CreatePostData) => {
    if (posting || processingMedia) {
      return;
    }

    const trimmedDescription = description.trim();

    /*
     * Validate description.
     */
    if (!trimmedDescription) {
      setError("Please write something before publishing.");
      return;
    }

    /*
     * Safety check:
     * arrays should always have matching lengths.
     */
    if (selectedFiles.length !== mediaTypes.length) {
      setError(
        "Something went wrong with the selected media. Please select it again.",
      );
      return;
    }

    try {
      setError(null);

      setPosting(true);

      /*
       * =====================================================
       * UPLOAD MEDIA
       * =====================================================
       */

      const uploadedMedia: CreatePostData["media"] = [];

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const type = mediaTypes[index];

        if (!file || !type) {
          continue;
        }

        /*
         * Show processing state while compressing.
         */
        setPosting(false);
        setProcessingMedia(true);

        let processedFile = file;

        /*
         * IMAGE
         */
        if (type === "IMAGE") {
          processedFile = await compressImage(file);
        }

        /*
         * VIDEO
         */
        if (type === "VIDEO") {
          processedFile = await compressVideo(file);
        }

        /*
         * Upload processed file.
         */
        setProcessingMedia(false);
        setPosting(true);

        const uploadResult = await uploadPostMediaToCloudinary(
          processedFile,
          type,
        );

        /*
         * Add media in the same order the user
         * selected it.
         */
        uploadedMedia.push({
          mediaUrl: uploadResult.secure_url,

          mediaType: type,

          displayOrder: index,
        });
      }

      /*
       * =====================================================
       * CREATE POST REQUEST
       * =====================================================
       */

      const postData: CreatePostData = {
        description: trimmedDescription,

        category: data.category,

        media: uploadedMedia,
      };

      await createPost(postData);

      /*
       * =====================================================
       * SUCCESS
       * =====================================================
       */

      navigate("/home", {
        replace: true,
      });
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-background">
      <div
        className="
          relative
          z-0
          mx-auto
          w-full
          max-w-4xl
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            relative
            z-[100]
            mb-6
            flex
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate("/home", {
                replace: true,
              })
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-foreground
              transition
              hover:bg-muted
              active:scale-95
            "
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>

          <div>
            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-foreground
              "
            >
              Create Post
            </h1>

            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              Share something with your campus community
            </p>
          </div>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

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
      </div>
    </div>
  );
};

export default CreatePostPage;
