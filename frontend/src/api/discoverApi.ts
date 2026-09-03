import { useAuth } from "@clerk/react";
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
  const { getToken } = useAuth();

  const getPeople = async (params?: {
    query?: string;
    college?: string;
    department?: string;
    year?: string;
  }) => {
    const token = await getToken();

    const response = await api.get<DiscoverPerson[]>("/discover/people", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const getPersonProfile = async (id: number) => {
    const token = await getToken();

    const response = await api.get(`/discover/people/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

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
    getPeople,
    getPersonProfile,
    searchProfiles,
  };
};
