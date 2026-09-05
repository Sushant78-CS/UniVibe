import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import LandingLoader from "../components/common/LandingLoader";
import api from "../api/axios";

interface ProfileResponse {
  profileCompleted: boolean;
}

function PublicLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);

  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkProfile = async () => {
      // ========================================
      // CLERK STILL LOADING
      // ========================================

      if (!isLoaded) {
        return;
      }

      // ========================================
      // USER NOT AUTHENTICATED
      // ========================================

      if (!isSignedIn) {
        if (!cancelled) {
          setProfileLoading(false);
          setProfileExists(false);
        }

        return;
      }

      try {
        setProfileLoading(true);

        const token = await getToken();

        if (!token) {
          throw new Error("Unable to get Clerk session token.");
        }

        // ======================================
        // GET PROFILE
        // ======================================

        const response = await api.get<ProfileResponse>("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) {
          return;
        }

        setProfileExists(response.data.profileCompleted === true);
      } catch (error: any) {
        if (cancelled) {
          return;
        }

        // ======================================
        // PROFILE DOES NOT EXIST
        // ======================================

        if (error?.response?.status === 404) {
          setProfileExists(false);

          return;
        }

        // ======================================
        // OTHER ERROR
        // ======================================

        console.error("Failed to check profile:", error);

        // Treat unknown profile errors as
        // missing here so a newly authenticated
        // user is not trapped on the public page.
        setProfileExists(false);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  // ==========================================
  // CLERK LOADING
  // ==========================================

  if (!isLoaded) {
    return <LandingLoader />;
  }

  // ==========================================
  // NOT SIGNED IN
  // ==========================================

  if (!isSignedIn) {
    return <Outlet />;
  }

  // ==========================================
  // PROFILE LOADING
  // ==========================================

  if (profileLoading) {
    return <LandingLoader />;
  }

  // ==========================================
  // PROFILE DOES NOT EXIST
  // ==========================================

  if (!profileExists) {
    return <Navigate to="/profile/setup" replace />;
  }

  // ==========================================
  // PROFILE EXISTS
  // ==========================================

  return <Navigate to="/home" replace />;
}

export default PublicLayout;
