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
  const getRequests = async (): Promise<ConnectionRequest[]> => {
    const response = await api.get("/user/connections/requests");

    return response.data;
  };

  const sendConnection = async (receiverId: number) => {
    try {
      const response = await api.post("/user/connections", {
        receiverId,
      });

      return response.data;
    } catch (error: any) {
      console.error("SEND CONNECTION ERROR:", error.response?.data ?? error);

      console.error("SEND CONNECTION STATUS:", error.response?.status);

      console.error("SEND CONNECTION REQUEST:", {
        receiverId,
      });

      throw error;
    }
  };

  const updateConnection = async (id: number, action: "ACCEPT" | "REJECT") => {
    const response = await api.put(`/user/connections/${id}`, { action });

    return response.data;
  };

  const getConnections = async (): Promise<ConnectedPerson[]> => {
    const response = await api.get("/user/connections");

    return response.data;
  };

  return {
    getRequests,
    sendConnection,
    updateConnection,
    getConnections,
  };
};
