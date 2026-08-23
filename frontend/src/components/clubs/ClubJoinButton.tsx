import { useEffect, useState } from "react";
import { Check, Clock, UserPlus } from "lucide-react";

import { useClubApplicationApi } from "../../api/clubApplicationApi";

interface ClubApplyButtonProps {
  clubId: number;
}

const ClubApplyButton = ({ clubId }: ClubApplyButtonProps) => {
  const { applyToClub, getMyApplication, withdrawApplication } =
    useClubApplicationApi();

  const [status, setStatus] = useState<
    "NONE" | "PENDING" | "ACCEPTED" | "REJECTED"
  >("NONE");

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const application = await getMyApplication(clubId);

        setStatus(application.status);
      } catch (error: any) {
        // 404 means the user has not applied yet
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
    if (applying || status === "PENDING" || status === "ACCEPTED") {
      return;
    }

    try {
      setApplying(true);

      const application = await applyToClub(clubId);

      setStatus(application.status);
    } catch (error) {
      console.error("Failed to apply to club:", error);
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setApplying(true);

      await withdrawApplication(clubId);

      setStatus("NONE");
    } catch (error) {
      console.error("Failed to withdraw application:", error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="
          inline-flex items-center gap-2
          rounded-xl
          bg-slate-200
          px-4 py-2.5
          text-sm font-semibold
          text-slate-400
          dark:bg-slate-800
        "
      >
        Checking...
      </button>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <button
        type="button"
        disabled
        className="
          inline-flex items-center gap-2
          rounded-xl
          bg-emerald-50
          px-4 py-2.5
          text-sm font-semibold
          text-emerald-600
          dark:bg-emerald-500/10
          dark:text-emerald-400
        "
      >
        <Check size={16} />
        Joined
      </button>
    );
  }

  if (status === "PENDING") {
    return (
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={applying}
        className="
          inline-flex items-center gap-2
          rounded-xl
          bg-amber-50
          px-4 py-2.5
          text-sm font-semibold
          text-amber-600
          transition
          hover:bg-amber-100
          dark:bg-amber-500/10
          dark:text-amber-400
          dark:hover:bg-amber-500/15
        "
      >
        <Clock size={16} />
        {applying ? "Updating..." : "Application sent"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={applying}
      className="
        inline-flex items-center gap-2
        rounded-xl
        bg-slate-900
        px-4 py-2.5
        text-sm font-semibold
        text-white
        shadow-sm
        transition
        hover:bg-slate-800
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-60
        dark:bg-white
        dark:text-slate-900
        dark:hover:bg-slate-100
      "
    >
      {applying ? (
        <>
          <span
            className="
              h-4 w-4
              animate-spin
              rounded-full
              border-2
              border-current
              border-t-transparent
            "
          />
          Applying...
        </>
      ) : (
        <>
          <UserPlus size={16} />
          Apply to join
        </>
      )}
    </button>
  );
};

export default ClubApplyButton;
