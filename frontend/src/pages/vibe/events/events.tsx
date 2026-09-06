import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  Link,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useProfileApi } from "../../../api/profileApi";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router";

import { deleteEvent, getEvents, type Event } from "../../../api/eventApi";

/* =========================================================
   CONFIRM MODAL
   ========================================================= */

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  loadingText?: string;
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  loadingText = "Loading...",
}: ConfirmModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        backdrop-blur-sm
      "
      onClick={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-sm
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-end
            px-4
            pt-4
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* WARNING ICON */}
        <div
          className="
            flex
            justify-center
            px-6
            pt-1
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-red-100
              text-red-600
              dark:bg-red-500/10
              dark:text-red-400
            "
          >
            <AlertTriangle size={25} />
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="
            px-6
            pt-4
            text-center
          "
        >
          <h2
            className="
              text-base
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-5
              text-slate-500
              dark:text-slate-400
            "
          >
            {message}
          </p>
        </div>

        {/* ACTIONS */}
        <div
          className="
            grid
            grid-cols-2
            gap-3
            px-6
            pb-6
            pt-6
          "
        >
          {/* CANCEL */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:hover:bg-slate-700
            "
          >
            {cancelText}
          </button>

          {/* CONFIRM */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                {loadingText}
              </>
            ) : (
              <>
                <Trash2 size={14} />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   EVENTS PAGE
   ========================================================= */

const Events = () => {
  const navigate = useNavigate();

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const { getProfile } = useProfileApi();

  const queryClient = useQueryClient();

  /* =======================================================
     ADMIN MENU
     ======================================================= */

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  /* =======================================================
     DELETE MODAL
     ======================================================= */

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const [shareEvent, setShareEvent] = useState<Event | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  /* =========================================================
     PROFILE
     ========================================================= */

  const { data: profile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfile,
    enabled: isLoaded && !!isSignedIn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  /* =========================================================
     EVENTS
     ========================================================= */

  const {
    data: events = [],
    isLoading: loading,
    isFetching,
    isError,
    error: eventsError,
    refetch,
  } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token unavailable.");
      }

      return getEvents(token);
    },

    enabled: isLoaded && !!isSignedIn,

    /*
     * Keep event data fresh for 2 minutes.
     * Navigating away and coming back during this time
     * will use the cached data instead of fetching again.
     */
    staleTime: 1000 * 60 * 2,

    /*
     * Keep cached events available for 10 minutes.
     */
    gcTime: 1000 * 60 * 10,

    /*
     * Don't refetch simply because the browser window
     * receives focus again.
     */
    refetchOnWindowFocus: false,

    /*
     * Retry failed requests twice.
     */
    retry: 2,
  });

  /* =========================================================
     DELETE EVENT
     ========================================================= */

  const handleDeleteEvent = async () => {
    if (!eventToDelete) {
      return;
    }

    try {
      setDeleteLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token unavailable.");
      }

      await deleteEvent(token, eventToDelete.id);

      /*
       * Immediately update TanStack Query cache.
       * No need to refetch the entire events list.
       */
      queryClient.setQueryData<Event[]>(["events"], (current = []) =>
        current.filter((event) => event.id !== eventToDelete.id),
      );

      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =========================================================
     OPEN DELETE MODAL
     ========================================================= */

  const openDeleteModal = (event: Event) => {
    setOpenMenuId(null);
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  /* =========================================================
     CLOSE DELETE MODAL
     ========================================================= */

  const closeDeleteModal = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  /* =========================================================
     ERROR MESSAGE
     ========================================================= */

  const error = isError
    ? eventsError instanceof Error
      ? eventsError.message
      : "Unable to load events."
    : null;

  const handleShareEvent = async (event: Event) => {
    const eventUrl = `${window.location.origin}/vibe/events/${event.id}`;

    // Mobile/tablet browsers that support the native share sheet
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this event on UniVibe: ${event.title}`,
          url: eventUrl,
        });
      } catch (error) {
        // User cancelled the native share sheet
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to share event:", error);
      } finally {
        setOpenMenuId(null);
      }

      return;
    }

    // Desktop / browsers without native sharing
    setOpenMenuId(null);
    setShareEvent(event);
  };

  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     FORMAT TIME
     ========================================================= */

  const formatTime = (value: string) => {
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isAdmin = profile?.role === "ADMIN";

  return (
    <>
      <div
        className="
          min-h-screen
          bg-slate-50
          pb-24
          text-slate-900
          dark:bg-[#0d0d0f]
          dark:text-white
        "
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <header
          className="
            sticky
            top-0
            z-30
            border-b
            border-slate-200
            bg-slate-50/95
            backdrop-blur
            dark:border-neutral-800
            dark:bg-[#0d0d0f]/95
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-5xl
              items-center
              justify-between
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <button
                type="button"
                onClick={() => navigate("/vibe")}
                className="
                  rounded-full
                  p-2
                  text-slate-600
                  transition
                  hover:bg-slate-200
                  dark:text-neutral-300
                  dark:hover:bg-neutral-800
                "
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1
                  className="
                    text-lg
                    font-semibold
                  "
                >
                  Events
                </h1>

                <p
                  className="
                    text-xs
                    text-slate-500
                    dark:text-neutral-500
                  "
                >
                  Discover what's happening on campus
                </p>
              </div>
            </div>

            {/* ADMIN CREATE */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate("/vibe/events/create")}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-violet-600
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-violet-700
                  dark:hover:bg-violet-500
                "
              >
                <Plus size={17} />
                Create
              </button>
            )}
          </div>
        </header>

        <main
          className="
            mx-auto
            max-w-5xl
            px-4
            py-5
          "
        >
          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-base
                  font-semibold
                "
              >
                Upcoming Events
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-neutral-500
                "
              >
                Find events, activities and opportunities around you.
              </p>
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={loading || isFetching}
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                p-2.5
                text-slate-600
                transition
                hover:bg-slate-100
                disabled:opacity-50
                dark:border-neutral-700
                dark:bg-[#18181b]
                dark:text-neutral-300
                dark:hover:bg-neutral-800
              "
              aria-label="Refresh events"
            >
              <RefreshCw
                size={18}
                className={loading || isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div
              className="
                mb-5
                flex
                items-center
                justify-between
                gap-4
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
                dark:border-red-900/40
                dark:bg-red-950/20
                dark:text-red-400
              "
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} />
                <span>Unable to load events.</span>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="
                  shrink-0
                  rounded-lg
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  hover:bg-red-100
                  dark:hover:bg-red-950/40
                "
              >
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (
            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                      dark:border-neutral-700
                      dark:bg-[#18181b]
                    "
                >
                  <div
                    className="
                        h-48
                        bg-slate-200
                        dark:bg-neutral-800
                      "
                  />

                  <div
                    className="
                        space-y-3
                        p-5
                      "
                  >
                    <div
                      className="
                          h-5
                          w-2/3
                          rounded
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                    />

                    <div
                      className="
                          h-4
                          w-1/2
                          rounded
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                    />

                    <div
                      className="
                          h-4
                          w-3/4
                          rounded
                          bg-slate-200
                          dark:bg-neutral-800
                        "
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =================================================
              EMPTY
              ================================================= */}

          {!loading && !error && events.length === 0 && (
            <div
              className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-6
                  py-12
                  text-center
                  shadow-sm
                  dark:border-neutral-700
                  dark:bg-[#18181b]
                "
            >
              <CalendarDays
                size={42}
                className="
                    mx-auto
                    mb-4
                    text-slate-400
                    dark:text-neutral-600
                  "
              />

              <h3
                className="
                    font-semibold
                  "
              >
                No events yet
              </h3>

              <p
                className="
                    mt-2
                    text-sm
                    text-slate-500
                    dark:text-neutral-500
                  "
              >
                Check back later for upcoming campus events.
              </p>
            </div>
          )}

          {/* =================================================
              EVENTS
              ================================================= */}

          {!loading && !error && events.length > 0 && (
            <div
              className="
                  grid
                  gap-5
                  md:grid-cols-2
                "
            >
              {events.map((event) => {
                const registrationEnabled = event.registrationEnabled;

                const registrationOpen = event.registrationOpen;

                const alreadyRegistered = event.registeredByCurrentUser;

                return (
                  <article
                    key={event.id}
                    onClick={() => navigate(`/vibe/events/${event.id}`)}
                    className="
                        group
                        relative
                        cursor-pointer
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-[0_2px_8px_rgba(15,23,42,0.06)]
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-lg
                        dark:border-neutral-700
                        dark:bg-[#1a1a1d]
                        dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)]
                        dark:hover:border-neutral-600
                        dark:hover:bg-[#1d1d21]
                        dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]
                      "
                  >
                    {/* ADMIN THREE DOT MENU */}
                    {isAdmin && (
                      <div
                        className="
                            absolute
                            right-3
                            top-3
                            z-30
                          "
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenuId(
                              openMenuId === event.id ? null : event.id,
                            );
                          }}
                          className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-white/20
                              bg-black/50
                              text-white
                              backdrop-blur-sm
                              transition
                              hover:bg-black/70
                            "
                          aria-label="Event options"
                        >
                          <MoreVertical size={19} />
                        </button>

                        {/* DROPDOWN */}
                        {openMenuId === event.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="
                                absolute
                                right-0
                                mt-2
                                w-48
                                overflow-hidden
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                py-1
                                shadow-xl
                                dark:border-neutral-700
                                dark:bg-[#202024]
                              "
                          >
                            {/* EDIT */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);

                                navigate(`/vibe/events/${event.id}/edit`);
                              }}
                              className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  px-4
                                  py-3
                                  text-sm
                                  text-slate-700
                                  transition
                                  hover:bg-slate-100
                                  dark:text-neutral-200
                                  dark:hover:bg-neutral-800
                                "
                            >
                              <Pencil size={16} />

                              <span>Edit Event</span>
                            </button>

                            {/* SHARE EVENT */}
                            <button
                              type="button"
                              onClick={() => handleShareEvent(event)}
                              className="
    flex
    w-full
    items-center
    gap-3
    px-4
    py-3
    text-sm
    text-slate-700
    transition
    hover:bg-slate-100
    dark:text-neutral-200
    dark:hover:bg-neutral-800
  "
                            >
                              <Share2 size={16} />
                              <span>Share Event</span>
                            </button>

                            {/* VIEW RESPONSES */}
                            {registrationEnabled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);

                                  navigate(
                                    `/vibe/events/${event.id}/responses`,
                                  );
                                }}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-700
                                    transition
                                    hover:bg-slate-100
                                    dark:text-neutral-200
                                    dark:hover:bg-neutral-800
                                  "
                              >
                                <Eye size={16} />

                                <span>View Responses</span>

                                {/* <span
                                  className="
                                      ml-auto
                                      rounded-full
                                      bg-blue-100
                                      px-2
                                      py-0.5
                                      text-[10px]
                                      font-medium
                                      text-blue-700
                                      dark:bg-blue-950/50
                                      dark:text-blue-300
                                    "
                                >
                                  {event.registrationCount}
                                </span> */}
                              </button>
                            )}

                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() => openDeleteModal(event)}
                              className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  px-4
                                  py-3
                                  text-sm
                                  text-red-600
                                  transition
                                  hover:bg-red-50
                                  dark:text-red-400
                                  dark:hover:bg-red-950/30
                                "
                            >
                              <Trash2 size={16} />

                              <span>Delete Event</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* IMAGE */}
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="
                            h-48
                            w-full
                            bg-slate-100
                            object-cover
                            dark:bg-neutral-900
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex
                            h-48
                            items-center
                            justify-center
                            bg-slate-100
                            dark:bg-[#222225]
                          "
                      >
                        <CalendarDays
                          size={48}
                          className="
                              text-slate-300
                              dark:text-neutral-600
                            "
                        />
                      </div>
                    )}

                    {/* CONTENT */}
                    <div className="p-5">
                      {/* TITLE */}
                      <div
                        className="
                            mb-2
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                      >
                        <h3
                          className="
                              line-clamp-2
                              text-lg
                              font-semibold
                              text-slate-900
                              dark:text-white
                            "
                        >
                          {event.title}
                        </h3>

                        {registrationEnabled && (
                          <span
                            className={`
                                shrink-0
                                rounded-full
                                px-2.5
                                py-1
                                text-[11px]
                                font-medium

                                ${
                                  alreadyRegistered
                                    ? `
                                      bg-green-100
                                      text-green-700
                                      dark:bg-green-950/40
                                      dark:text-green-400
                                    `
                                    : registrationOpen
                                      ? `
                                        bg-violet-100
                                        text-violet-700
                                        dark:bg-violet-950/50
                                        dark:text-violet-300
                                      `
                                      : `
                                        bg-slate-100
                                        text-slate-500
                                        dark:bg-neutral-800
                                        dark:text-neutral-400
                                      `
                                }
                              `}
                          >
                            {alreadyRegistered
                              ? "Registered"
                              : registrationOpen
                                ? "Registration Open"
                                : "Registration Closed"}
                          </span>
                        )}
                      </div>

                      {/* DESCRIPTION */}
                      {event.description && (
                        <p
                          className="
                              mb-4
                              line-clamp-2
                              text-sm
                              leading-5
                              text-slate-500
                              dark:text-neutral-400
                            "
                        >
                          {event.description}
                        </p>
                      )}

                      {/* EVENT INFO */}
                      <div className="space-y-2">
                        <div
                          className="
                              flex
                              items-center
                              gap-2
                              text-sm
                              text-slate-600
                              dark:text-neutral-300
                            "
                        >
                          <CalendarDays size={16} />

                          <span>{formatDate(event.startTime)}</span>
                        </div>

                        <div
                          className="
                              flex
                              items-center
                              gap-2
                              text-sm
                              text-slate-600
                              dark:text-neutral-300
                            "
                        >
                          <Clock3 size={16} />

                          <span>
                            {formatTime(event.startTime)}

                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </span>
                        </div>

                        {event.location && (
                          <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                text-slate-600
                                dark:text-neutral-300
                              "
                          >
                            <MapPin size={16} />

                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {event.organizerName && (
                          <div
                            className="
                                flex
                                items-center
                                gap-2
                                pt-1
                                text-xs
                                text-slate-400
                                dark:text-neutral-500
                              "
                          >
                            <UserRound size={14} />

                            <span>{event.organizerName}</span>
                          </div>
                        )}
                      </div>

                      {/* REGISTRATION INFO */}
                      {registrationEnabled && (
                        <div
                          className="
                              mt-4
                              flex
                              items-center
                              justify-between
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              px-3
                              py-2.5
                              dark:border-neutral-700
                              dark:bg-[#222225]
                            "
                        >
                          <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-slate-500
                                dark:text-neutral-400
                              "
                          >
                            <UsersRound size={15} />

                            <span>
                              {event.capacity !== null
                                ? `${event.registrationCount} / ${event.capacity} registered`
                                : `${event.registrationCount} registered`}
                            </span>
                          </div>

                          {event.registrationDeadline && registrationOpen && (
                            <span
                              className="
                                    text-[11px]
                                    text-slate-400
                                    dark:text-neutral-500
                                  "
                            >
                              Until {formatDate(event.registrationDeadline)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div
                        className="
                            mt-5
                            flex
                            gap-2
                          "
                      >
                        {/* VIEW DETAILS */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            navigate(`/vibe/events/${event.id}`);
                          }}
                          className="
                              flex-1
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-4
                              py-2.5
                              text-sm
                              font-medium
                              text-slate-700
                              transition
                              hover:bg-slate-50
                              dark:border-neutral-700
                              dark:bg-[#222225]
                              dark:text-neutral-200
                              dark:hover:bg-[#29292d]
                            "
                        >
                          View Details
                        </button>

                        {/* ADMIN → VIEW RESPONSES */}
                        {isAdmin && registrationEnabled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(`/vibe/events/${event.id}/responses`);
                            }}
                            className="
                                  flex-1
                                  rounded-xl
                                  bg-blue-600
                                  px-4
                                  py-2.5
                                  text-sm
                                  font-medium
                                  text-white
                                  transition
                                  hover:bg-blue-700
                                  dark:hover:bg-blue-500
                                "
                          >
                            View Responses
                          </button>
                        )}

                        {/* NORMAL USER */}
                        {!isAdmin && registrationEnabled && (
                          <button
                            type="button"
                            disabled={alreadyRegistered || !registrationOpen}
                            onClick={(e) => {
                              e.stopPropagation();

                              if (alreadyRegistered || !registrationOpen) {
                                return;
                              }

                              navigate(`/vibe/events/${event.id}/register`);
                            }}
                            className={`
                                  flex-1
                                  rounded-xl
                                  px-4
                                  py-2.5
                                  text-sm
                                  font-medium
                                  transition

                                  ${
                                    alreadyRegistered
                                      ? `
                                        cursor-default
                                        bg-green-100
                                        text-green-700
                                        dark:bg-green-950/40
                                        dark:text-green-400
                                      `
                                      : registrationOpen
                                        ? `
                                          bg-violet-600
                                          text-white
                                          hover:bg-violet-700
                                          dark:hover:bg-violet-500
                                        `
                                        : `
                                          cursor-not-allowed
                                          bg-slate-200
                                          text-slate-500
                                          dark:bg-neutral-800
                                          dark:text-neutral-500
                                        `
                                  }
                                `}
                          >
                            {alreadyRegistered
                              ? "Registered"
                              : registrationOpen
                                ? "Register"
                                : "Registration Closed"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* =================================================
              BACKGROUND FETCH INDICATOR
              ================================================= */}

          {!loading && isFetching && events.length > 0 && (
            <div
              className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  text-slate-400
                  dark:text-neutral-500
                "
            >
              <RefreshCw size={13} className="animate-spin" />
              Updating events...
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
          ===================================================== */}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Event?"
        message={
          eventToDelete
            ? `Are you sure you want to delete "${eventToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this event?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteEvent}
        onCancel={closeDeleteModal}
        loading={deleteLoading}
        loadingText="Deleting..."
      />

      {shareEvent && (
        <div
          className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      bg-black/40
      px-4
      backdrop-blur-sm
    "
          onClick={() => setShareEvent(null)}
        >
          <div
            className="
        w-full
        max-w-md
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-2xl
        dark:border-neutral-700
        dark:bg-[#202024]
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Share Event
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
                  Share "{shareEvent.title}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShareEvent(null)}
                className="
            rounded-lg
            p-2
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-700
            dark:text-neutral-400
            dark:hover:bg-neutral-800
            dark:hover:text-neutral-200
          "
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {/* COPY LINK */}
              <button
                type="button"
                onClick={async () => {
                  const url = `${window.location.origin}/vibe/events/${shareEvent.id}`;

                  try {
                    await navigator.clipboard.writeText(url);
                    setShareEvent(null);

                    // Replace with your toast if you already have one
                    alert("Event link copied!");
                  } catch (error) {
                    console.error("Failed to copy link:", error);
                  }
                }}
                className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-100
            dark:text-neutral-200
            dark:hover:bg-neutral-800
          "
              >
                <Link size={18} />
                <span>Copy Link</span>
              </button>

              {/* WHATSAPP */}
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/vibe/events/${shareEvent.id}`;
                  const text = `Check out this event on UniVibe: ${shareEvent.title}`;

                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `${text}\n${url}`,
                    )}`,
                    "_blank",
                    "noopener,noreferrer",
                  );

                  setShareEvent(null);
                }}
                className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-100
            dark:text-neutral-200
            dark:hover:bg-neutral-800
          "
              >
                <MessageCircle size={18} />
                <span>Share on WhatsApp</span>
              </button>

              {/* TELEGRAM */}
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/vibe/events/${shareEvent.id}`;
                  const text = `Check out this event on UniVibe: ${shareEvent.title}`;

                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(
                      url,
                    )}&text=${encodeURIComponent(text)}`,
                    "_blank",
                    "noopener,noreferrer",
                  );

                  setShareEvent(null);
                }}
                className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-100
            dark:text-neutral-200
            dark:hover:bg-neutral-800
          "
              >
                <Send size={18} />
                <span>Share on Telegram</span>
              </button>

              {/* EMAIL */}
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/vibe/events/${shareEvent.id}`;
                  const subject = `UniVibe Event: ${shareEvent.title}`;
                  const body = `Check out this event on UniVibe:\n\n${shareEvent.title}\n${url}`;

                  window.location.href =
                    `mailto:?subject=${encodeURIComponent(subject)}` +
                    `&body=${encodeURIComponent(body)}`;

                  setShareEvent(null);
                }}
                className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-100
            dark:text-neutral-200
            dark:hover:bg-neutral-800
          "
              >
                <Mail size={18} />
                <span>Share via Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Events;
