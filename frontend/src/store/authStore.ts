import type { UserResource } from "@clerk/react/types";
import { create } from "zustand";

interface AuthStore {
  user: UserResource | null;
  loading: boolean;

  setUser: (user: UserResource | null) => void;
  setLoading: (loading: boolean) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => {
    set({ user });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  clearAuth: () => {
    set({
      user: null,
      loading: false,
    });
  },
}));
