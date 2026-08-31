import { Bell, Sparkles } from "lucide-react";
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
          max-w-6xl
          px-4
          py-2.5
          sm:px-6
        "
      >
        <div className="flex items-center justify-between">
          {/* ================= LOGO ================= */}
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Go to home"
            className="
              flex
              items-center
              gap-2.5
              rounded-xl
              transition
              active:scale-95
            "
          >
            {/* Logo Icon */}
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-violet-600
                text-white
                dark:bg-violet-500
              "
            >
              <Sparkles size={18} strokeWidth={2.5} />
            </div>

            {/* Brand */}
            <div className="text-left">
              <h1
                className="
                  text-base
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                UniVibe
              </h1>

              <p
                className="
                  -mt-0.5
                  text-[9px]
                  font-medium
                  tracking-wide
                  text-slate-400
                  dark:text-slate-500
                "
              >
                CAMPUS COMMUNITY
              </p>
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
      </div>
    </header>
  );
}

export default DashboardHeader;
