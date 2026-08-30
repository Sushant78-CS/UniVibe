import { useEffect, useState } from "react";
import { AlertCircle, UserRound, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { useClubApi, type Club, type ClubMember } from "../../api/clubApi";

import ClubHeader from "../../components/clubs/ClubHeader";
import ClubInfo from "../../components/clubs/ClubInfo";
import ClubStats from "../../components/clubs/ClubStats";
import ClubApplyButton from "../../components/clubs/ClubApplyButton";
import ClubDetailsSkeleton from "../../components/clubs/ClubDetailsSkeleton";

const ClubDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getClub, getClubMembers } = useClubApi();

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load club + members
   */
  useEffect(() => {
    if (!id) {
      setError("Invalid club.");
      setLoading(false);
      return;
    }

    const loadClub = async () => {
      try {
        setLoading(true);
        setError("");

        const clubId = Number(id);

        if (Number.isNaN(clubId)) {
          setError("Invalid club.");
          return;
        }

        const [clubData, membersData] = await Promise.all([
          getClub(clubId),
          getClubMembers(clubId),
        ]);

        setClub(clubData);
        setMembers(membersData);
      } catch (error) {
        console.error("Failed to load club:", error);
        setError("We couldn't load this club.");
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [id]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
          <ClubDetailsSkeleton />
        </main>
      </div>
    );
  }

  /*
   * Error
   */
  if (error || !club) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
          <div
            className="
              w-full
              rounded-3xl
              border border-slate-200
              bg-white
              p-6
              text-center
              shadow-sm
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div
              className="
                mx-auto flex h-12 w-12
                items-center justify-center
                rounded-2xl
                bg-red-100
                text-red-600
                dark:bg-red-500/10
                dark:text-red-400
              "
            >
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Club unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error || "This club could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                mt-5
                rounded-xl
                bg-violet-600
                px-5 py-2.5
                text-sm font-semibold
                text-white
                transition
                hover:bg-violet-700
                active:scale-95
              "
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-10
        text-slate-900
        transition-colors
        dark:bg-slate-950
        dark:text-white
      "
    >
      {/* Club Header */}
      <ClubHeader
        name={club.name}
        category={club.category}
        image={club.image}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <div className="space-y-4">
          {/* Stats */}
          <ClubStats memberCount={club.memberCount} />

          {/* About */}
          {club.description && <ClubInfo description={club.description} />}

          {/* Apply */}
          <section
            className="
              flex items-center justify-between
              gap-4
              rounded-2xl
              border border-slate-200
              bg-white
              px-4 py-3
              shadow-sm
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Interested in joining?
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Send a request to join this club.
              </p>
            </div>

            <div className="flex justify-end">
              <ClubApplyButton clubId={club.id} />
            </div>
          </section>

          {/* Members */}
          <section className="pt-2">
            {/* Section Header */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Members
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  People in this community
                </p>
              </div>

              <div
                className="
                  flex items-center gap-1.5
                  text-xs
                  text-slate-400
                  dark:text-slate-500
                "
              >
                <Users size={14} />

                <span>{members.length}</span>
              </div>
            </div>

            {/* Members List */}
            <div
              className="
                overflow-hidden
                rounded-2xl
                border border-slate-200
                bg-white
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              {members.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {members.map((member) => (
                    <button
                      key={member.profileId}
                      type="button"
                      onClick={() => navigate(`/profile/${member.profileId}`)}
                      className="
                        flex w-full
                        items-center
                        gap-3
                        px-4 py-3
                        text-left
                        transition
                        hover:bg-slate-50
                        dark:hover:bg-slate-800/60
                      "
                    >
                      {/* Avatar */}
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.fullName}
                          className="
                            h-10 w-10
                            shrink-0
                            rounded-full
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex h-10 w-10
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-slate-100
                            text-slate-500
                            dark:bg-slate-800
                            dark:text-slate-400
                          "
                        >
                          <UserRound size={18} />
                        </div>
                      )}

                      {/* User Information */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {member.fullName}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-slate-500
                            dark:text-slate-400
                          "
                        >
                          @{member.username}
                        </p>

                        {(member.department || member.year) && (
                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[11px]
                              text-slate-400
                              dark:text-slate-500
                            "
                          >
                            {member.department}

                            {member.department && member.year && " · "}

                            {member.year}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      {member.role && (
                        <span
                          className="
                            shrink-0
                            rounded-lg
                            bg-slate-100
                            px-2 py-1
                            text-[10px]
                            font-semibold
                            text-slate-600
                            dark:bg-slate-800
                            dark:text-slate-300
                          "
                        >
                          {member.role}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="px-5 py-8 text-center">
                  <div
                    className="
                      mx-auto flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      bg-slate-100
                      text-slate-400
                      dark:bg-slate-800
                    "
                  >
                    <Users size={18} />
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    No members yet
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Be the first to join this club.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <p
            className="
              pt-4
              text-center
              text-xs
              text-slate-400
              dark:text-slate-600
            "
          >
            UniVibe · Your campus. Your communities.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ClubDetailsPage;
