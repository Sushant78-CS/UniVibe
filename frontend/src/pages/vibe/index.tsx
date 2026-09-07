import {
  ArrowLeft,
  Check,
  MoreVertical,
  Pencil,
  Smile,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router";

import {
  getVibeMessages,
  sendVibeMessage,
  editVibeMessage,
  deleteVibeMessage,
  type VibeMediaType,
  type VibeMessage,
} from "../../api/vibeApi";

import { useVibeSocket } from "../../hooks/useVibeSocket";

import { uploadVibeMedia } from "../../api/vibeCloudinary";

import VibeComposer from "../../components/vibe/VibeComposer";
import VibeMessageMedia from "../../components/vibe/VibeMessageMedia";
import VibeMediaViewer from "../../components/vibe/VibeMediaViewer";
import ConfirmModal from "../../components/common/ConfirmModal";

import { compressImage } from "../../services/compressImage";

// =========================================================
// UI MESSAGE
// =========================================================

type UiVibeMessage = VibeMessage & {
  mine?: boolean;
  pending?: boolean;
  localMediaUrl?: string | null;
  localFileName?: string | null;
};

// =========================================================
// PAGE
// =========================================================

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
  // EDIT / DELETE STATE
  // =========================================================

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const [editingText, setEditingText] = useState("");

  const [actionMessageId, setActionMessageId] = useState<number | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);

  // =========================================================
  // REFS
  // =========================================================

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const previousMessageCountRef = useRef(0);

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
  // WEBSOCKET - NEW / UPDATED MESSAGE
  // =========================================================

  const handleIncomingMessage = (message: VibeMessage) => {
    setMessages((current) => {
      const existingIndex = current.findIndex((item) => item.id === message.id);

      // -----------------------------------------------------
      // EXISTING MESSAGE
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

  // =========================================================
  // WEBSOCKET - DELETE
  // =========================================================

  const handleDeletedMessage = (messageId: number) => {
    setMessages((current) =>
      current.filter((message) => message.id !== messageId),
    );

    if (editingMessageId === messageId) {
      setEditingMessageId(null);
      setEditingText("");
    }

    setActionMessageId(null);
  };

  // =========================================================
  // VIBE SOCKET
  // =========================================================

  const { connected } = useVibeSocket({
    token,
    onMessage: handleIncomingMessage,
    onDelete: handleDeletedMessage,
  });

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    const currentCount = messages.length;
    const previousCount = previousMessageCountRef.current;

    /*
     * Scroll on initial load and when a new message is added.
     * Editing or deleting an existing message does not scroll.
     */
    if (previousCount === 0 || currentCount > previousCount) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    previousMessageCountRef.current = currentCount;
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
        let fileToUpload = file;

        // ---------------------------------------------------
        // COMPRESS IMAGE
        // ---------------------------------------------------

        if (mediaType === "IMAGE") {
          try {
            fileToUpload = await compressImage(file);

            console.log(
              `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)} MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`,
            );
          } catch (compressionError) {
            console.error("Image compression failed:", compressionError);

            throw new Error("Failed to compress image.");
          }
        }

        // ---------------------------------------------------
        // UPLOAD
        // ---------------------------------------------------

        const uploadResult = await uploadVibeMedia(fileToUpload, mediaType);

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
      // MARK OUR MESSAGE
      // -----------------------------------------------------

      myMessageIdsRef.current.add(saved.id);

      // -----------------------------------------------------
      // RECONCILE
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

    const optimisticId = -Date.now();

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

    resetComposer();

    void sendInBackground(
      optimisticId,
      cleanText,
      file,
      mediaType,
      localPreview,
    );
  };

  // =========================================================
  // START EDIT
  // =========================================================

  const startEditing = (message: UiVibeMessage) => {
    if (!message.mine || message.pending || !message.content) {
      return;
    }

    setEditingMessageId(message.id);

    setEditingText(message.content);

    setActionMessageId(null);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const saveEditedMessage = async () => {
    if (editingMessageId === null || !editingText.trim() || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const currentToken = await getToken();

      if (!currentToken) {
        throw new Error("Authentication token unavailable.");
      }

      const updatedMessage = await editVibeMessage(
        currentToken,
        editingMessageId,
        editingText.trim(),
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === editingMessageId
            ? {
                ...message,
                ...updatedMessage,
                mine: true,
                pending: false,
              }
            : message,
        ),
      );

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Failed to edit Vibe message:", error);

      setError(
        error instanceof Error ? error.message : "Failed to edit message.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const openDeleteModal = (messageId: number) => {
    if (actionLoading) {
      return;
    }

    setActionMessageId(null);
    setDeleteMessageId(messageId);
  };

  const closeDeleteModal = () => {
    if (actionLoading) {
      return;
    }

    setDeleteMessageId(null);
  };

  const handleDeleteMessage = async () => {
    if (deleteMessageId === null || actionLoading) {
      return;
    }

    const messageId = deleteMessageId;

    try {
      setActionLoading(true);
      setError(null);

      const currentToken = await getToken();

      if (!currentToken) {
        throw new Error("Authentication token unavailable.");
      }

      await deleteVibeMessage(currentToken, messageId);

      // Remove immediately for the current user.
      // Other users are updated through the WebSocket delete event.
      setMessages((current) =>
        current.filter((message) => message.id !== messageId),
      );

      myMessageIdsRef.current.delete(messageId);

      setDeleteMessageId(null);
      setActionMessageId(null);
    } catch (error) {
      console.error("Failed to delete Vibe message:", error);

      setError(
        error instanceof Error ? error.message : "Failed to delete message.",
      );
    } finally {
      setActionLoading(false);
    }
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
    h-[64px]
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
      px-2.5
    "
        >
          {/* BACK */}
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
            <ArrowLeft size={21} strokeWidth={2} />
          </button>

          {/* TITLE */}
          <div className="ml-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1
                className="
            truncate
            text-[16px]
            font-semibold
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
            font-semibold
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
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-60
                "
                    />
                    <span
                      className="
                  relative
                  inline-flex
                  h-1.5
                  w-1.5
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

          {/* CONNECTION STATUS */}
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
        dark:text-neutral-400
      "
          >
            <span
              className={`
          h-1.5
          w-1.5
          rounded-full
          ${connected ? "bg-emerald-500" : "bg-neutral-400"}
        `}
            />

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
          max-md:bottom-[68px]
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

          {loadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-purple-600 dark:border-neutral-700 dark:border-t-purple-400" />
            </div>
          ) : messages.length === 0 ? (
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
            <div className="space-y-2.5">
              {messages.map((message) => {
                const mine = message.mine === true;
                const isEditing = editingMessageId === message.id;
                const menuOpen = actionMessageId === message.id;

                return (
                  <div
                    key={message.id}
                    className={`flex w-full ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        group relative w-fit max-w-[85%]
                        sm:max-w-[68%]
                        transition-all duration-200
                        ${
                          mine
                            ? `
                              rounded-2xl rounded-br-md
                              bg-gradient-to-br from-violet-600 to-purple-600
                              text-white shadow-sm shadow-purple-500/10
                            `
                            : `
                              rounded-2xl rounded-bl-md
                              border border-neutral-200/80 bg-white
                              text-neutral-900 shadow-sm
                              dark:border-neutral-800 dark:bg-neutral-900
                              dark:text-white
                            `
                        }
                      `}
                    >
                      {/* =================================================
                          MESSAGE HEADER
                      ================================================= */}

                      <div
                        className={`
                          flex items-center gap-2 px-3.5 pt-2.5
                          ${mine ? "justify-end" : "justify-start"}
                        `}
                      >
                        <div
                          className={`
                            flex h-6 w-6 shrink-0 items-center justify-center
                            rounded-full text-[9px] font-bold
                            ${
                              mine
                                ? "bg-white/15 text-white"
                                : "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                            }
                          `}
                        >
                          ?
                        </div>

                        <div
                          className={`
                            flex min-w-0 items-center gap-1.5
                            ${mine ? "flex-row-reverse" : ""}
                          `}
                        >
                          <span
                            className={`
                              text-[10px] font-semibold
                              ${
                                mine
                                  ? "text-white/90"
                                  : "text-neutral-600 dark:text-neutral-300"
                              }
                            `}
                          >
                            Anonymous
                          </span>

                          <span
                            className={`
                              h-1 w-1 rounded-full
                              ${mine ? "bg-white/40" : "bg-violet-400"}
                            `}
                          />

                          <span
                            className={`
                              text-[9px]
                              ${mine ? "text-white/55" : "text-neutral-400"}
                            `}
                          >
                            {formatTime(message.createdAt)}
                          </span>
                        </div>

                        {/* =================================================
                            MESSAGE MENU
                        ================================================= */}

                        {mine && !message.pending && !isEditing && (
                          <div className="relative ml-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                setActionMessageId(menuOpen ? null : message.id)
                              }
                              aria-label="Message options"
                              className="
                                  flex h-6 w-6 items-center justify-center
                                  rounded-full text-white/50 opacity-0
                                  transition-all duration-150
                                  hover:bg-white/10 hover:text-white
                                  group-hover:opacity-100 focus:opacity-100
                                "
                            >
                              <MoreVertical size={14} />
                            </button>

                            {menuOpen && (
                              <div
                                className="
                                    absolute right-0 top-7 z-50 w-32
                                    overflow-hidden rounded-xl border
                                    border-neutral-200 bg-white p-1 shadow-xl
                                    dark:border-neutral-700 dark:bg-neutral-900
                                  "
                              >
                                {message.content && (
                                  <button
                                    type="button"
                                    onClick={() => startEditing(message)}
                                    className="
                                        flex w-full items-center gap-2
                                        rounded-lg px-3 py-2 text-left text-xs
                                        text-neutral-700 transition
                                        hover:bg-neutral-100
                                        dark:text-neutral-200 dark:hover:bg-neutral-800
                                      "
                                  >
                                    <Pencil size={13} />
                                    Edit
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => openDeleteModal(message.id)}
                                  className="
                                      flex w-full items-center gap-2
                                      rounded-lg px-3 py-2 text-left text-xs
                                      text-red-500 transition
                                      hover:bg-red-50 disabled:opacity-50
                                      dark:hover:bg-red-950/40
                                    "
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* =================================================
                          MESSAGE CONTENT
                      ================================================= */}

                      {isEditing ? (
                        <div className="px-3.5 pb-3 pt-2">
                          <textarea
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            autoFocus
                            rows={3}
                            maxLength={5000}
                            className="
                              w-full resize-none rounded-xl border
                              border-white/20 bg-white/10 px-3 py-2.5
                              text-sm leading-5 text-white outline-none
                              placeholder:text-white/40 focus:border-white/40
                            "
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void saveEditedMessage();
                              }

                              if (event.key === "Escape") {
                                cancelEdit();
                              }
                            }}
                          />

                          <div className="mt-2 flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={actionLoading}
                              className="
                                rounded-lg px-2.5 py-1.5 text-[10px]
                                font-medium text-white/65 transition
                                hover:bg-white/10 hover:text-white
                              "
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => void saveEditedMessage()}
                              disabled={actionLoading || !editingText.trim()}
                              className="
                                flex items-center gap-1.5 rounded-lg bg-white
                                px-2.5 py-1.5 text-[10px] font-semibold
                                text-violet-700 transition hover:bg-white/90
                                disabled:cursor-not-allowed disabled:opacity-50
                              "
                            >
                              <Check size={12} />
                              {actionLoading ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {message.content && (
                            <p
                              className={`
                                px-3.5 pb-3 pt-2 whitespace-pre-wrap
                                break-words text-[14px] leading-[1.4]
                                ${
                                  mine
                                    ? "text-white"
                                    : "text-neutral-800 dark:text-neutral-100"
                                }
                              `}
                            >
                              {message.content}
                            </p>
                          )}

                          <div className={message.mediaUrl ? "px-2 pb-2" : ""}>
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
                          </div>
                        </>
                      )}

                      {message.pending && (
                        <div
                          className={`
                            px-3.5 pb-2.5 text-[9px]
                            ${mine ? "text-white/50" : "text-neutral-400"}
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
            max-md:bottom-[74px]
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
          DELETE CONFIRMATION
      ===================================================== */}

      <ConfirmModal
        open={deleteMessageId !== null}
        title="Delete message?"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={actionLoading}
        loadingText="Deleting..."
        onConfirm={() => void handleDeleteMessage()}
        onCancel={closeDeleteModal}
      />

      {/* =====================================================
          MEDIA VIEWER
      ===================================================== */}

      <VibeMediaViewer
        media={viewerMedia}
        onClose={() => setViewerMedia(null)}
      />
    </div>
  );
};

export default VibePage;
