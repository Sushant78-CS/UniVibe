import { useAuth } from "@clerk/react";
import api from "./axios";

export type ConnectionStatus =
  | "NONE"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "CONNECTED";

export interface Recommendation {
  profileId: number;
  userId: number;
  fullName: string;
  username: string;
  bio?: string;
  profileImage?: string;
  college?: string;
  department?: string;
  year?: string;
  interests?: string;
  score: number;
  connectionStatus: ConnectionStatus;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
}

export const useRecommendationApi = () => {
  const { getToken } = useAuth();

  const getRecommendations = async () => {
    const token = await getToken();

    const response = await api.get<RecommendationResponse>("/recommendations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  return {
    getRecommendations,
  };
};
