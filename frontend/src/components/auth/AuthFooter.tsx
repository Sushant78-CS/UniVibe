import { Link } from "react-router";

const AuthFooter = () => {
  return (
    <p
      className="
        mt-6
        text-center
        text-sm
        text-slate-500
        dark:text-slate-400
      "
    >
      Already part of UniVibe?{" "}
      <Link
        to="/"
        className="
          font-semibold
          text-violet-600
          transition-colors
          hover:text-violet-700

          dark:text-violet-400
          dark:hover:text-violet-300
        "
      >
        Sign In
      </Link>
    </p>
  );
};

export default AuthFooter;
