import ThemeToggle from "../common/ThemeToggle";

function ProfileHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1
            className="
            text-xl
            font-bold
            text-slate-900
            dark:text-white
          "
          >
            Create Your Vibe
          </h1>

          <p
            className="
            mt-0.5
            text-xs
            text-slate-500
            dark:text-slate-400
          "
          >
            Let's get to know you
          </p>
        </div>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}

export default ProfileHeader;
