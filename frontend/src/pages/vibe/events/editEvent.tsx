import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@clerk/react";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  createRegistrationForm,
  getEvent,
  getRegistrationForm,
  updateEvent,
  updateRegistrationForm,
  type CreateEventRequest,
  type Event,
  type RegistrationFormRequest,
  type RegistrationQuestionRequest,
} from "../../../api/eventApi";

import { useQuery, useQueryClient } from "@tanstack/react-query";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

type QuestionType =
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "TEXTAREA"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX";

interface Question {
  id?: number;
  question: string;
  type: QuestionType;
  required: boolean;
  options: string;
  displayOrder: number;
}

const QUESTION_TYPES: {
  value: QuestionType;
  label: string;
}[] = [
  { value: "TEXT", label: "Short text" },
  { value: "TEXTAREA", label: "Long text" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Dropdown" },
  { value: "RADIO", label: "Single choice" },
  { value: "CHECKBOX", label: "Checkbox" },
];

const OPTION_TYPES: QuestionType[] = ["SELECT", "RADIO", "CHECKBOX"];

function toLocalDateTime(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function toInstant(value: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function isOptionType(type: QuestionType) {
  return OPTION_TYPES.includes(type);
}

export default function EditEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const numericEventId = Number(eventId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [registrationEnabled, setRegistrationEnabled] = useState(false);

  const [registrationDeadline, setRegistrationDeadline] = useState("");

  const [capacity, setCapacity] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [formExists, setFormExists] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const [savingEvent, setSavingEvent] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  const [eventError, setEventError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: event,
    isLoading: loadingEvent,
    isError: eventLoadError,
  } = useQuery<Event>({
    queryKey: ["event", numericEventId],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      return getEvent(numericEventId);
    },
    enabled: isLoaded && !!isSignedIn && Number.isFinite(numericEventId),
  });

  useEffect(() => {
    if (!event) return;

    setTitle(event.title ?? "");
    setDescription(event.description ?? "");
    setLocation(event.location ?? "");

    setImageUrl(event.imageUrl ?? null);
    setImagePreview(event.imageUrl ?? null);

    setStartTime(toLocalDateTime(event.startTime));
    setEndTime(toLocalDateTime(event.endTime));

    setRegistrationEnabled(event.registrationEnabled);

    setRegistrationDeadline(toLocalDateTime(event.registrationDeadline));

    setCapacity(
      event.capacity !== null && event.capacity !== undefined
        ? String(event.capacity)
        : "",
    );
  }, [event]);

  useEffect(() => {
    if (!event || !registrationEnabled) {
      setQuestions([]);
      setFormExists(false);
      return;
    }

    loadRegistrationForm();
  }, [event, registrationEnabled]);

  const loadRegistrationForm = async () => {
    if (!numericEventId) return;

    try {
      setLoadingForm(true);
      setFormError("");

      const form = await getRegistrationForm(numericEventId);

      setFormExists(true);

      setQuestions(
        [...form.questions]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((question) => ({
            id: question.id,
            question: question.question,
            type: question.type,
            required: question.required,
            options: question.options ?? "",
            displayOrder: question.displayOrder,
          })),
      );
    } catch (error: any) {
      /*
       * A missing form is not an error.
       *
       * The backend may return 404 when registration is enabled
       * but the admin has not created a form yet.
       */
      if (error?.response?.status === 404) {
        setFormExists(false);
        setQuestions([]);
      } else {
        console.error("Failed to load registration form:", error);

        setFormError("Unable to load the registration form.");
      }
    } finally {
      setLoadingForm(false);
    }
  };

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setEventError("");

    if (!file.type.startsWith("image/")) {
      setEventError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEventError("Image must be smaller than 5MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    try {
      setUploadingImage(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await response.json();

      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Image upload failed:", error);

      setImageErrorPreview(preview);

      setEventError("Failed to upload the event image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const setImageErrorPreview = (preview: string) => {
    setImagePreview(preview);
  };

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
  };

  const handleSaveEvent = async () => {
    setEventError("");
    setSuccessMessage("");

    if (!title.trim()) {
      setEventError("Event title is required.");
      return;
    }

    if (!startTime) {
      setEventError("Event start time is required.");
      return;
    }

    if (
      endTime &&
      new Date(endTime).getTime() < new Date(startTime).getTime()
    ) {
      setEventError("Event end time must be after the start time.");
      return;
    }

    if (registrationEnabled) {
      if (
        registrationDeadline &&
        new Date(registrationDeadline).getTime() > new Date(startTime).getTime()
      ) {
        setEventError("Registration deadline must be before the event.");
        return;
      }

      if (
        capacity &&
        (Number(capacity) <= 0 || !Number.isInteger(Number(capacity)))
      ) {
        setEventError("Capacity must be a positive whole number.");
        return;
      }
    }

    try {
      setSavingEvent(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const request: CreateEventRequest = {
        title: title.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl || null,
        location: location.trim() || null,
        startTime: toInstant(startTime) as string,
        endTime: toInstant(endTime),
        registrationDeadline: registrationEnabled
          ? toInstant(registrationDeadline)
          : null,
        capacity: registrationEnabled && capacity ? Number(capacity) : null,
        registrationEnabled,
      };

      await updateEvent(numericEventId, request);

      await queryClient.invalidateQueries({
        queryKey: ["event", numericEventId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      setSuccessMessage("Event details saved successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      console.error("Failed to update event:", error);

      setEventError(
        error?.response?.data?.message || "Failed to update the event.",
      );
    } finally {
      setSavingEvent(false);
    }
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        question: "",
        type: "TEXT",
        required: false,
        options: "",
        displayOrder: current.length,
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              ...updates,
            }
          : question,
      ),
    );
  };

  const deleteQuestion = (index: number) => {
    setQuestions((current) =>
      current
        .filter((_, questionIndex) => questionIndex !== index)
        .map((question, questionIndex) => ({
          ...question,
          displayOrder: questionIndex,
        })),
    );
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    setQuestions((current) => {
      const newQuestions = [...current];

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newQuestions.length) {
        return current;
      }

      [newQuestions[index], newQuestions[targetIndex]] = [
        newQuestions[targetIndex],
        newQuestions[index],
      ];

      return newQuestions.map((question, questionIndex) => ({
        ...question,
        displayOrder: questionIndex,
      }));
    });
  };

  const handleQuestionTypeChange = (index: number, type: QuestionType) => {
    updateQuestion(index, {
      type,
      options: isOptionType(type) ? (questions[index]?.options ?? "") : "",
    });
  };

  const handleSaveForm = async () => {
    setFormError("");
    setSuccessMessage("");

    if (!registrationEnabled) {
      setFormError("Enable registration before editing the registration form.");
      return;
    }

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      if (!question.question.trim()) {
        setFormError(`Question ${index + 1} cannot be empty.`);
        return;
      }

      if (
        isOptionType(question.type) &&
        !question.options
          .split("\n")
          .map((option) => option.trim())
          .filter(Boolean).length
      ) {
        setFormError(`Question ${index + 1} needs at least one option.`);
        return;
      }
    }

    try {
      setSavingForm(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const normalizedQuestions: RegistrationQuestionRequest[] = questions.map(
        (question, index) => ({
          question: question.question.trim(),
          type: question.type,
          required: question.required,
          options: isOptionType(question.type)
            ? question.options
                .split("\n")
                .map((option) => option.trim())
                .filter(Boolean)
                .join("\n")
            : null,
          displayOrder: index,
        }),
      );

      const request: RegistrationFormRequest = {
        questions: normalizedQuestions,
      };

      if (formExists) {
        await updateRegistrationForm(numericEventId, request);
      } else {
        await createRegistrationForm(numericEventId, request);

        setFormExists(true);
      }

      setSuccessMessage("Registration form saved successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      console.error("Failed to save registration form:", error);

      setFormError(
        error?.response?.data?.message ||
          "Failed to save the registration form.",
      );
    } finally {
      setSavingForm(false);
    }
  };

  const pageTitle = useMemo(
    () =>
      loadingEvent
        ? "Edit Event"
        : event?.title
          ? `Edit ${event.title}`
          : "Edit Event",
    [event, loadingEvent],
  );

  if (!isLoaded || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6 text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <p>Please sign in to edit events.</p>
      </div>
    );
  }

  if (eventLoadError || !event) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            Unable to load this event.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              aria-label="Go back"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                UniVibe Events
              </p>

              <h1 className="text-xl font-bold tracking-tight">{pageTitle}</h1>
            </div>
          </div>
        </div>

        {/* Event details */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Event Details</h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Update the information shown to students.
            </p>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Event title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the event..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Event image
              </label>

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="h-56 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    aria-label="Remove image"
                  >
                    <X size={17} />
                  </button>

                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 size={18} className="animate-spin" />
                        Uploading...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <ImageIcon size={22} />
                  </div>

                  <span className="text-sm font-medium">
                    Upload event image
                  </span>

                  <span className="mt-1 text-xs text-zinc-500">
                    PNG, JPG, WEBP up to 5MB
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}

              {imagePreview && (
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  <Upload size={16} />
                  Replace image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium">Location</label>

              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Event location"
                  className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start time
                </label>

                <div className="relative">
                  <Calendar
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End time
                </label>

                <div className="relative">
                  <Calendar
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>
            </div>

            {/* Registration */}
            <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setRegistrationEnabled((current) => !current)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm font-semibold">Enable registration</p>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Allow students to register for this event.
                  </p>
                </div>

                <div
                  className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                    registrationEnabled
                      ? "bg-violet-600"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white transition ${
                      registrationEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              {registrationEnabled && (
                <div className="mt-5 grid gap-5 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Registration deadline
                    </label>

                    <input
                      type="datetime-local"
                      value={registrationDeadline}
                      onChange={(e) => setRegistrationDeadline(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Maximum participants
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="No limit"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                </div>
              )}
            </div>

            {eventError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                {eventError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingEvent || uploadingImage}
                onClick={handleSaveEvent}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEvent ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                Save Event
              </button>
            </div>
          </div>
        </section>

        {/* Registration form */}
        {registrationEnabled && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-lg font-semibold">Registration Form</h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Customize the information students need to provide when
                  registering.
                </p>
              </div>

              {formExists && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Check size={14} />
                  Form exists
                </div>
              )}
            </div>

            {loadingForm ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 size={22} className="animate-spin" />
              </div>
            ) : (
              <>
                {questions.length === 0 && (
                  <div className="mb-5 rounded-2xl border border-dashed border-zinc-300 px-5 py-8 text-center dark:border-zinc-700">
                    <p className="text-sm font-medium">
                      No registration questions yet
                    </p>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Add questions to collect information from students.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id ?? `new-${index}`}
                      className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical size={17} className="text-zinc-400" />

                          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Question {index + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveQuestion(index, "up")}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                            aria-label="Move question up"
                          >
                            <ChevronDown size={16} className="rotate-180" />
                          </button>

                          <button
                            type="button"
                            disabled={index === questions.length - 1}
                            onClick={() => moveQuestion(index, "down")}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                            aria-label="Move question down"
                          >
                            <ChevronDown size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteQuestion(index)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            aria-label="Delete question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-zinc-500">
                            Question
                          </label>

                          <input
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(index, {
                                question: e.target.value,
                              })
                            }
                            placeholder="e.g. What is your department?"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-zinc-500">
                            Answer type
                          </label>

                          <select
                            value={question.type}
                            onChange={(e) =>
                              handleQuestionTypeChange(
                                index,
                                e.target.value as QuestionType,
                              )
                            }
                            className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                          >
                            {QUESTION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(index, {
                              required: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                        />

                        <span>Required question</span>
                      </label>

                      {isOptionType(question.type) && (
                        <div className="mt-4">
                          <label className="mb-2 block text-xs font-medium text-zinc-500">
                            Options
                          </label>

                          <textarea
                            value={question.options}
                            onChange={(e) =>
                              updateQuestion(index, {
                                options: e.target.value,
                              })
                            }
                            rows={4}
                            placeholder={
                              "Computer Science\nInformation Technology\nElectronics"
                            }
                            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
                          />

                          <p className="mt-1 text-xs text-zinc-500">
                            Enter one option per line.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Plus size={17} />
                  Add Question
                </button>

                {formError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                    {formError}
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    disabled={savingForm}
                    onClick={handleSaveForm}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingForm ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}

                    {formExists
                      ? "Save Registration Form"
                      : "Create Registration Form"}
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Success */}
        {successMessage && (
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-zinc-900">
            <Check size={17} />
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
