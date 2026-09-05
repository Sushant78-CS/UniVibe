import { Check, Clock3, MessageCircle, UserPlus, X } from "lucide-react";

export type ConnectionStatus =
  | "SELF"
  | "NONE"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "CONNECTED";

interface PersonProfileActionsProps {
  connectionStatus: ConnectionStatus;

  messageLoading: boolean;
  connectionLoading: boolean;
  rejectLoading?: boolean;

  onMessage: () => void;
  onConnect: () => void;
  onAccept: () => void;
  onReject: () => void;
}

/* ==========================================
   COMPONENT
========================================== */

const PersonProfileActions = ({
  connectionStatus,
  messageLoading,
  connectionLoading,
  rejectLoading = false,
  onMessage,
  onConnect,
  onAccept,
  onReject,
}: PersonProfileActionsProps) => {
  const connectionBusy = connectionLoading || rejectLoading;

  /* ========================================
     SELF
  ======================================== */

  if (connectionStatus === "SELF") {
    return null;
  }

  /* ========================================
     NOT CONNECTED
  ======================================== */

  if (connectionStatus === "NONE") {
    return (
      <div className="mt-5 px-4">
        <button
          type="button"
          onClick={onConnect}
          disabled={connectionBusy}
          className="
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-violet-600
            px-4
            text-sm
            font-semibold
            text-white
            transition-all
            duration-150
            hover:bg-violet-700
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:hover:bg-violet-500
          "
        >
          {connectionLoading ? (
            <Loader />
          ) : (
            <UserPlus size={17} strokeWidth={2} />
          )}

          {connectionLoading ? "Sending request..." : "Connect"}
        </button>
      </div>
    );
  }

  /* ========================================
     REQUEST SENT
  ======================================== */

  if (connectionStatus === "PENDING_SENT") {
    return (
      <div className="mt-5 px-4">
        <div
          className="
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-neutral-200
            bg-neutral-50
            px-4
            text-sm
            font-semibold
            text-neutral-600
            dark:border-neutral-800
            dark:bg-neutral-950
            dark:text-neutral-400
          "
        >
          <Clock3 size={17} strokeWidth={2} />
          Request sent
        </div>
      </div>
    );
  }

  /* ========================================
     INCOMING REQUEST
  ======================================== */

  if (connectionStatus === "PENDING_RECEIVED") {
    return (
      <div className="mt-5 px-4">
        <div className="grid grid-cols-2 gap-2">
          {/* ACCEPT */}

          <button
            type="button"
            onClick={onAccept}
            disabled={connectionBusy}
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-violet-600
              px-3
              text-sm
              font-semibold
              text-white
              transition-all
              duration-150
              hover:bg-violet-700
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:hover:bg-violet-500
            "
          >
            {connectionLoading ? (
              <Loader />
            ) : (
              <Check size={17} strokeWidth={2} />
            )}
            Accept
          </button>

          {/* REJECT */}

          <button
            type="button"
            onClick={onReject}
            disabled={connectionBusy}
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-neutral-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-neutral-700
              transition-all
              duration-150
              hover:bg-neutral-100
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-neutral-800
              dark:bg-neutral-950
              dark:text-neutral-200
              dark:hover:bg-neutral-900
            "
          >
            {rejectLoading ? <Loader /> : <X size={17} strokeWidth={2} />}
            Reject
          </button>
        </div>
      </div>
    );
  }

  /* ========================================
     CONNECTED
  ======================================== */

  if (connectionStatus === "CONNECTED") {
    return (
      <div className="mt-5 px-4">
        <button
          type="button"
          onClick={onMessage}
          disabled={messageLoading}
          className="
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-neutral-200
            bg-white
            px-4
            text-sm
            font-semibold
            text-neutral-900
            transition-all
            duration-150
            hover:bg-neutral-100
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:border-neutral-800
            dark:bg-neutral-950
            dark:text-white
            dark:hover:bg-neutral-900
          "
        >
          {messageLoading ? (
            <Loader />
          ) : (
            <MessageCircle size={18} strokeWidth={2} />
          )}

          {messageLoading ? "Opening chat..." : "Message"}
        </button>
      </div>
    );
  }

  return null;
};

/* ==========================================
   LOADER
========================================== */

const Loader = () => {
  return (
    <span
      className="
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-current/25
        border-t-current
      "
    />
  );
};

export default PersonProfileActions;
