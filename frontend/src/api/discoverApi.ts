import api from "./axios";

export interface DiscoverPerson {
  id: number;
  userId: number;
  fullName: string;
  username: string;
  profileImage?: string;
  college: string;
  department?: string;
  year: string;
  interests?: string;
  bio?: string;
  score?: number;
  connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED";
}

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

export const useDiscoverApi = () => {
  const getPeople = async (params?: {
    query?: string;
    college?: string;
    department?: string;
    year?: string;
  }) => {
    const response = await api.get<DiscoverPerson[]>("/discover/people", {
      params,
    });

    return response.data;
  };

  const getPersonProfile = async (id: number) => {
    const response = await api.get(`/discover/people/${id}`);

    return response.data;
  };

  const searchProfiles = async (query: string): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>("/search", {
      params: {
        query,
      },
    });

    return response.data;
  };

  return {
    getPeople,
    getPersonProfile,
    searchProfiles,
  };
};
