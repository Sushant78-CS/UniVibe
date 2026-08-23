import { useAuth } from "@clerk/react";
import api from "./axios";

export interface ConnectionRequest {
  id: number;
  profileId: number;
  fullName: string;
  username: string;
  profileImage?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface ConnectedPerson {
  connectionId: number;
  profileId: number;
  fullName: string;
  username: string;
  profileImage?: string | null;
}

export const useConnectionApi = () => {
  const { getToken } = useAuth();
  const getRequests = async (): Promise<ConnectionRequest[]> => {
    const token = await getToken();

    const response = await api.get("/user/connections/requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const sendConnection = async (receiverId: number) => {
    const token = await getToken();

    const response = await api.post(
      "/user/connections",
      { receiverId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };

  const updateConnection = async (id: number, action: "ACCEPT" | "REJECT") => {
    const token = await getToken();

    const response = await api.put(
      `/user/connections/${id}`,
      { action },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };

  const getConnections = async (): Promise<ConnectedPerson[]> => {
    const token = await getToken();

    const response = await api.get("/user/connections", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  return {
    getRequests,
    sendConnection,
    updateConnection,
    getConnections,
  };
};
