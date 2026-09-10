import {} from "@clerk/react";
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
  // Apply to a club
  const applyToClub = async (clubId: number) => {
    const response = await api.post(`/clubs/${clubId}/applications`, {});

    return response.data as ClubApplication;
  };

  // Get my application for a club
  const getMyApplication = async (clubId: number) => {
    const response = await api.get(`/clubs/${clubId}/applications/me`);

    return response.data as ClubApplication;
  };

  // Withdraw application
  const withdrawApplication = async (clubId: number) => {
    const response = await api.delete(`/clubs/${clubId}/applications`);

    return response.data;
  };

  // Get pending applications for a club
  const getPendingApplications = async (clubId: number) => {
    const response = await api.get(`/admin/clubs/${clubId}/applications`);

    return response.data as ClubApplication[];
  };

  // Accept or reject an application
  const updateApplication = async (
    applicationId: number,
    action: "ACCEPT" | "REJECT",
  ) => {
    const response = await api.put(
      `/admin/clubs/applications/${applicationId}`,
      {
        action,
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
