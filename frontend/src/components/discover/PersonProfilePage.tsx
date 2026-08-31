import { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, MapPin, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/react";
import ProfileHero from "../../components/profile/ProfileHero";
import ProfileTags from "../../components/profile/ProfileTags";
import ProfileStats from "../../components/profile/ProfileStats";
import ProfileSkeleton from "../../components/profile/ProfileSkeleton";
import { useDiscoverApi } from "../../api/discoverApi";
import ProfileImageModal from "../profile/ProfileImageModal";

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

const PersonProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoaded } = useAuth();
  const { getPersonProfile } = useDiscoverApi();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !id) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPersonProfile(Number(id));
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError("We couldn't load this profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, id]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
          <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="ml-3 space-y-1">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <UserRound size={22} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Profile unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This profile may no longer be available.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const interests =
    profile.interests
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex h-9 w-9 items-center justify-center rounded-xl
              text-slate-600 transition
              hover:bg-slate-100 hover:text-slate-900
              dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white
            "
          >
            <ArrowLeft size={19} />
          </button>

          <div className="ml-3">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">
              Profile
            </h1>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              UniVibe
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        {/* Hero */}
        <ProfileHero
          profileImage={profile.profileImage || null}
          fullName={profile.fullName}
          department={profile.department ?? ""}
          year={profile.year}
          college={profile.college}
          onImageClick={() => setShowImageModal(true)}
        />

        {/* Username */}
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            @{profile.username}
          </p>
        </div>

        {/* Quick information */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <GraduationCap size={17} />

              <span className="text-xs font-medium">Education</span>
            </div>

            <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {profile.department || "Student"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {profile.year}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MapPin size={17} />

              <span className="text-xs font-medium">College</span>
            </div>

            <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {profile.college}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4">
          <ProfileStats connections={0} clubs={0} events={0} />
        </div>

        {/* About */}
        {profile.bio && (
          <section className="mt-5">
            <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
              About
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                {profile.bio}
              </p>
            </div>
          </section>
        )}

        {/* Interests */}
        <section className="mt-5">
          <ProfileTags
            title="Interests"
            tags={interests}
            emptyText="No interests added yet."
          />
        </section>

        {/* Connect */}
        {/* <section className="mt-6">
          <button
            type="button"
            className="
              w-full rounded-2xl
              bg-gradient-to-r from-violet-600 to-fuchsia-600
              px-4 py-3.5
              text-sm font-semibold text-white
              shadow-lg shadow-violet-500/20
              transition
              hover:-translate-y-0.5 hover:shadow-xl
              active:translate-y-0
              dark:shadow-violet-950/30
            "
          >
            Connect with {firstName}
          </button>
        </section> */}

        <p className="pt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          UniVibe · Your campus. Your people.
        </p>
      </main>
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
