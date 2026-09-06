import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Circle,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  Type,
} from "lucide-react";

import {
  createRegistrationForm,
  type RegistrationQuestionRequest,
} from "../../../api/eventApi";

type QuestionType = RegistrationQuestionRequest["type"];

interface FormQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options: string;
}

const QUESTION_TYPES: {
  value: QuestionType;
  label: string;
}[] = [
  {
    value: "TEXT",
    label: "Short text",
  },
  {
    value: "EMAIL",
    label: "Email",
  },
  {
    value: "PHONE",
    label: "Phone number",
  },
  {
    value: "NUMBER",
    label: "Number",
  },
  {
    value: "TEXTAREA",
    label: "Long text",
  },
  {
    value: "SELECT",
    label: "Dropdown",
  },
  {
    value: "RADIO",
    label: "Multiple choice",
  },
  {
    value: "CHECKBOX",
    label: "Checkbox",
  },
];

const requiresOptions = (type: QuestionType) => {
  return type === "SELECT" || type === "RADIO" || type === "CHECKBOX";
};

const createEmptyQuestion = (): FormQuestion => ({
  id: crypto.randomUUID(),
  question: "",
  type: "TEXT",
  required: true,
  options: "",
});

const CreateRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { getToken } = useAuth();

  const [questions, setQuestions] = useState<FormQuestion[]>([
    createEmptyQuestion(),
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parsedEventId = Number(eventId);

  const canSave = useMemo(() => {
    if (!questions.length) {
      return false;
    }

    return questions.every((question) => {
      if (!question.question.trim()) {
        return false;
      }

      if (requiresOptions(question.type) && !question.options.trim()) {
        return false;
      }

      return true;
    });
  }, [questions]);

  const updateQuestion = (id: string, changes: Partial<FormQuestion>) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id
          ? {
              ...question,
              ...changes,
            }
          : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, createEmptyQuestion()]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((current) => current.filter((question) => question.id !== id));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    setQuestions((current) => {
      const newQuestions = [...current];

      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= newQuestions.length) {
        return current;
      }

      const temp = newQuestions[index];

      newQuestions[index] = newQuestions[newIndex];

      newQuestions[newIndex] = temp;

      return newQuestions;
    });
  };

  const handleSave = async () => {
    setError("");

    if (!parsedEventId || Number.isNaN(parsedEventId)) {
      setError("Invalid event.");
      return;
    }

    if (!questions.length) {
      setError("Add at least one question to the registration form.");
      return;
    }

    for (const question of questions) {
      if (!question.question.trim()) {
        setError("Please enter a question for every field.");
        return;
      }

      if (requiresOptions(question.type) && !question.options.trim()) {
        setError(`Please add options for "${question.question}".`);
        return;
      }
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not available.");
      }

      const request = {
        questions: questions.map((question, index) => ({
          question: question.question.trim(),

          type: question.type,

          required: question.required,

          options: requiresOptions(question.type)
            ? question.options.trim()
            : null,

          displayOrder: index,
        })),
      };

      await createRegistrationForm(token, parsedEventId, request);

      navigate("/vibe/events");
    } catch (err) {
      console.error("Failed to create registration form:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create registration form.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-xl font-semibold">Registration Form</h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create the questions students will answer when registering for
              this event.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form Builder */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Question header */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={18} className="text-gray-400" />

                  <span className="text-sm font-semibold">
                    Question {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, "up")}
                    disabled={index === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-800"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveQuestion(index, "down")}
                    disabled={index === questions.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-800"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    title="Delete question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                {/* Question */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                    <Type size={15} />
                    Question
                  </label>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        question: e.target.value,
                      })
                    }
                    placeholder="e.g. What is your department?"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                    <ChevronDown size={15} />
                    Field type
                  </label>

                  <select
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        type: e.target.value as QuestionType,
                        options: "",
                      })
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options */}
              {requiresOptions(question.type) && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium">
                    Options
                  </label>

                  <input
                    type="text"
                    value={question.options}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        options: e.target.value,
                      })
                    }
                    placeholder="e.g. 1st Year, 2nd Year, 3rd Year, 4th Year"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  />

                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Separate each option with a comma.
                  </p>
                </div>
              )}

              {/* Required */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium">Required question</p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Students must answer this question.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateQuestion(question.id, {
                      required: !question.required,
                    })
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    question.required
                      ? "bg-violet-600"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      question.required ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Preview
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <label className="mb-2 block text-sm font-medium">
                    {question.question || "Your question"}
                    {question.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>

                  {question.type === "TEXT" && (
                    <input
                      disabled
                      placeholder="Short answer"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  )}

                  {question.type === "EMAIL" && (
                    <input
                      disabled
                      type="email"
                      placeholder="name@example.com"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  )}

                  {question.type === "PHONE" && (
                    <input
                      disabled
                      type="tel"
                      placeholder="Phone number"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  )}

                  {question.type === "NUMBER" && (
                    <input
                      disabled
                      type="number"
                      placeholder="Enter a number"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  )}

                  {question.type === "TEXTAREA" && (
                    <textarea
                      disabled
                      placeholder="Long answer"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  )}

                  {question.type === "SELECT" && (
                    <select
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option>Select an option</option>

                      {question.options
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean)
                        .map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                    </select>
                  )}

                  {question.type === "RADIO" && (
                    <div className="space-y-2">
                      {question.options
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean)
                        .map((option) => (
                          <div
                            key={option}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Circle size={16} className="text-gray-400" />
                            {option}
                          </div>
                        ))}
                    </div>
                  )}

                  {question.type === "CHECKBOX" && (
                    <div className="space-y-2">
                      {question.options
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean)
                        .map((option) => (
                          <div
                            key={option}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 dark:border-gray-600">
                              <Check size={11} className="text-transparent" />
                            </div>

                            {option}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add question */}
        <button
          type="button"
          onClick={addQuestion}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-medium text-gray-600 transition hover:border-violet-400 hover:bg-violet-50/50 hover:text-violet-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-violet-600 dark:hover:bg-violet-950/10 dark:hover:text-violet-400"
        >
          <Plus size={18} />
          Add Question
        </button>

        {/* Bottom actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving Form...
              </>
            ) : (
              <>
                <Check size={17} />
                Save Registration Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRegistrationForm;
