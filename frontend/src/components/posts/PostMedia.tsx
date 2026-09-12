import { useEffect, useRef, useState, type TouchEvent } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  optimizeCloudinaryImage,
  optimizeCloudinaryVideo,
} from "../../utils/cloudinary";

import type { PostMedia as PostMediaItem } from "../../api/postApi";

interface PostMediaProps {
  media: PostMediaItem[];
  onImageOpen?: (index: number) => void;
}

/*
|--------------------------------------------------------------------------
| MEDIA DESIGN
|--------------------------------------------------------------------------
|
| The feed uses a stable media viewport.
|
| Why?
|
| 1. Prevents layout jumping when an image finishes loading.
| 2. Prevents extremely tall images from taking over the feed.
| 3. Prevents landscape images from becoming unnecessarily tall.
| 4. Never crops the original image.
|
| 4:5 is a proven social-feed ratio and works well on mobile.
|
*/

const FEED_ASPECT_RATIO = "4 / 5";

const PostMedia = ({ media, onImageOpen }: PostMediaProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  /* =========================================================
     SORT MEDIA
  ========================================================= */

  const sortedMedia = [...(media ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const imageMedia = sortedMedia.filter((item) => item.mediaType === "IMAGE");

  const hasMedia = sortedMedia.length > 0;

  const hasMultipleImages = imageMedia.length > 1;

  /* =========================================================
     RESET
  ========================================================= */

  useEffect(() => {
    setActiveIndex(0);
    setImageErrors({});
  }, [media]);

  /* =========================================================
     CURRENT IMAGE
  ========================================================= */

  const currentImage = imageMedia[activeIndex];

  /* =========================================================
     PREVIOUS
  ========================================================= */

  const showPrevious = () => {
    if (!hasMultipleImages) {
      return;
    }

    setActiveIndex((current) =>
      current === 0 ? imageMedia.length - 1 : current - 1,
    );
  };

  /* =========================================================
     NEXT
  ========================================================= */

  const showNext = () => {
    if (!hasMultipleImages) {
      return;
    }

    setActiveIndex((current) =>
      current === imageMedia.length - 1 ? 0 : current + 1,
    );
  };

  /* =========================================================
     TOUCH START
  ========================================================= */

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;

    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  /* =========================================================
     TOUCH END
  ========================================================= */

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? 0;

    const endY = event.changedTouches[0]?.clientY ?? 0;

    const deltaX = endX - touchStartX.current;

    const deltaY = endY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    /*
     * Ignore vertical gestures.
     */
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    /*
     * Ignore tiny movements.
     */
    if (Math.abs(deltaX) < 45) {
      return;
    }

    if (deltaX < 0) {
      showNext();
    } else {
      showPrevious();
    }
  };

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!hasMedia) {
    return null;
  }

  /* =========================================================
     VIDEO
  ========================================================= */

  if (sortedMedia.length === 1 && sortedMedia[0].mediaType === "VIDEO") {
    const videoUrl = optimizeCloudinaryVideo(sortedMedia[0].mediaUrl, 1080);

    if (!videoUrl) {
      return null;
    }

    return (
      <div
        className="
          w-full
          overflow-hidden
          bg-white
          dark:bg-black
        "
      >
        <div
          className="
            relative
            w-full
            overflow-hidden
            bg-white
            dark:bg-black
          "
          style={{
            aspectRatio: FEED_ASPECT_RATIO,
          }}
        >
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-contain
              bg-white
              dark:bg-black
            "
          />
        </div>
      </div>
    );
  }

  /* =========================================================
     NO IMAGE
  ========================================================= */

  if (!currentImage) {
    return null;
  }

  /* =========================================================
     OPTIMIZED IMAGE
  ========================================================= */

  const optimizedUrl = optimizeCloudinaryImage(currentImage.mediaUrl, 1080);

  if (!optimizedUrl) {
    return null;
  }

  const imageHasError = !!imageErrors[activeIndex];

  /* =========================================================
     IMAGE ERROR
  ========================================================= */

  const handleImageError = () => {
    setImageErrors((previous) => ({
      ...previous,
      [activeIndex]: true,
    }));
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        relative
        w-full
        overflow-hidden
        bg-white
        dark:bg-black
      "
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =====================================================
          STABLE MEDIA VIEWPORT

          IMPORTANT:

          The viewport ALWAYS has the same aspect ratio.

          The image sits inside it using object-contain.

          Therefore:

          - no cropping
          - no jumping
          - no resizing after load
          - no extremely tall posts
      ===================================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
          bg-white
          dark:bg-black
        "
        style={{
          aspectRatio: FEED_ASPECT_RATIO,
        }}
      >
        {/* =================================================
            IMAGE
        ================================================= */}

        <button
          type="button"
          onClick={() => onImageOpen?.(activeIndex)}
          aria-label={`Open image ${activeIndex + 1}`}
          className="
            absolute
            inset-0
            block
            h-full
            w-full
            bg-white
            p-0
            dark:bg-black
            focus:outline-none
          "
        >
          {!imageHasError ? (
            <img
              src={optimizedUrl}
              alt={`Post image ${activeIndex + 1}`}
              loading={activeIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              onError={handleImageError}
              className="
                block
                h-full
                w-full
                object-contain
                object-center
                select-none
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
                bg-white
                text-xs
                text-neutral-500
                dark:bg-black
                dark:text-neutral-500
              "
            >
              Unable to load image
            </div>
          )}
        </button>

        {/* =================================================
            MULTIPLE IMAGE CONTROLS
        ================================================= */}

        {hasMultipleImages && (
          <>
            {/* =============================================
                PREVIOUS
            ============================================= */}

            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="
                absolute
                left-3
                top-1/2
                z-10
                hidden
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-white
                shadow-md
                backdrop-blur-sm
                transition
                hover:bg-black/70
                sm:flex
              "
            >
              <ChevronLeft size={17} />
            </button>

            {/* =============================================
                NEXT
            ============================================= */}

            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="
                absolute
                right-3
                top-1/2
                z-10
                hidden
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-white
                shadow-md
                backdrop-blur-sm
                transition
                hover:bg-black/70
                sm:flex
              "
            >
              <ChevronRight size={17} />
            </button>

            {/* =============================================
                COUNTER
            ============================================= */}

            <div
              className="
                absolute
                right-3
                top-3
                z-10
                rounded-full
                bg-black/60
                px-2.5
                py-1
                text-[11px]
                font-medium
                leading-none
                text-white
                backdrop-blur-sm
              "
            >
              {activeIndex + 1}/{imageMedia.length}
            </div>

            {/* =============================================
                DOTS
            ============================================= */}

            <div
              className="
                absolute
                bottom-3
                left-1/2
                z-10
                flex
                -translate-x-1/2
                items-center
                gap-1
                rounded-full
                bg-black/30
                px-2
                py-1.5
                backdrop-blur-sm
              "
            >
              {imageMedia.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    transition-all
                    ${
                      activeIndex === index
                        ? "scale-125 bg-white"
                        : "bg-white/55"
                    }
                  `}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostMedia;
