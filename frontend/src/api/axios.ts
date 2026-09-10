import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let getClerkToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (
  tokenGetter: () => Promise<string | null>,
) => {
  getClerkToken = tokenGetter;
};

api.interceptors.request.use(
  async (config) => {
    if (!getClerkToken) {
      return config;
    }

    try {
      const token = await getClerkToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get Clerk authentication token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
