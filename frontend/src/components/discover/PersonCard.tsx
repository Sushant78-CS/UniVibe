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
        min-h-[72px]
        w-full
        items-center
        gap-3.5
        border-b
        border-slate-200/80
        px-1
        py-3
        text-left
        outline-none

        transition-colors
        duration-150

        hover:bg-slate-50/70

        focus-visible:bg-slate-50
        focus-visible:ring-1
        focus-visible:ring-violet-500/20

        dark:border-neutral-800/80
        dark:hover:bg-white/[0.025]
        dark:focus-visible:bg-white/[0.025]
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
              h-14
              w-14
              rounded-full
              object-cover
              ring-1
              ring-slate-200

              transition-transform
              duration-150

              group-hover:scale-[1.02]

              dark:ring-neutral-700
            "
          />
        ) : (
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-slate-500
              ring-1
              ring-slate-200

              dark:bg-neutral-900
              dark:text-neutral-400
              dark:ring-neutral-700
            "
          >
            <UserRound size={21} strokeWidth={1.7} />
          </div>
        )}
      </div>

      {/* ========================================
          USER INFO
          ======================================== */}

      <div className="min-w-0 flex-1">
        <h3
          className="
            truncate
            text-[13px]
            font-semibold
            leading-[18px]
            text-slate-950
            dark:text-white
          "
        >
          {person.fullName}
        </h3>

        {person.username && (
          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              leading-[16px]
              text-slate-500
              dark:text-neutral-500
            "
          >
            @{person.username}
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
          rounded-lg
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
                min-w-[68px]
                bg-violet-600
                text-white
              `
              : isConnected
                ? `
                  min-w-[76px]
                  border
                  border-violet-500/20
                  bg-violet-500/10
                  text-violet-600

                  dark:border-violet-500/20
                  dark:bg-violet-500/10
                  dark:text-violet-400
                `
                : isPendingSent
                  ? `
                    min-w-[78px]
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
                      min-w-[68px]
                      border
                      border-violet-500/20
                      bg-violet-500/10
                      text-violet-600

                      dark:border-violet-500/20
                      dark:bg-violet-500/10
                      dark:text-violet-400
                    `
                    : `
                      min-w-[68px]
                      bg-violet-600
                      text-white

                      hover:bg-violet-700

                      dark:bg-violet-600
                      dark:hover:bg-violet-500
                    `
          }
        `}
      >
        {/* SENDING */}

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

        {/* CONNECTED */}

        {!connecting && isConnected && (
          <>
            <Check size={12} strokeWidth={2.5} />

            <span>Connected</span>
          </>
        )}

        {/* REQUEST SENT */}

        {!connecting && isPendingSent && (
          <>
            <Clock3 size={12} strokeWidth={2} />

            <span>Requested</span>
          </>
        )}

        {/* PENDING RECEIVED */}

        {!connecting && isPendingReceived && (
          <>
            <Check size={12} strokeWidth={2.2} />

            <span>Accept</span>
          </>
        )}

        {/* CONNECT */}

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
