import { ArrowLeft, Send, UserRound } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import type { Conversation, Message } from "../../api/messageApi";

import ChatMessagesSkeleton from "./ChatMessagesSkeleton";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId?: number;
  loading?: boolean;
  sending?: boolean;
  onBack: () => void;
  onSend: (content: string) => Promise<void>;
}

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  loading = false,
  sending = false,
  onBack,
  onSend,
}: ChatWindowProps) => {
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    if (loading) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const content = input.trim();

    if (!content || sending) {
      return;
    }

    setInput("");

    try {
      await onSend(content);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Restore text if sending failed
      setInput(content);
    }
  };

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) {
      return "Today";
    }

    if (isSameDay(date, yesterday)) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="
        flex
        h-[100dvh]
        max-h-[100dvh]
        min-h-0
        w-full
        flex-1
        flex-col
        overflow-hidden
        bg-[#f7f7f7]
        text-slate-900
        dark:bg-[#0b0b0b]
        dark:text-white
      "
    >
      {/* ================================================= */}
      {/* FIXED / STICKY CHAT HEADER */}
      {/* ================================================= */}

      <header
        className="
          sticky
          top-0
          z-30
          flex
          min-h-[64px]
          shrink-0
          items-center
          gap-2.5
          border-b
          border-slate-200
          bg-white
          px-3
          pt-[env(safe-area-inset-top)]
          shadow-[0_1px_3px_rgba(0,0,0,0.04)]
          dark:border-neutral-800
          dark:bg-[#171717]
          dark:shadow-none
        "
      >
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-slate-600
            transition-colors
            active:scale-95
            hover:bg-slate-100
            hover:text-slate-900
            dark:text-neutral-300
            dark:hover:bg-neutral-900
            dark:hover:text-white
          "
        >
          <ArrowLeft size={21} strokeWidth={2.2} />
        </button>

        {/* Avatar */}
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-violet-50
            ring-1
            ring-violet-100
            dark:bg-violet-500/10
            dark:ring-violet-500/20
          "
        >
          {conversation.otherProfileImage ? (
            <img
              src={conversation.otherProfileImage}
              alt={conversation.otherUserName}
              className="
                h-full
                w-full
                object-cover
              "
            />
          ) : (
            <UserRound
              size={19}
              strokeWidth={2}
              className="
                text-violet-600
                dark:text-violet-400
              "
            />
          )}
        </div>

        {/* User information */}
        <div className="min-w-0 flex-1">
          <h2
            className="
              truncate
              text-[14px]
              font-semibold
              leading-5
              text-slate-900
              dark:text-white
            "
          >
            {conversation.otherUserName}
          </h2>

          {conversation.otherUsername && (
            <p
              className="
                truncate
                text-[11px]
                leading-4
                text-slate-500
                dark:text-neutral-400
              "
            >
              @{conversation.otherUsername}
            </p>
          )}
        </div>
      </header>

      {/* ================================================= */}
      {/* MESSAGE AREA */}
      {/* ================================================= */}

      <main
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-3
          py-4
          sm:px-5
          sm:py-5
        "
      >
        {loading ? (
          <div className="mx-auto w-full max-w-3xl">
            <ChatMessagesSkeleton />
          </div>
        ) : messages.length === 0 ? (
          /* ============================================ */
          /* EMPTY CHAT */
          /* ============================================ */

          <div className="flex h-full items-center justify-center px-5">
            <div className="max-w-xs text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-50
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-400
                "
              >
                <Send size={21} strokeWidth={2} />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Start the conversation
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-neutral-500
                "
              >
                Send a message to {conversation.otherUserName}.
              </p>
            </div>
          </div>
        ) : (
          /* ============================================ */
          /* MESSAGES */
          /* ============================================ */

          <div
            className="
              mx-auto
              flex
              w-full
              max-w-3xl
              flex-col
              gap-1
            "
          >
            {messages.map((message, index) => {
              const isMine =
                currentUserId !== undefined &&
                message.senderId === currentUserId;

              const previousMessage = messages[index - 1];

              const isSameSender =
                !!previousMessage &&
                previousMessage.senderId === message.senderId;

              const showDateSeparator =
                !previousMessage ||
                !isSameDay(
                  new Date(message.createdAt),
                  new Date(previousMessage.createdAt),
                );

              return (
                <div key={message.id}>
                  {/* DATE */}
                  {showDateSeparator && (
                    <div className="my-4 flex items-center justify-center">
                      <span
                        className="
                            rounded-full
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-1
                            text-[10px]
                            font-semibold
                            text-slate-500
                            shadow-sm
                            dark:border-neutral-800
                            dark:bg-[#171717]
                            dark:text-neutral-400
                            dark:shadow-none
                          "
                      >
                        {formatDateSeparator(message.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* MESSAGE ROW */}
                  <div
                    className={`
                        flex
                        w-full
                        ${isMine ? "justify-end" : "justify-start"}
                        ${
                          isSameSender && !showDateSeparator
                            ? "mt-0.5"
                            : "mt-2.5"
                        }
                      `}
                  >
                    <div
                      className={`
                          flex
                          max-w-[86%]
                          items-end
                          gap-1.5
                          sm:max-w-[70%]
                          ${isMine ? "flex-row-reverse" : "flex-row"}
                        `}
                    >
                      {/* OTHER USER AVATAR */}
                      {!isMine && !isSameSender ? (
                        <div
                          className="
                              h-7
                              w-7
                              shrink-0
                              overflow-hidden
                              rounded-full
                              bg-violet-50
                              ring-1
                              ring-violet-100
                              dark:bg-violet-500/10
                              dark:ring-violet-500/20
                            "
                        >
                          {conversation.otherProfileImage ? (
                            <img
                              src={conversation.otherProfileImage}
                              alt={conversation.otherUserName}
                              className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserRound
                                size={14}
                                className="
                                    text-violet-600
                                    dark:text-violet-400
                                  "
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-7 shrink-0" />
                      )}

                      {/* BUBBLE */}
                      <div
                        className={`
                            min-w-0
                            break-words
                            px-3.5
                            py-2
                            text-[14px]
                            leading-[1.45]
                            shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                            ${
                              isMine
                                ? `
                                  rounded-2xl
                                  rounded-br-md
                                  bg-violet-600
                                  text-white
                                `
                                : `
                                  rounded-2xl
                                  rounded-bl-md
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-800
                                  dark:border-neutral-800
                                  dark:bg-[#171717]
                                  dark:text-neutral-200
                                `
                            }
                          `}
                      >
                        {message.content}

                        {/* MESSAGE TIME */}
                        <div
                          className={`
                              mt-1
                              flex
                              justify-end
                              ${
                                isMine
                                  ? "text-violet-100"
                                  : "text-slate-400 dark:text-neutral-500"
                              }
                            `}
                        >
                          <span
                            className="
                                text-[9px]
                                leading-3
                              "
                          >
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} className="h-px" />
          </div>
        )}
      </main>

      {/* ================================================= */}
      {/* FIXED / STICKY MESSAGE INPUT */}
      {/* ================================================= */}

      <div
        className="
          sticky
          bottom-0
          z-30
          shrink-0
          border-t
          border-slate-200
          bg-white
          px-3
          pt-2.5
          pb-[max(0.625rem,env(safe-area-inset-bottom))]
          shadow-[0_-2px_8px_rgba(0,0,0,0.04)]
          dark:border-neutral-800
          dark:bg-[#171717]
          dark:shadow-none
          sm:px-5
          sm:pt-3
        "
      >
        <form
          onSubmit={handleSubmit}
          className="
            mx-auto
            flex
            w-full
            max-w-3xl
            items-end
            gap-2
          "
        >
          {/* INPUT BOX */}
          <div
            className="
              flex
              min-h-[44px]
              flex-1
              items-center
              rounded-[22px]
              border
              border-slate-200
              bg-slate-50
              px-4
              transition-colors
              focus-within:border-violet-400
              focus-within:bg-white
              dark:border-neutral-800
              dark:bg-black
              dark:focus-within:border-violet-500
              dark:focus-within:bg-black
            "
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`Message ${conversation.otherUserName}...`}
              disabled={sending}
              autoComplete="off"
              enterKeyHint="send"
              className="
                w-full
                bg-transparent
                py-2
                text-[14px]
                text-slate-900
                outline-none
                placeholder:text-slate-400
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:text-white
                dark:placeholder:text-neutral-500
              "
            />
          </div>

          {/* SEND */}
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="Send message"
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-violet-600
              text-white
              shadow-sm
              transition-all
              hover:bg-violet-700
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-45
            "
          >
            {sending ? (
              <span
                className="
                  h-[17px]
                  w-[17px]
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                "
              />
            ) : (
              <Send size={18} strokeWidth={2.1} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
