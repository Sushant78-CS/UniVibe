import api from "./axios";

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
  const getClubs = async (): Promise<Club[]> => {
    const response = await api.get("/clubs");

    return response.data;
  };

  const getMyClubs = async (): Promise<Club[]> => {
    const response = await api.get("/clubs/my");

    return response.data;
  };

  const getClub = async (id: number) => {
    const response = await api.get(`/clubs/${id}`);

    return response.data as Club;
  };

  const getClubMembers = async (clubId: number): Promise<ClubMember[]> => {
    const response = await api.get(`/clubs/${clubId}/members`);

    return response.data;
  };

  const getMembership = async (clubId: number): Promise<boolean> => {
    const response = await api.get<MembershipResponse>(
      `/clubs/${clubId}/membership`,
    );

    return response.data.member;
  };

  const joinClub = async (clubId: number) => {
    const response = await api.post(`/clubs/${clubId}/join`);

    return response.data;
  };

  const leaveClub = async (clubId: number) => {
    const response = await api.delete(`/clubs/${clubId}/leave`);

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
