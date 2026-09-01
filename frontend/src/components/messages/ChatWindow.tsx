import { ArrowLeft, Send, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Conversation, Message } from "../../api/messageApi";
import ChatMessagesSkeleton from "./ChatMessagesSkeleton";

interface ChatWindowProps {
  conversation: Conversation | null;
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
  const [content, setContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    if (loading) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();

    if (!trimmed || sending || !conversation) {
      return;
    }

    setContent("");

    try {
      await onSend(trimmed);
    } catch {
      setContent(trimmed);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-3
          border-b
          border-slate-200
          bg-white
          px-4
          py-3
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={onBack}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            text-slate-500
            hover:bg-slate-100
            dark:hover:bg-slate-800
          "
        >
          <ArrowLeft size={19} />
        </button>

        {/* PROFILE IMAGE */}

        {conversation?.otherProfileImage ? (
          <img
            src={conversation.otherProfileImage}
            alt={conversation.otherUserName}
            className="
              h-10
              w-10
              rounded-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-violet-100
              text-violet-600
              dark:bg-violet-500/10
              dark:text-violet-400
            "
          >
            <UserRound size={18} />
          </div>
        )}

        {/* USER INFORMATION */}

        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold">
            {conversation?.otherUserName ?? "Opening conversation..."}
          </h2>

          {conversation?.otherUsername && (
            <p
              className="
                truncate
                text-[11px]
                text-slate-500
                dark:text-slate-400
              "
            >
              @{conversation.otherUsername}
            </p>
          )}
        </div>
      </div>

      {/* ==========================================
          MESSAGES
      ========================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          bg-slate-50
          px-4
          py-5
          dark:bg-slate-950
        "
      >
        {/* ONLY THIS AREA SHOWS THE LOADING SKELETON */}

        {loading ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold">No messages yet</p>

              <p className="mt-1 text-xs text-slate-500">Say hello 👋</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => {
              const mine =
                currentUserId !== undefined &&
                message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[78%]
                      rounded-2xl
                      px-3.5
                      py-2.5
                      text-sm
                      shadow-sm
                      ${
                        mine
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
                            dark:border-slate-800
                            dark:bg-slate-900
                            dark:text-slate-200
                          `
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    <p
                      className={`
                        mt-1
                        text-[9px]
                        ${mine ? "text-violet-200" : "text-slate-400"}
                      `}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ==========================================
          INPUT
      ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          flex
          shrink-0
          items-center
          gap-2
          border-t
          border-slate-200
          bg-white
          p-3
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a message..."
          disabled={sending || !conversation}
          className="
            min-w-0
            flex-1
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-sm
            outline-none
            transition
            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-500/10
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:border-slate-700
            dark:bg-slate-950
            dark:text-white
          "
        />

        <button
          type="submit"
          disabled={!content.trim() || sending || !conversation}
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-violet-600
            text-white
            transition
            hover:bg-violet-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

// ==========================================
// FORMAT MESSAGE TIME
// ==========================================

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default ChatWindow;
