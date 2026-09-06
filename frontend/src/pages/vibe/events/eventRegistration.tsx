import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import {
  getEvent,
  getRegistrationForm,
  registerForEvent,
  type Event,
  type RegistrationFormResponse,
} from "../../../api/eventApi";

const EventRegistration: React.FC = () => {
  const { eventId } = useParams<{
    eventId: string;
  }>();

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);

  const [form, setForm] = useState<RegistrationFormResponse | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (!eventId) {
          throw new Error("Invalid event.");
        }

        const id = Number(eventId);

        if (Number.isNaN(id)) {
          throw new Error("Invalid event.");
        }

        const token = await getToken();

        if (!token) {
          throw new Error("Authentication token not available.");
        }

        const [eventData, formData] = await Promise.all([
          getEvent(token, id),
          getRegistrationForm(token, id),
        ]);

        setEvent(eventData);
        setForm(formData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load registration form.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId, getToken]);

  const updateAnswer = (questionId: number, value: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form || !event) {
      return;
    }

    setError("");

    for (const question of form.questions) {
      if (question.required && !answers[question.id]?.trim()) {
        setError(`Please answer: ${question.question}`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not available.");
      }

      await registerForEvent(token, event.id, {
        answers: form.questions.map((question) => ({
          questionId: question.id,
          answer: answers[question.id] || null,
        })),
      });

      setSuccess(true);
    } catch (err) {
      console.error("Registration failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to register for this event.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={28} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <CheckCircle2 size={52} className="mx-auto mb-4 text-green-500" />

          <h1 className="text-xl font-semibold">Registration Successful</h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You have successfully registered for{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {event?.title}
            </span>
            .
          </p>

          <button
            onClick={() => navigate(`/vibe/events/${event?.id}`)}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-700"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  if (!form || !event) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-red-500">
            {error || "Registration form not found."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-xl font-semibold">Register for Event</h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {event.title}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {form.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <label className="mb-2 block text-sm font-medium">
                {index + 1}. {question.question}
                {question.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>

              {question.type === "TEXT" && (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              {question.type === "EMAIL" && (
                <input
                  type="email"
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              {question.type === "PHONE" && (
                <input
                  type="tel"
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              {question.type === "NUMBER" && (
                <input
                  type="number"
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              {question.type === "TEXTAREA" && (
                <textarea
                  rows={4}
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              {question.type === "SELECT" && (
                <select
                  value={answers[question.id] || ""}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="">Select an option</option>

                  {question.options
                    ?.split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              )}

              {question.type === "RADIO" && (
                <div className="space-y-3">
                  {question.options
                    ?.split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 text-sm"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) =>
                            updateAnswer(question.id, e.target.value)
                          }
                          className="h-4 w-4 accent-violet-600"
                        />

                        {option}
                      </label>
                    ))}
                </div>
              )}

              {question.type === "CHECKBOX" && (
                <div className="space-y-3">
                  {question.options
                    ?.split(",")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .map((option) => {
                      const selected =
                        answers[question.id]
                          ?.split(",")
                          .map((item) => item.trim())
                          .includes(option) ?? false;

                      return (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const current =
                                answers[question.id]
                                  ?.split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean) || [];

                              const updated = e.target.checked
                                ? [...current, option]
                                : current.filter((item) => item !== option);

                              updateAnswer(question.id, updated.join(", "));
                            }}
                            className="h-4 w-4 accent-violet-600"
                          />

                          {option}
                        </label>
                      );
                    })}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRegistration;
