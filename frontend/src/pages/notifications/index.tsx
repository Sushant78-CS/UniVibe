import { ArrowLeft, Bell, Check, ChevronRight, UserRound } from "lucide-react";

import { useNavigate } from "react-router";

import {
  useNotificationApi,
  type Notification,
} from "../../api/notificationApi";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const { getNotifications, markAsRead, markAllAsRead } = useNotificationApi();

  const queryClient = useQueryClient();

  /*
   * --------------------------------------------------
   * GET NOTIFICATIONS
   * --------------------------------------------------
   */
  const {
    data: notifications = [],
    isLoading,
    isFetching,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  /*
   * --------------------------------------------------
   * MARK ONE AS READ
   *
   * Optimistic update:
   * UI changes immediately without waiting for API.
   * --------------------------------------------------
   */
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => markAsRead(notificationId),

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications"],
      });

      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      /*
       * Immediately mark notification as read
       * in the TanStack Query cache.
       */
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (current = []) =>
          current.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
          ),
      );

      return {
        previousNotifications,
      };
    },

    /*
     * If API fails, restore previous state.
     */
    onError: (error, _notificationId, context) => {
      console.error("Failed to mark notification as read:", error);

      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        );
      }
    },

    /*
     * Once API finishes, refresh server state.
     */
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  /*
   * --------------------------------------------------
   * MARK ALL AS READ
   *
   * Also optimistic.
   * --------------------------------------------------
   */
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["notifications"],
      });

      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);

      /*
       * Immediately mark everything as read.
       */
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (current = []) =>
          current.map((notification) => ({
            ...notification,
            read: true,
          })),
      );

      return {
        previousNotifications,
      };
    },

    onError: (error, _variables, context) => {
      console.error("Failed to mark all notifications as read:", error);

      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  /*
   * --------------------------------------------------
   * CLICK NOTIFICATION
   * --------------------------------------------------
   */
  const handleNotificationClick = (notification: Notification) => {
    /*
     * Do NOT wait for the API.
     *
     * The mutation immediately updates the cache.
     */
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    /*
     * Navigate immediately.
     */
    if (notification.url) {
      navigate(notification.url);
    }
  };

  /*
   * --------------------------------------------------
   * MARK ALL
   * --------------------------------------------------
   */
  const handleMarkAllAsRead = () => {
    if (markAllAsReadMutation.isPending) {
      return;
    }

    markAllAsReadMutation.mutate();
  };

  /*
   * --------------------------------------------------
   * UNREAD COUNT
   * --------------------------------------------------
   */
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-28
        text-slate-900
        transition-colors
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
          sm:px-6
        "
      >
        {/* ============================================
            HEADER
        ============================================ */}
        <div className="mb-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back */}
              <button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Go back"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-100
                  active:scale-95
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                <ArrowLeft size={18} />
              </button>

              {/* Title */}
              <div>
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-violet-600
                    dark:text-violet-400
                  "
                >
                  Updates
                </p>

                <div className="flex items-center gap-2">
                  <h1
                    className="
                      mt-0.5
                      text-2xl
                      font-bold
                      tracking-tight
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Notifications
                  </h1>

                  {/* Small refresh indicator */}
                  {isFetching && !isLoading && (
                    <span
                      className="
                        mt-1
                        h-1.5
                        w-1.5
                        animate-pulse
                        rounded-full
                        bg-violet-500
                      "
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Mark all */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2
                  py-2
                  text-xs
                  font-semibold
                  text-violet-600
                  transition
                  hover:bg-violet-50
                  hover:text-violet-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:text-violet-400
                  dark:hover:bg-violet-500/10
                  dark:hover:text-violet-300
                "
              >
                <Check size={14} />

                {markAllAsReadMutation.isPending
                  ? "Marking..."
                  : "Mark all read"}
              </button>
            )}
          </div>

          {/* Subtitle */}
          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              pl-13
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            <span>Stay updated with your UniVibe activity.</span>

            {unreadCount > 0 && (
              <span
                className="
                  rounded-full
                  bg-violet-100
                  px-2
                  py-0.5
                  text-[11px]
                  font-bold
                  text-violet-700
                  dark:bg-violet-500/10
                  dark:text-violet-300
                "
              >
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* ============================================
            LOADING
        ============================================ */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-[82px]
                  animate-pulse
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              />
            ))}
          </div>
        )}

        {/* ============================================
            EMPTY
        ============================================ */}
        {!isLoading && notifications.length === 0 && (
          <div
            className="
              mt-10
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              px-6
              py-14
              text-center
              shadow-sm
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-violet-100
                text-violet-600
                dark:bg-violet-500/10
                dark:text-violet-400
              "
            >
              <Bell size={28} />
            </div>

            <h2
              className="
                mt-5
                text-base
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              No notifications
            </h2>

            <p
              className="
                mx-auto
                mt-1.5
                max-w-xs
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              You're all caught up. New activity will appear here.
            </p>
          </div>
        )}

        {/* ============================================
            NOTIFICATIONS
        ============================================ */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-2.5">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`
                  group
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  p-3.5
                  text-left
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:shadow-md
                  active:scale-[0.99]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-violet-500/40

                  ${
                    notification.read
                      ? `
                        border-slate-200
                        bg-white
                        hover:border-slate-300
                        dark:border-slate-800
                        dark:bg-slate-900
                        dark:hover:border-slate-700
                      `
                      : `
                        border-violet-200
                        bg-violet-50/70
                        hover:border-violet-300
                        hover:bg-violet-50
                        dark:border-violet-500/20
                        dark:bg-violet-500/[0.07]
                        dark:hover:border-violet-500/30
                        dark:hover:bg-violet-500/10
                      `
                  }
                `}
              >
                {/* ====================================
                    AVATAR
                ==================================== */}
                <div className="relative shrink-0">
                  {notification.actorProfileImage ? (
                    <img
                      src={notification.actorProfileImage}
                      alt={notification.actorFullName ?? "User"}
                      className="
                        h-11
                        w-11
                        rounded-full
                        object-cover
                        ring-2
                        ring-white
                        dark:ring-slate-900
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-11
                        w-11
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

                  {/* Unread dot */}
                  {!notification.read && (
                    <span
                      className="
                        absolute
                        -right-0.5
                        -top-0.5
                        h-3
                        w-3
                        rounded-full
                        border-2
                        border-white
                        bg-violet-600
                        dark:border-slate-900
                        dark:bg-violet-400
                      "
                    />
                  )}
                </div>

                {/* ====================================
                    CONTENT
                ==================================== */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`
                      text-sm
                      leading-5
                      ${
                        notification.read
                          ? `
                            text-slate-600
                            dark:text-slate-300
                          `
                          : `
                            font-semibold
                            text-slate-800
                            dark:text-slate-100
                          `
                      }
                    `}
                  >
                    {notification.message}
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* ====================================
                    ARROW
                ==================================== */}
                <div
                  className="
                    shrink-0
                    text-slate-300
                    transition-transform
                    group-hover:translate-x-0.5
                    group-hover:text-violet-500
                    dark:text-slate-600
                    dark:group-hover:text-violet-400
                  "
                >
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
