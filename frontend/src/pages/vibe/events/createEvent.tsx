import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";

import { createEvent } from "../../../api/eventApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const parseLocalDateTime = (value: string): Date | null => {
  if (!value) return null;

  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes);
};

const formatLocalDateTime = (date: Date | null): string => {
  if (!date) return "";

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [registrationEnabled, setRegistrationEnabled] = useState(false);

  const [registrationDeadline, setRegistrationDeadline] = useState("");

  const [capacity, setCapacity] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) {
      return null;
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration is missing.");
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload event image.");
      }

      const data = await response.json();

      return data.secure_url;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }

    if (!startTime) {
      setError("Event start time is required.");
      return;
    }

    if (
      endTime &&
      new Date(endTime).getTime() < new Date(startTime).getTime()
    ) {
      setError("Event end time must be after the start time.");
      return;
    }

    if (registrationEnabled) {
      if (
        registrationDeadline &&
        new Date(registrationDeadline).getTime() > new Date(startTime).getTime()
      ) {
        setError("Registration deadline must be before the event.");
        return;
      }

      if (capacity && Number(capacity) <= 0) {
        setError("Capacity must be greater than zero.");
        return;
      }
    }

    try {
      setCreating(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not available.");
      }

      const imageUrl = await uploadImage();

      const response = await createEvent(token, {
        title: title.trim(),

        description: description.trim() || null,

        imageUrl: imageUrl || null,

        location: location.trim() || null,

        startTime: new Date(startTime).toISOString(),

        endTime: endTime ? new Date(endTime).toISOString() : null,

        registrationDeadline:
          registrationEnabled && registrationDeadline
            ? new Date(registrationDeadline).toISOString()
            : null,

        capacity: registrationEnabled && capacity ? Number(capacity) : null,

        registrationEnabled,
      });

      if (registrationEnabled) {
        navigate(`/vibe/events/create-form/${response.id}`);
      } else {
        navigate("/vibe/events");
      }
    } catch (err) {
      console.error("Failed to create event:", err);

      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-xl font-semibold">Create Event</h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create an event for your campus community
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold">Event Information</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Event title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. College Tech Fest 2026"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell students what this event is about..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <MapPin size={15} />
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
          </section>

          {/* Event image */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-1 text-base font-semibold">Event Banner</h2>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Add an image to make your event stand out.
            </p>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="max-h-80 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                >
                  <X size={17} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 px-5 py-10 transition hover:border-violet-400 hover:bg-violet-50/50 dark:border-gray-700 dark:hover:border-violet-600 dark:hover:bg-violet-950/10">
                <ImagePlus size={30} className="mb-3 text-gray-400" />

                <span className="text-sm font-medium">Upload event image</span>

                <span className="mt-1 text-xs text-gray-500">
                  PNG, JPG or WEBP • Max 5MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </section>

          {/* Date and time */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold">Date & Time</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <CalendarDays size={15} />
                  Start
                </label>

                <DatePicker
                  selected={parseLocalDateTime(startTime)}
                  onChange={(date: Date | null) =>
                    setStartTime(formatLocalDateTime(date))
                  }
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy h:mm aa"
                  placeholderText="DD/MM/YYYY hh:mm AM/PM"
                  minDate={new Date()}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  wrapperClassName="w-full"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <Clock size={15} />
                  End
                </label>

                <DatePicker
                  selected={parseLocalDateTime(endTime)}
                  onChange={(date: Date | null) =>
                    setEndTime(formatLocalDateTime(date))
                  }
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy h:mm aa"
                  placeholderText="DD/MM/YYYY hh:mm AM/PM"
                  minDate={
                    startTime
                      ? (parseLocalDateTime(startTime) ?? new Date())
                      : new Date()
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </section>

          {/* Registration */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users size={17} />

                  <h2 className="text-base font-semibold">Registration</h2>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Allow students to register for this event.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRegistrationEnabled((current) => !current)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  registrationEnabled
                    ? "bg-violet-600"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
                aria-label="Toggle registration"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    registrationEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {registrationEnabled && (
              <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Registration deadline
                  </label>

                  <DatePicker
                    selected={parseLocalDateTime(registrationDeadline)}
                    onChange={(date: Date | null) =>
                      setRegistrationDeadline(formatLocalDateTime(date))
                    }
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy h:mm aa"
                    placeholderText="DD/MM/YYYY hh:mm AM/PM"
                    minDate={new Date()}
                    maxDate={
                      startTime
                        ? (parseLocalDateTime(startTime) ?? undefined)
                        : undefined
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                    wrapperClassName="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={creating || uploadingImage}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating || uploadingImage}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating || uploadingImage ? (
                <>
                  <Loader2 size={17} className="animate-spin" />

                  {uploadingImage ? "Uploading image..." : "Creating event..."}
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
