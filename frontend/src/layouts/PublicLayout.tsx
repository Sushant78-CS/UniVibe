import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import LandingLoader from "../components/common/LandingLoader";

interface ProfileResponse {
  profileCompleted: boolean;
}

function PublicLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      // Clerk is still loading
      if (!isLoaded) {
        return;
      }

      // User is not authenticated
      if (!isSignedIn) {
        setProfileLoading(false);
        setProfileExists(false);
        return;
      }

      try {
        setProfileLoading(true);

        const token = await getToken();

        if (!token) {
          throw new Error("Unable to get Clerk session token.");
        }

        const response = await fetch("http://localhost:8000/api/profile/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // User is authenticated but doesn't have a profile yet
        if (response.status === 404) {
          setProfileExists(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to check profile: ${response.status}`);
        }

        const profile: ProfileResponse = await response.json();

        setProfileExists(profile.profileCompleted === true);
      } catch (error) {
        console.error("Failed to check profile:", error);
        setProfileExists(false);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [isLoaded, isSignedIn, getToken]);

  // =========================================
  // CLERK AUTH LOADING
  // =========================================

  if (!isLoaded) {
    // return <LoadingScreen message="Loading UniVibe..." />;
    return <LandingLoader />;
  }

  // =========================================
  // USER NOT AUTHENTICATED
  // =========================================

  if (!isSignedIn) {
    return <Outlet />;
  }

  // =========================================
  // PROFILE LOADING
  // =========================================

  if (profileLoading) {
    return <LandingLoader />;
  }

  // =========================================
  // USER AUTHENTICATED
  // PROFILE DOES NOT EXIST
  // =========================================

  if (!profileExists) {
    return <Navigate to="/profile/setup" replace />;
  }

  // =========================================
  // USER AUTHENTICATED
  // PROFILE EXISTS
  // =========================================

  return <Navigate to="/home" replace />;
}

export default PublicLayout;
