import api from "./axios";

interface CreateProfileData {
  fullName: string;
  username: string;
  bio?: string;
  college: string;
  department?: string;
  year: string;
  interests?: string;
}

export interface UpdateProfileData {
  fullName: string;
  username: string;
  bio?: string;
  college?: string;
  department?: string;
  year?: string;
  interests?: string;
  profileImage?: string;
}

/* =========================================================
   CONNECTION STATUS
   ========================================================= */

export type PublicConnectionStatus =
  | "NONE"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "CONNECTED";

/* =========================================================
   PUBLIC PROFILE
   ========================================================= */

export interface PublicProfile {
  id: number;
  userId: number;

  fullName: string;
  username: string;

  bio?: string;
  profileImage?: string | null;

  college?: string;
  department?: string;
  year?: string;
  interests?: string;

  connectionsCount: number;

  connectionStatus: PublicConnectionStatus;
  connectionId?: number | null;
}

/* =========================================================
   PROFILE API
   ========================================================= */

export const useProfileApi = () => {
  /* =======================================================
     MY PROFILE
     ======================================================= */

  const getProfile = async () => {
    const response = await api.get("/user/profile");

    return response.data;
  };

  /* =======================================================
     PUBLIC PROFILE
     ======================================================= */

  const getPublicProfile = async (
    profileId: number,
  ): Promise<PublicProfile> => {
    const response = await api.get(`/discover/people/${profileId}`);

    return response.data;
  };

  /* =======================================================
     CREATE PROFILE
     ======================================================= */

  const createProfile = async (
    data: CreateProfileData,
    profileImage?: File | null,
  ) => {
    const formData = new FormData();

    formData.append("fullName", data.fullName);

    formData.append("username", data.username);

    formData.append("college", data.college);

    formData.append("year", data.year);

    if (data.bio) {
      formData.append("bio", data.bio);
    }

    if (data.department) {
      formData.append("department", data.department);
    }

    if (data.interests) {
      formData.append("interests", data.interests);
    }

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    const response = await api.post("/user/profile", formData);

    return response.data;
  };

  /* =======================================================
     UPDATE PROFILE
     ======================================================= */

  const updateProfile = async (
    data: UpdateProfileData,
    profileImage?: File | null,
  ) => {
    const formData = new FormData();

    formData.append("fullName", data.fullName);

    formData.append("username", data.username);

    if (data.bio) {
      formData.append("bio", data.bio);
    }

    if (data.college) {
      formData.append("college", data.college);
    }

    if (data.department) {
      formData.append("department", data.department);
    }

    if (data.year) {
      formData.append("year", data.year);
    }

    if (data.interests) {
      formData.append("interests", data.interests);
    }

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    const response = await api.put("/user/profile", formData);

    return response.data;
  };

  /* =======================================================
     DELETE PROFILE IMAGE
     ======================================================= */

  const deleteProfileImage = async () => {
    const response = await api.delete("/user/image");

    return response.data;
  };

  /* =======================================================
     RETURN
     ======================================================= */

  return {
    getProfile,
    getPublicProfile,
    createProfile,
    updateProfile,
    deleteProfileImage,
  };
};
