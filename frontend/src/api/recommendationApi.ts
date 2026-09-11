import api from "./axios";

export interface RecommendationPerson {
  profileId: number;
  userId: number;
  fullName: string;
  username: string;
  bio: string;
  profileImage?: string | null;
  college?: string | null;
  department?: string | null;
  year?: string | null;
  interests?: string | null;
  score?: number;
  connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED";
}

export interface RecommendationPageResponse {
  recommendations: RecommendationPerson[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const useRecommendationApi = () => {
  const getRecommendations = async (
    page = 0,
    size = 10,
  ): Promise<RecommendationPageResponse> => {
    const response = await api.get<RecommendationPageResponse>(
      "/recommendations",
      {
        params: {
          page,
          size,
        },
      },
    );

    return response.data;
  };

  return {
    getRecommendations,
  };
};
