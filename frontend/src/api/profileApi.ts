import { useAuth } from "@clerk/react";
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

export const useProfileApi = () => {
  const { getToken } = useAuth();

  const getProfile = async () => {
    const token = await getToken();

    const response = await api.get("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const createProfile = async (
    data: CreateProfileData,
    profileImage?: File | null,
  ) => {
    const token = await getToken();

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

    const response = await api.post("/user/profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  return {
    getProfile,
    createProfile,
  };
};
