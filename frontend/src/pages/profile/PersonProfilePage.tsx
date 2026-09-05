import { useState } from "react";

import { useNavigate, useParams } from "react-router";

import { useAuth } from "@clerk/react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { UserRound } from "lucide-react";

import PersonProfileHeader from "../../components/person-profile/PersonProfileHeader";

import PersonProfileInfo from "../../components/person-profile/PersonProfileInfo";

import PersonProfileActions, {
  type ConnectionStatus,
} from "../../components/person-profile/PersonProfileActions";

import PersonProfileDetails from "../../components/person-profile/PersonProfileDetails";

import ProfileImageModal from "../../components/profile/ProfileImageModal";

import { useDiscoverApi } from "../../api/discoverApi";

import { useMessageApi } from "../../api/messageApi";

import { useConnectionApi } from "../../api/connectionApi";

import { useProfileApi } from "../../api/profileApi";

/* ==========================================
   PROFILE
========================================== */

interface Profile {
  id: number;
  userId: number;

  fullName: string;
  username: string;

  bio?: string;
  profileImage?: string | null;

  college?: string;
  department?: string;
  year?: string;
  interests?: string;

  profileCompleted: boolean;

  connectionStatus?: ConnectionStatus;
  connectionId?: number;

  postsCount?: number;
  connectionsCount?: number;
  clubsCount?: number;
}

/* ==========================================
   CONNECTION INFO
========================================== */

interface ConnectionInfo {
  status: ConnectionStatus;
  connectionId?: number;
}

/* ==========================================
   PAGE
========================================== */

const PersonProfilePage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { isLoaded } = useAuth();

  const { getPersonProfile, getPeople } = useDiscoverApi();

  const { getOrCreateConversation } = useMessageApi();

  const { sendConnection, updateConnection, getRequests, getConnections } =
    useConnectionApi();

  const { getProfile } = useProfileApi();

  const queryClient = useQueryClient();

  /* ==========================================
     PROFILE ID
  ========================================== */

  const profileId = id && !Number.isNaN(Number(id)) ? Number(id) : null;

  /* ==========================================
     UI STATE
  ========================================== */

  const [showImageModal, setShowImageModal] = useState(false);

  const [messageLoading, setMessageLoading] = useState(false);

  const [connectionLoading, setConnectionLoading] = useState(false);

  const [rejectLoading, setRejectLoading] = useState(false);

  /* ==========================================
     PROFILE QUERY
  ========================================== */

  const {
    data: profile,
    isPending: profileLoading,
    isError,
  } = useQuery<Profile>({
    queryKey: ["person-profile", profileId],

    queryFn: async () => {
      if (profileId === null) {
        throw new Error("Invalid profile ID");
      }

      const data = await getPersonProfile(profileId);

      return data as Profile;
    },

    enabled: isLoaded && profileId !== null,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /* ==========================================
     MY PROFILE QUERY
     
     Used only to determine whether the
     profile being viewed belongs to me.
  ========================================== */

  const { data: myProfile, isPending: myProfileLoading } = useQuery<Profile>({
    queryKey: ["profile", "me"],

    queryFn: async () => {
      const data = await getProfile();

      return data as Profile;
    },

    enabled: isLoaded && profileId !== null,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  /* ==========================================
     IS THIS MY PROFILE?
  ========================================== */

  const isOwnProfile = !!profile && !!myProfile && profile.id === myProfile.id;

  /* ==========================================
     CONNECTION QUERY
  ========================================== */

  const { data: connectionInfo, isPending: connectionInfoLoading } =
    useQuery<ConnectionInfo>({
      queryKey: ["person-connection", profileId],

      queryFn: async () => {
        /*
         * If this is the user's own profile,
         * there is no connection action.
         */

        if (isOwnProfile) {
          return {
            status: "SELF",
          };
        }

        /* --------------------------------------
         Fetch everything in parallel
      -------------------------------------- */

        const [people, requests, connections] = await Promise.all([
          getPeople(),
          getRequests(),
          getConnections(),
        ]);

        /* --------------------------------------
         1. INCOMING REQUEST
         
         Most important to check first.
      -------------------------------------- */

        const incomingRequest = requests.find(
          (request) =>
            request.profileId === profileId && request.status === "PENDING",
        );

        if (incomingRequest) {
          return {
            status: "PENDING_RECEIVED",

            connectionId: incomingRequest.id,
          };
        }

        /* --------------------------------------
         2. ALREADY CONNECTED
         
         Connected users may not appear in
         Discover anymore, so use
         getConnections().
      -------------------------------------- */

        const connectedPerson = connections.find(
          (person) => person.profileId === profileId,
        );

        if (connectedPerson) {
          return {
            status: "CONNECTED",

            connectionId: connectedPerson.connectionId,
          };
        }

        /* --------------------------------------
         3. PENDING SENT
         
         Discover API already exposes this.
      -------------------------------------- */

        const discoverPerson = people.find((person) => person.id === profileId);

        if (discoverPerson?.connectionStatus === "PENDING_SENT") {
          return {
            status: "PENDING_SENT",
          };
        }

        /* --------------------------------------
         4. FALLBACK
         
         No relationship exists.
      -------------------------------------- */

        return {
          status: "NONE",
        };
      },

      enabled: isLoaded && profileId !== null && !!profile && !myProfileLoading,

      staleTime: 30 * 1000,

      gcTime: 5 * 60 * 1000,

      refetchOnWindowFocus: false,

      retry: 1,
    });

  /* ==========================================
     FINAL CONNECTION STATUS
  ========================================== */

  const connectionStatus = isOwnProfile
    ? "SELF"
    : (connectionInfo?.status ?? profile?.connectionStatus ?? "NONE");

  const connectionId = connectionInfo?.connectionId ?? profile?.connectionId;

  /* ==========================================
     MESSAGE
  ========================================== */

  const handleMessage = async () => {
    /*
     * Message is only allowed when
     * users are connected.
     */

    if (!profile || connectionStatus !== "CONNECTED" || messageLoading) {
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
     CONNECT
  ========================================== */

  const handleConnect = async () => {
    if (!profile || connectionStatus !== "NONE" || connectionLoading) {
      return;
    }

    try {
      setConnectionLoading(true);

      await sendConnection(profile.userId);

      /* ------------------------------------
           Instant UI update
        ------------------------------------ */

      queryClient.setQueryData(["person-connection", profileId], {
        status: "PENDING_SENT",
      });

      /* ------------------------------------
           Invalidate Discover cache
        ------------------------------------ */

      queryClient.invalidateQueries({
        queryKey: ["people"],
      });
    } catch (error) {
      console.error("Connection request failed:", error);
    } finally {
      setConnectionLoading(false);
    }
  };

  /* ==========================================
     ACCEPT
  ========================================== */

  const handleAccept = async () => {
    if (
      !connectionId ||
      connectionStatus !== "PENDING_RECEIVED" ||
      connectionLoading
    ) {
      return;
    }

    try {
      setConnectionLoading(true);

      await updateConnection(connectionId, "ACCEPT");

      /* ------------------------------------
           Instant UI update
        ------------------------------------ */

      queryClient.setQueryData(["person-connection", profileId], {
        status: "CONNECTED",

        connectionId,
      });

      queryClient.invalidateQueries({
        queryKey: ["people"],
      });

      queryClient.invalidateQueries({
        queryKey: ["connection-requests"],
      });

      queryClient.invalidateQueries({
        queryKey: ["connections"],
      });
    } catch (error) {
      console.error("Failed to accept connection:", error);
    } finally {
      setConnectionLoading(false);
    }
  };

  /* ==========================================
     REJECT
  ========================================== */

  const handleReject = async () => {
    if (
      !connectionId ||
      connectionStatus !== "PENDING_RECEIVED" ||
      rejectLoading
    ) {
      return;
    }

    try {
      setRejectLoading(true);

      await updateConnection(connectionId, "REJECT");

      /* ------------------------------------
           Instant UI update
        ------------------------------------ */

      queryClient.setQueryData(["person-connection", profileId], {
        status: "NONE",
        connectionId: undefined,
      });

      queryClient.invalidateQueries({
        queryKey: ["people"],
      });

      queryClient.invalidateQueries({
        queryKey: ["connection-requests"],
      });
    } catch (error) {
      console.error("Failed to reject connection:", error);
    } finally {
      setRejectLoading(false);
    }
  };

  /* ==========================================
     AUTH LOADING
  ========================================== */

  if (!isLoaded) {
    return <ProfilePageSkeleton />;
  }

  /* ==========================================
     PROFILE LOADING
  ========================================== */

  if (profileLoading || myProfileLoading) {
    return <ProfilePageSkeleton />;
  }

  /* ==========================================
     PROFILE ERROR
  ========================================== */

  if (isError || !profile) {
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
        {/* ==================================
            HEADER
        ================================== */}

        <PersonProfileHeader
          fullName={profile.fullName.toLowerCase()}
          onBack={() => navigate(-1)}
        />

        <main className="pb-10">
          {/* ==================================
              PROFILE
          ================================== */}

          <PersonProfileInfo
            profileImage={profile.profileImage}
            fullName={profile.fullName}
            username={profile.username}
            posts={profile.postsCount ?? 0}
            connections={profile.connectionsCount ?? 0}
            clubs={profile.clubsCount ?? 0}
            onImageClick={() => setShowImageModal(true)}
          />

          {/* ==================================
              ACTIONS
              
              For own profile this component
              returns null.
          ================================== */}

          {!connectionInfoLoading && (
            <PersonProfileActions
              connectionStatus={connectionStatus}
              messageLoading={messageLoading}
              connectionLoading={connectionLoading}
              rejectLoading={rejectLoading}
              onMessage={handleMessage}
              onConnect={handleConnect}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}

          {/* ==================================
              DETAILS
          ================================== */}

          <PersonProfileDetails
            bio={profile.bio}
            department={profile.department}
            year={profile.year}
            college={profile.college}
            interests={interests}
          />

          {/* ==================================
              FOOTER
          ================================== */}

          <p
            className="
              mt-10
              border-t
              border-neutral-200
              px-4
              pt-6
              text-center
              text-[11px]
              text-neutral-400
              dark:border-neutral-800
              dark:text-neutral-600
            "
          >
            UniVibe · Your campus. Your people.
          </p>
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

/* ============================================
   SKELETON
============================================ */

const ProfilePageSkeleton = () => {
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
        {/* HEADER */}

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
          <div
            className="
                h-9
                w-9
                animate-pulse
                rounded-full
                bg-neutral-100
                dark:bg-neutral-900
              "
          />

          <div
            className="
                h-4
                w-24
                animate-pulse
                rounded
                bg-neutral-100
                dark:bg-neutral-900
              "
          />

          <div
            className="
                h-9
                w-9
                animate-pulse
                rounded-full
                bg-neutral-100
                dark:bg-neutral-900
              "
          />
        </div>

        {/* CONTENT */}

        <main className="px-4 pt-6">
          <div className="flex items-center gap-5">
            <div
              className="
                  h-20
                  w-20
                  animate-pulse
                  rounded-full
                  bg-neutral-100
                  dark:bg-neutral-900
                "
            />

            <div
              className="
                  grid
                  flex-1
                  grid-cols-3
                  gap-4
                "
            >
              <div
                className="
                    h-10
                    animate-pulse
                    rounded
                    bg-neutral-100
                    dark:bg-neutral-900
                  "
              />

              <div
                className="
                    h-10
                    animate-pulse
                    rounded
                    bg-neutral-100
                    dark:bg-neutral-900
                  "
              />

              <div
                className="
                    h-10
                    animate-pulse
                    rounded
                    bg-neutral-100
                    dark:bg-neutral-900
                  "
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div
              className="
                  h-4
                  w-32
                  animate-pulse
                  rounded
                  bg-neutral-100
                  dark:bg-neutral-900
                "
            />

            <div
              className="
                  h-3
                  w-20
                  animate-pulse
                  rounded
                  bg-neutral-100
                  dark:bg-neutral-900
                "
            />
          </div>

          <div
            className="
                mt-5
                h-11
                animate-pulse
                rounded-xl
                bg-neutral-100
                dark:bg-neutral-900
              "
          />

          <div className="mt-7 space-y-4">
            <div
              className="
                  h-4
                  w-20
                  animate-pulse
                  rounded
                  bg-neutral-100
                  dark:bg-neutral-900
                "
            />

            <div
              className="
                  h-4
                  w-40
                  animate-pulse
                  rounded
                  bg-neutral-100
                  dark:bg-neutral-900
                "
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PersonProfilePage;
