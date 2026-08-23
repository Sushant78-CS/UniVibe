import { Check, Clock, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useClubApplicationApi,
  type ClubApplicationStatus,
} from "../../api/clubApplicationApi";

interface ClubApplyButtonProps {
  clubId: number;
}

const ClubApplyButton = ({ clubId }: ClubApplyButtonProps) => {
  const { applyToClub, getMyApplication, withdrawApplication } =
    useClubApplicationApi();

  const [status, setStatus] = useState<ClubApplicationStatus | "NONE">("NONE");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);

        const application = await getMyApplication(clubId);

        setStatus(application.status);
      } catch (error: any) {
        // 404 means the user has not applied
        if (error?.response?.status === 404) {
          setStatus("NONE");
        } else {
          console.error("Failed to load club application:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [clubId]);

  const handleApply = async () => {
    try {
      setSubmitting(true);

      const application = await applyToClub(clubId);

      setStatus(application.status);
    } catch (error: any) {
      console.error("Failed to apply to club:", error);

      alert(error?.response?.data?.error || "Unable to apply to this club.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setSubmitting(true);

      await withdrawApplication(clubId);

      setStatus("NONE");
    } catch (error: any) {
      console.error("Failed to withdraw application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    );
  }

  // Already a member
  if (status === "ACCEPTED") {
    return (
      <button
        type="button"
        disabled
        className="
          flex w-full items-center justify-center
          gap-2 rounded-xl
          bg-emerald-50
          px-4 py-2.5
          text-sm font-semibold
          text-emerald-600
          dark:bg-emerald-500/10
          dark:text-emerald-400
        "
      >
        <Check size={16} />
        Member
      </button>
    );
  }

  // Waiting for admin
  if (status === "PENDING") {
    return (
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={submitting}
        className="
          flex w-full items-center justify-center
          gap-2 rounded-xl
          border border-slate-200
          bg-slate-100
          px-4 py-2.5
          text-sm font-semibold
          text-slate-600
          transition
          hover:bg-slate-200
          disabled:cursor-not-allowed
          disabled:opacity-60
          dark:border-slate-700
          dark:bg-slate-800
          dark:text-slate-300
          dark:hover:bg-slate-700
        "
      >
        <Clock size={16} />

        {submitting ? "Withdrawing..." : "Application Sent"}
      </button>
    );
  }

  // Rejected / never applied
  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={submitting}
      className="
        flex w-full items-center justify-center
        gap-2 rounded-xl
        bg-violet-600
        px-4 py-2.5
        text-sm font-semibold
        text-white
        transition
        hover:bg-violet-700
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <UserPlus size={16} />

      {submitting ? "Applying..." : "Apply to Join"}
    </button>
  );
};

export default ClubApplyButton;
