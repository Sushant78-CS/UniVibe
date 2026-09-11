import { MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

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

  const queryClient = useQueryClient();

  /* =========================================================
     APIs
     ========================================================= */

  const { getProfile } = useProfileApi();

  const { getConversations, getConversation, getMessages, markMessagesAsRead } =
    useMessageApi();

  /* =========================================================
     CONVERSATION ID
     ========================================================= */

  const selectedConversationId = conversationId ? Number(conversationId) : null;

  const validConversationId =
    selectedConversationId !== null && !Number.isNaN(selectedConversationId)
      ? selectedConversationId
      : null;

  /* =========================================================
     UI STATE
     ========================================================= */

  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =========================================================
     PROFILE QUERY
     ========================================================= */

  const {
    data: profile,
    isLoading: loadingProfile,
    isError: profileError,
  } = useQuery({
    queryKey: ["profile", "me"],

    queryFn: getProfile,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /* =========================================================
     CONVERSATIONS QUERY
     ========================================================= */

  const {
    data: conversations = [],
    isLoading: loadingConversations,
    isError: conversationsError,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],

    queryFn: getConversations,

    staleTime: 30 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,

    /*
     * We don't need to load the conversation
     * list while already inside a conversation
     * on mobile.
     *
     * It remains cached from previous visits.
     */
    enabled: !conversationId,
  });

  /* =========================================================
     SINGLE CONVERSATION QUERY
     ========================================================= */

  const {
    data: selectedConversation = null,
    isLoading: loadingConversation,
    isError: conversationError,
  } = useQuery<Conversation>({
    queryKey: ["conversation", validConversationId],

    queryFn: () => {
      if (validConversationId === null) {
        throw new Error("Invalid conversation ID");
      }

      return getConversation(validConversationId);
    },

    enabled: validConversationId !== null,

    staleTime: 30 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /* =========================================================
     MESSAGES QUERY
     ========================================================= */

  const {
    data: messages = [],
    isLoading: loadingMessages,
    isError: messagesError,
  } = useQuery<Message[]>({
    queryKey: ["messages", validConversationId],

    queryFn: () => {
      if (validConversationId === null) {
        throw new Error("Invalid conversation ID");
      }

      return getMessages(validConversationId);
    },

    enabled: validConversationId !== null,

    staleTime: 10 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /* =========================================================
     MARK AS READ MUTATION
     ========================================================= */

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return markMessagesAsRead(id);
    },

    onSuccess: (_, id) => {
      /*
       * Update conversation cache so
       * unread state can disappear immediately.
       */

      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) {
          return old;
        }

        return old.map((conversation) => {
          if (conversation.id !== id) {
            return conversation;
          }

          return {
            ...conversation,
            unreadCount: 0,
          };
        });
      });
    },
  });

  /* =========================================================
     MARK CURRENT CONVERSATION AS READ
     ========================================================= */

  useEffect(() => {
    if (validConversationId === null) {
      return;
    }

    markReadMutation.mutate(validConversationId);
  }, [validConversationId]);

  /* =========================================================
     WEBSOCKET — INCOMING MESSAGE
     ========================================================= */

  const handleIncomingMessage = useCallback(
    (message: Message) => {
      /*
       * Add message to the currently
       * opened conversation.
       */

      queryClient.setQueryData<Message[]>(
        ["messages", message.conversationId],
        (old = []) => {
          const alreadyExists = old.some(
            (existingMessage) => existingMessage.id === message.id,
          );

          if (alreadyExists) {
            return old;
          }

          return [...old, message];
        },
      );

      /*
       * Update selected conversation
       * immediately.
       */

      queryClient.setQueryData<Conversation>(
        ["conversation", message.conversationId],
        (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,

            lastMessage: message.content,

            lastMessageAt: message.createdAt,

            updatedAt: message.createdAt,
          };
        },
      );

      /*
       * Update conversation list cache.
       */

      queryClient.setQueryData<Conversation[]>(
        ["conversations"],
        (old = []) => {
          return old.map((conversation) => {
            if (conversation.id !== message.conversationId) {
              return conversation;
            }

            return {
              ...conversation,

              lastMessage: message.content,

              lastMessageAt: message.createdAt,

              updatedAt: message.createdAt,
            };
          });
        },
      );
    },
    [queryClient],
  );

  /* =========================================================
     WEBSOCKET
     ========================================================= */

  const { connected, sendMessage: sendWebSocketMessage } = useMessageWebSocket({
    conversationId: selectedConversation?.id,

    onMessage: handleIncomingMessage,
  });

  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) {
      return;
    }
    console.log(error);

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

  /* =========================================================
     SELECT CONVERSATION
     ========================================================= */

  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/messages/${conversation.id}`);
  };

  /* =========================================================
     BACK
     ========================================================= */

  const handleBack = () => {
    navigate(-1);
  };

  /* =========================================================
     ERROR
     ========================================================= */

  const hasError =
    profileError || conversationsError || conversationError || messagesError;

  if (hasError) {
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
            Unable to load messages.
          </p>

          <button
            type="button"
            onClick={() => {
              setError(null);

              queryClient.invalidateQueries({
                queryKey: ["conversations"],
              });

              if (validConversationId !== null) {
                queryClient.invalidateQueries({
                  queryKey: ["conversation", validConversationId],
                });

                queryClient.invalidateQueries({
                  queryKey: ["messages", validConversationId],
                });
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

  /* =========================================================
     LOADING PROFILE
     ========================================================= */

  if (loadingProfile) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          dark:bg-slate-950
        "
      >
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
    );
  }

  /* =========================================================
     PAGE MODE
     ========================================================= */

  const isConversationPage = Boolean(validConversationId);

  /* =========================================================
     RENDER
     ========================================================= */

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
        {/* =================================================
            CONVERSATION LIST
        ================================================= */}

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
              <MessageCircle
                size={21}
                className="
                  text-violet-600
                "
              />

              <h1
                className="
                  text-lg
                  font-bold
                "
              >
                Messages
              </h1>
            </div>

            <div
              className="
                h-[calc(100%-65px)]
                overflow-y-auto
              "
            >
              {loadingConversations ? (
                <div
                  className="
                    flex
                    h-40
                    items-center
                    justify-center
                  "
                >
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

        {/* =================================================
            CHAT
        ================================================= */}

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
                currentUserId={profile?.id ?? 0}
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

              <h2
                className="
                  mt-5
                  text-lg
                  font-bold
                "
              >
                Your messages
              </h2>

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
