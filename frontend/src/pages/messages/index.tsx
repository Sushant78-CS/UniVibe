import { MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import ConversationList from "../../components/messages/ConversationList";
import ChatWindow from "../../components/messages/ChatWindow";

import {
  useMessageApi,
  type Conversation,
  type Message,
} from "../../api/messageApi";
import { useProfileApi } from "../../api/profileApi";
import { useMessageWebSocket } from "../../hooks/useMessageWebSocket";

const MessagesPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  // const { user } = useUser();
  const { getProfile } = useProfileApi();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setProfile(profile);
        console.log("Profile:", profile);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    loadProfile();
  }, []);

  const {
    getConversations,
    getConversation,
    getMessages,
    // sendMessage,
    markMessagesAsRead,
  } = useMessageApi();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * ==========================================
   * LOAD CONVERSATION LIST
   * ==========================================
   */

  useEffect(() => {
    if (conversationId) {
      return;
    }

    const loadConversations = async () => {
      try {
        setError(null);
        setLoadingConversations(true);

        const data = await getConversations();

        setConversations(data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setError("Unable to load your conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };

    loadConversations();
  }, [conversationId, getConversations]);

  /*
   * ==========================================
   * LOAD SINGLE CONVERSATION
   * ==========================================
   */

  useEffect(() => {
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      setLoadingConversation(false);
      setLoadingMessages(false);
      return;
    }

    const id = Number(conversationId);

    if (Number.isNaN(id)) {
      setError("Invalid conversation.");
      return;
    }

    const loadConversation = async () => {
      try {
        setError(null);

        // Clear previous conversation/messages
        setSelectedConversation(null);
        setMessages([]);

        // ==========================================
        // LOAD CONVERSATION
        // ==========================================

        setLoadingConversation(true);

        const conversation = await getConversation(id);

        setSelectedConversation(conversation);

        setLoadingConversation(false);

        // ==========================================
        // LOAD MESSAGES
        // ==========================================

        setLoadingMessages(true);

        try {
          const data = await getMessages(id);
          setMessages(data);
        } finally {
          setLoadingMessages(false);
        }

        // ==========================================
        // MARK AS READ
        // ==========================================

        try {
          await markMessagesAsRead(id);
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);

        setLoadingConversation(false);
        setLoadingMessages(false);

        setError("Unable to load this conversation.");
      }
    };

    loadConversation();
  }, [conversationId, getConversation, getMessages, markMessagesAsRead]);

  /*
   * ==========================================
   * SELECT CONVERSATION
   * ==========================================
   */

  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/messages/${conversation.id}`);
  };

  /*
   * ==========================================
   * SEND MESSAGE
   * ==========================================
   */

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) {
      return;
    }

    if (!connected) {
      console.error("WebSocket is not connected.");
      return;
    }

    try {
      setSending(true);

      sendWebSocketMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleIncomingMessage = useCallback((message: Message) => {
    setMessages((previous) => {
      const alreadyExists = previous.some(
        (existingMessage) => existingMessage.id === message.id,
      );

      if (alreadyExists) {
        return previous;
      }

      return [...previous, message];
    });

    setSelectedConversation((previous) =>
      previous
        ? {
            ...previous,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            updatedAt: message.createdAt,
          }
        : previous,
    );
  }, []);

  const { connected, sendMessage: sendWebSocketMessage } = useMessageWebSocket({
    conversationId: selectedConversation?.id,
    onMessage: handleIncomingMessage,
  });

  /*
   * ==========================================
   * BACK
   * ==========================================
   */

  const handleBack = () => {
    navigate(-1);
  };

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-5
          dark:bg-slate-950
        "
      >
        <div className="text-center">
          <p
            className="
              text-sm
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setError(null);

              if (conversationId) {
                navigate(`/messages/${conversationId}`, { replace: true });
              }
            }}
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-violet-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-violet-700
            "
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  const isConversationPage = Boolean(conversationId);

  return (
    <div
      className="
        h-screen
        overflow-hidden
        bg-slate-50
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >
      <div
        className="
          mx-auto
          flex
          h-full
          max-w-6xl
        "
      >
        {/* ================================= */}
        {/* CONVERSATION LIST */}
        {/* ================================= */}

        {!isConversationPage && (
          <aside
            className="
              w-full
              border-r
              border-slate-200
              bg-white
              dark:border-slate-800
              dark:bg-slate-900
              md:w-[340px]
            "
          >
            <div
              className="
                flex
                h-[65px]
                items-center
                gap-2
                border-b
                border-slate-200
                px-4
                dark:border-slate-800
              "
            >
              <MessageCircle size={21} className="text-violet-600" />

              <h1 className="text-lg font-bold">Messages</h1>
            </div>

            <div
              className="
                h-[calc(100%-65px)]
                overflow-y-auto
              "
            >
              {loadingConversations ? (
                <div className="flex h-40 items-center justify-center">
                  <div
                    className="
        h-6
        w-6
        animate-spin
        rounded-full
        border-2
        border-slate-200
        border-t-violet-600
        dark:border-slate-700
        dark:border-t-violet-400
      "
                  />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  onSelect={handleSelectConversation}
                />
              )}
            </div>
          </aside>
        )}

        {/* ================================= */}
        {/* CHAT */}
        {/* ================================= */}

        <main
          className="
    flex
    min-w-0
    flex-1
    flex-col
  "
        >
          {isConversationPage ? (
            loadingConversation ? (
              <div
                className="
          flex
          h-full
          flex-1
          items-center
          justify-center
          bg-slate-50
          dark:bg-slate-950
        "
              >
                <div
                  className="
            h-7
            w-7
            animate-spin
            rounded-full
            border-2
            border-slate-200
            border-t-violet-600
            dark:border-slate-700
            dark:border-t-violet-400
          "
                />
              </div>
            ) : selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                currentUserId={profile?.id || 0}
                messages={messages}
                loading={loadingMessages}
                sending={sending}
                onBack={handleBack}
                onSend={handleSendMessage}
              />
            ) : null
          ) : (
            <div
              className="
        hidden
        h-full
        flex-1
        flex-col
        items-center
        justify-center
        px-6
        text-center
        md:flex
      "
            >
              <div
                className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-3xl
          bg-violet-100
          text-violet-600
          dark:bg-violet-500/10
          dark:text-violet-400
        "
              >
                <MessageCircle size={30} />
              </div>

              <h2 className="mt-5 text-lg font-bold">Your messages</h2>

              <p
                className="
          mt-1
          max-w-sm
          text-sm
          text-slate-500
          dark:text-slate-400
        "
              >
                Select a conversation to start chatting.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
