import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";

import ProfileTopBar from "../../components/profile/ProfileTopBar";
import ProfileHero from "../../components/profile/ProfileHero";
import ProfileInfo from "../../components/profile/ProfileInfo";
import ProfileTags from "../../components/profile/ProfileTags";
import ProfileActions from "../../components/profile/ProfileActions";
import FloatingTabs from "../../components/home/FloatingTabs";

import { useProfileApi } from "../../api/profileApi";
import ProfileSkeleton from "../../components/profile/ProfileSkeleton";
import ConfirmModal from "../../components/common/ConfirmModal";

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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isLoaded, signOut } = useAuth();

  const { getProfile } = useProfileApi();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProfile();

        setProfile(data);
      } catch (error: any) {
        console.error("Failed to load profile:", error);

        if (error?.response?.status === 404) {
          navigate("/profile/setup", {
            replace: true,
          });
          return;
        }

        setError("We couldn't load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl dark:bg-red-500/10">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const interests = profile?.interests
    ? profile.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <ProfileTopBar />

      {/* <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6"> */}
      <main
        className="
    mx-auto
    w-full
    max-w-3xl
    px-4
    py-3
    sm:px-6
    sm:py-4
  "
      >
        {loading ? (
          /* Skeleton while profile loads */
          <ProfileSkeleton />
        ) : error ? (
          /* Error */
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl dark:bg-red-500/10">
                !
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Something went wrong
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : profile ? (
          <>
            {/* Profile Hero */}

            <ProfileHero
              profileImage={profile.profileImage || null}
              fullName={profile.fullName}
              department={profile.department ?? ""}
              year={profile.year}
              college={profile.college}
            />

            {/* <div className="mt-3">
              <ProfileStats connections={0} clubs={clubs.length} events={0} />
            </div> */}

            {profile.bio && (
              <section className="mt-4">
                <h2
                  className="
        mb-2
        text-sm
        font-bold
        text-slate-900
        dark:text-white
      "
                >
                  About
                </h2>

                <div
                  className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3.5
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
                >
                  <p
                    className="
          text-xs
          leading-5
          text-slate-600
          dark:text-slate-300
        "
                  >
                    {profile.bio}
                  </p>
                </div>
              </section>
            )}

            <section className="mt-4">
              <ProfileInfo
                college={profile.college}
                department={profile.department ?? ""}
                year={profile.year}
              />
            </section>

            <section className="mt-4">
              <ProfileTags
                title="Interests"
                tags={interests}
                emptyText="Add interests to find people who match your vibe."
              />
            </section>

            {/* <section className="mt-4">
              <ProfileClubs clubs={clubs} />
            </section> */}

            <section className="mt-4">
              <ProfileActions onLogout={() => setShowLogoutModal(true)} />
            </section>

            <p className="pt-6 text-center text-xs text-slate-400 dark:text-slate-600">
              UniVibe · Your campus. Your people.
            </p>
          </>
        ) : null}
      </main>
      <ConfirmModal
        open={showLogoutModal}
        title="Sign out?"
        message="Are you sure you want to sign out of UniVibe?"
        confirmText="Sign Out"
        cancelText="Cancel"
        loadingText="Signing out..."
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => {
          if (!loggingOut) {
            setShowLogoutModal(false);
          }
        }}
      />

      {/* Always visible */}
      <FloatingTabs />
    </div>
  );
};

export default ProfilePage;
