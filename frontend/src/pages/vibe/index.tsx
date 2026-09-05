import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Send,
  Smile,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

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

/*
|--------------------------------------------------------------------------
| UI MESSAGE
|--------------------------------------------------------------------------
|
| The backend intentionally does not expose sender information.
| Therefore `mine` is a frontend-only property used to identify
| messages sent during the current session.
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

  const [showGifInput, setShowGifInput] = useState(false);

  const [gifUrl, setGifUrl] = useState("");

  const [token, setToken] = useState<string | null>(null);

  // =========================================================
  // REFS
  // =========================================================

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * IDs of messages sent by the current user.
   *
   * We cannot get sender information from backend because
   * Vibe is anonymous.
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
  // WEBSOCKET MESSAGE
  // =========================================================

  const handleIncomingMessage = (message: VibeMessage) => {
    setMessages((current) => {
      // =====================================================
      // MESSAGE ALREADY EXISTS
      // =====================================================

      const existingIndex = current.findIndex((item) => item.id === message.id);

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

      // =====================================================
      // NEW MESSAGE
      // =====================================================

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
    // GIF
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
  // GIF URL
  // =========================================================

  const addGifUrl = () => {
    const url = gifUrl.trim();

    if (!url) {
      return;
    }

    if (!url.startsWith("https://")) {
      setError("Please enter a valid GIF URL.");

      return;
    }

    setSelectedFile(null);
    setSelectedMediaType("GIF");
    setPreviewUrl(url);

    setGifUrl("");
    setShowGifInput(false);
    setError(null);
  };

  // =========================================================
  // RESET COMPOSER
  // =========================================================

  const resetComposer = () => {
    setText("");
    setSelectedFile(null);
    setSelectedMediaType(null);
    setPreviewUrl(null);
    setGifUrl("");
    setShowGifInput(false);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
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

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
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

      // =====================================================
      // UPLOAD MEDIA
      // =====================================================

      if (file && mediaType) {
        const uploadResult = await uploadVibeMedia(file, mediaType);

        if (!uploadResult) {
          throw new Error("Media upload failed.");
        }

        mediaUrl = uploadResult.secure_url;
      }

      // =====================================================
      // GIF URL
      // =====================================================

      if (!file && localPreview && mediaType === "GIF") {
        mediaUrl = localPreview;
        finalMediaType = "GIF";
      }

      // =====================================================
      // SEND TO BACKEND
      // =====================================================

      const saved = await sendVibeMessage(currentToken, {
        content: messageText || null,
        mediaUrl,
        mediaType: finalMediaType,
      });

      // =====================================================
      // MARK AS MY MESSAGE
      // =====================================================

      myMessageIdsRef.current.add(saved.id);

      // =====================================================
      // RECONCILE OPTIMISTIC + WEBSOCKET MESSAGE
      // =====================================================

      setMessages((current) => {
        /*
         * Remove:
         *
         * 1. The optimistic message
         * 2. Any WebSocket copy of the same saved message
         *
         * Then add ONE final message.
         */

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

      // =====================================================
      // REMOVE FAILED OPTIMISTIC MESSAGE
      // =====================================================

      setMessages((current) =>
        current.filter((item) => item.id !== optimisticId),
      );

      setError(
        error instanceof Error ? error.message : "Failed to send message.",
      );
    } finally {
      // =====================================================
      // CLEAN LOCAL PREVIEW
      // =====================================================

      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const cleanText = text.trim();

    const file = selectedFile;

    const mediaType = selectedMediaType;

    const localPreview = previewUrl;

    const hasContent = cleanText.length > 0 || !!file || !!localPreview;

    if (!hasContent) {
      return;
    }

    setError(null);

    /*
     * -------------------------------------------------------
     * CREATE OPTIMISTIC MESSAGE
     * -------------------------------------------------------
     *
     * Negative IDs are temporary frontend-only IDs.
     */
    const optimisticId = -Date.now();

    const optimisticMessage: UiVibeMessage = {
      id: optimisticId,

      content: cleanText || null,

      /*
       * For images/GIFs, display the local
       * preview immediately.
       *
       * For PDFs we don't have a preview URL,
       * so the UI will show a PDF card.
       */
      mediaUrl: localPreview || null,

      mediaType: mediaType,

      createdAt: new Date().toISOString(),

      mine: true,

      pending: true,

      localMediaUrl: localPreview,

      localFileName: file?.name || null,
    };

    /*
     * Show user's message immediately.
     */
    setMessages((current) => [...current, optimisticMessage]);

    /*
     * -------------------------------------------------------
     * CLEAR UI IMMEDIATELY
     * -------------------------------------------------------
     *
     * The user is free to type another message.
     */
    resetComposer();

    /*
     * -------------------------------------------------------
     * BACKGROUND REQUEST
     * -------------------------------------------------------
     *
     * We intentionally DO NOT await this here.
     */
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
  // RENDER MEDIA
  // =========================================================

  const renderMedia = (message: UiVibeMessage) => {
    if (
      !message.mediaUrl &&
      !message.localMediaUrl &&
      message.mediaType !== "PDF"
    ) {
      return null;
    }

    const mediaUrl = message.localMediaUrl || message.mediaUrl;

    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------

    if (message.mediaType === "IMAGE") {
      if (!mediaUrl) {
        return null;
      }

      return (
        <div className="mt-3 overflow-hidden rounded-2xl">
          <img
            src={mediaUrl}
            alt="Anonymous shared image"
            className="
              max-h-[420px]
              w-full
              rounded-2xl
              object-contain
              bg-black/5
              dark:bg-white/5
            "
          />
        </div>
      );
    }

    // -------------------------------------------------------
    // GIF
    // -------------------------------------------------------

    if (message.mediaType === "GIF") {
      if (!mediaUrl) {
        return null;
      }

      return (
        <div className="mt-3 overflow-hidden rounded-2xl">
          <img
            src={mediaUrl}
            alt="Anonymous shared GIF"
            className="
              max-h-[420px]
              w-full
              rounded-2xl
              object-contain
              bg-black/5
              dark:bg-white/5
            "
          />
        </div>
      );
    }

    // -------------------------------------------------------
    // PDF
    // -------------------------------------------------------

    if (message.mediaType === "PDF") {
      /*
       * Optimistic PDF doesn't have a Cloudinary URL yet.
       */
      if (message.pending && !message.mediaUrl) {
        return (
          <div
            className="
              mt-3
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-purple-200
              bg-purple-50
              p-3
              dark:border-purple-900
              dark:bg-purple-950/30
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

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-purple-800
                  dark:text-purple-200
                "
              >
                {message.localFileName || "Shared PDF"}
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-purple-500
                  dark:text-purple-400
                "
              >
                Sending...
              </p>
            </div>
          </div>
        );
      }

      if (!message.mediaUrl) {
        return null;
      }

      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-3
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-neutral-200
            bg-white
            p-3
            transition
            hover:bg-neutral-100
            dark:border-neutral-700
            dark:bg-neutral-900
            dark:hover:bg-neutral-800
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
            <FileText size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-neutral-800
                dark:text-neutral-100
              "
            >
              Shared PDF
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-neutral-500
              "
            >
              Tap to open
            </p>
          </div>
        </a>
      );
    }

    return null;
  };

  // =========================================================
  // CAN SEND
  // =========================================================

  const canSend = text.trim().length > 0 || !!selectedFile || !!previewUrl;

  // =========================================================
  // COMPONENT
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
          FIXED HEADER
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

          {/* Vibe Avatar */}

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
            <span
              className="
                text-base
                font-bold
              "
            >
              V
            </span>
          </div>

          {/* Header text */}

          <div
            className="
              ml-3
              min-w-0
              flex-1
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
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
          bottom-[78px]
          overflow-hidden
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
            <div
              className="
                  mb-5
                  flex
                  justify-center
                "
            >
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
               EMPTY STATE
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

              <h2
                className="
                  mt-5
                  text-base
                  font-bold
                "
              >
                Nothing here yet
              </h2>

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
                          max-w-[82%]
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
                      {/* =================================
                            MESSAGE HEADER
                        ================================= */}

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
                                    ${
                                      mine
                                        ? "text-white/65"
                                        : "text-neutral-400"
                                    }
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

                      {/* =================================
                            MESSAGE CONTENT
                        ================================= */}

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

                      {/* =================================
                            MEDIA
                        ================================= */}

                      {renderMedia(message)}

                      {/* =================================
                            PENDING
                        ================================= */}

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
            bottom-[84px]
            left-3
            right-3
            z-40
            mx-auto
            max-w-2xl
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
            <span className="flex-1">{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
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
          FIXED COMPOSER
      ===================================================== */}

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
            pb-[max(8px,env(safe-area-inset-bottom))]
            pt-2
            sm:px-3
          "
        >
          {/* =================================================
              MEDIA PREVIEW
          ================================================= */}

          {previewUrl || selectedMediaType === "PDF" ? (
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
              <div
                className="
                  relative
                  flex
                  items-center
                  gap-3
                "
              >
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
                      <p
                        className="
                          truncate
                          text-xs
                          font-semibold
                        "
                      >
                        {selectedFile?.name || "Shared PDF"}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-neutral-500
                        "
                      >
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
                  onClick={removeSelectedMedia}
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
          ) : null}

          {/* =================================================
              GIF URL
          ================================================= */}

          {showGifInput && (
            <div
              className="
                mb-2
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-neutral-200
                bg-neutral-100
                p-2
                dark:border-neutral-800
                dark:bg-neutral-900
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
                  rounded-xl
                  bg-purple-100
                  text-[9px]
                  font-bold
                  text-purple-600
                  dark:bg-purple-950
                  dark:text-purple-300
                "
              >
                GIF
              </div>

              <input
                type="url"
                value={gifUrl}
                onChange={(event) => setGifUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addGifUrl();
                  }
                }}
                placeholder="Paste GIF URL..."
                className="
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  px-1
                  py-2
                  text-xs
                  outline-none
                  placeholder:text-neutral-400
                  focus:ring-0
                "
              />

              <button
                type="button"
                onClick={addGifUrl}
                className="
                  rounded-xl
                  bg-purple-600
                  px-3
                  py-2
                  text-[11px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-purple-500
                  active:scale-95
                "
              >
                Add
              </button>

              <button
                type="button"
                onClick={() => setShowGifInput(false)}
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-neutral-500
                  hover:bg-neutral-200
                  dark:hover:bg-neutral-800
                "
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* =================================================
              COMPOSER
          ================================================= */}

          <form onSubmit={handleSubmit}>
            <div
              className="
                flex
                items-end
                gap-2
              "
            >
              {/* ===========================================
                  WHATSAPP STYLE INPUT
              =========================================== */}

              <div
                className="
                  flex
                  min-h-[50px]
                  flex-1
                  items-end
                  rounded-[28px]
                  border
                  border-neutral-200
                  bg-neutral-100
                  px-1.5
                  py-1.5
                  shadow-sm
                  transition
                  focus-within:border-purple-400
                  focus-within:bg-white
                  dark:border-neutral-800
                  dark:bg-neutral-900
                  dark:focus-within:border-purple-700
                  dark:focus-within:bg-neutral-900
                "
              >
                {/* Emoji */}

                <button
                  type="button"
                  onClick={() => {
                    setText((current) => `${current}😊`);
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

                {/* Text */}

                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();

                      if (canSend) {
                        event.currentTarget.form?.requestSubmit();
                      }
                    }
                  }}
                  rows={1}
                  maxLength={5000}
                  placeholder="Say something anonymously..."
                  className="
                    max-h-28
                    min-h-9
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

                {/* =========================================
                    IMAGE
                ========================================= */}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label="Add image"
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
                    hover:text-purple-600
                    active:scale-95
                    dark:hover:bg-neutral-800
                    dark:hover:text-purple-400
                  "
                >
                  <ImageIcon size={19} strokeWidth={1.8} />
                </button>

                {/* =========================================
                    PDF
                ========================================= */}

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  aria-label="Add PDF"
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
                    hover:text-purple-600
                    active:scale-95
                    dark:hover:bg-neutral-800
                    dark:hover:text-purple-400
                  "
                >
                  <FileText size={19} strokeWidth={1.8} />
                </button>

                {/* =========================================
                    GIF
                ========================================= */}

                <button
                  type="button"
                  onClick={() => setShowGifInput((value) => !value)}
                  aria-label="Add GIF"
                  className="
                    mb-0.5
                    flex
                    h-9
                    w-9
                    shrink-0
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

              {/* ===========================================
                  SEND BUTTON
              =========================================== */}

              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
                className={`
                  flex
                  h-[50px]
                  w-[50px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  shadow-lg
                  transition-all
                  active:scale-90
                  ${
                    canSend
                      ? `
                        bg-purple-600
                        shadow-purple-600/25
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
                <Send size={19} strokeWidth={2.2} />
              </button>
            </div>

            {/* Small hint */}

            <div
              className="
                px-3
                pt-1
                text-[9px]
                text-neutral-400
              "
            >
              Enter to send • Shift + Enter for a new line
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VibePage;
