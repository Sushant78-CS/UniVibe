import { useAuth } from "@clerk/react";
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
  const { getToken } = useAuth();

  // ==========================================
  // AUTH HEADERS
  // ==========================================

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  }, [getToken]);

  // ==========================================
  // GET CONVERSATIONS
  // ==========================================

  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    const headers = await getAuthHeaders();

    const response = await api.get("/messages/conversations", {
      headers,
    });

    return response.data;
  }, [getAuthHeaders]);

  // ==========================================
  // CREATE / GET CONVERSATION
  // ==========================================

  const getOrCreateConversation = useCallback(
    async (userId: number): Promise<Conversation> => {
      const headers = await getAuthHeaders();

      const response = await api.post(
        `/messages/conversations/${userId}`,
        {},
        {
          headers,
        },
      );

      return response.data;
    },
    [getAuthHeaders],
  );

  // ==========================================
  // GET SINGLE CONVERSATION
  // ==========================================

  const getConversation = useCallback(
    async (conversationId: number): Promise<Conversation> => {
      const headers = await getAuthHeaders();

      const response = await api.get(
        `/messages/conversations/${conversationId}/details`,
        {
          headers,
        },
      );

      return response.data;
    },
    [getAuthHeaders],
  );

  // ==========================================
  // GET MESSAGES
  // ==========================================

  const getMessages = useCallback(
    async (conversationId: number): Promise<Message[]> => {
      const headers = await getAuthHeaders();

      const response = await api.get(
        `/messages/conversations/${conversationId}`,
        {
          headers,
        },
      );

      return response.data;
    },
    [getAuthHeaders],
  );

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = useCallback(
    async (conversationId: number, content: string): Promise<Message> => {
      const headers = await getAuthHeaders();

      const response = await api.post(
        `/messages/conversations/${conversationId}/messages`,
        {
          content,
        },
        {
          headers,
        },
      );

      return response.data;
    },
    [getAuthHeaders],
  );

  // ==========================================
  // MARK MESSAGES AS READ
  // ==========================================

  const markMessagesAsRead = useCallback(
    async (conversationId: number): Promise<void> => {
      const headers = await getAuthHeaders();

      await api.patch(
        `/messages/conversations/${conversationId}/read`,
        {},
        {
          headers,
        },
      );
    },
    [getAuthHeaders],
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
