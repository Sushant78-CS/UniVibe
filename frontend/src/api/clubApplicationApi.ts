import { useAuth } from "@clerk/react";
import api from "./axios";

export type ClubApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ClubApplication {
  id: number;
  clubId: number;
  clubName: string;
  userId: number;
  profileId: number;
  fullName: string;
  username: string;
  profileImage?: string;
  status: ClubApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export const useClubApplicationApi = () => {
  const { getToken } = useAuth();

  const getAuthHeaders = async () => {
    const token = await getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Apply to a club
  const applyToClub = async (clubId: number) => {
    const headers = await getAuthHeaders();

    const response = await api.post(
      `/clubs/${clubId}/applications`,
      {},
      {
        headers,
      },
    );

    return response.data as ClubApplication;
  };

  // Get my application for a club
  const getMyApplication = async (clubId: number) => {
    const headers = await getAuthHeaders();

    const response = await api.get(`/clubs/${clubId}/applications/me`, {
      headers,
    });

    return response.data as ClubApplication;
  };

  // Withdraw application
  const withdrawApplication = async (clubId: number) => {
    const headers = await getAuthHeaders();

    const response = await api.delete(`/clubs/${clubId}/applications`, {
      headers,
    });

    return response.data;
  };

  // Get pending applications for a club
  const getPendingApplications = async (clubId: number) => {
    const headers = await getAuthHeaders();

    const response = await api.get(`/admin/clubs/${clubId}/applications`, {
      headers,
    });

    return response.data as ClubApplication[];
  };

  // Accept or reject an application
  const updateApplication = async (
    applicationId: number,
    action: "ACCEPT" | "REJECT",
  ) => {
    const headers = await getAuthHeaders();

    const response = await api.put(
      `/admin/clubs/applications/${applicationId}`,
      {
        action,
      },
      {
        headers,
      },
    );

    return response.data as ClubApplication;
  };

  return {
    applyToClub,
    getMyApplication,
    withdrawApplication,
    getPendingApplications,
    updateApplication,
  };
};
