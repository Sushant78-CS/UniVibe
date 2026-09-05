import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useAuth } from "@clerk/react";
import { FileText, ChevronRight } from "lucide-react";

import ProfileTopBar from "../../components/profile/ProfileTopBar";
import ProfileHero from "../../components/profile/ProfileHero";
// import ProfileInfo from "../../components/profile/ProfileInfo";
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
          {/* Profile Hero */}
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

          {/* My Posts */}
          <section
            className="
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
            <button
              type="button"
              onClick={() => navigate("/posts/mine")}
              className="
                group
                flex
                w-full
                items-center
                gap-3
                p-4
                text-left
                transition-colors
                hover:bg-slate-50
                dark:hover:bg-neutral-900/60
              "
            >
              {/* Icon */}
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-950/50
                  dark:text-violet-400
                "
              >
                <FileText size={19} strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <h2
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  My Posts
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                    dark:text-neutral-500
                  "
                >
                  View and edit your posts
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={18}
                className="
                  shrink-0
                  text-slate-400
                  transition-transform
                  group-hover:translate-x-0.5
                  dark:text-neutral-600
                "
              />
            </button>
          </section>

          {/* Profile Actions */}
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

      {/* Logout Modal */}
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

      {/* Profile Image Modal */}
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
