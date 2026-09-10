import api from "./axios";

export interface SearchProfile {
  profileId: number;
  fullName: string;
  username: string;
  college?: string;
  department?: string;
}

export interface SearchResponse {
  results: SearchProfile[];
  algorithm: string;
  timeComplexity: string;
}

export const useSearchApi = () => {
  const searchProfiles = async (query: string): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>("/search", {
      params: {
        query,
      },
    });

    return response.data;
  };

  return {
    searchProfiles,
  };
};
