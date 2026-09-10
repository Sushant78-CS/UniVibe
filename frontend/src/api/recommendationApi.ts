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
  const getRecommendations = async () => {
    const response = await api.get<RecommendationResponse>("/recommendations");

    return response.data;
  };

  return {
    getRecommendations,
  };
};
