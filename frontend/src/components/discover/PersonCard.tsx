import { UserRound, UserPlus, Check, Clock3 } from "lucide-react";

import type { DiscoverPerson } from "../../api/discoverApi";

interface PersonCardProps {
  person: DiscoverPerson;

  onClick?: () => void;

  onConnect?: () => void;

  connectionStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED";

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

  const isConnected = connectionStatus === "CONNECTED";

  /*
   * ============================================
   * CONNECT BUTTON
   * ============================================
   */

  const handleConnect = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (connectionStatus === "NONE" && !connecting) {
      onConnect?.();
    }
  };

  /*
   * ============================================
   * CARD
   * ============================================
   */

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      className="
        group
        flex
        min-h-[88px]
        w-full
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3
        text-left
        shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        outline-none
        transition-all
        duration-150

        hover:border-slate-300
        hover:shadow-[0_3px_10px_rgba(15,23,42,0.06)]

        active:scale-[0.995]

        focus-visible:ring-2
        focus-visible:ring-violet-500/30

        dark:border-neutral-800
        dark:bg-[#171717]
        dark:shadow-none
        dark:hover:border-neutral-700
        dark:hover:bg-[#1b1b1b]
      "
    >
      {/* ========================================
          PROFILE IMAGE
          ======================================== */}

      <div className="shrink-0">
        {person.profileImage ? (
          <img
            src={person.profileImage}
            alt={person.fullName}
            draggable={false}
            className="
              h-12
              w-12
              rounded-full
              object-cover
              ring-1
              ring-slate-200
              transition-all
              duration-150
              group-hover:ring-2
              group-hover:ring-violet-500

              dark:ring-neutral-700
              dark:group-hover:ring-violet-500
            "
          />
        ) : (
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-slate-500
              ring-1
              ring-slate-200
              transition-all
              duration-150
              group-hover:ring-2
              group-hover:ring-violet-500

              dark:bg-neutral-900
              dark:text-neutral-400
              dark:ring-neutral-700
              dark:group-hover:ring-violet-500
            "
          >
            <UserRound size={19} strokeWidth={1.8} />
          </div>
        )}
      </div>

      {/* ========================================
          USER INFO
          ======================================== */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <h3
          className="
            truncate
            text-[13px]
            font-semibold
            leading-5
            text-slate-900

            dark:text-white
          "
        >
          {person.fullName}
        </h3>

        <p
          className="
            mt-0.5
            truncate
            text-[11px]
            leading-4
            text-slate-500

            dark:text-neutral-500
          "
        >
          @{person.username}
        </p>

        {/* Optional profile context */}

        {(person.college || person.year) && (
          <p
            className="
              mt-0.5
              truncate
              text-[10px]
              leading-4
              text-slate-400

              dark:text-neutral-600
            "
          >
            {person.college || person.year}
          </p>
        )}
      </div>

      {/* ========================================
          CONNECTION BUTTON
          ======================================== */}

      <button
        type="button"
        onClick={handleConnect}
        disabled={
          isPendingSent || isConnected || connecting || isPendingReceived
        }
        className={`
          flex
          h-8
          shrink-0
          items-center
          justify-center
          gap-1.5
          rounded-xl
          px-3
          text-[10px]
          font-semibold
          transition-all
          duration-150
          active:scale-95

          disabled:cursor-default

          ${
            connecting
              ? `
                bg-violet-600
                text-white
              `
              : isConnected
                ? `
                  border
                  border-violet-200
                  bg-violet-50
                  text-violet-600

                  dark:border-violet-500/20
                  dark:bg-violet-500/10
                  dark:text-violet-400
                `
                : isPendingSent
                  ? `
                    border
                    border-slate-200
                    bg-slate-100
                    text-slate-500

                    dark:border-neutral-700
                    dark:bg-neutral-900
                    dark:text-neutral-400
                  `
                  : isPendingReceived
                    ? `
                      border
                      border-violet-200
                      bg-violet-50
                      text-violet-600

                      dark:border-violet-500/20
                      dark:bg-violet-500/10
                      dark:text-violet-400
                    `
                    : `
                      bg-violet-600
                      text-white
                      shadow-sm
                      hover:bg-violet-700

                      dark:bg-violet-600
                      dark:hover:bg-violet-500
                    `
          }
        `}
      >
        {/* Sending */}

        {connecting && (
          <>
            <span
              className="
                h-3
                w-3
                animate-spin
                rounded-full
                border-2
                border-white/40
                border-t-white
              "
            />

            <span>Sending</span>
          </>
        )}

        {/* Connected */}

        {!connecting && isConnected && (
          <>
            <Check size={12} strokeWidth={2.5} />

            <span>Connected</span>
          </>
        )}

        {/* Request Sent */}

        {!connecting && isPendingSent && (
          <>
            <Clock3 size={12} strokeWidth={2} />

            <span>Request sent</span>
          </>
        )}

        {/* Pending Received */}

        {!connecting && isPendingReceived && (
          <>
            <Check size={12} strokeWidth={2.2} />

            <span>Accept</span>
          </>
        )}

        {/* Connect */}

        {!connecting &&
          !isConnected &&
          !isPendingSent &&
          !isPendingReceived && (
            <>
              <UserPlus size={12} strokeWidth={2} />

              <span>Connect</span>
            </>
          )}
      </button>
    </article>
  );
};

export default PersonCard;
