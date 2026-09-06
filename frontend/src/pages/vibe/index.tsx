import { ArrowLeft, Smile, Wifi, WifiOff, X } from "lucide-react";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router";

import {
  getVibeMessages,
  sendVibeMessage,
  type VibeMediaType,
  type VibeMessage,
} from "../../api/vibe";

import { useVibeSocket } from "../../hooks/useVibeSocket";

import { uploadVibeMedia } from "../../api/vibeCloudinary";

import VibeComposer from "../../components/vibe/VibeComposer";

import VibeMessageMedia from "../../components/vibe/VibeMessageMedia";

import VibeMediaViewer from "../../components/vibe/VibeMediaViewer";

/*
|--------------------------------------------------------------------------
| UI MESSAGE
|--------------------------------------------------------------------------
|
| The backend intentionally does not expose sender information.
| `mine` is therefore used by the frontend to identify messages
| sent by the current user.
|
*/

type UiVibeMessage = VibeMessage & {
  mine?: boolean;
  pending?: boolean;
  localMediaUrl?: string | null;
  localFileName?: string | null;
};

const VibePage = () => {
  const navigate = useNavigate();

  const { getToken } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [messages, setMessages] = useState<UiVibeMessage[]>([]);

  const [text, setText] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [selectedMediaType, setSelectedMediaType] =
    useState<VibeMediaType | null>(null);

  const [loadingMessages, setLoadingMessages] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [viewerMedia, setViewerMedia] = useState<{
    url: string;
    type: "IMAGE" | "GIF";
  } | null>(null);

  // =========================================================
  // REFS
  // =========================================================

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /*
   * IDs of messages sent by the current user.
   *
   * Since Vibe is anonymous, this lets the frontend
   * remember which WebSocket messages belong to us.
   */

  const myMessageIdsRef = useRef<Set<number>>(new Set());

  // =========================================================
  // LOAD CLERK TOKEN
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadToken = async () => {
      try {
        const currentToken = await getToken();

        if (mounted) {
          setToken(currentToken);
        }
      } catch (error) {
        console.error("Failed to get Clerk token:", error);
      }
    };

    loadToken();

    return () => {
      mounted = false;
    };
  }, [getToken]);

  // =========================================================
  // LOAD INITIAL MESSAGES
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);

        const currentToken = await getToken();

        if (!currentToken) {
          throw new Error("Authentication token unavailable.");
        }

        const data = await getVibeMessages(currentToken, 50);

        if (mounted) {
          const mappedMessages: UiVibeMessage[] = [...data]
            .reverse()
            .map((message) => ({
              ...message,

              mine:
                message.mine === true ||
                myMessageIdsRef.current.has(message.id),
            }));

          setMessages(mappedMessages);
        }
      } catch (error) {
        console.error("Failed to load Vibe messages:", error);

        if (mounted) {
          setError("Unable to load Vibe messages.");
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [getToken]);

  // =========================================================
  // WEBSOCKET
  // =========================================================

  const handleIncomingMessage = (message: VibeMessage) => {
    setMessages((current) => {
      const existingIndex = current.findIndex((item) => item.id === message.id);

      // -----------------------------------------------------
      // MESSAGE ALREADY EXISTS
      // -----------------------------------------------------

      if (existingIndex !== -1) {
        const updated = [...current];

        updated[existingIndex] = {
          ...updated[existingIndex],
          ...message,

          mine:
            message.mine === true || myMessageIdsRef.current.has(message.id),

          pending: false,
        };

        return updated;
      }

      // -----------------------------------------------------
      // NEW MESSAGE
      // -----------------------------------------------------

      return [
        ...current,
        {
          ...message,

          mine:
            message.mine === true || myMessageIdsRef.current.has(message.id),
        },
      ];
    });
  };

  const { connected } = useVibeSocket({
    token,
    onMessage: handleIncomingMessage,
  });

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================================================
  // FILE HANDLING
  // =========================================================

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    // -------------------------------------------------------
    // PDF
    // -------------------------------------------------------

    if (file.type === "application/pdf") {
      if (file.size > 10 * 1024 * 1024) {
        setError("PDF must be smaller than 10 MB.");

        event.target.value = "";

        return;
      }

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);

      setSelectedMediaType("PDF");

      setPreviewUrl(null);

      return;
    }

    // -------------------------------------------------------
    // GIF FILE
    // -------------------------------------------------------

    if (file.type === "image/gif") {
      if (file.size > 10 * 1024 * 1024) {
        setError("GIF must be smaller than 10 MB.");

        event.target.value = "";

        return;
      }

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(file);

      setSelectedFile(file);

      setSelectedMediaType("GIF");

      setPreviewUrl(objectUrl);

      return;
    }

    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------

    if (file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be smaller than 10 MB.");

        event.target.value = "";

        return;
      }

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(file);

      setSelectedFile(file);

      setSelectedMediaType("IMAGE");

      setPreviewUrl(objectUrl);

      return;
    }

    event.target.value = "";

    setError("Only images, GIFs and PDFs are supported.");
  };

  // =========================================================
  // REMOVE SELECTED MEDIA
  // =========================================================

  const removeSelectedMedia = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);

    setSelectedMediaType(null);

    setPreviewUrl(null);
  };

  // =========================================================
  // RESET COMPOSER
  // =========================================================

  const resetComposer = () => {
    setText("");

    setSelectedFile(null);

    setSelectedMediaType(null);

    setPreviewUrl(null);
  };

  // =========================================================
  // SEND MESSAGE IN BACKGROUND
  // =========================================================

  const sendInBackground = async (
    optimisticId: number,
    messageText: string,
    file: File | null,
    mediaType: VibeMediaType | null,
    localPreview: string | null,
  ) => {
    try {
      const currentToken = await getToken();

      if (!currentToken) {
        throw new Error("Authentication token unavailable.");
      }

      let mediaUrl: string | null = null;

      let finalMediaType = mediaType;

      // -----------------------------------------------------
      // CLOUDINARY UPLOAD
      // -----------------------------------------------------

      if (file && mediaType) {
        const uploadResult = await uploadVibeMedia(file, mediaType);

        if (!uploadResult) {
          throw new Error("Media upload failed.");
        }

        mediaUrl = uploadResult.secure_url;
      }

      // -----------------------------------------------------
      // GIPHY GIF
      // -----------------------------------------------------

      if (!file && localPreview && mediaType === "GIF") {
        mediaUrl = localPreview;

        finalMediaType = "GIF";
      }

      // -----------------------------------------------------
      // SEND TO BACKEND
      // -----------------------------------------------------

      const saved = await sendVibeMessage(currentToken, {
        content: messageText || null,

        mediaUrl,

        mediaType: finalMediaType,
      });

      // -----------------------------------------------------
      // MARK AS OUR MESSAGE
      // -----------------------------------------------------

      myMessageIdsRef.current.add(saved.id);

      // -----------------------------------------------------
      // RECONCILE OPTIMISTIC MESSAGE
      // -----------------------------------------------------

      setMessages((current) => {
        const withoutDuplicates = current.filter(
          (item) => item.id !== optimisticId && item.id !== saved.id,
        );

        return [
          ...withoutDuplicates,
          {
            ...saved,

            mine: true,

            pending: false,
          },
        ];
      });
    } catch (error) {
      console.error("Failed to send Vibe message:", error);

      setMessages((current) =>
        current.filter((item) => item.id !== optimisticId),
      );

      setError(
        error instanceof Error ? error.message : "Failed to send message.",
      );
    } finally {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSubmit = () => {
    const cleanText = text.trim();

    const file = selectedFile;

    const mediaType = selectedMediaType;

    const localPreview = previewUrl;

    const hasContent = cleanText.length > 0 || !!file || !!localPreview;

    if (!hasContent) {
      return;
    }

    setError(null);

    // -------------------------------------------------------
    // OPTIMISTIC ID
    // -------------------------------------------------------

    const optimisticId = -Date.now();

    // -------------------------------------------------------
    // OPTIMISTIC MESSAGE
    // -------------------------------------------------------

    const optimisticMessage: UiVibeMessage = {
      id: optimisticId,

      content: cleanText || null,

      mediaUrl: localPreview || null,

      mediaType,

      createdAt: new Date().toISOString(),

      mine: true,

      pending: true,

      localMediaUrl: localPreview,

      localFileName: file?.name || null,
    };

    setMessages((current) => [...current, optimisticMessage]);

    // -------------------------------------------------------
    // CLEAR COMPOSER IMMEDIATELY
    // -------------------------------------------------------

    resetComposer();

    // -------------------------------------------------------
    // SEND WITHOUT BLOCKING UI
    // -------------------------------------------------------

    void sendInBackground(
      optimisticId,
      cleanText,
      file,
      mediaType,
      localPreview,
    );
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================================================
  // CAN SEND
  // =========================================================

  const canSend = text.trim().length > 0 || !!selectedFile || !!previewUrl;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className="
        fixed
        inset-0
        overflow-hidden
        bg-neutral-50
        text-neutral-900
        dark:bg-black
        dark:text-white
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          fixed
          inset-x-0
          top-0
          z-50
          h-[68px]
          border-b
          border-neutral-200/70
          bg-white/95
          backdrop-blur-xl
          dark:border-neutral-800/70
          dark:bg-black/90
        "
      >
        <div
          className="
            mx-auto
            flex
            h-full
            w-full
            max-w-2xl
            items-center
            px-3
          "
        >
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-neutral-600
              transition
              hover:bg-neutral-100
              hover:text-neutral-900
              active:scale-95
              dark:text-neutral-300
              dark:hover:bg-neutral-900
              dark:hover:text-white
            "
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>

          {/* Vibe avatar */}
          <div
            className="
              ml-1
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-purple-500
              via-violet-600
              to-indigo-600
              text-white
              shadow-md
              shadow-purple-500/20
            "
          >
            <span className="text-base font-bold">V</span>
          </div>

          {/* Header info */}
          <div
            className="
              ml-3
              min-w-0
              flex-1
            "
          >
            <div className="flex items-center gap-2">
              <h1
                className="
                  truncate
                  text-[15px]
                  font-bold
                  tracking-tight
                  text-neutral-900
                  dark:text-white
                "
              >
                Vibe
              </h1>

              <span
                className="
                  rounded-full
                  bg-purple-100
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-purple-600
                  dark:bg-purple-950
                  dark:text-purple-300
                "
              >
                Anonymous
              </span>
            </div>

            <div
              className="
                mt-0.5
                flex
                items-center
                gap-1.5
                text-[11px]
                text-neutral-500
                dark:text-neutral-400
              "
            >
              {connected ? (
                <>
                  <span
                    className="
                      relative
                      flex
                      h-2
                      w-2
                    "
                  >
                    <span
                      className="
                        absolute
                        inline-flex
                        h-full
                        w-full
                        animate-ping
                        rounded-full
                        bg-emerald-400
                        opacity-50
                      "
                    />

                    <span
                      className="
                        relative
                        inline-flex
                        h-2
                        w-2
                        rounded-full
                        bg-emerald-500
                      "
                    />
                  </span>

                  <span>Live now</span>
                </>
              ) : (
                <>
                  <WifiOff size={11} />

                  <span>Connecting...</span>
                </>
              )}
            </div>
          </div>

          {/* Desktop connection */}
          <div
            className="
              hidden
              items-center
              gap-1.5
              rounded-full
              border
              border-neutral-200
              bg-neutral-50
              px-2.5
              py-1.5
              text-[10px]
              font-medium
              text-neutral-500
              sm:flex
              dark:border-neutral-800
              dark:bg-neutral-900
            "
          >
            {connected ? (
              <Wifi size={12} className="text-emerald-500" />
            ) : (
              <Wifi size={12} />
            )}

            {connected ? "Connected" : "Offline"}
          </div>
        </div>
      </header>

      {/* =====================================================
          MESSAGE AREA
      ===================================================== */}

      <main
        className="
          absolute
          inset-x-0
          top-[68px]
          bottom-[148px]
          overflow-hidden
          sm:bottom-[145px]
        "
      >
        <div
          className="
            mx-auto
            h-full
            w-full
            max-w-2xl
            overflow-y-auto
            overscroll-contain
            px-3
            pb-5
            pt-4
            sm:px-4
          "
        >
          {/* =================================================
              INTRO
          ================================================= */}

          {!loadingMessages && messages.length > 0 && (
            <div className="mb-5 flex justify-center">
              <div
                className="
                    max-w-[300px]
                    rounded-2xl
                    border
                    border-purple-100
                    bg-purple-50
                    px-4
                    py-2.5
                    text-center
                    text-[11px]
                    leading-4
                    text-purple-700
                    dark:border-purple-950
                    dark:bg-purple-950/40
                    dark:text-purple-300
                  "
              >
                Messages in Vibe are anonymous. Be kind, respectful and have
                fun.
              </div>
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingMessages ? (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
              "
            >
              <div
                className="
                  text-center
                  text-xs
                  text-neutral-500
                "
              >
                Loading Vibe...
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* ===============================================
               EMPTY
            =============================================== */

            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-purple-500
                  to-indigo-600
                  text-white
                  shadow-lg
                  shadow-purple-500/20
                "
              >
                <Smile size={30} />
              </div>

              <h2 className="mt-5 text-base font-bold">Nothing here yet</h2>

              <p
                className="
                  mt-1.5
                  max-w-[260px]
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >
                Drop an anonymous message and start the conversation.
              </p>
            </div>
          ) : (
            /* ===============================================
               MESSAGES
            =============================================== */

            <div className="space-y-2.5">
              {messages.map((message) => {
                const mine = message.mine === true;

                return (
                  <div
                    key={message.id}
                    className={`
                      flex
                      w-full
                      ${mine ? "justify-end" : "justify-start"}
                    `}
                  >
                    <div
                      className={`
                        group
                        relative
                        max-w-[88%]
                        sm:max-w-[70%]
                        ${
                          mine
                            ? `
                              rounded-[20px]
                              rounded-br-[6px]
                              bg-gradient-to-br
                              from-purple-600
                              to-violet-700
                              text-white
                              shadow-md
                              shadow-purple-500/10
                            `
                            : `
                              rounded-[20px]
                              rounded-bl-[6px]
                              border
                              border-neutral-200
                              bg-white
                              text-neutral-900
                              shadow-sm
                              dark:border-neutral-800
                              dark:bg-neutral-950
                              dark:text-white
                            `
                        }
                        px-4
                        py-3
                        transition
                      `}
                    >
                      {/* =================================================
                          MESSAGE HEADER
                      ================================================= */}

                      <div
                        className={`
                          flex
                          items-center
                          justify-between
                          gap-5
                          ${mine ? "flex-row-reverse" : ""}
                        `}
                      >
                        <div
                          className={`
                            flex
                            items-center
                            gap-2
                            ${mine ? "flex-row-reverse" : ""}
                          `}
                        >
                          {/* Avatar */}
                          <div
                            className={`
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              text-[10px]
                              font-bold
                              ${
                                mine
                                  ? `
                                    bg-white/20
                                    text-white
                                  `
                                  : `
                                    bg-gradient-to-br
                                    from-purple-500
                                    to-indigo-600
                                    text-white
                                  `
                              }
                            `}
                          >
                            ?
                          </div>

                          <div
                            className={`
                              min-w-0
                              ${mine ? "text-right" : ""}
                            `}
                          >
                            <p
                              className={`
                                truncate
                                text-[11px]
                                font-semibold
                                ${
                                  mine
                                    ? "text-white"
                                    : `
                                      text-neutral-700
                                      dark:text-neutral-200
                                    `
                                }
                              `}
                            >
                              Anonymous
                            </p>

                            <div
                              className={`
                                mt-0.5
                                flex
                                items-center
                                gap-1
                                ${mine ? "justify-end" : ""}
                              `}
                            >
                              <span
                                className={`
                                  h-1
                                  w-1
                                  rounded-full
                                  ${mine ? "bg-white/60" : "bg-purple-400"}
                                `}
                              />

                              <span
                                className={`
                                  text-[9px]
                                  ${mine ? "text-white/65" : "text-neutral-400"}
                                `}
                              >
                                Vibe
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <span
                          className={`
                            shrink-0
                            text-[9px]
                            ${mine ? "text-white/60" : "text-neutral-400"}
                          `}
                        >
                          {formatTime(message.createdAt)}
                        </span>
                      </div>

                      {/* =================================================
                          TEXT
                      ================================================= */}

                      {message.content && (
                        <p
                          className={`
                            mt-2.5
                            whitespace-pre-wrap
                            break-words
                            text-[14px]
                            leading-5
                            ${
                              mine
                                ? "text-white"
                                : `
                                  text-neutral-800
                                  dark:text-neutral-100
                                `
                            }
                          `}
                        >
                          {message.content}
                        </p>
                      )}

                      {/* =================================================
                          MEDIA
                      ================================================= */}

                      <VibeMessageMedia
                        mediaUrl={message.mediaUrl}
                        localMediaUrl={message.localMediaUrl}
                        mediaType={message.mediaType}
                        pending={message.pending}
                        localFileName={message.localFileName}
                        onMediaClick={(url, type) => {
                          setViewerMedia({
                            url,
                            type,
                          });
                        }}
                      />

                      {/* =================================================
                          PENDING
                      ================================================= */}

                      {message.pending && (
                        <div
                          className={`
                            mt-2
                            text-[9px]
                            ${mine ? "text-white/55" : "text-neutral-400"}
                          `}
                        >
                          Sending...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            fixed
            bottom-[154px]
            left-3
            right-3
            z-40
            mx-auto
            max-w-2xl
            sm:bottom-[150px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-3
              py-2.5
              text-xs
              text-red-600
              shadow-lg
              dark:border-red-900
              dark:bg-red-950/80
              dark:text-red-400
            "
          >
            <span className="min-w-0 flex-1">{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-full
                hover:bg-red-100
                dark:hover:bg-red-900
              "
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          COMPOSER
      ===================================================== */}

      <VibeComposer
        text={text}
        setText={setText}
        selectedFile={selectedFile}
        selectedMediaType={selectedMediaType}
        previewUrl={previewUrl}
        onFileSelect={handleFileSelect}
        onRemoveMedia={removeSelectedMedia}
        onSend={handleSubmit}
        onGifSelect={(url) => {
          if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
          }

          setSelectedFile(null);

          setSelectedMediaType("GIF");

          setPreviewUrl(url);

          setError(null);
        }}
        canSend={canSend}
      />

      {/* =====================================================
          IMAGE / GIF VIEWER
      ===================================================== */}

      <VibeMediaViewer
        media={viewerMedia}
        onClose={() => setViewerMedia(null)}
      />
    </div>
  );
};

export default VibePage;
