import { useNavigate } from "react-router";
import { useState } from "react";

import ProfileHeader from "../../components/profile-setup/ProfileHeader";
import ProfilePhoto from "../../components/profile-setup/ProfilePhoto";
import ProfileInput from "../../components/profile-setup/ProfileInput";
import ProfileSelect from "../../components/profile-setup/ProfileSelect";

import { useProfileApi } from "../../api/profileApi";
import axios from "axios";

function ProfileSetupPage() {
  const navigate = useNavigate();
  const { createProfile } = useProfileApi();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    college: "",
    year: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

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

    if (!form.college.trim()) {
      setError("Please enter your college.");
      return;
    }

    if (!form.year) {
      setError("Please select your year.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createProfile(
        {
          ...form,
          interests: "",
          department: "",
          bio: "",
        },
        profileFile,
      );

      window.dispatchEvent(new Event("profile-created"));

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
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
      {/* HEADER */}
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
        <div className="mx-auto max-w-2xl">
          <ProfileHeader />
        </div>
      </header>

      {/* MAIN */}
      <main
        className="
          px-5
          py-8
          sm:px-8
          sm:py-10
        "
      >
        <div className="mx-auto max-w-2xl">
          {/* TITLE */}
          <div className="mb-6">
            <h2
              className="
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
                sm:text-3xl
              "
            >
              Build your profile
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
              Set up the basics and start connecting with your campus.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="
              rounded-[24px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_16px_45px_-20px_rgba(15,23,42,0.18)]
              transition-colors
              dark:border-neutral-800
              dark:bg-[#171717]
              dark:shadow-[0_16px_45px_-20px_rgba(0,0,0,0.5)]
              sm:p-8
            "
          >
            {/* PROFILE PHOTO */}
            <ProfilePhoto
              image={profileImage}
              onChange={setProfileImage}
              onFileChange={setProfileFile}
            />

            <div className="mt-6 space-y-5">
              {/* FULL NAME */}
              <ProfileInput
                label="Full Name"
                value={form.fullName}
                placeholder="Enter your full name"
                onChange={(value) => update("fullName", value)}
              />

              {/* USERNAME */}
              <ProfileInput
                label="Username"
                value={form.username}
                placeholder="Choose a username"
                onChange={(value) => update("username", value)}
              />

              {/* COLLEGE */}
              <ProfileInput
                label="College"
                value={form.college}
                placeholder="Enter your college"
                onChange={(value) => update("college", value)}
              />

              {/* YEAR */}
              <ProfileSelect
                label="Year"
                value={form.year}
                placeholder="Select your year"
                options={[
                  "1st Year",
                  "2nd Year",
                  "3rd Year",
                  "4th Year",
                  "Postgraduate",
                ]}
                onChange={(value) => update("year", value)}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                  dark:border-red-900/60
                  dark:bg-red-950/30
                  dark:text-red-400
                "
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-6
                w-full
                rounded-2xl
                bg-violet-600
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-[0_8px_20px_-8px_rgba(124,58,237,0.55)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-violet-700
                hover:shadow-[0_12px_24px_-10px_rgba(124,58,237,0.65)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
                dark:bg-violet-600
                dark:hover:bg-violet-500
              "
            >
              {loading ? "Setting up..." : "Continue to UniVibe →"}
            </button>
          </form>

          {/* FOOTER NOTE */}
          <p
            className="
              py-6
              text-center
              text-xs
              text-slate-400
              dark:text-neutral-500
            "
          >
            You can add more details to your profile anytime.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ProfileSetupPage;
