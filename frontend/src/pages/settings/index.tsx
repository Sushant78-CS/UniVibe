import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Loader2,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";

import {
  enablePushNotifications,
  disablePushNotifications,
} from "../../firebase/messaging";

import InstallAppButton from "../../components/common/InstallAppButton";

function SettingsPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ------------------------------------------
  // Initial settings state
  // ------------------------------------------

  useEffect(() => {
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }

    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // ------------------------------------------
  // Push notifications
  // ------------------------------------------

  const handlePushToggle = async () => {
    // Prevent multiple clicks while request is running
    if (pushLoading) {
      return;
    }

    setPushLoading(true);

    try {
      if (!pushEnabled) {
        await enablePushNotifications(getToken);

        setPushEnabled(true);
      } else {
        await disablePushNotifications();

        setPushEnabled(false);
      }
    } catch (error) {
      console.error("Failed to update push notification setting:", error);
    } finally {
      setPushLoading(false);
    }
  };

  // ------------------------------------------
  // Theme
  // ------------------------------------------

  const handleThemeToggle = () => {
    const html = document.documentElement;

    const nextDarkMode = !html.classList.contains("dark");

    if (nextDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setDarkMode(nextDarkMode);
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        transition-colors
        duration-200
        dark:bg-black
        dark:text-white
      "
    >
      {/* -------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------- */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-slate-200
          bg-white/95
          backdrop-blur
          dark:border-neutral-800
          dark:bg-black/95
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-full
            max-w-[680px]
            items-center
            gap-3
            px-4
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-600
              transition
              hover:bg-slate-100
              dark:text-neutral-300
              dark:hover:bg-[#171717]
            "
          >
            <ArrowLeft size={19} />
          </button>

          <h1 className="text-base font-semibold">Settings</h1>
        </div>
      </header>

      {/* -------------------------------------- */}
      {/* MAIN */}
      {/* -------------------------------------- */}

      <main
        className="
          mx-auto
          w-full
          max-w-[680px]
          px-4
          pb-24
          pt-5
        "
      >
        {/* -------------------------------------- */}
        {/* ACCOUNT */}
        {/* -------------------------------------- */}

        <section className="mb-6">
          <p
            className="
              mb-2
              px-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
              dark:text-neutral-500
            "
          >
            Account
          </p>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <button
              type="button"
              onClick={() => navigate("/profile/edit")}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3.5
                text-left
                transition
                hover:bg-slate-50
                dark:hover:bg-neutral-900
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
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
                <User size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Edit profile</p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                    dark:text-neutral-400
                  "
                >
                  Update your profile information
                </p>
              </div>

              <ChevronRight
                size={17}
                className="
                  shrink-0
                  text-slate-400
                  dark:text-neutral-500
                "
              />
            </button>
          </div>
        </section>

        {/* -------------------------------------- */}
        {/* INSTALL APP */}
        {/* -------------------------------------- */}

        <InstallAppButton />

        {/* -------------------------------------- */}
        {/* NOTIFICATIONS */}
        {/* -------------------------------------- */}

        <section className="mb-6">
          <p
            className="
              mb-2
              px-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
              dark:text-neutral-500
            "
          >
            Notifications
          </p>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <div
              className="
                flex
                min-h-[72px]
                items-center
                gap-3
                px-4
                py-3.5
              "
            >
              {/* Bell */}
              <div
                className="
                  flex
                  h-9
                  w-9
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
                <Bell size={18} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Push notifications</p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                    dark:text-neutral-400
                  "
                >
                  Get notified about messages and connection requests
                </p>
              </div>

              {/* Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={pushEnabled}
                aria-label="Push notifications"
                disabled={pushLoading}
                onClick={handlePushToggle}
                className={`
                  relative
                  flex
                  h-6
                  w-11
                  shrink-0
                  items-center
                  rounded-full
                  transition-colors
                  duration-200
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-violet-500
                  focus-visible:ring-offset-2
                  dark:focus-visible:ring-offset-[#171717]

                  ${
                    pushEnabled
                      ? "bg-violet-600"
                      : "bg-slate-300 dark:bg-neutral-700"
                  }

                  ${pushLoading ? "cursor-wait opacity-70" : "cursor-pointer"}
                `}
              >
                {pushLoading ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin text-white" />
                  </span>
                ) : (
                  <span
                    className={`
                      absolute
                      left-0.5
                      top-0.5
                      h-5
                      w-5
                      rounded-full
                      bg-white
                      shadow-sm
                      transition-transform
                      duration-200

                      ${pushEnabled ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                )}
              </button>
            </div>

            {/* Enabled information */}
            {pushEnabled && !pushLoading && (
              <div
                className="
                  border-t
                  border-slate-100
                  px-4
                  py-2.5
                  text-[11px]
                  text-slate-500
                  dark:border-neutral-800
                  dark:text-neutral-500
                "
              >
                Push notifications are enabled for this browser.
              </div>
            )}

            {/* Loading information */}
            {pushLoading && (
              <div
                className="
                  border-t
                  border-slate-100
                  px-4
                  py-2.5
                  text-[11px]
                  text-slate-500
                  dark:border-neutral-800
                  dark:text-neutral-500
                "
              >
                Updating notification settings...
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------- */}
        {/* APPEARANCE */}
        {/* -------------------------------------- */}

        <section className="mb-6">
          <p
            className="
              mb-2
              px-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
              dark:text-neutral-500
            "
          >
            Appearance
          </p>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <button
              type="button"
              onClick={handleThemeToggle}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3.5
                text-left
                transition
                hover:bg-slate-50
                dark:hover:bg-neutral-900
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
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
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Theme</p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                    dark:text-neutral-400
                  "
                >
                  {darkMode ? "Dark mode" : "Light mode"}
                </p>
              </div>

              <div
                className="
                  rounded-lg
                  bg-slate-100
                  px-2
                  py-1
                  text-[10px]
                  font-medium
                  text-slate-600
                  dark:bg-neutral-800
                  dark:text-neutral-300
                "
              >
                {darkMode ? "Dark" : "Light"}
              </div>
            </button>
          </div>
        </section>

        {/* -------------------------------------- */}
        {/* ABOUT */}
        {/* -------------------------------------- */}

        <section>
          <p
            className="
              mb-2
              px-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
              dark:text-neutral-500
            "
          >
            About
          </p>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <button
              type="button"
              onClick={() => navigate("/about")}
              className="
                flex
                w-full
                items-center
                justify-between
                px-4
                py-3.5
                text-sm
                transition
                hover:bg-slate-50
                dark:hover:bg-neutral-900
              "
            >
              <span>About UniVibe</span>

              <ChevronRight
                size={17}
                className="
                  text-slate-400
                  dark:text-neutral-500
                "
              />
            </button>

            <div
              className="
                border-t
                border-slate-100
                px-4
                py-3
                text-[11px]
                text-slate-400
                dark:border-neutral-800
                dark:text-neutral-500
              "
            >
              UniVibe · Campus Community
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SettingsPage;
