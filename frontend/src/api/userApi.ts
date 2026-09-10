import api from "../api/axios";

interface SyncUserData {
  email: string;
}

export const useUserApi = () => {
  const syncUser = async (data: SyncUserData) => {
    const response = await api.post("/auth/sync-user", data);

    return response.data;
  };

  return {
    syncUser,
  };
};
