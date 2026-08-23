import { useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/react";

import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();

  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Clerk is still loading
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    // User is signed in
    if (isSignedIn && user) {
      console.log("Clerk auth state:", user);

      setUser(user);
      setLoading(false);

      return;
    }

    // User is signed out
    console.log("Clerk auth state: signed out");

    setUser(null);
    setLoading(false);
  }, [isLoaded, isSignedIn, user, userId, setUser, setLoading]);

  return {
    user: storeUser,
    loading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    userId,
  };
};
