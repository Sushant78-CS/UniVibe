import { useState } from "react";
import { Link, useNavigate } from "react-router";

import AuthDivider from "./AuthDivider";
import AuthError from "./AuthError";
import GoogleButton from "./GoogleButton";

import useClerkSignIn from "../../hooks/useClerkSignIn";

const SignInForm = () => {
  const navigate = useNavigate();

  const { signInUser, signInWithGoogle, loading } = useClerkSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  // --------------------------------
  // EMAIL SIGN IN
  // --------------------------------

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const result = await signInUser(email, password);

    if (!result.success) {
      setError(result.error ?? "Unable to sign in.");

      return;
    }

    // Clerk session is now active.
    navigate("/home", {
      replace: true,
    });
  };

  // --------------------------------
  // GOOGLE
  // --------------------------------

  const handleGoogle = async () => {
    setError(null);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error ?? "Google sign in failed.");
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-6">
        <p
          className="
      text-xs
      font-bold
      tracking-[0.16em]
      text-violet-600
      dark:text-violet-400
    "
        >
          CAMPUS CONNECTION
        </p>

        <h1
          className="
      mt-2
      text-3xl
      font-bold
      leading-tight
      tracking-tight
      text-slate-950
      dark:text-white
    "
        >
          Sign in to UniVibe
        </h1>

        <p
          className="
      mt-2
      text-sm
      text-slate-500
      dark:text-slate-400
    "
        >
          Connect, Discover, Belong
        </p>
      </div>

      {/* Form Card */}
      <div
        className="
          rounded-[26px]
          border
          border-slate-200
          bg-white
          p-6
          shadow-[0_20px_60px_-20px_rgba(15,23,42,0.15)]
          transition-all

          dark:border-slate-800
          dark:bg-slate-900/70
          dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]

          sm:p-7
        "
      >
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="signin-email"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              "
            >
              Email
            </label>

            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3.5
                text-sm
                text-slate-900
                outline-none
                transition-all

                placeholder:text-slate-400

                hover:border-slate-300

                focus:border-violet-500
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white
                dark:placeholder:text-slate-500

                dark:hover:border-slate-600
                dark:focus:border-violet-500
                dark:focus:bg-slate-800
              "
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="signin-password"
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Password
              </label>

              <button
                type="button"
                className="
                  text-xs
                  font-semibold
                  text-violet-600
                  transition-colors
                  hover:text-violet-700
                  hover:underline

                  dark:text-violet-400
                  dark:hover:text-violet-300
                "
              >
                Forgot password?
              </button>
            </div>

            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3.5
                text-sm
                text-slate-900
                outline-none
                transition-all

                placeholder:text-slate-400

                hover:border-slate-300

                focus:border-violet-500
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white
                dark:placeholder:text-slate-500

                dark:hover:border-slate-600
                dark:focus:border-violet-500
                dark:focus:bg-slate-800
              "
            />
          </div>

          {/* Error */}
          <AuthError message={error} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              group
              relative
              w-full
              overflow-hidden
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              via-purple-600
              to-fuchsia-600
              px-4
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-violet-500/20
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:shadow-xl

              active:translate-y-0

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <span className="relative z-10">
              {loading ? "Signing you in..." : "Sign In"}
            </span>

            <span
              className="
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                transition-transform
                duration-700
                group-hover:translate-x-full
              "
            />
          </button>
        </form>

        {/* Divider */}
        <AuthDivider />

        {/* Google */}
        <GoogleButton onClick={handleGoogle} loading={loading} />
      </div>

      {/* Signup */}
      <p
        className="
          mt-6
          text-center
          text-sm
          text-slate-500
          dark:text-slate-400
        "
      >
        New to UniVibe?{" "}
        <Link
          to="/signup"
          className="
            font-semibold
            text-violet-600
            transition-colors
            hover:text-violet-700
            hover:underline

            dark:text-violet-400
            dark:hover:text-violet-300
          "
        >
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default SignInForm;
