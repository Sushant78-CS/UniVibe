import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

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
    return <LoadingScreen message="Loading UniVibe..." />;
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
    return <LoadingScreen message="Setting up your profile..." />;
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

function LoadingScreen({ message }: { message: string }) {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
        dark:bg-slate-950
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-slate-200
            border-t-violet-600
            dark:border-slate-700
            dark:border-t-violet-500
          "
        />

        <p
          className="
            mt-4
            text-sm
            text-slate-500
            dark:text-slate-400
          "
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export default PublicLayout;
