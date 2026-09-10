import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
  UsersRound,
  Loader2,
  ClipboardList,
  Eye,
} from "lucide-react";

import { useAuth } from "@clerk/react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getEvent, type Event } from "../../../api/eventApi";

import { useProfileApi } from "../../../api/profileApi";

const EventDetail = () => {
  const navigate = useNavigate();

  const { eventId } = useParams<{
    eventId: string;
  }>();

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const { getProfile } = useProfileApi();

  const numericEventId = Number(eventId);

  /*
   * =========================================================
   * EVENT QUERY
   * =========================================================
   */

  const {
    data: event,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<Event>({
    queryKey: ["event", numericEventId],

    queryFn: async () => {
      if (!Number.isFinite(numericEventId)) {
        throw new Error("Invalid event.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token unavailable.");
      }

      return getEvent(numericEventId);
    },

    enabled: isLoaded && !!isSignedIn && Number.isFinite(numericEventId),

    staleTime: 1000 * 60 * 2,

    gcTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,

    retry: 2,
  });

  /*
   * =========================================================
   * PROFILE QUERY
   * =========================================================
   */

  const { data: profile } = useQuery({
    queryKey: ["profile", "me"],

    queryFn: getProfile,

    enabled: isLoaded && !!isSignedIn,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
  });

  /*
   * =========================================================
   * ADMIN
   * =========================================================
   */

  const isAdmin = profile?.role === "ADMIN";

  /*
   * =========================================================
   * ERROR MESSAGE
   * =========================================================
   */

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load event."
    : null;

  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /*
   * =========================================================
   * FORMAT TIME
   * =========================================================
   */

  const formatTime = (value: string) => {
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /*
   * =========================================================
   * REGISTER
   * =========================================================
   */

  const handleRegister = () => {
    if (!event) {
      return;
    }

    if (isAdmin) {
      navigate(`/vibe/events/${event.id}/responses`);

      return;
    }

    if (
      !event.registrationEnabled ||
      !event.registrationOpen ||
      event.registeredByCurrentUser
    ) {
      return;
    }

    navigate(`/vibe/events/${event.id}/register`);
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-50
          dark:bg-[#101010]
        "
      >
        <div
          className="
            flex
            min-h-[70vh]
            items-center
            justify-center
          "
        >
          <Loader2
            size={28}
            className="
              animate-spin
              text-violet-600
            "
          />
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (errorMessage || !event) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-50
          px-4
          py-6
          text-slate-900
          dark:bg-[#101010]
          dark:text-white
        "
      >
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/vibe/events")}
            className="
              mb-6
              flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-sm
              text-slate-600
              transition
              hover:bg-slate-200
              dark:text-neutral-300
              dark:hover:bg-neutral-800
            "
          >
            <ArrowLeft size={18} />
            Events
          </button>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-8
              text-center
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <p className="text-sm text-red-500">
              {errorMessage || "Event not found."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="
                mt-5
                rounded-xl
                bg-violet-600
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-violet-700
              "
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * REGISTRATION STATE
   * =========================================================
   */

  const registrationEnabled = event.registrationEnabled;

  const registrationOpen = event.registrationOpen;

  const alreadyRegistered = event.registeredByCurrentUser;

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-24
        text-slate-900
        dark:bg-[#101010]
        dark:text-white
      "
    >
      {/* HEADER */}
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
          dark:bg-[#101010]/95
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-4xl
            items-center
            px-4
            py-3
          "
        >
          <button
            type="button"
            onClick={() => navigate("/vibe/events")}
            className="
              rounded-full
              p-2
              text-slate-600
              transition
              hover:bg-slate-200
              dark:text-neutral-300
              dark:hover:bg-neutral-800
            "
            aria-label="Back to events"
          >
            <ArrowLeft size={20} />
          </button>

          <h1
            className="
              ml-2
              text-base
              font-semibold
            "
          >
            Event Details
          </h1>
        </div>
      </header>

      <main
        className="
          mx-auto
          max-w-4xl
          px-4
          py-5
        "
      >
        {/* EVENT IMAGE */}
        {event.imageUrl ? (
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
            <img
              src={event.imageUrl}
              alt={event.title}
              className="
                h-56
                w-full
                object-cover
                sm:h-72
                md:h-80
              "
            />
          </div>
        ) : (
          <div
            className="
              flex
              h-56
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-slate-100
              dark:border-neutral-800
              dark:bg-neutral-900
              sm:h-72
              md:h-80
            "
          >
            <CalendarDays
              size={64}
              strokeWidth={1.3}
              className="
                text-slate-300
                dark:text-neutral-700
              "
            />
          </div>
        )}

        {/* TITLE */}
        <section className="mt-6">
          <div
            className="
              flex
              flex-wrap
              items-start
              gap-2
            "
          >
            <h2
              className="
                flex-1
                text-2xl
                font-bold
                tracking-tight
                sm:text-3xl
              "
            >
              {event.title}
            </h2>

            {registrationEnabled && (
              <span
                className={`
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
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
                          dark:bg-violet-950/40
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

          {event.organizerName && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                text-sm
                text-slate-500
                dark:text-neutral-400
              "
            >
              <UserRound size={16} />

              <span>
                Organized by{" "}
                <span
                  className="
                    font-medium
                    text-slate-700
                    dark:text-neutral-200
                  "
                >
                  {event.organizerName}
                </span>
              </span>
            </div>
          )}
        </section>

        {/* EVENT INFORMATION */}
        <section
          className="
            mt-6
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          {/* DATE */}
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              dark:border-neutral-800
              dark:bg-[#171717]
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
                bg-violet-100
                text-violet-600
                dark:bg-violet-950/40
                dark:text-violet-400
              "
            >
              <CalendarDays size={18} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-slate-400
                  dark:text-neutral-500
                "
              >
                Date
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                "
              >
                {formatDate(event.startTime)}
              </p>
            </div>
          </div>

          {/* TIME */}
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              dark:border-neutral-800
              dark:bg-[#171717]
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
                bg-violet-100
                text-violet-600
                dark:bg-violet-950/40
                dark:text-violet-400
              "
            >
              <Clock3 size={18} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-slate-400
                  dark:text-neutral-500
                "
              >
                Time
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                "
              >
                {formatTime(event.startTime)}

                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </p>
            </div>
          </div>

          {/* LOCATION */}
          {event.location && (
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                dark:border-neutral-800
                dark:bg-[#171717]
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
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-950/40
                  dark:text-violet-400
                "
              >
                <MapPin size={18} />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    text-slate-400
                    dark:text-neutral-500
                  "
                >
                  Location
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                  "
                >
                  {event.location}
                </p>
              </div>
            </div>
          )}

          {/* CAPACITY */}
          {event.capacity !== null && (
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                dark:border-neutral-800
                dark:bg-[#171717]
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
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-950/40
                  dark:text-violet-400
                "
              >
                <UsersRound size={18} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    text-slate-400
                    dark:text-neutral-500
                  "
                >
                  Capacity
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                  "
                >
                  {event.registrationCount} / {event.capacity} participants
                </p>
              </div>
            </div>
          )}
        </section>

        {/* DESCRIPTION */}
        {event.description && (
          <section
            className="
              mt-6
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <h3
              className="
                text-base
                font-semibold
              "
            >
              About this event
            </h3>

            <p
              className="
                mt-3
                whitespace-pre-wrap
                text-sm
                leading-6
                text-slate-600
                dark:text-neutral-300
              "
            >
              {event.description}
            </p>
          </section>
        )}

        {/* REGISTRATION */}
        {registrationEnabled && (
          <section
            className={`
              mt-6
              rounded-2xl
              border
              p-5

              ${
                isAdmin
                  ? `
                    border-blue-200
                    bg-blue-50
                    dark:border-blue-900/40
                    dark:bg-blue-950/20
                  `
                  : alreadyRegistered
                    ? `
                      border-green-200
                      bg-green-50
                      dark:border-green-900/40
                      dark:bg-green-950/20
                    `
                    : registrationOpen
                      ? `
                        border-violet-200
                        bg-violet-50
                        dark:border-violet-900/40
                        dark:bg-violet-950/20
                      `
                      : `
                        border-slate-200
                        bg-slate-100
                        dark:border-neutral-800
                        dark:bg-[#171717]
                      `
              }
            `}
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              {/* ICON */}
              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-white

                  ${
                    isAdmin
                      ? "bg-blue-600"
                      : alreadyRegistered
                        ? "bg-green-600"
                        : registrationOpen
                          ? "bg-violet-600"
                          : "bg-neutral-500"
                  }
                `}
              >
                {isAdmin ? (
                  <ClipboardList size={19} />
                ) : alreadyRegistered ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <ClipboardList size={19} />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold">
                  {isAdmin ? "Event Responses" : "Event Registration"}
                </h3>

                {/* ADMIN */}
                {isAdmin ? (
                  <>
                    <p
                      className="
                        mt-1
                        text-sm
                        text-blue-800
                        dark:text-blue-200
                      "
                    >
                      View the responses submitted by students for this event.
                    </p>

                    <p
                      className="
                        mt-2
                        text-xs
                        text-blue-700
                        dark:text-blue-300
                      "
                    >
                      {event.registrationCount}{" "}
                      {event.registrationCount === 1 ? "response" : "responses"}{" "}
                      received
                    </p>
                  </>
                ) : alreadyRegistered ? (
                  <>
                    <p
                      className="
                        mt-1
                        text-sm
                        text-green-700
                        dark:text-green-300
                      "
                    >
                      You are already registered for this event.
                    </p>

                    <p
                      className="
                        mt-2
                        text-xs
                        text-green-600
                        dark:text-green-400
                      "
                    >
                      Your registration has been successfully submitted.
                    </p>
                  </>
                ) : registrationOpen ? (
                  <>
                    <p
                      className="
                        mt-1
                        text-sm
                        text-violet-800
                        dark:text-violet-200
                      "
                    >
                      Registration is open. Complete the registration form to
                      reserve your spot.
                    </p>

                    {event.registrationDeadline && (
                      <p
                        className="
                          mt-2
                          text-xs
                          text-violet-700
                          dark:text-violet-300
                        "
                      >
                        Registration closes on{" "}
                        <span className="font-medium">
                          {formatDate(event.registrationDeadline)}
                        </span>{" "}
                        at{" "}
                        <span className="font-medium">
                          {formatTime(event.registrationDeadline)}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-600
                        dark:text-neutral-400
                      "
                    >
                      Registration for this event is closed.
                    </p>

                    {event.capacity !== null &&
                      event.registrationCount >= event.capacity && (
                        <p
                          className="
                            mt-2
                            text-xs
                            text-red-500
                          "
                        >
                          This event has reached its maximum capacity.
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>

            {/* ADMIN BUTTON */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate(`/vibe/events/${event.id}/responses`)}
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  dark:hover:bg-blue-500
                "
              >
                <Eye size={18} />
                View Responses
                <span
                  className="
                    rounded-full
                    bg-white/15
                    px-2
                    py-0.5
                    text-xs
                  "
                >
                  {event.registrationCount}
                </span>
              </button>
            )}

            {/* NORMAL USER - OPEN */}
            {!isAdmin && registrationOpen && !alreadyRegistered && (
              <button
                type="button"
                onClick={handleRegister}
                className="
                    mt-5
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-violet-600
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-violet-700
                    dark:hover:bg-violet-500
                  "
              >
                <ClipboardList size={18} />
                Register Now
              </button>
            )}

            {/* NORMAL USER - ALREADY REGISTERED */}
            {!isAdmin && alreadyRegistered && (
              <div
                className="
                    mt-5
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-green-100
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-green-700
                    dark:bg-green-950/40
                    dark:text-green-400
                  "
              >
                <CheckCircle2 size={18} />
                Registered
              </div>
            )}

            {/* NORMAL USER - CLOSED */}
            {!isAdmin && !alreadyRegistered && !registrationOpen && (
              <div
                className="
                    mt-5
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-slate-200
                    px-5
                    py-3.5
                    text-sm
                    font-medium
                    text-slate-500
                    dark:bg-neutral-800
                    dark:text-neutral-500
                  "
              >
                <CheckCircle2 size={17} />
                Registration Closed
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default EventDetail;
