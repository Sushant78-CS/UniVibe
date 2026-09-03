import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";

import CreatePostForm from "./CreatePostForm";

import {
  usePostApi,
  type CreatePostData,
  type PostCategory,
} from "../../../api/postApi";

import { useCloudinaryApi } from "../../../api/cloudinary";

import { compressImage } from "../../../services/compressImage";
import { compressVideo } from "../../../services/compressVideo";
import { ArrowLeft } from "lucide-react";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const CreatePostPage = () => {
  const navigate = useNavigate();

  const { createPost } = usePostApi();
  const { uploadPostMediaToCloudinary } = useCloudinaryApi();

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState<PostCategory>("GENERAL");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [processingMedia, setProcessingMedia] = useState(false);

  const [posting, setPosting] = useState(false);

  const [error, setError] = useState<string | null>(null);

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

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  /*
   * ==========================================
   * SELECT IMAGE
   * ==========================================
   */

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    setMediaType("IMAGE");
  };

  /*
   * ==========================================
   * SELECT VIDEO
   * ==========================================
   */

  const handleVideoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setSelectedFile(file);
    setMediaType("VIDEO");
  };

  /*
   * ==========================================
   * TAKE PHOTO
   * ==========================================
   *
   * Camera will be connected in the next step.
   */

  const handleTakePhoto = () => {
    setError(null);

    // Temporary placeholder.
    // Full-screen camera will replace this.
    navigate("/posts/create/camera?mode=photo");
  };

  /*
   * ==========================================
   * RECORD VIDEO
   * ==========================================
   */

  const handleRecordVideo = () => {
    setError(null);

    // Temporary placeholder.
    // Full-screen camera will replace this.
    navigate("/posts/create/camera?mode=video");
  };

  /*
   * ==========================================
   * REMOVE MEDIA
   * ==========================================
   */

  const handleRemoveMedia = () => {
    if (posting || processingMedia) {
      return;
    }

    setSelectedFile(null);
    setMediaType(null);
    setPreviewUrl(null);
    setError(null);
  };

  /*
   * ==========================================
   * CREATE POST
   * ==========================================
   */

  const handleSubmit = async (data: CreatePostData) => {
    if (posting || processingMedia) {
      return;
    }

    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      setError("Please write something before publishing.");
      return;
    }

    try {
      setError(null);
      setPosting(true);

      let mediaUrl: string | null = null;
      let finalMediaType: "IMAGE" | "VIDEO" | null = null;

      /*
       * ========================================
       * PROCESS MEDIA
       * ========================================
       */

      if (selectedFile && mediaType) {
        setPosting(false);
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

        /*
         * ======================================
         * CLOUDINARY UPLOAD
         * ======================================
         */

        setProcessingMedia(false);
        setPosting(true);

        const uploadResult = await uploadPostMediaToCloudinary(
          processedFile,
          mediaType,
        );

        mediaUrl = uploadResult.secure_url;
        finalMediaType = mediaType;
      }

      /*
       * ========================================
       * CREATE POST
       * ========================================
       */

      const postData: CreatePostData = {
        description: trimmedDescription,
        category: data.category,
        mediaUrl,
        mediaType: finalMediaType,
      };

      await createPost(postData);

      /*
       * ========================================
       * SUCCESS
       * ========================================
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

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-0 mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative z-[100] mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/home", { replace: true })}
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Post
            </h1>

            <p className="text-sm text-muted-foreground">
              Share something with your campus community
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default CreatePostPage;
