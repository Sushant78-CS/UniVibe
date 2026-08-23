import api from "./axios";
import { useAuth } from "@clerk/react";

export interface Club {
  id: number;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  memberCount: number;
  members?: ClubMember[];
}

export interface ClubMember {
  profileId: number;
  fullName: string;
  username: string;
  profileImage?: string;
  department?: string;
  year?: string;
  role: string;
}

export interface MembershipResponse {
  member: boolean;
}

export const useClubApi = () => {
  const { getToken } = useAuth();

  const authConfig = async () => {
    const token = await getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const getClubs = async (): Promise<Club[]> => {
    const config = await authConfig();

    const response = await api.get("/clubs", config);

    return response.data;
  };

  const getMyClubs = async (): Promise<Club[]> => {
    const config = await authConfig();

    const response = await api.get("/clubs/my", config);

    return response.data;
  };

  const getClub = async (id: number) => {
    const token = await getToken();

    const response = await api.get(`/clubs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data as Club;
  };

  const getClubMembers = async (clubId: number): Promise<ClubMember[]> => {
    const config = await authConfig();

    const response = await api.get(`/clubs/${clubId}/members`, config);

    return response.data;
  };

  const getMembership = async (clubId: number): Promise<boolean> => {
    const config = await authConfig();

    const response = await api.get<MembershipResponse>(
      `/clubs/${clubId}/membership`,
      config,
    );

    return response.data.member;
  };

  const joinClub = async (clubId: number) => {
    const config = await authConfig();

    const response = await api.post(`/clubs/${clubId}/join`, {}, config);

    return response.data;
  };

  const leaveClub = async (clubId: number) => {
    const config = await authConfig();

    const response = await api.delete(`/clubs/${clubId}/leave`, config);

    return response.data;
  };

  return {
    getClubs,
    getMyClubs,
    getClub,
    getClubMembers,
    getMembership,
    joinClub,
    leaveClub,
  };
};
