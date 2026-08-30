import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  useClubApplicationApi,
  type ClubApplication,
} from "../../api/clubApplicationApi";

const ClubApplicationsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { getPendingApplications, updateApplication } = useClubApplicationApi();

  const [applications, setApplications] = useState<ClubApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid club.");
      setLoading(false);
      return;
    }

    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPendingApplications(Number(id));

        setApplications(data);
      } catch (error) {
        console.error("Failed to load applications:", error);

        setError("Unable to load club applications.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [id]);

  const handleAction = async (
    applicationId: number,
    action: "ACCEPT" | "REJECT",
  ) => {
    try {
      setProcessingId(applicationId);

      await updateApplication(applicationId, action);

      // Remove it from the pending list
      setApplications((current) =>
        current.filter((application) => application.id !== applicationId),
      );
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} application:`, error);

      setError(
        `Unable to ${action === "ACCEPT" ? "accept" : "reject"} application.`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="ml-3 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl
              text-slate-600
              transition
              hover:bg-slate-100
              hover:text-slate-900
              active:scale-95
              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <ArrowLeft size={19} />
          </button>

          <div className="ml-3 min-w-0">
            <h1 className="truncate text-sm font-semibold">
              Club Applications
            </h1>

            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              Review membership requests
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        {/* Intro */}
        <section>
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            CLUB ADMIN
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Applications
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review students who want to join your club.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Count */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Pending requests</h3>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Applications waiting for your decision
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Users size={15} />
            {applications.length}
          </div>
        </div>

        {/* Applications */}
        <section className="mt-3">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Clock size={22} />
              </div>

              <p className="mt-4 text-sm font-semibold">
                No pending applications
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                New membership requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((application) => {
                  const processing = processingId === application.id;

                  return (
                    <div key={application.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        {application.profileImage ? (
                          <img
                            src={application.profileImage}
                            alt={application.fullName}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <UserRound size={19} />
                          </div>
                        )}

                        {/* User info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {application.fullName}
                          </p>

                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            @{application.username}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            Applied{" "}
                            {new Date(
                              application.appliedAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Pending badge */}
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          <Clock size={11} />
                          Pending
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleAction(application.id, "REJECT")}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-1.5
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-slate-600
                            transition
                            hover:border-red-200
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            dark:border-slate-700
                            dark:bg-slate-900
                            dark:text-slate-300
                            dark:hover:border-red-500/30
                            dark:hover:bg-red-500/10
                            dark:hover:text-red-400
                          "
                        >
                          {processing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleAction(application.id, "ACCEPT")}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-1.5
                            rounded-xl
                            bg-emerald-600
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-emerald-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {processing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <p className="pt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          UniVibe · Club administration
        </p>
      </main>
    </div>
  );
};

export default ClubApplicationsPage;
