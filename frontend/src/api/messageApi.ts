import { useCallback } from "react";
import api from "./axios";

export interface Conversation {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUsername?: string;
  otherProfileImage?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderUsername?: string;
  senderProfileImage?: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export const useMessageApi = () => {
  // ==========================================
  // GET CONVERSATIONS
  // ==========================================

  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>("/messages/conversations");

    return response.data;
  }, []);

  // ==========================================
  // CREATE / GET CONVERSATION
  // ==========================================

  const getOrCreateConversation = useCallback(
    async (userId: number): Promise<Conversation> => {
      const response = await api.post<Conversation>(
        `/messages/conversations/${userId}`,
        {},
      );

      return response.data;
    },
    [],
  );

  // ==========================================
  // GET SINGLE CONVERSATION
  // ==========================================

  const getConversation = useCallback(
    async (conversationId: number): Promise<Conversation> => {
      const response = await api.get<Conversation>(
        `/messages/conversations/${conversationId}/details`,
      );

      return response.data;
    },
    [],
  );

  // ==========================================
  // GET MESSAGES
  // ==========================================

  const getMessages = useCallback(
    async (conversationId: number): Promise<Message[]> => {
      const response = await api.get<Message[]>(
        `/messages/conversations/${conversationId}`,
      );

      return response.data;
    },
    [],
  );

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = useCallback(
    async (conversationId: number, content: string): Promise<Message> => {
      const response = await api.post<Message>(
        `/messages/conversations/${conversationId}/messages`,
        {
          content,
        },
      );

      return response.data;
    },
    [],
  );

  // ==========================================
  // MARK MESSAGES AS READ
  // ==========================================

  const markMessagesAsRead = useCallback(
    async (conversationId: number): Promise<void> => {
      await api.patch(`/messages/conversations/${conversationId}/read`, {});
    },
    [],
  );

  return {
    getConversations,
    getOrCreateConversation,
    getConversation,
    getMessages,
    sendMessage,
    markMessagesAsRead,
  };
};
