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

  useEffect(() => {
    if (loading) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

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
      setInput(content);
    }
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      {/* ================================================= */}
      {/* FIXED CHAT HEADER */}
      {/* ================================================= */}

      <header
        className="
          flex
          h-[68px]
          shrink-0
          items-center
          gap-3
          border-b
          border-slate-200
          bg-white
          px-4
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-slate-900
            dark:text-slate-400
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Profile image */}
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
            bg-violet-100
            dark:bg-violet-500/10
          "
        >
          {conversation.otherProfileImage ? (
            <img
              src={conversation.otherProfileImage}
              alt={conversation.otherUserName}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound
              size={20}
              className="text-violet-600 dark:text-violet-400"
            />
          )}
        </div>

        {/* User information */}
        <div className="min-w-0">
          <h2
            className="
              truncate
              text-sm
              font-semibold
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
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              @{conversation.otherUsername}
            </p>
          )}
        </div>
      </header>

      {/* ================================================= */}
      {/* SCROLLABLE MESSAGE AREA */}
      {/* ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          py-5
          sm:px-6
        "
      >
        {loading ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-400
                "
              >
                <Send size={22} />
              </div>

              <p
                className="
                  mt-3
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
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Send a message to {conversation.otherUserName}.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            {messages.map((message, index) => {
              const isMine =
                currentUserId !== undefined &&
                message.senderId === currentUserId;

              const previousMessage = messages[index - 1];

              const isSameSender =
                previousMessage &&
                previousMessage.senderId === message.senderId;

              const showDateSeparator =
                !previousMessage ||
                !isSameDay(
                  new Date(message.createdAt),
                  new Date(previousMessage.createdAt),
                );

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="my-4 flex items-center justify-center">
                      <span
                        className="
              rounded-full
              bg-slate-200/80
              px-3
              py-1
              text-[11px]
              font-medium
              text-slate-600
              dark:bg-slate-800
              dark:text-slate-300
            "
                      >
                        {formatDateSeparator(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex w-full ${
                      isMine ? "justify-end" : "justify-start"
                    } ${isSameSender && !showDateSeparator ? "mt-0.5" : "mt-3"}`}
                  >
                    <div
                      className={`flex max-w-[78%] items-end gap-2 sm:max-w-[65%] ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Other user's avatar */}
                      {!isMine && !isSameSender ? (
                        <div
                          className="
                h-8
                w-8
                shrink-0
                overflow-hidden
                rounded-full
                bg-violet-100
                dark:bg-violet-500/10
              "
                        >
                          {conversation.otherProfileImage ? (
                            <img
                              src={conversation.otherProfileImage}
                              alt={conversation.otherUserName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserRound
                                size={16}
                                className="text-violet-600 dark:text-violet-400"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      <div
                        className={`flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`
                break-words
                rounded-2xl
                px-4
                py-2.5
                text-sm
                leading-relaxed
                shadow-sm
                ${
                  isMine
                    ? `
                      rounded-br-md
                      bg-violet-600
                      text-white
                    `
                    : `
                      rounded-bl-md
                      border
                      border-slate-200
                      bg-white
                      text-slate-800
                      dark:border-slate-700
                      dark:bg-slate-900
                      dark:text-slate-100
                    `
                }
              `}
                        >
                          {message.content}
                        </div>

                        <span
                          className="
                mt-1
                px-1
                text-[10px]
                text-slate-400
                dark:text-slate-500
              "
                        >
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* FIXED MESSAGE INPUT */}
      {/* ================================================= */}

      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          px-4
          py-3
          dark:border-slate-800
          dark:bg-slate-900
          sm:px-6
        "
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2"
        >
          <div
            className="
              flex
              min-h-[44px]
              flex-1
              items-center
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              transition
              focus-within:border-violet-400
              focus-within:ring-2
              focus-within:ring-violet-500/10
              dark:border-slate-700
              dark:bg-slate-950
              dark:focus-within:border-violet-500
            "
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`Message ${conversation.otherUserName}...`}
              disabled={sending}
              className="
                w-full
                bg-transparent
                py-2
                text-sm
                text-slate-900
                outline-none
                placeholder:text-slate-400
                dark:text-white
                dark:placeholder:text-slate-500
              "
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || sending}
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
              transition
              hover:bg-violet-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Send message"
          >
            {sending ? (
              <div
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/40
                  border-t-white
                "
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
