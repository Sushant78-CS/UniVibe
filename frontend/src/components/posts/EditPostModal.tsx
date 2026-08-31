import { useEffect, useRef, useState } from "react";
import { X, Save, ImagePlus, Trash2 } from "lucide-react";
import { usePostApi, type Post, type CreatePostData } from "../../api/postApi";

interface EditPostModalProps {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onUpdated: (post: Post) => void;
}

const EditPostModal = ({
  open,
  post,
  onClose,
  onUpdated,
}: EditPostModalProps) => {
  const { updatePost } = usePostApi();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [description, setDescription] = useState("");

  const [category, setCategory] =
    useState<CreatePostData["category"]>("GENERAL");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [removeImage, setRemoveImage] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!post) return;

    setDescription(post.description ?? "");
    setCategory(post.category);

    setSelectedImage(null);
    setRemoveImage(false);

    // Show existing Cloudinary image
    setImagePreview(post.imageUrl ?? null);

    setError("");
  }, [post]);

  // Create preview when a new file is selected
  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);

    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

  if (!open || !post) {
    return null;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError("");
    setRemoveImage(false);
    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Post description cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedPost = await updatePost(
        post.id,
        {
          description: description.trim(),
          category,
        },
        selectedImage,
        removeImage,
      );

      onUpdated(updatedPost);
      onClose();
    } catch (err) {
      console.error("Failed to update post:", err);

      setError("Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
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
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* Header */}
        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            bg-white
            px-4
            py-3
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div>
            <h2 className="text-sm font-semibold">Edit Post</h2>

            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
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
              hover:bg-slate-100
              dark:hover:bg-slate-800
            "
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
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
                outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
                dark:text-white
              "
              placeholder="What's happening around campus?"
            />

            <div className="mt-1 flex justify-end">
              <span className="text-[10px] text-slate-400">
                {description.length}/1000
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as CreatePostData["category"])
              }
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-xs
                outline-none
                focus:border-violet-500
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

          {/* Image */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold">
              Post Image
            </label>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <img
                  src={imagePreview}
                  alt="Post preview"
                  className="
                    max-h-72
                    w-full
                    object-cover
                  "
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
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
                  "
                  aria-label="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                "
              >
                <ImagePlus size={24} />

                <span className="mt-2 text-xs font-semibold">Add image</span>

                <span className="mt-1 text-[10px]">PNG, JPG up to 5MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  mt-2
                  text-xs
                  font-medium
                  text-violet-600
                  hover:text-violet-700
                  dark:text-violet-400
                "
              >
                Change image
              </button>
            )}
          </div>

          {/* Error */}
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

          {/* Actions */}
          <div className="flex gap-2 pt-1">
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
                hover:bg-slate-100
                dark:border-slate-700
                dark:text-slate-300
                dark:hover:bg-slate-800
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
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
                hover:bg-violet-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Save size={14} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
