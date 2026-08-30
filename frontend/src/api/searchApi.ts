import { useAuth } from "@clerk/react";
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
  const { getToken } = useAuth();

  const searchProfiles = async (query: string): Promise<SearchResponse> => {
    const token = await getToken();

    const response = await api.get<SearchResponse>("/search", {
      params: {
        query,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  return {
    searchProfiles,
  };
};
