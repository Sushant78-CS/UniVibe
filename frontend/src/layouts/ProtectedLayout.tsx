import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@clerk/react";

import { useQuery } from "@tanstack/react-query";

import { isAxiosError } from "axios";

import { useProfileApi } from "../api/profileApi";
import LandingLoader from "../components/common/LandingLoader";

interface Profile {
  id: number;
  fullName: string;
  username: string;
  bio?: string;
  profileImage?: string;
  college: string;
  department?: string;
  year: string;
  interests?: string;
  profileCompleted: boolean;
}

function ProtectedLayout() {
  const location = useLocation();

  const { isLoaded, isSignedIn, userId } = useAuth();

  const { getProfile } = useProfileApi();

  /*
   * ==================================================
   * PROFILE QUERY
   * ==================================================
   *
   * IMPORTANT:
   * This hook is ALWAYS called.
   *
   * We use "enabled" instead of putting the hook
   * below conditional returns.
   */

  const {
    data: profile,
    isPending: profileLoading,
    isError,
    error,
  } = useQuery<Profile>({
    queryKey: ["profile", "me"],

    queryFn: async () => {
      const result = await getProfile();

      return result as Profile;
    },

    enabled: isLoaded && !!isSignedIn && !!userId,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    retry: (failureCount, queryError) => {
      /*
       * Profile does not exist.
       * Don't retry a 404.
       */

      if (isAxiosError(queryError) && queryError.response?.status === 404) {
        return false;
      }

      /*
       * Only one retry for server/network
       * failures.
       */

      return failureCount < 1;
    },
  });

  /*
   * ==================================================
   * CLERK LOADING
   * ==================================================
   */

  if (!isLoaded) {
    return <LandingLoader />;
  }

  /*
   * ==================================================
   * NOT AUTHENTICATED
   * ==================================================
   */

  if (!isSignedIn || !userId) {
    return <Navigate to="/signup" replace state={{ from: location }} />;
  }

  /*
   * ==================================================
   * PROFILE LOADING
   * ==================================================
   */

  if (profileLoading) {
    return <LandingLoader />;
  }

  /*
   * ==================================================
   * PROFILE ERROR
   * ==================================================
   */

  if (isError) {
    /*
     * Only a 404 means that the authenticated
     * user doesn't have a profile yet.
     */

    if (isAxiosError(error) && error.response?.status === 404) {
      if (location.pathname !== "/profile/setup") {
        return <Navigate to="/profile/setup" replace />;
      }
    }

    /*
     * For 401 / 403 / 500 / network errors,
     * don't send the user to profile setup.
     *
     * Show a simple error instead.
     */

    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-5

          dark:bg-black
        "
      >
        <div
          className="
            w-full
            max-w-sm
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            text-center
            shadow-sm

            dark:border-neutral-800
            dark:bg-[#171717]
            dark:shadow-none
          "
        >
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-sm
              font-bold
              text-red-600

              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            !
          </div>

          <h2
            className="
              mt-4
              text-base
              font-semibold
              text-slate-900

              dark:text-white
            "
          >
            Unable to load UniVibe
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500

              dark:text-neutral-500
            "
          >
            We couldn't verify your profile. Please try again.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="
              mt-5
              w-full
              rounded-xl
              bg-violet-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-violet-700

              dark:hover:bg-violet-500
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ==================================================
   * PROFILE DOESN'T EXIST
   * ==================================================
   *
   * In case the query somehow has no data without
   * being an error, treat it safely as missing.
   */

  if (!profile) {
    if (location.pathname !== "/profile/setup") {
      return <Navigate to="/profile/setup" replace />;
    }

    return <Outlet context={{ profile }} />;
  }

  /*
   * ==================================================
   * PROFILE EXISTS
   * ==================================================
   *
   * Don't allow a completed user to remain
   * on profile setup.
   */

  if (location.pathname === "/profile/setup") {
    return <Navigate to="/home" replace />;
  }

  /*
   * ==================================================
   * EVERYTHING IS READY
   * ==================================================
   */

  return <Outlet context={{ profile }} />;
}

export default ProtectedLayout;
