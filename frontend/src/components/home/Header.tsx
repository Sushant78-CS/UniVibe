import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useNotificationApi } from "../../api/notificationApi";

function Header() {
  const navigate = useNavigate();

  const { getUnreadCount } = useNotificationApi();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCount();

        if (!cancelled) {
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Failed to load notification count:", error);
      }
    };

    loadUnreadCount();

    return () => {
      cancelled = true;
    };
  }, [getUnreadCount]);

  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-slate-200
        bg-white
        transition-colors
        dark:border-neutral-900
        dark:bg-black
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[680px]
          items-center
          justify-between
          px-4
          py-3
          sm:px-0
        "
      >
        {/* =======================================
            UNIVIBE LOGO
            ======================================= */}

        <button
          type="button"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
          className="
            rounded-lg
            text-left
            outline-none
            transition-transform
            active:scale-[0.97]
            focus-visible:ring-2
            focus-visible:ring-violet-500/30
          "
        >
          <div
            className="
              text-[21px]
              font-extrabold
              leading-none
              tracking-[-0.045em]
              text-violet-600
              dark:text-violet-400
            "
          >
            UniVibe
          </div>

          <div
            className="
              mt-1
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-slate-400
              dark:text-neutral-600
            "
          >
            Campus Community
          </div>
        </button>

        {/* =======================================
            NOTIFICATIONS
            ======================================= */}

        <button
          type="button"
          onClick={() => navigate("/notifications")}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="
            relative
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-600
            transition-all
            hover:bg-slate-50
            hover:text-slate-900
            active:scale-95
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-violet-500/30

            dark:border-neutral-800
            dark:bg-[#171717]
            dark:text-neutral-400
            dark:hover:bg-neutral-900
            dark:hover:text-white
          "
        >
          <Bell size={18} strokeWidth={2} />

          {/* =====================================
              UNREAD BADGE
              ===================================== */}

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                flex
                min-h-[17px]
                min-w-[17px]
                items-center
                justify-center
                rounded-full
                bg-violet-600
                px-1
                text-[9px]
                font-bold
                leading-none
                text-white
                ring-2
                ring-white

                dark:bg-violet-500
                dark:ring-black
              "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
