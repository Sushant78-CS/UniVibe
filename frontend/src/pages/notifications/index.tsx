import { useEffect, useState } from "react";
import { ArrowLeft, Bell, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import {
  useNotificationApi,
  type Notification,
} from "../../api/notificationApi";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const { getNotifications, markAsRead, markAllAsRead } = useNotificationApi();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
      }

      // Connection request
      if (notification.type === "CONNECTION_REQUEST") {
        navigate("/connections/requests");
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-28
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-2xl
          px-4
          py-6
        "
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="
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
                  hover:bg-slate-100
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-violet-600
                    dark:text-violet-400
                  "
                >
                  UPDATES
                </p>

                <h1
                  className="
                    text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Notifications
                </h1>
              </div>
            </div>

            {notifications.some((notification) => !notification.read) && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="
                  text-xs
                  font-semibold
                  text-violet-600
                  hover:text-violet-700
                  dark:text-violet-400
                "
              >
                Mark all read
              </button>
            )}
          </div>

          <p
            className="
              mt-2
              pl-12
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Stay updated with your UniVibe activity.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-20
                  animate-pulse
                  rounded-2xl
                  bg-slate-200
                  dark:bg-slate-800
                "
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div
            className="
                mt-8
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
                dark:border-slate-700
                dark:bg-slate-900
              "
          >
            <Bell
              size={30}
              className="
                  mx-auto
                  text-slate-400
                "
            />

            <h2 className="mt-4 font-semibold">No notifications</h2>

            <p
              className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
            >
              You're all caught up.
            </p>
          </div>
        )}

        {/* Notifications */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition
                      ${
                        notification.read
                          ? `
                            border-slate-200
                            bg-white
                            dark:border-slate-800
                            dark:bg-slate-900
                          `
                          : `
                            border-violet-200
                            bg-violet-50/70
                            dark:border-violet-500/20
                            dark:bg-violet-500/10
                          `
                      }
                    `}
              >
                {/* Avatar */}
                {notification.actorProfileImage ? (
                  <img
                    src={notification.actorProfileImage}
                    alt={notification.actorFullName ?? "User"}
                    className="
                          h-11
                          w-11
                          shrink-0
                          rounded-full
                          object-cover
                        "
                  />
                ) : (
                  <div
                    className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
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

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className="
                          text-sm
                          text-slate-700
                          dark:text-slate-200
                        "
                  >
                    {notification.message}
                  </p>

                  <p
                    className="
                          mt-1
                          text-xs
                          text-slate-400
                        "
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <span
                    className="
                          h-2.5
                          w-2.5
                          shrink-0
                          rounded-full
                          bg-violet-600
                        "
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
