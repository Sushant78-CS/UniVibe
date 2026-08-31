import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, ImagePlus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useProfileApi, type UpdateProfileData } from "../../api/profileApi";
import ConfirmModal from "../../components/common/ConfirmModal";

const EditProfile = () => {
  const navigate = useNavigate();

  const { getProfile, updateProfile, deleteProfileImage } = useProfileApi();

  const [form, setForm] = useState<UpdateProfileData>({
    fullName: "",
    username: "",
    bio: "",
    college: "",
    department: "",
    year: "",
    interests: "",
    // profileImage: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();

        setForm({
          fullName: profile.fullName ?? "",
          username: profile.username ?? "",
          bio: profile.bio ?? "",
          college: profile.college ?? "",
          department: profile.department ?? "",
          year: profile.year ?? "",
          interests: profile.interests ?? "",
          profileImage: profile.profileImage ?? "",
        });

        if (profile.profileImage) {
          setPreviewImage(profile.profileImage);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Optional size limit: 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  const handleRemoveImage = async () => {
    try {
      setSaving(true);

      await deleteProfileImage();

      // Remove image from UI
      setSelectedImage(null);
      setPreviewImage("");

      setForm((prev) => ({
        ...prev,
        profileImage: "",
      }));

      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }

      setShowConfirmModal(false);
    } catch (error) {
      console.error("Failed to remove profile image:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      console.log("selectedImage", selectedImage);

      await updateProfile(form, selectedImage);

      navigate("/profile");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-600
              transition
              hover:bg-slate-100
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
              PROFILE
            </p>

            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="
            space-y-5
            rounded-3xl
            border border-slate-200
            bg-white
            p-5
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* Profile Image */}
          <div>
            <label className="mb-3 block text-sm font-semibold">
              Profile Picture
            </label>

            {/* Preview */}
            <div className="mb-5 flex justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="
          h-32 w-32
          rounded-full
          border-4
          border-white
          object-cover
          shadow-lg
          dark:border-slate-800
        "
                />
              ) : (
                <div
                  className="
          flex h-32 w-32
          items-center justify-center
          rounded-full
          bg-violet-100
          text-4xl font-bold
          text-violet-600
          dark:bg-violet-500/10
          dark:text-violet-400
        "
                >
                  {form.fullName ? form.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>

            {/* Hidden gallery input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Hidden camera input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
        flex items-center justify-center gap-2
        rounded-xl
        border border-slate-200
        bg-slate-50
        px-4 py-3
        text-sm font-semibold
        text-slate-700
        transition
        hover:bg-slate-100
        dark:border-slate-700
        dark:bg-slate-950
        dark:text-slate-200
        dark:hover:bg-slate-800
      "
              >
                <ImagePlus size={18} />
                Select Image
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="
        flex items-center justify-center gap-2
        rounded-xl
        bg-violet-600
        px-4 py-3
        text-sm font-semibold
        text-white
        transition
        hover:bg-violet-700
      "
              >
                <Camera size={18} />
                Take Photo
              </button>
            </div>

            {/* Remove */}
            {previewImage && (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="
      mx-auto mt-3
      flex items-center gap-2
      text-xs font-semibold
      text-red-500
      transition
      hover:text-red-600
    "
              >
                <Trash2 size={14} />
                Remove Photo
              </button>
            )}

            <p className="mt-3 text-center text-xs text-slate-400">
              JPG, PNG or WEBP • Maximum 5 MB
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />
          </div>

          {/* Username */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Username</label>

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Bio</label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className="
                w-full resize-none rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />
          </div>

          {/* College */}
          <div>
            <label className="mb-2 block text-sm font-semibold">College</label>

            <input
              name="college"
              value={form.college}
              onChange={handleChange}
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Department
            </label>

            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />
          </div>

          {/* Year */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Year</label>

            <input
              name="year"
              value={form.year}
              onChange={handleChange}
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />
          </div>

          {/* Interests */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Interests
            </label>

            <input
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="Coding, Music, Gaming"
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-4 py-3
                text-sm outline-none
                focus:border-violet-500
                dark:border-slate-700
                dark:bg-slate-950
              "
            />

            <p className="mt-1 text-xs text-slate-400">
              Separate interests with commas.
            </p>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="
              flex w-full items-center
              justify-center gap-2
              rounded-xl
              bg-violet-600
              px-4 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-violet-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Save size={17} />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <ConfirmModal
          open={showConfirmModal}
          loading={saving}
          loadingText="Removing..."
          title="Remove profile picture?"
          message="Are you sure you want to remove your profile picture? This change will be applied when you save your profile."
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={handleRemoveImage}
          onCancel={() => setShowConfirmModal(false)}
        />
      </main>
    </div>
  );
};

export default EditProfile;
