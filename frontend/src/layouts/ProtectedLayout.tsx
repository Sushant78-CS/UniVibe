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

  const {
    data: profile,
    isPending: profileLoading,
    isError,
    error,
  } = useQuery<Profile>({
    queryKey: ["profile", "me", userId],

    queryFn: async () => {
      const result = await getProfile();

      return result as Profile;
    },

    enabled: isLoaded && !!isSignedIn && !!userId,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: (failureCount, queryError) => {
      // A missing profile is expected for
      // a newly registered user.
      if (isAxiosError(queryError) && queryError.response?.status === 404) {
        return false;
      }

      // Retry real server/network failures once.
      return failureCount < 1;
    },
  });

  // ==========================================
  // CLERK LOADING
  // ==========================================

  if (!isLoaded) {
    return <LandingLoader />;
  }

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================

  if (!isSignedIn || !userId) {
    return (
      <Navigate
        to="/signup"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ==========================================
  // PROFILE LOADING
  // ==========================================

  if (profileLoading) {
    return <LandingLoader />;
  }

  // ==========================================
  // PROFILE ERROR
  // ==========================================

  if (isError) {
    const status = isAxiosError(error) ? error.response?.status : undefined;

    // ========================================
    // NO PROFILE YET
    // ========================================

    if (status === 404) {
      /*
       * IMPORTANT:
       *
       * A new user has no profile yet.
       *
       * If they are already on /profile/setup,
       * allow ProfileSetupPage to render.
       */

      if (location.pathname === "/profile/setup") {
        return (
          <Outlet
            context={{
              profile: undefined,
            }}
          />
        );
      }

      /*
       * Otherwise send them to setup.
       */

      return <Navigate to="/profile/setup" replace />;
    }

    // ========================================
    // REAL ERROR
    // ========================================

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
            onClick={() => window.location.reload()}
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
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO PROFILE DATA
  // ==========================================

  if (!profile) {
    if (location.pathname === "/profile/setup") {
      return (
        <Outlet
          context={{
            profile: undefined,
          }}
        />
      );
    }

    return <Navigate to="/profile/setup" replace />;
  }

  // ==========================================
  // PROFILE EXISTS
  // ==========================================

  if (location.pathname === "/profile/setup") {
    return <Navigate to="/home" replace />;
  }

  // ==========================================
  // EVERYTHING READY
  // ==========================================

  return (
    <Outlet
      context={{
        profile,
      }}
    />
  );
}

export default ProtectedLayout;
