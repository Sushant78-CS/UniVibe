import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Send, X } from "lucide-react";
import { isAxiosError } from "axios";
import {
  useClubApplicationApi,
  type ClubApplication,
} from "../../api/clubApplicationApi";

interface ClubApplyButtonProps {
  clubId: number;
}

const ClubApplyButton = ({ clubId }: ClubApplyButtonProps) => {
  const { applyToClub, getMyApplication, withdrawApplication } =
    useClubApplicationApi();

  const [application, setApplication] = useState<ClubApplication | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyApplication(clubId);

        if (!cancelled) {
          setApplication(data);
        }
      } catch (error) {
        if (cancelled) return;

        /*
         * If there is no application, the backend should ideally
         * return 404.
         *
         * Until then, treat 404 as "not applied".
         */
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            setApplication(null);
            return;
          }

          console.error("Failed to load application:", error.response?.data);
        } else {
          console.error("Failed to load application:", error);
        }

        setError("Unable to check application status.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplication();

    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const handleApply = async () => {
    try {
      setSubmitting(true);
      setError("");

      const data = await applyToClub(clubId);

      setApplication(data);
    } catch (error: any) {
      console.error("Failed to apply:", error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to submit application.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setSubmitting(true);
      setError("");

      await withdrawApplication(clubId);

      setApplication(null);
    } catch (error: any) {
      console.error("Failed to withdraw:", error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to withdraw application.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="
          inline-flex
          min-w-[150px]
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-slate-200
          px-5
          py-2.5
          text-sm
          font-semibold
          text-slate-500
          dark:bg-slate-800
          dark:text-slate-400
        "
      >
        <Loader2 size={16} className="animate-spin" />
        Checking...
      </button>
    );
  }

  if (error && !application) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={submitting}
          className="
            inline-flex
            min-w-[150px]
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-violet-600
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-violet-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Send size={16} />
              Apply
            </>
          )}
        </button>

        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  /*
   * PENDING
   */
  if (application?.status === "PENDING") {
    return (
      <div className="flex flex-col items-end gap-2">
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            px-5
            py-2.5
            text-sm
            font-semibold
            text-amber-700
            dark:border-amber-500/20
            dark:bg-amber-500/10
            dark:text-amber-400
          "
        >
          <Clock size={16} />
          Application Pending
        </div>

        <button
          type="button"
          onClick={handleWithdraw}
          disabled={submitting}
          className="
            text-xs
            font-medium
            text-slate-500
            transition
            hover:text-red-500
            disabled:opacity-50
          "
        >
          {submitting ? "Withdrawing..." : "Withdraw application"}
        </button>
      </div>
    );
  }

  /*
   * ACCEPTED
   */
  if (application?.status === "ACCEPTED") {
    return (
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-emerald-50
          px-5
          py-2.5
          text-sm
          font-semibold
          text-emerald-700
          dark:bg-emerald-500/10
          dark:text-emerald-400
        "
      >
        <Check size={17} />
        Member
      </div>
    );
  }

  /*
   * REJECTED
   */
  if (application?.status === "REJECTED") {
    return (
      <div className="flex flex-col items-end gap-2">
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-2.5
            text-sm
            font-semibold
            text-red-600
            dark:border-red-500/20
            dark:bg-red-500/10
            dark:text-red-400
          "
        >
          <X size={16} />
          Application Rejected
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={submitting}
          className="
            text-xs
            font-semibold
            text-violet-600
            transition
            hover:text-violet-700
            dark:text-violet-400
          "
        >
          {submitting ? "Applying..." : "Apply again"}
        </button>
      </div>
    );
  }

  /*
   * NO APPLICATION
   */
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleApply}
        disabled={submitting}
        className="
          inline-flex
          min-w-[150px]
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-violet-600
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-violet-700
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Applying...
          </>
        ) : (
          <>
            <Send size={16} />
            Apply to Join
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ClubApplyButton;
