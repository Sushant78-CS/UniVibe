import type { ChangeEvent, RefObject } from "react";
import { Camera, Image as ImageIcon, Video } from "lucide-react";

interface MediaPickerProps {
  imageInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;

  disabled?: boolean;

  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;

  onVideoSelect: (event: ChangeEvent<HTMLInputElement>) => void;

  onTakePhoto: () => void;

  onRecordVideo: () => void;
}

const MediaPicker = ({
  imageInputRef,
  videoInputRef,
  disabled = false,
  onImageSelect,
  onVideoSelect,
  onTakePhoto,
  onRecordVideo,
}: MediaPickerProps) => {
  return (
    <div>
      {/* =====================================================
          TITLE
      ===================================================== */}

      <label
        className="
          mb-2
          block
          text-sm
          font-semibold
          text-slate-900
          dark:text-white
        "
      >
        Add Media
      </label>

      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-2
        "
      >
        {/* ===================================================
            SELECT PHOTO
        =================================================== */}

        <button
          type="button"
          disabled={disabled}
          onClick={() => imageInputRef.current?.click()}
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-3
            py-4
            text-xs
            font-semibold
            text-slate-700
            transition

            hover:border-violet-300
            hover:bg-violet-50

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-slate-700
            dark:bg-slate-950
            dark:text-slate-300
            dark:hover:bg-violet-500/10
          "
        >
          <ImageIcon size={21} className="text-violet-500" />

          <span>Select Photo</span>
        </button>

        {/* ===================================================
            SELECT VIDEO
        =================================================== */}

        <button
          type="button"
          disabled={disabled}
          onClick={() => videoInputRef.current?.click()}
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-3
            py-4
            text-xs
            font-semibold
            text-slate-700
            transition

            hover:border-violet-300
            hover:bg-violet-50

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-slate-700
            dark:bg-slate-950
            dark:text-slate-300
            dark:hover:bg-violet-500/10
          "
        >
          <Video size={21} className="text-violet-500" />

          <span>Select Video</span>
        </button>

        {/* ===================================================
            TAKE PHOTO
        =================================================== */}

        <button
          type="button"
          disabled={disabled}
          onClick={onTakePhoto}
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-3
            py-4
            text-xs
            font-semibold
            text-slate-700
            transition

            hover:border-violet-300
            hover:bg-violet-50

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-slate-700
            dark:bg-slate-950
            dark:text-slate-300
            dark:hover:bg-violet-500/10
          "
        >
          <Camera size={21} className="text-violet-500" />

          <span>Take Photo</span>
        </button>

        {/* ===================================================
            RECORD VIDEO
        =================================================== */}

        <button
          type="button"
          disabled={disabled}
          onClick={onRecordVideo}
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-3
            py-4
            text-xs
            font-semibold
            text-slate-700
            transition

            hover:border-violet-300
            hover:bg-violet-50

            disabled:cursor-not-allowed
            disabled:opacity-50

            dark:border-slate-700
            dark:bg-slate-950
            dark:text-slate-300
            dark:hover:bg-violet-500/10
          "
        >
          <Video size={21} className="text-violet-500" />

          <span>Record Video</span>
        </button>
      </div>

      {/* =====================================================
          HIDDEN FILE INPUTS
      ===================================================== */}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageSelect}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onVideoSelect}
      />
    </div>
  );
};

export default MediaPicker;
