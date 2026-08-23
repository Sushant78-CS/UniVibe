import { Camera } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfilePhotoProps {
  image: string | null;
  onChange: (image: string | null) => void;
  onFileChange: (file: File | null) => void;
}

function ProfilePhoto({ image, onChange, onFileChange }: ProfilePhotoProps) {
  const [preview, setPreview] = useState<string | null>(image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    // Create local preview
    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);

    // Keep the actual file for later upload
    onFileChange(file);

    // Store preview
    onChange(imageUrl);
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex flex-col items-center py-5">
      <label className="group relative cursor-pointer">
        {/* Profile Image */}
        <div
          className="
            flex h-28 w-28
            items-center justify-center
            overflow-hidden
            rounded-full
            border-4
            border-white
            bg-gradient-to-br
            from-indigo-100
            to-purple-100
            shadow-lg
            ring-2
            ring-indigo-100

            dark:border-slate-900
            dark:from-indigo-950
            dark:to-purple-950
            dark:ring-indigo-900
          "
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>

        {/* Camera */}
        <div
          className="
            absolute
            bottom-0
            right-0
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border-2
            border-white
            bg-gradient-to-br
            from-indigo-600
            to-purple-600
            text-white
            shadow-md

            transition
            group-hover:scale-105

            dark:border-slate-900
          "
        >
          <Camera size={17} />
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      <p
        className="
          mt-3
          text-sm
          font-semibold
          text-indigo-600
          dark:text-indigo-400
        "
      >
        {preview ? "Change Photo" : "Add Profile Photo"}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-slate-400
          dark:text-slate-500
        "
      >
        JPG, PNG or WebP · Max 5MB
      </p>
    </div>
  );
}

export default ProfilePhoto;
