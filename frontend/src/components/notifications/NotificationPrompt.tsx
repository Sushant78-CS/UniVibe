import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

import { enablePushNotifications } from "../../firebase/messaging";

const DISMISSED_KEY = "univibe-push-prompt-dismissed";

function NotificationPrompt() {
  const { getToken } = useAuth();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // Already enabled
    if (Notification.permission === "granted") {
      return;
    }

    // Browser has permanently blocked notifications
    if (Notification.permission === "denied") {
      return;
    }

    // User previously dismissed the prompt
    const dismissed = localStorage.getItem(DISMISSED_KEY);

    if (dismissed === "true") {
      return;
    }

    setVisible(true);
  }, []);

  const handleEnable = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await enablePushNotifications(getToken);

      setVisible(false);

      localStorage.removeItem(DISMISSED_KEY);
    } catch (error) {
      console.error("Failed to enable UniVibe push notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");

    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <section
      className="
        mx-4
        mb-3
        overflow-hidden
        rounded-2xl
        border
        border-violet-200
        bg-white
        shadow-sm
        dark:border-violet-500/20
        dark:bg-[#171717]
      "
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-violet-50
              text-violet-600
              dark:bg-violet-500/10
              dark:text-violet-400
            "
          >
            <Bell size={19} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">Never miss a message</h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-neutral-400
                  "
                >
                  Get notified about new messages and connection requests, even
                  when UniVibe isn't open.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-600
                  dark:text-neutral-500
                  dark:hover:bg-neutral-800
                  dark:hover:text-neutral-300
                "
              >
                <X size={15} />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnable}
                disabled={loading}
                className="
                  rounded-xl
                  bg-violet-600
                  px-3.5
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-violet-700
                  disabled:cursor-wait
                  disabled:opacity-60
                "
              >
                {loading ? "Enabling..." : "Enable notifications"}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                disabled={loading}
                className="
                  rounded-xl
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  dark:text-neutral-400
                  dark:hover:bg-neutral-800
                "
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotificationPrompt;
