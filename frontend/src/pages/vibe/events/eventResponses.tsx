import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import {
  getEvent,
  getEventRegistrations,
  type Event,
  type EventRegistrationResponse,
} from "../../../api/eventApi";

export default function EventResponses() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { isLoaded, isSignedIn } = useAuth();

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const numericEventId = Number(eventId);

  const { data: event, isLoading: loadingEvent } = useQuery<Event>({
    queryKey: ["event", numericEventId],
    queryFn: async () => {
      return getEvent(numericEventId);
    },
    enabled: isLoaded && !!isSignedIn && Number.isFinite(numericEventId),
  });

  const {
    data: registrations = [],
    isLoading: loadingRegistrations,
    isError,
    error,
  } = useQuery<EventRegistrationResponse[]>({
    queryKey: ["event-registrations", numericEventId],
    queryFn: async () => {
      return getEventRegistrations(numericEventId);
    },
    enabled: isLoaded && !!isSignedIn && Number.isFinite(numericEventId),
  });

  const filteredRegistrations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return registrations;
    }

    return registrations.filter((registration) => {
      const studentName = registration.studentName?.toLowerCase() ?? "";

      const username = registration.username?.toLowerCase() ?? "";

      const answers = registration.answers
        .map((answer) => answer.answer ?? "")
        .join(" ")
        .toLowerCase();

      return (
        studentName.includes(value) ||
        username.includes(value) ||
        answers.includes(value)
      );
    });
  }, [registrations, search]);

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";

    return new Date(value).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDownloadCSV = () => {
    if (registrations.length === 0) {
      return;
    }

    // Collect every unique registration-form question.
    const questionMap = new Map<number, string>();

    registrations.forEach((registration) => {
      registration.answers.forEach((answer) => {
        if (!questionMap.has(answer.questionId)) {
          questionMap.set(answer.questionId, answer.question);
        }
      });
    });

    const questions = Array.from(questionMap.entries());

    // Fixed UniVibe information + custom form questions.
    const headers = [
      "UniVibe Username",
      "UniVibe User ID",
      "Submitted At",
      ...questions.map(([, question]) => question),
    ];

    // Properly escape values for CSV.
    const escapeCSV = (value: string | null | undefined) => {
      const stringValue = value ?? "";

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    const rows = registrations.map((registration) => {
      const answersByQuestion = new Map<number, string>();

      registration.answers.forEach((answer) => {
        answersByQuestion.set(answer.questionId, answer.answer ?? "");
      });

      return [
        // UniVibe account information
        registration.username ? `@${registration.username}` : "",
        String(registration.userId),
        formatDateTime(registration.submittedAt),

        // Registration form answers
        ...questions.map(
          ([questionId]) => answersByQuestion.get(questionId) ?? "",
        ),
      ];
    });

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    // BOM helps Excel correctly recognize UTF-8.
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const safeTitle = (event?.title ?? "event")
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    link.download = `${safeTitle || "event"}_responses.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const remainingSeats =
    event?.capacity != null
      ? Math.max(event.capacity - registrations.length, 0)
      : null;

  if (!isLoaded || loadingEvent || loadingRegistrations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
        Please sign in.
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            Event not found.
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : "Unable to load registrations.";

    return (
      <div className="min-h-screen bg-white px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
              UniVibe Events
            </p>

            <h1 className="text-xl font-bold tracking-tight">
              Event Responses
            </h1>
          </div>
        </div>

        {/* Event summary */}
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-48 w-full object-cover sm:h-56"
            />
          )}

          <div className="p-5 sm:p-6">
            <h2 className="text-xl font-bold">{event.title}</h2>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              {event.startTime && (
                <div className="flex items-center gap-2">
                  <Calendar size={15} />
                  {formatDate(event.startTime)}
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {event.location}
                </div>
              )}

              {event.registrationDeadline && (
                <div className="flex items-center gap-2">
                  <Clock size={15} />
                  Deadline {formatDate(event.registrationDeadline)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Users size={17} />
              <span className="text-xs font-medium">Registrations</span>
            </div>

            <p className="text-2xl font-bold">{registrations.length}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Capacity
            </div>

            <p className="text-2xl font-bold">{event.capacity ?? "∞"}</p>
          </div>

          <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-1">
            <div className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Remaining
            </div>

            <p className="text-2xl font-bold">{remainingSeats ?? "∞"}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students or answers..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        {/* Responses header */}
        <div className="mb-3 mt-7 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Responses</h2>

            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {filteredRegistrations.length}{" "}
              {filteredRegistrations.length === 1 ? "response" : "responses"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={registrations.length === 0}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>

        {/* Empty */}
        {filteredRegistrations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Users size={21} className="text-zinc-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
              {search ? "No matching responses" : "No registrations yet"}
            </h3>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {search
                ? "Try a different search."
                : "Student registrations will appear here."}
            </p>
          </div>
        )}

        {/* Registration cards */}
        <div className="space-y-3">
          {filteredRegistrations.map((registration) => {
            const expanded = expandedId === registration.registrationId;

            const name = registration.studentName?.trim() || "Unknown student";

            return (
              <div
                key={registration.registrationId}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Summary */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expanded ? null : registration.registrationId)
                  }
                  className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:p-5"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{name}</h3>

                    {registration.username && (
                      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        @{registration.username}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-zinc-400">
                      Submitted {formatDateTime(registration.submittedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 sm:block">
                      {registration.answers.length} answers
                    </span>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700">
                      {expanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Answers */}
                {expanded && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800">
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {registration.answers.length === 0 ? (
                        <div className="p-5 text-sm text-zinc-500">
                          No answers submitted.
                        </div>
                      ) : (
                        registration.answers.map((answer) => (
                          <div key={answer.questionId} className="p-5">
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              {answer.question}
                            </p>

                            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-zinc-900 dark:text-zinc-100">
                              {answer.answer?.trim() || "No answer"}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
