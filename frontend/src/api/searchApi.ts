import api from "./axios";

export interface SearchPerson {
  profileId: number;
  userId: number;
  fullName: string;
  username: string | null;
  profileImage: string | null;
}

export interface SearchResponse {
  results: SearchPerson[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const useSearchApi = () => {
  const searchPeople = async (
    query: string,
    page: number = 0,
    size: number = 10,
  ): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>("/discover/search", {
      params: {
        query,
        page,
        size,
      },
    });

    return response.data;
  };

  return {
    searchPeople,
  };
};
