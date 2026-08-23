import { UserRound, UserPlus, Check } from "lucide-react";
import type { DiscoverPerson } from "../../api/discoverApi";

interface PersonCardProps {
  person: DiscoverPerson;
  onClick?: () => void;
  onConnect?: () => void;
  connectionStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";
  connecting?: boolean;
}

const PersonCard = ({
  person,
  onClick,
  onConnect,
  connectionStatus = "NONE",
  connecting = false,
}: PersonCardProps) => {
  const isPendingSent = connectionStatus === "PENDING_SENT";
  const isPendingReceived = connectionStatus === "PENDING_RECEIVED";
  const isConnected = connectionStatus === "ACCEPTED";

  return (
    <div
      onClick={onClick}
      className="
        flex cursor-pointer items-center gap-3
        rounded-2xl
        border border-slate-200
        bg-white
        p-3
        transition
        hover:bg-slate-50
        dark:border-slate-800
        dark:bg-slate-900
        dark:hover:bg-slate-800
      "
    >
      {/* Profile Image */}
      {person.profileImage ? (
        <img
          src={person.profileImage}
          alt={person.fullName}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-full
            bg-violet-100
            text-violet-600
            dark:bg-violet-500/10
            dark:text-violet-400
          "
        >
          <UserRound size={20} />
        </div>
      )}

      {/* Name + Username */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {person.fullName}
        </h3>

        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          @{person.username}
        </p>
      </div>

      {/* Connection Button */}
      <button
        type="button"
        disabled={
          isPendingSent || isConnected || connecting || isPendingReceived
        }
        onClick={(e) => {
          e.stopPropagation();

          if (connectionStatus === "NONE" && !connecting) {
            onConnect?.();
          }
        }}
        className={`
    flex shrink-0 items-center gap-1.5
    rounded-lg
    px-3 py-1.5
    text-xs font-semibold
    transition

    ${
      isConnected
        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        : isPendingSent
          ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          : isPendingReceived
            ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            : "bg-violet-600 text-white hover:bg-violet-700 active:scale-95"
    }

    disabled:cursor-default
  `}
      >
        {connecting ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Sending
          </>
        ) : isConnected ? (
          <>
            <Check size={13} />
            Connected
          </>
        ) : isPendingSent ? (
          "Request Sent"
        ) : isPendingReceived ? (
          "Accept"
        ) : (
          <>
            <UserPlus size={13} />
            Connect
          </>
        )}
      </button>
    </div>
  );
};

export default PersonCard;
