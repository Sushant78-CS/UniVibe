import { ArrowLeft, Save, RotateCcw } from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useNavigate, useParams } from "react-router";

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

import EditPostHeader from "../../components/posts/edit/EditPostHeader";
import PostDetailsForm from "../../components/posts/edit/PostDetailsForm";
import MediaEditor from "../../components/posts/edit/MediaEditor";
import MediaUploadProgress from "../../components/posts/edit/MediaUploadProgress";

const MAX_IMAGES = 10;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const EditPostPage = () => {
  const navigate = useNavigate();

  const { postId } = useParams<{
    postId: string;
  }>();

  const { getPostById, updatePost } = usePostApi();

  const { uploadPostMediaToCloudinaryWithProgress } = useCloudinaryApi();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================
  // POST
  // =========================================================

  const [post, setPost] = useState<Post | null>(null);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FORM
  // =========================================================

  const [description, setDescription] = useState("");

  const [category, setCategory] =
    useState<CreatePostData["category"]>("GENERAL");

  // =========================================================
  // EXISTING MEDIA
  // =========================================================

  const [existingMedia, setExistingMedia] = useState<PostMedia[]>([]);

  const [removedMediaUrls, setRemovedMediaUrls] = useState<string[]>([]);

  // =========================================================
  // NEW MEDIA
  // =========================================================

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [selectedMediaTypes, setSelectedMediaTypes] = useState<MediaType[]>([]);

  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);

  // =========================================================
  // UI
  // =========================================================

  const [saving, setSaving] = useState(false);

  const [processingMedia, setProcessingMedia] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD POST
  // =========================================================

  useEffect(() => {
    if (!postId) {
      setError("Invalid post.");
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const postIdNumber = Number(postId);

        if (Number.isNaN(postIdNumber)) {
          throw new Error("Invalid post ID.");
        }

        const fetchedPost = await getPostById(postIdNumber);

        setPost(fetchedPost);

        setDescription(fetchedPost.description ?? "");

        setCategory(fetchedPost.category);

        const media = [...(fetchedPost.media ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        setExistingMedia(media);
        setRemovedMediaUrls([]);

        setSelectedFiles([]);
        setSelectedMediaTypes([]);
        setSelectedPreviews([]);

        setUploadProgress(0);
      } catch (err) {
        console.error("Failed to load post:", err);

        setError(err instanceof Error ? err.message : "Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // =========================================================
  // CLEANUP PREVIEWS
  // =========================================================

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [selectedPreviews]);

  // =========================================================
  // VISIBLE EXISTING MEDIA
  // =========================================================

  const visibleExistingMedia = existingMedia.filter(
    (media) => !removedMediaUrls.includes(media.mediaUrl),
  );

  // =========================================================
  // ADD MEDIA
  // =========================================================

  const handleMediaSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setError("");

    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // ---------------------------------------------------------
    // MIXED MEDIA
    // ---------------------------------------------------------

    if (videoFiles.length > 0 && imageFiles.length > 0) {
      setError("Please select images or one video, not both.");
      return;
    }

    // ---------------------------------------------------------
    // VIDEO
    // ---------------------------------------------------------

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

      const hasExistingImages = visibleExistingMedia.some(
        (media) => media.mediaType === "IMAGE",
      );

      if (hasExistingImages) {
        setError("Remove the existing images before adding a video.");
        return;
      }

      selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

      setSelectedFiles([video]);

      setSelectedMediaTypes(["VIDEO"]);

      setSelectedPreviews([URL.createObjectURL(video)]);

      setUploadProgress(0);

      return;
    }

    // ---------------------------------------------------------
    // IMAGES
    // ---------------------------------------------------------

    if (imageFiles.length === 0) {
      setError("Please select an image or video.");
      return;
    }

    const existingImageCount = visibleExistingMedia.filter(
      (media) => media.mediaType === "IMAGE",
    ).length;

    const totalImages =
      existingImageCount + selectedFiles.length + imageFiles.length;

    if (totalImages > MAX_IMAGES) {
      setError(`You can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const hasExistingVideo = visibleExistingMedia.some(
      (media) => media.mediaType === "VIDEO",
    );

    if (hasExistingVideo) {
      setError("Remove the existing video before adding images.");
      return;
    }

    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedFiles(imageFiles);

    setSelectedMediaTypes(imageFiles.map(() => "IMAGE"));

    setSelectedPreviews(imageFiles.map((file) => URL.createObjectURL(file)));

    setUploadProgress(0);
  };

  // =========================================================
  // REMOVE NEW FILE
  // =========================================================

  const handleRemoveSelectedFile = (index: number) => {
    if (saving) {
      return;
    }

    const preview = selectedPreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFiles((current) => current.filter((_, i) => i !== index));

    setSelectedMediaTypes((current) => current.filter((_, i) => i !== index));

    setSelectedPreviews((current) => current.filter((_, i) => i !== index));

    setUploadProgress(0);
  };

  // =========================================================
  // REMOVE EXISTING MEDIA
  // =========================================================

  const handleRemoveExistingMedia = (mediaUrl: string) => {
    if (saving) {
      return;
    }

    setRemovedMediaUrls((current) => {
      if (current.includes(mediaUrl)) {
        return current;
      }

      return [...current, mediaUrl];
    });

    setError("");
  };

  // =========================================================
  // RESTORE EXISTING MEDIA
  // =========================================================

  const handleRestoreExistingMedia = (mediaUrl: string) => {
    if (saving) {
      return;
    }

    setRemovedMediaUrls((current) => current.filter((url) => url !== mediaUrl));
  };

  // =========================================================
  // ADD MEDIA BUTTON
  // =========================================================

  const handleAddMedia = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    if (saving) {
      return;
    }

    navigate(-1);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!post || saving) {
      return;
    }

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!description.trim()) {
      setError("Post description cannot be empty.");
      return;
    }

    if (description.trim().length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setUploadProgress(0);

      // -------------------------------------------------------
      // RETAIN EXISTING MEDIA
      // -------------------------------------------------------

      const retainedExistingMedia = existingMedia.filter(
        (media) => !removedMediaUrls.includes(media.mediaUrl),
      );

      // -------------------------------------------------------
      // UPLOAD NEW MEDIA
      // -------------------------------------------------------

      const uploadedMedia: PostMedia[] = [];

      if (selectedFiles.length > 0) {
        setProcessingMedia(true);

        const totalFiles = selectedFiles.length;

        for (let index = 0; index < totalFiles; index++) {
          const file = selectedFiles[index];

          const mediaType = selectedMediaTypes[index];

          if (!file || !mediaType) {
            continue;
          }

          let processedFile = file;

          // Client-side compression.
          if (mediaType === "IMAGE") {
            processedFile = await compressImage(file);
          }

          if (mediaType === "VIDEO") {
            processedFile = await compressVideo(file);
          }

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
            displayOrder: 0,
          });
        }

        setProcessingMedia(false);
      }

      // -------------------------------------------------------
      // FINAL MEDIA
      // -------------------------------------------------------

      const finalMedia: PostMedia[] = [
        ...retainedExistingMedia,
        ...uploadedMedia,
      ].map((media, index) => ({
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType,
        displayOrder: index,
      }));

      // -------------------------------------------------------
      // UPDATE DATA
      // -------------------------------------------------------

      const data: CreatePostData = {
        description: description.trim(),

        category,

        media: finalMedia.map((media) => ({
          mediaUrl: media.mediaUrl,
          mediaType: media.mediaType,
          displayOrder: media.displayOrder,
        })),
      };

      // -------------------------------------------------------
      // REMOVE ALL
      // -------------------------------------------------------

      const removeAllMedia =
        existingMedia.length > 0 && finalMedia.length === 0;

      // -------------------------------------------------------
      // UPDATE BACKEND
      // -------------------------------------------------------

      const updatedPost = await updatePost(post.id, data, removeAllMedia);

      // Keep local state updated.
      setPost(updatedPost);

      // Go back to previous page.
      navigate(-1);
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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <EditPostHeader onBack={() => navigate(-1)} disabled />

        <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
          <div className="flex flex-col items-center">
            <RotateCcw size={22} className="animate-spin text-violet-600" />

            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              Loading post...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR / POST NOT FOUND
  // =========================================================

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <EditPostHeader onBack={() => navigate(-1)} />

        <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">
              Unable to load post
            </h1>

            <p className="mt-2 text-sm text-red-500">
              {error || "The post could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <EditPostHeader onBack={handleBack} disabled={saving} />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITLE */}

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Edit Post
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your post details and media.
            </p>
          </div>

          {/* DETAILS */}

          <PostDetailsForm
            description={description}
            category={category}
            disabled={saving}
            onDescriptionChange={setDescription}
            onCategoryChange={setCategory}
          />

          {/* MEDIA */}

          <MediaEditor
            existingMedia={visibleExistingMedia}
            removedMedia={existingMedia.filter((media) =>
              removedMediaUrls.includes(media.mediaUrl),
            )}
            selectedFiles={selectedFiles}
            selectedMediaTypes={selectedMediaTypes}
            selectedPreviews={selectedPreviews}
            saving={saving}
            onAddMedia={handleAddMedia}
            onRemoveExistingMedia={handleRemoveExistingMedia}
            onRestoreExistingMedia={handleRestoreExistingMedia}
            onRemoveSelectedFile={handleRemoveSelectedFile}
          />

          {/* FILE INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaSelect}
            className="hidden"
          />

          {/* PROCESSING */}

          {processingMedia && (
            <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700 dark:border-violet-900/50 dark:bg-violet-500/10 dark:text-violet-300">
              <RotateCcw size={16} className="animate-spin" />

              <span>Compressing and preparing media...</span>
            </div>
          )}

          {/* UPLOAD */}

          {saving && !processingMedia && selectedFiles.length > 0 && (
            <MediaUploadProgress progress={uploadProgress} />
          )}

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || processingMedia}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              <Save size={16} />

              {processingMedia
                ? "Processing..."
                : saving
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditPostPage;
