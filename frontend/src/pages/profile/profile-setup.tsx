import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import ProfileHeader from "../../components/profile-setup/ProfileHeader";
import ProfilePhoto from "../../components/profile-setup/ProfilePhoto";
import ProfileInput from "../../components/profile-setup/ProfileInput";
import { useProfileApi } from "../../api/profileApi";

interface Profile {
  id: number;
  fullName: string;
  username: string;
  bio?: string;
  profileImage?: string;
  college?: string;
  department?: string;
  year?: string;
  interests?: string;
  profileCompleted: boolean;
}

function ProfileSetupPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { createProfile } = useProfileApi();

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // UPDATE FORM
  // ==========================================

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.username.trim()) {
      setError("Please choose a username.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ======================================
      // CREATE PROFILE
      // ======================================

      const createdProfile = await createProfile(
        {
          fullName: form.fullName.trim(),
          username: form.username.trim(),

          // Remaining profile fields can be
          // completed later.
          bio: "",
          college: "",
          department: "",
          year: "",
          interests: "",
        },
        profileFile,
      );

      // ======================================
      // UPDATE PROFILE QUERY CACHE
      // ======================================

      if (userId) {
        queryClient.setQueryData<Profile>(
          ["profile", "me", userId],
          createdProfile,
        );
      }

      // ======================================
      // REDIRECT DIRECTLY TO HOME
      // ======================================

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to create profile:", error);

      setError(
        axios.isAxiosError(error)
          ? (error.response?.data?.error ?? "Failed to create profile")
          : "Failed to create profile",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        transition-colors
        duration-300
        dark:bg-black
        dark:text-white
      "
    >
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <header
        className="
          border-b
          border-slate-200
          bg-white
          px-5
          py-4
          dark:border-neutral-800
          dark:bg-[#111111]
        "
      >
        <div className="mx-auto max-w-lg">
          <ProfileHeader />
        </div>
      </header>

      {/* ====================================== */}
      {/* MAIN */}
      {/* ====================================== */}

      <main
        className="
          flex
          min-h-[calc(100vh-73px)]
          items-center
          px-5
          py-8
        "
      >
        <div className="mx-auto w-full max-w-lg">
          {/* INTRO */}

          <div className="mb-6">
            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                dark:text-white
                sm:text-3xl
              "
            >
              Welcome to UniVibe
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
                dark:text-neutral-400
              "
            >
              Just two quick details and you're ready to join your campus
              community.
            </p>
          </div>

          {/* ================================== */}
          {/* FORM */}
          {/* ================================== */}

          <form
            onSubmit={handleSubmit}
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              dark:border-neutral-800
              dark:bg-[#171717]
              sm:p-7
            "
          >
            {/* PROFILE PHOTO */}

            <ProfilePhoto
              image={profileImage}
              onChange={setProfileImage}
              onFileChange={setProfileFile}
            />

            {/* ================================= */}
            {/* INPUTS */}
            {/* ================================= */}

            <div className="mt-7 space-y-5">
              <ProfileInput
                label="Full Name"
                value={form.fullName}
                placeholder="Enter your full name"
                onChange={(value) => update("fullName", value)}
              />

              <ProfileInput
                label="Username"
                value={form.username}
                placeholder="Choose a username"
                onChange={(value) => update("username", value)}
              />
            </div>

            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {error && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                  dark:border-red-900/50
                  dark:bg-red-950/30
                  dark:text-red-400
                "
              >
                {error}
              </div>
            )}

            {/* ================================= */}
            {/* SUBMIT */}
            {/* ================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                rounded-2xl
                bg-violet-600
                py-3.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-violet-700
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:hover:bg-violet-500
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Setting up...
                </>
              ) : (
                "Continue to UniVibe"
              )}
            </button>
          </form>

          <p
            className="
              py-6
              text-center
              text-xs
              text-slate-400
              dark:text-neutral-500
            "
          >
            You can complete your profile anytime.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ProfileSetupPage;
