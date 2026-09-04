import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useAuth } from "@clerk/react";

import ProfileTopBar from "../../components/profile/ProfileTopBar";
import ProfileHero from "../../components/profile/ProfileHero";
import ProfileInfo from "../../components/profile/ProfileInfo";
import ProfileActions from "../../components/profile/ProfileActions";
import FloatingTabs from "../../components/home/FloatingTabs";
import ConfirmModal from "../../components/common/ConfirmModal";
import ProfileImageModal from "../../components/profile/ProfileImageModal";

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

interface ProtectedLayoutContext {
  profile: Profile;
}

const ProfilePage = () => {
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const { profile } = useOutletContext<ProtectedLayoutContext>();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-28
        text-slate-900
        transition-colors
        duration-200
        dark:bg-black
        dark:text-white
      "
    >
      <ProfileTopBar />

      <main
        className="
          mx-auto
          w-full
          max-w-[680px]
          px-4
          pb-8
          pt-3
          sm:px-0
          sm:pt-5
        "
      >
        <div className="space-y-4">
          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_1px_4px_rgba(15,23,42,0.04)]
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:shadow-none
            "
          >
            <ProfileHero
              profileImage={profile.profileImage || null}
              fullName={profile.fullName}
              department={profile.department ?? ""}
              year={profile.year}
              college={profile.college}
              onImageClick={() => setShowImageModal(true)}
            />
          </section>

          {profile.bio && (
            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_1px_4px_rgba(15,23,42,0.04)]
                dark:border-neutral-800
                dark:bg-[#171717]
                dark:shadow-none
              "
            >
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                About
              </h2>

              <p
                className="
                  mt-2
                  whitespace-pre-wrap
                  text-sm
                  leading-6
                  text-slate-600
                  dark:text-neutral-400
                "
              >
                {profile.bio}
              </p>
            </section>
          )}

          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-1
              shadow-[0_1px_4px_rgba(15,23,42,0.04)]
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:shadow-none
            "
          >
            <ProfileInfo
              college={profile.college}
              department={profile.department ?? ""}
              year={profile.year}
            />
          </section>

          {/* <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-1
              shadow-[0_1px_4px_rgba(15,23,42,0.04)]
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:shadow-none
            "
          >
            <ProfileTags
              title="Interests"
              tags={interests}
              emptyText="Add interests to find people who match your vibe."
            />
          </section> */}

          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-1
              shadow-[0_1px_4px_rgba(15,23,42,0.04)]
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:shadow-none
            "
          >
            <ProfileActions onLogout={() => setShowLogoutModal(true)} />
          </section>

          <p
            className="
              py-4
              text-center
              text-[11px]
              text-slate-400
              dark:text-neutral-600
            "
          >
            UniVibe · Your campus. Your people.
          </p>
        </div>
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

      <ProfileImageModal
        open={showImageModal}
        image={profile.profileImage || null}
        name={profile.fullName || ""}
        onClose={() => setShowImageModal(false)}
      />

      <FloatingTabs />
    </div>
  );
};

export default ProfilePage;
