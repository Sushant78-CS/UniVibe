import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import { useProfileApi } from "../api/profileApi";
import LandingLoader from "../components/common/LandingLoader";

function ProtectedLayout() {
  const location = useLocation();

  // Only use stable auth values here.
  const { isLoaded, isSignedIn, userId } = useAuth();

  const { getProfile } = useProfileApi();

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    // Clerk is still loading
    if (!isLoaded) {
      return;
    }

    // User is not signed in
    if (!isSignedIn || !userId) {
      setProfileLoading(false);
      setProfileExists(null);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const profile = await getProfile();

        if (cancelled) return;

        console.log("Profile loaded:", profile);

        setProfileExists(true);
      } catch (error) {
        if (cancelled) return;

        /*
         * IMPORTANT:
         * Only treat 404 as "profile doesn't exist".
         *
         * CORS, 401, 403, 500, network errors, etc.
         * should NOT redirect the user to profile setup.
         */

        if (isAxiosError(error)) {
          const status = error.response?.status;

          console.error(
            "Profile request failed:",
            status,
            error.response?.data,
          );

          if (status === 404) {
            console.log("Profile does not exist.");
            setProfileExists(false);
          } else {
            // API/server/CORS/network problem
            setProfileExists(null);
          }
        } else {
          console.error("Unexpected profile error:", error);

          setProfileExists(null);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  /*
   * Clerk loading
   */
  if (!isLoaded) {
    // return <LoadingScreen message="Loading UniVibe..." />;
    return <LandingLoader />;
  }

  /*
   * Not authenticated
   */
  if (!isSignedIn || !userId) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  /*
   * Profile API is loading
   */
  if (profileLoading || profileExists === null) {
    // return <LoadingScreen message="Loading UniVibe..." />;
    return <LandingLoader />;
  }

  /*
   * User is authenticated but doesn't have
   * a profile yet.
   */
  if (profileExists === false && location.pathname !== "/profile/setup") {
    return <Navigate to="/profile/setup" replace />;
  }

  /*
   * Profile exists, so don't allow the user
   * to go back to profile setup.
   */
  if (profileExists === true && location.pathname === "/profile/setup") {
    return <Navigate to="/home" replace />;
  }

  /*
   * Everything is good.
   */
  return <Outlet />;
}
export default ProtectedLayout;
