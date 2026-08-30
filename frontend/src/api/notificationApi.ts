import { useAuth } from "@clerk/react";
import api from "./axios";

export type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "CONNECTION_REJECTED"
  | "CLUB_APPLICATION"
  | "CLUB_APPLICATION_ACCEPTED"
  | "CLUB_APPLICATION_REJECTED";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  referenceId?: number | null;
  actorId?: number | null;
  actorFullName?: string | null;
  actorUsername?: string | null;
  actorProfileImage?: string | null;
  read: boolean;
  createdAt: string;
}

export const useNotificationApi = () => {
  const { getToken } = useAuth();

  const getAuthHeaders = async () => {
    const token = await getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const getNotifications = async (): Promise<Notification[]> => {
    const headers = await getAuthHeaders();

    const response = await api.get<Notification[]>("/notifications", {
      headers,
    });

    return response.data;
  };

  const getUnreadCount = async (): Promise<number> => {
    const headers = await getAuthHeaders();

    const response = await api.get<{ count: number }>(
      "/notifications/unread-count",
      { headers },
    );

    return response.data.count;
  };

  const markAsRead = async (id: number) => {
    const headers = await getAuthHeaders();

    const response = await api.put(
      `/notifications/${id}/read`,
      {},
      { headers },
    );

    return response.data;
  };

  const markAllAsRead = async () => {
    const headers = await getAuthHeaders();

    const response = await api.put("/notifications/read-all", {}, { headers });

    return response.data;
  };

  return {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
