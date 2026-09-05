import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router";

import { useAuth } from "@clerk/react";

import { UserRound } from "lucide-react";

import PersonProfileHeader from "../../components/person-profile/PersonProfileHeader";
import PersonProfileInfo from "../../components/person-profile/PersonProfileInfo";
import PersonProfileActions from "../../components/person-profile/PersonProfileActions";
import PersonProfileDetails from "../../components/person-profile/PersonProfileDetails";

import ProfileImageModal from "../../components/profile/ProfileImageModal";

import { useDiscoverApi } from "../../api/discoverApi";
import { useMessageApi } from "../../api/messageApi";

interface Profile {
  id: number;
  fullName: string;
  username: string;
  bio?: string;
  profileImage?: string;
  college?: string;
  department?: string;
  year?: string;
  interests?: string;
  profileCompleted: boolean;
  userId: number;
}

const PersonProfilePage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { isLoaded } = useAuth();

  const { getPersonProfile } = useDiscoverApi();

  const { getOrCreateConversation } = useMessageApi();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [showImageModal, setShowImageModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [messageLoading, setMessageLoading] = useState(false);

  /* ==========================================
     LOAD PROFILE
  ========================================== */

  useEffect(() => {
    if (!isLoaded || !id) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPersonProfile(Number(id));

        if (!cancelled) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);

        if (!cancelled) {
          setError("We couldn't load this profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, id, getPersonProfile]);

  /* ==========================================
     MESSAGE
  ========================================== */

  const handleMessage = async () => {
    if (!profile || messageLoading) {
      return;
    }

    try {
      setMessageLoading(true);

      const conversation = await getOrCreateConversation(profile.userId);

      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setMessageLoading(false);
    }
  };

  /* ==========================================
     LOADING
  ========================================== */

  if (!isLoaded || loading) {
    return (
      <div
        className="
          min-h-screen
          bg-white
          dark:bg-black
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-2xl
          "
        >
          <div
            className="
              flex
              h-14
              items-center
              justify-between
              border-b
              border-neutral-200
              px-4
              dark:border-neutral-800
            "
          >
            <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-900" />

            <div className="h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />

            <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-900" />
          </div>

          <main className="px-4 pt-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-900" />

              <div className="grid flex-1 grid-cols-3 gap-3">
                <div className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                <div className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                <div className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              <div className="h-3 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            </div>

            <div className="mt-5 h-10 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />

            <div className="mt-7 space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              <div className="h-4 w-40 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ==========================================
     ERROR
  ========================================== */

  if (error || !profile) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-white
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
            border-neutral-200
            bg-white
            p-6
            text-center
            dark:border-neutral-800
            dark:bg-[#171717]
          "
        >
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-neutral-100
              text-neutral-500
              dark:bg-neutral-900
              dark:text-neutral-400
            "
          >
            <UserRound size={22} />
          </div>

          <h2
            className="
              mt-4
              text-base
              font-semibold
              text-neutral-900
              dark:text-white
            "
          >
            Profile unavailable
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-neutral-500
              dark:text-neutral-400
            "
          >
            This profile may no longer be available.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              mt-5
              w-full
              rounded-xl
              bg-violet-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-violet-700
              dark:hover:bg-violet-500
            "
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================
     INTERESTS
  ========================================== */

  const interests =
    profile.interests
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  /* ==========================================
     PAGE
  ========================================== */

  return (
    <div
      className="
        min-h-screen
        bg-white
        text-neutral-900
        dark:bg-black
        dark:text-white
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-2xl
        "
      >
        {/* HEADER */}

        <PersonProfileHeader
          fullName={profile.fullName}
          onBack={() => navigate(-1)}
        />

        <main className="pb-10">
          {/* ================================== */}
          {/* PROFILE HEADER */}
          {/* ================================== */}

          <PersonProfileInfo
            profileImage={profile.profileImage}
            fullName={profile.fullName}
            username={profile.username}
            posts={0}
            connections={0}
            clubs={0}
            onImageClick={() => setShowImageModal(true)}
          />

          {/* ================================== */}
          {/* ACTION */}
          {/* ================================== */}

          <PersonProfileActions
            fullName={profile.fullName}
            loading={messageLoading}
            onMessage={handleMessage}
          />

          {/* ================================== */}
          {/* DETAILS */}
          {/* ================================== */}

          <PersonProfileDetails
            bio={profile.bio}
            department={profile.department}
            year={profile.year}
            college={profile.college}
            interests={interests}
          />

          {/* ================================== */}
          {/* FOOTER */}
          {/* ================================== */}

          <div
            className="
              mt-10
              border-t
              border-neutral-200
              px-4
              pt-6
              text-center
              dark:border-neutral-800
            "
          >
            <p
              className="
                text-[11px]
                text-neutral-400
                dark:text-neutral-600
              "
            >
              UniVibe · Your campus. Your people.
            </p>
          </div>
        </main>
      </div>

      {/* ======================================
          IMAGE MODAL
      ====================================== */}

      <ProfileImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        image={profile.profileImage || null}
        name={profile.fullName}
      />
    </div>
  );
};

export default PersonProfilePage;
