import { Navigate, Outlet, useLocation } from "react-router";
import { useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { useProfileApi } from "../api/profileApi";

function ProtectedLayout() {
  const location = useLocation();
  const { user, isLoaded } = useUser();

  const { getProfile } = useProfileApi();

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setProfileLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        await getProfile();

        setProfileExists(true);
      } catch (error) {
        console.log("Profile not found");
        setProfileExists(false);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, isLoaded]);

  if (!isLoaded || profileLoading) {
    return <LoadingScreen message="Loading UniVibe..." />;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!profileExists && location.pathname !== "/profile/setup") {
    return <Navigate to="/profile/setup" replace />;
  }

  if (profileExists && location.pathname === "/profile/setup") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500" />

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
      </div>
    </div>
  );
}

export default ProtectedLayout;
