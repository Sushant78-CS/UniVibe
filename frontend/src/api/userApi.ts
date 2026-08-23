import { useAuth } from "@clerk/react";
import api from "../api/axios";

interface SyncUserData {
  email: string;
}

export const useUserApi = () => {
  const { getToken } = useAuth();

  const syncUser = async (data: SyncUserData) => {
    const token = await getToken();

    const response = await api.post("/auth/sync-user", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  return {
    syncUser,
  };
};
