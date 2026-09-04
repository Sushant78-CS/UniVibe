import ThemeToggle from "../common/ThemeToggle";

const AuthHeader = () => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        px-5
        py-5
      "
    >
      <div>
        <div
          className="
            text-[22px]
            font-extrabold
            leading-none
            tracking-[-0.04em]
            text-slate-900
            dark:text-white
          "
        >
          UniVibe
        </div>

        <div
          className="
            mt-1
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-slate-400
            dark:text-neutral-500
          "
        >
          Campus Community
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
};

export default AuthHeader;
