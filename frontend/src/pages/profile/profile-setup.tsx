import { useNavigate } from "react-router";
import { useState } from "react";
import ProfileHeader from "../../components/profile-setup/ProfileHeader";
import ProfilePhoto from "../../components/profile-setup/ProfilePhoto";
import ProfileInput from "../../components/profile-setup/ProfileInput";
import ProfileSelect from "../../components/profile-setup/ProfileSelect";
import TagInput from "../../components/profile-setup/TagInput";
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
    department: "",
    year: "",
    bio: "",
    interests: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createProfile(
        {
          ...form,
          interests: form.interests.join(","),
        },
        profileFile,
      );

      navigate("/home", { replace: true });
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950">
      <header className="border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto max-w-2xl">
          <ProfileHeader />
        </div>
      </header>

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Build your profile ✨
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tell us a little about yourself.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
          >
            <ProfilePhoto
              image={profileImage}
              onChange={setProfileImage}
              onFileChange={setProfileFile}
            />

            <div className="mt-5 space-y-5">
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

              <ProfileInput
                label="College"
                value={form.college}
                placeholder="Enter your college"
                onChange={(value) => update("college", value)}
              />

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

              <ProfileInput
                label="Department"
                value={form.department}
                placeholder="e.g. Computer Science"
                onChange={(value) => update("department", value)}
              />

              <TagInput
                label="Interests"
                tags={form.interests}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, interests: value }))
                }
                placeholder="Add an interest..."
                suggestions={[
                  "Coding",
                  "Gaming",
                  "Music",
                  "Movies",
                  "Fitness",
                  "Reading",
                ]}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  About You
                </label>

                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Tell us something about you..."
                  maxLength={200}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-950"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.bio.length}/200
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Setting up..." : "Continue to UniVibe →"}
            </button>
          </form>

          <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Your profile helps UniVibe find people like you.
          </p>
        </div>
        {/* <button
          onClick={handleSignOut}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign Out
        </button> */}
      </main>
    </div>
  );
}

export default ProfileSetupPage;
