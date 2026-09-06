import { FileText, Image as ImageIcon, Send, Smile, X } from "lucide-react";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

import type { VibeMediaType } from "../../api/vibe";
import VibeGifPicker from "./VibeGifPicker";

interface VibeComposerProps {
  text: string;
  setText: (value: string) => void;

  selectedFile: File | null;
  selectedMediaType: VibeMediaType | null;
  previewUrl: string | null;

  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;

  onRemoveMedia: () => void;

  onSend: () => void;

  onGifSelect: (url: string) => void;

  canSend: boolean;
}

const VibeComposer = ({
  text,
  setText,
  selectedFile,
  selectedMediaType,
  previewUrl,
  onFileSelect,
  onRemoveMedia,
  onSend,
  onGifSelect,
  canSend,
}: VibeComposerProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const [gifPickerOpen, setGifPickerOpen] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canSend) {
        onSend();
      }
    }
  };

  const handleRemoveMedia = () => {
    onRemoveMedia();

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handleGifSelect = (url: string) => {
    onGifSelect(url);
    setGifPickerOpen(false);
  };

  return (
    <>
      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-neutral-200/70
          bg-white/95
          backdrop-blur-xl
          dark:border-neutral-800/70
          dark:bg-black/95
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-2xl
            px-2
            pt-2
            sm:px-3
          "
        >
          {/* =================================================
              MEDIA PREVIEW
          ================================================= */}

          {(previewUrl || selectedMediaType === "PDF") && (
            <div
              className="
                mb-2
                overflow-hidden
                rounded-2xl
                border
                border-neutral-200
                bg-neutral-100
                p-2
                dark:border-neutral-800
                dark:bg-neutral-900
              "
            >
              <div className="relative flex items-center gap-3">
                {selectedMediaType === "PDF" ? (
                  <div
                    className="
                      flex
                      min-w-0
                      flex-1
                      items-center
                      gap-3
                      px-2
                      py-1
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-purple-100
                        text-purple-600
                        dark:bg-purple-950
                        dark:text-purple-300
                      "
                    >
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                        {selectedFile?.name || "Shared PDF"}
                      </p>

                      <p className="mt-0.5 text-[10px] text-neutral-500">
                        PDF • Ready
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewUrl!}
                    alt="Selected media preview"
                    className="
                      h-20
                      w-20
                      rounded-xl
                      object-cover
                    "
                  />
                )}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  aria-label="Remove selected media"
                  className="
                    absolute
                    right-1
                    top-1
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-black/75
                    text-white
                    shadow-sm
                    transition
                    hover:bg-black
                    active:scale-95
                  "
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              INPUT
          ================================================= */}

          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-neutral-200
              bg-neutral-100
              shadow-sm
              transition
              focus-within:border-purple-400
              focus-within:bg-white
              dark:border-neutral-800
              dark:bg-neutral-900
              dark:focus-within:border-purple-700
            "
          >
            {/* Text row */}
            <div className="flex min-w-0 items-end px-1.5 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setText(`${text}😊`);
                }}
                aria-label="Add emoji"
                className="
                  mb-0.5
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-neutral-500
                  transition
                  hover:bg-neutral-200
                  hover:text-neutral-700
                  active:scale-95
                  dark:hover:bg-neutral-800
                  dark:hover:text-neutral-200
                "
              >
                <Smile size={21} strokeWidth={1.8} />
              </button>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={5000}
                placeholder="Say something anonymously..."
                className="
                  min-h-10
                  max-h-28
                  min-w-0
                  flex-1
                  resize-none
                  border-0
                  bg-transparent
                  px-2
                  py-2
                  text-sm
                  leading-5
                  text-neutral-900
                  outline-none
                  placeholder:text-neutral-400
                  focus:ring-0
                  dark:text-white
                  dark:placeholder:text-neutral-500
                "
              />
            </div>

            {/* Toolbar */}
            <div
              className="
                flex
                items-center
                justify-between
                px-2
                pb-1.5
                pt-0.5
              "
            >
              <div className="flex items-center">
                {/* Image input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileSelect}
                />

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label="Add image"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-neutral-500
                    transition
                    hover:bg-neutral-200
                    hover:text-purple-600
                    active:scale-95
                    dark:hover:bg-neutral-800
                    dark:hover:text-purple-400
                  "
                >
                  <ImageIcon size={19} strokeWidth={1.8} />
                </button>

                {/* PDF input */}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileSelect}
                />

                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  aria-label="Add PDF"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-neutral-500
                    transition
                    hover:bg-neutral-200
                    hover:text-purple-600
                    active:scale-95
                    dark:hover:bg-neutral-800
                    dark:hover:text-purple-400
                  "
                >
                  <FileText size={19} strokeWidth={1.8} />
                </button>

                {/* GIF */}
                <button
                  type="button"
                  onClick={() => setGifPickerOpen(true)}
                  aria-label="Add GIF"
                  className="
                    flex
                    h-9
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-[9px]
                    font-bold
                    text-neutral-500
                    transition
                    hover:bg-neutral-200
                    hover:text-purple-600
                    active:scale-95
                    dark:hover:bg-neutral-800
                    dark:hover:text-purple-400
                  "
                >
                  GIF
                </button>
              </div>

              {/* Send */}
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                aria-label="Send message"
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  transition-all
                  active:scale-90
                  ${
                    canSend
                      ? `
                        bg-purple-600
                        shadow-md
                        shadow-purple-600/20
                        hover:bg-purple-500
                      `
                      : `
                        bg-neutral-300
                        shadow-none
                        dark:bg-neutral-800
                      `
                  }
                `}
              >
                <Send size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>
          <div className="mt-4"></div>
        </div>
      </div>

      <VibeGifPicker
        open={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={handleGifSelect}
      />
    </>
  );
};

export default VibeComposer;
