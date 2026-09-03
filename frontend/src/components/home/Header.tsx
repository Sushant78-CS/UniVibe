import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useNotificationApi } from "../../api/notificationApi";

function DashboardHeader() {
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
        border-slate-200/70
        bg-slate-50/90
        backdrop-blur-xl
        dark:border-slate-800/70
        dark:bg-slate-950/90
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-6xl
          items-center
          justify-between
          px-4
          py-2
          sm:px-6
        "
      >
        {/* ================= UNIVIBE LOGO ================= */}

        <button
          type="button"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
          className="
            rounded-xl
            text-left
            transition
            active:scale-[0.97]
          "
        >
          <div
            className="
              bg-gradient-to-r
              from-violet-600
              via-purple-600
              to-fuchsia-500
              bg-clip-text
              text-[20px]
              font-extrabold
              leading-none
              tracking-[-0.04em]
              text-transparent
              dark:from-violet-400
              dark:via-purple-400
              dark:to-fuchsia-400
            "
          >
            UniVibe
          </div>

          <div
            className="
              mt-1
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-400
              dark:text-slate-500
            "
          >
            Campus Community
          </div>
        </button>

        {/* ================= NOTIFICATIONS ================= */}

        <button
          type="button"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
          className="
            relative
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-600
            transition
            hover:bg-slate-100
            active:scale-95
            dark:border-slate-800
            dark:bg-slate-900
            dark:text-slate-300
            dark:hover:bg-slate-800
          "
        >
          <Bell size={18} strokeWidth={2} />

          {/* Unread Badge */}

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                min-h-4
                min-w-4
                items-center
                justify-center
                rounded-full
                bg-red-500
                px-1
                text-[9px]
                font-bold
                leading-none
                text-white
                ring-2
                ring-slate-50
                dark:ring-slate-950
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

export default DashboardHeader;
