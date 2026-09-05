import { useState } from "react";
import {
  optimizeCloudinaryImage,
  optimizeCloudinaryVideo,
} from "../../utils/cloudinary";

interface PostMediaProps {
  mediaUrl: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  onImageOpen?: () => void;
}

const PostMedia = ({ mediaUrl, mediaType, onImageOpen }: PostMediaProps) => {
  const [imageError, setImageError] = useState(false);

  if (!mediaUrl || !mediaType) {
    return null;
  }

  const optimizedUrl =
    mediaType === "IMAGE"
      ? optimizeCloudinaryImage(mediaUrl, 1080)
      : optimizeCloudinaryVideo(mediaUrl, 1080);

  if (!optimizedUrl) {
    return null;
  }

  return (
    <div
      className="
        w-full
        overflow-hidden
        bg-black
        dark:bg-black
      "
    >
      {mediaType === "IMAGE" ? (
        <button
          type="button"
          onClick={onImageOpen}
          className="
            group
            block
            aspect-[4/5]
            w-full
            cursor-zoom-in
            bg-neutral-100
            dark:bg-neutral-950
          "
        >
          {!imageError ? (
            <img
              src={optimizedUrl}
              alt="Post attachment"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="
                h-full
                w-full
                object-contain
                bg-neutral-100
                dark:bg-neutral-950
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-neutral-100
                text-xs
                text-neutral-500
                dark:bg-neutral-950
                dark:text-neutral-500
              "
            >
              Unable to load image
            </div>
          )}
        </button>
      ) : (
        <div
          className="
            aspect-[4/5]
            w-full
            bg-black
          "
        >
          <video
            src={optimizedUrl}
            controls
            playsInline
            preload="metadata"
            className="
              h-full
              w-full
              object-contain
              bg-black
            "
          />
        </div>
      )}
    </div>
  );
};

export default PostMedia;
