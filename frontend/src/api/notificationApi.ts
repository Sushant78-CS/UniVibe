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
  url: string;
}

export const useNotificationApi = () => {
  const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>("/notifications");

    return response.data;
  };

  const getUnreadCount = async (): Promise<number> => {
    const response = await api.get<{ count: number }>(
      "/notifications/unread-count",
    );

    return response.data.count;
  };

  const markAsRead = async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`, {});

    return response.data;
  };

  const markAllAsRead = async () => {
    const response = await api.put("/notifications/read-all");

    return response.data;
  };

  return {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
