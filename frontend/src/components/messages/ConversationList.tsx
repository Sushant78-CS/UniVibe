import { MessageCircle } from "lucide-react";
import type { Conversation } from "../../api/messageApi";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelect: (conversation: Conversation) => void;
}

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelect,
}: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className="
            flex h-14 w-14
            items-center justify-center
            rounded-2xl
            bg-violet-100
            text-violet-600
            dark:bg-violet-500/10
            dark:text-violet-400
          "
        >
          <MessageCircle size={26} />
        </div>

        <h3 className="mt-4 text-sm font-semibold">No conversations yet</h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Start a conversation with someone from their profile.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {conversations.map((conversation) => {
        const selected = selectedConversationId === conversation.id;

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={`
              flex
              w-full
              items-center
              gap-3
              px-4
              py-3
              text-left
              transition

              ${
                selected
                  ? "bg-violet-50 dark:bg-violet-500/10"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }
            `}
          >
            {/* Avatar */}

            {conversation.otherProfileImage ? (
              <img
                src={conversation.otherProfileImage}
                alt={conversation.otherUserName}
                className="
                  h-11
                  w-11
                  shrink-0
                  rounded-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-100
                  text-sm
                  font-bold
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-400
                "
              >
                {conversation.otherUserName?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}

            {/* Content */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">
                  {conversation.otherUserName}
                </h3>

                {conversation.lastMessageAt && (
                  <span className="shrink-0 text-[10px] text-slate-400">
                    {formatMessageTime(conversation.lastMessageAt)}
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {conversation.lastMessage ?? "Start a conversation"}
                </p>

                {conversation.unreadCount > 0 && (
                  <span
                    className="
                      flex
                      h-5
                      min-w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-600
                      px-1.5
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    {conversation.unreadCount > 99
                      ? "99+"
                      : conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

export default ConversationList;
