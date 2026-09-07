import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Smile,
  Sticker,
  X,
} from "lucide-react";

import { useRef, useState, type ChangeEvent } from "react";

import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";

import type { VibeMediaType } from "../../api/vibeApi";
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

  onStickerSelect?: (url: string) => void;

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
  onStickerSelect,
  canSend,
}: VibeComposerProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [stickerCategory, setStickerCategory] = useState("All");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

  /*
   * UniVibe stickers.
   *
   * Add your WebP/PNG sticker files to:
   * public/stickers/
   *
   * Example:
   * public/stickers/happy.webp
   */
  const stickerCategories = {
    All: [
      "/stickers/happy.webp",
      "/stickers/laughing.webp",
      "/stickers/love.webp",
      "/stickers/celebrate.webp",
      "/stickers/coding.webp",
      "/stickers/exam.webp",
      "/stickers/study.webp",
      "/stickers/sad.webp",
    ],
    Reactions: [
      "/stickers/happy.webp",
      "/stickers/laughing.webp",
      "/stickers/love.webp",
      "/stickers/sad.webp",
    ],
    College: [
      "/stickers/celebrate.webp",
      "/stickers/exam.webp",
      "/stickers/study.webp",
    ],
    Coding: ["/stickers/coding.webp"],
  } as const;

  const stickerCategoryNames = Object.keys(stickerCategories);

  const visibleStickers =
    stickerCategories[stickerCategory as keyof typeof stickerCategories] ??
    stickerCategories.All;

  // const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  //   if (event.key === "Enter" && !event.shiftKey) {
  //     event.preventDefault();

  //     if (canSend) {
  //       onSend();
  //     }
  //   }
  // };

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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textAreaRef.current;

    if (!textarea) {
      setText(`${text}${emojiData.emoji}`);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;

    const nextText = text.slice(0, start) + emojiData.emoji + text.slice(end);

    setText(nextText);

    requestAnimationFrame(() => {
      const cursorPosition = start + emojiData.emoji.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const handleEmojiButtonClick = () => {
    setStickerPickerOpen(false);
    setGifPickerOpen(false);
    setEmojiPickerOpen((current) => !current);
  };

  const handleStickerButtonClick = () => {
    setEmojiPickerOpen(false);
    setGifPickerOpen(false);
    setStickerPickerOpen((current) => !current);
  };

  const handleStickerSelect = (url: string) => {
    setStickerPickerOpen(false);
    onStickerSelect?.(url);
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
          max-md:border-t-0
          max-md:bg-transparent
          max-md:backdrop-blur-none
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-2xl
            px-2
            pt-2
            pb-1
            sm:px-3
            md:pb-0
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

                      <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
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
              relative
              overflow-visible
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
              dark:focus-within:bg-neutral-900
              max-md:rounded-full
              max-md:border-neutral-200/80
              max-md:bg-white
              max-md:shadow-lg
              max-md:dark:border-neutral-700
              max-md:dark:bg-neutral-900
            "
          >
            {/* =================================================
                DESKTOP-ONLY EMOJI / STICKER PICKERS
            ================================================= */}

            {stickerPickerOpen && (
              <div
                className="
            hidden
            md:block
            absolute
            bottom-full
            left-0
            z-[99999]
            mb-3
            w-[350px]
            max-w-[calc(100vw-24px)]
            overflow-hidden
            rounded-2xl
            border
            border-neutral-200
            bg-white
            shadow-2xl
            dark:border-neutral-800
            dark:bg-neutral-900
          "
              >
                <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2.5 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sticker
                      size={18}
                      className="text-purple-600 dark:text-purple-400"
                    />
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      Stickers
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStickerPickerOpen(false)}
                    aria-label="Close sticker picker"
                    className="
                flex h-7 w-7 items-center justify-center rounded-full
                text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700
                dark:hover:bg-neutral-800 dark:hover:text-neutral-200
              "
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-2 py-2 dark:border-neutral-800">
                  {stickerCategoryNames.map((category) => {
                    const active = stickerCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setStickerCategory(category)}
                        className={`
                    shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition
                    ${
                      active
                        ? "bg-purple-600 text-white"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                    }
                  `}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div className="grid max-h-[300px] grid-cols-4 gap-2 overflow-y-auto p-3">
                  {visibleStickers.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => handleStickerSelect(url)}
                      className="
                  flex aspect-square items-center justify-center rounded-xl
                  p-1 transition hover:bg-neutral-100 hover:scale-105
                  active:scale-95 dark:hover:bg-neutral-800
                "
                      aria-label="Send sticker"
                    >
                      <img
                        src={url}
                        alt="Sticker"
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>

                <div className="border-t border-neutral-200 px-3 py-2 text-center dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-400">
                    Tap a sticker to send
                  </span>
                </div>
              </div>
            )}

            {emojiPickerOpen && (
              <div
                className="
                  hidden
                  md:block
                  absolute
                  bottom-full
                  left-0
                  mb-3
                  z-[99999]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-white
                  shadow-2xl
                  dark:border-neutral-800
                  dark:bg-neutral-900
                "
              >
                <div className="w-[350px] max-w-[calc(100vw-24px)]">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={Theme.AUTO}
                    width={350}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{
                      showPreview: false,
                    }}
                  />
                </div>
              </div>
            )}

            {/* On mobile, keep the native OS keyboard in control. The custom
                emoji/sticker/GIF controls below are desktop-only. */}

            {/* =================================================
                RESPONSIVE MESSAGE ROW
                Mobile: Telegram-style single pill.
                Desktop: emoji/sticker controls + textarea.
            ================================================= */}

            {/* MOBILE ATTACHMENT */}
            {/* =================================================
    RESPONSIVE MESSAGE ROW
    ================================================= */}

            <div className="flex w-full min-w-0 items-center gap-0 px-1.5 py-1.5">
              {/* MOBILE ATTACHMENT */}
              <div className="relative shrink-0">
                {/* PHOTO INPUT */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    onFileSelect(event);
                    setAttachmentMenuOpen(false);
                  }}
                />

                {/* PDF INPUT */}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    onFileSelect(event);
                    setAttachmentMenuOpen(false);
                  }}
                />

                {/* PAPERCLIP */}
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentMenuOpen((current) => !current);
                    setEmojiPickerOpen(false);
                    setStickerPickerOpen(false);
                    setGifPickerOpen(false);
                  }}
                  aria-label="Add attachment"
                  aria-expanded={attachmentMenuOpen}
                  className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        text-neutral-500
        transition
        active:scale-90
        md:hidden
      "
                >
                  <Paperclip size={22} strokeWidth={1.9} />
                </button>

                {/* ATTACHMENT MENU */}
                {attachmentMenuOpen && (
                  <div
                    className="
          absolute
          bottom-12
          left-0
          z-[99999]
          w-48
          overflow-hidden
          rounded-2xl
          border
          border-neutral-200
          bg-white
          p-1.5
          shadow-2xl
          dark:border-neutral-700
          dark:bg-neutral-900
          md:hidden
        "
                  >
                    {/* PHOTO */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentMenuOpen(false);
                        imageInputRef.current?.click();
                      }}
                      className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            transition
            hover:bg-neutral-100
            active:scale-[0.98]
            dark:hover:bg-neutral-800
          "
                    >
                      <div
                        className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-purple-100
              text-purple-600
              dark:bg-purple-950
              dark:text-purple-400
            "
                      >
                        <ImageIcon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                          Photo
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Choose an image
                        </p>
                      </div>
                    </button>

                    {/* PDF */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentMenuOpen(false);
                        pdfInputRef.current?.click();
                      }}
                      className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            transition
            hover:bg-neutral-100
            active:scale-[0.98]
            dark:hover:bg-neutral-800
          "
                    >
                      <div
                        className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-red-100
              text-red-500
              dark:bg-red-950
              dark:text-red-400
            "
                      >
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                          PDF
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Share a document
                        </p>
                      </div>
                    </button>

                    {/* GIF */}
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentMenuOpen(false);
                        setEmojiPickerOpen(false);
                        setStickerPickerOpen(false);
                        setGifPickerOpen(true);
                      }}
                      className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            transition
            hover:bg-neutral-100
            active:scale-[0.98]
            dark:hover:bg-neutral-800
          "
                    >
                      <div
                        className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-[10px]
              font-bold
              text-blue-600
              dark:bg-blue-950
              dark:text-blue-400
            "
                      >
                        GIF
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                          GIF
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Search GIFs
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* DESKTOP EMOJI */}
              <button
                type="button"
                onClick={handleEmojiButtonClick}
                aria-label="Open emoji picker"
                aria-expanded={emojiPickerOpen}
                className={`
      mb-0.5
      hidden
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      transition
      active:scale-95
      md:flex
      ${
        emojiPickerOpen
          ? "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
          : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      }
    `}
              >
                <Smile size={21} strokeWidth={1.8} />
              </button>

              {/* DESKTOP STICKER */}
              <button
                type="button"
                onClick={handleStickerButtonClick}
                aria-label="Open sticker picker"
                aria-expanded={stickerPickerOpen}
                className={`
      mb-0.5
      hidden
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      transition
      active:scale-95
      md:flex
      ${
        stickerPickerOpen
          ? "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
          : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      }
    `}
              >
                <Sticker size={20} strokeWidth={1.8} />
              </button>

              {/* MESSAGE INPUT */}
              <textarea
                ref={textAreaRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={1}
                maxLength={5000}
                placeholder="Message"
                className="
      min-w-0
      flex-1
      resize-none
      border-0
      bg-transparent
      px-2
      py-2.5
      text-[16px]
      leading-5
      text-neutral-900
      outline-none
      placeholder:text-neutral-400
      dark:text-white
      dark:placeholder:text-neutral-500
    "
              />

              {/* SEND */}
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
      md:hidden
      ${
        canSend
          ? "bg-purple-600 shadow-md shadow-purple-600/20"
          : "bg-neutral-300 dark:bg-neutral-800"
      }
    `}
              >
                <Send size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* =================================================
                DESKTOP TOOLBAR
            ================================================= */}

            <div
              className="
                hidden
                items-center
                justify-between
                px-2
                pb-1.5
                pt-0.5
                md:flex
              "
            >
              <div className="flex items-center">
                {/* IMAGE */}
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

                {/* PDF */}
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

              {/* DESKTOP SEND */}
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
                      ? "bg-purple-600 shadow-md shadow-purple-600/20 hover:bg-purple-500"
                      : "bg-neutral-300 shadow-none dark:bg-neutral-800"
                  }
                `}
              >
                <Send size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="mt-1 md:mt-4" />
        </div>
      </div>

      {/* GIF PICKER */}

      <VibeGifPicker
        open={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={handleGifSelect}
      />
    </>
  );
};

export default VibeComposer;
