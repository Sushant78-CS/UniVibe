import { useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, Send, ChevronDown } from "lucide-react";
import {
  usePostApi,
  type CreatePostData,
  type PostCategory,
} from "../../api/postApi";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (
    post: Awaited<ReturnType<ReturnType<typeof usePostApi>["createPost"]>>,
  ) => void;
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

const CreatePostModal = ({
  open,
  onClose,
  onCreated,
}: CreatePostModalProps) => {
  const { createPost } = usePostApi();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PostCategory>("GENERAL");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImage);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!open) {
      setDescription("");
      setCategory("GENERAL");
      setSelectedImage(null);
      setPreviewUrl(null);
      setError("");
      setPosting(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

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
    setSelectedImage(file);

    event.target.value = "";
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

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

      const data: CreatePostData = {
        description: description.trim(),
        category,
      };

      const createdPost = await createPost(data, selectedImage);

      onCreated(createdPost);
      onClose();
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        px-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-lg
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            border-b border-slate-200
            px-5 py-4
            dark:border-slate-800
          "
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Post
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Description */}
          <div>
            <label
              className="
                mb-2 block
                text-sm font-semibold
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
              rows={5}
              placeholder="Share an event, news, announcement or something interesting..."
              className="
                w-full resize-none
                rounded-2xl
                border border-slate-200
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

            <div className="mt-1 text-right text-xs text-slate-400">
              {description.length}/1000
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              className="
                mb-2 block
                text-sm font-semibold
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
                className="
                  w-full appearance-none
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  px-4 py-3 pr-10
                  text-sm
                  outline-none
                  focus:border-violet-500
                  dark:border-slate-700
                  dark:bg-slate-950
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
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label
              className="
                mb-2 block
                text-sm font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Image
            </label>

            <div className="flex gap-2">
              {/* Select image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  flex flex-1
                  items-center justify-center gap-2
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  px-4 py-3
                  text-sm font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                <ImageIcon size={17} />
                Select Image
              </button>

              {/* Camera */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="
                  flex flex-1
                  items-center justify-center gap-2
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  px-4 py-3
                  text-sm font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                <Camera size={17} />
                Camera
              </button>
            </div>

            {/* Gallery input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Camera input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
              "
            >
              <img
                src={previewUrl}
                alt="Post preview"
                className="
                  max-h-80
                  w-full
                  object-cover
                "
              />

              <button
                type="button"
                onClick={removeImage}
                className="
                  absolute right-3 top-3
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  bg-black/60
                  text-white
                  backdrop-blur-sm
                  transition
                  hover:bg-black/80
                "
                aria-label="Remove image"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="
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

          {/* Submit */}
          <button
            type="submit"
            disabled={posting}
            className="
              flex w-full
              items-center justify-center gap-2
              rounded-xl
              bg-violet-600
              px-4 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-violet-700
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Send size={17} />

            {posting ? "Posting..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
