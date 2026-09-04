import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import AuthError from "./AuthError";
import useClerkSignIn from "../../hooks/useClerkSignIn";

const SignInForm = () => {
  const navigate = useNavigate();
  const { signInUser, loading } = useClerkSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = loading || loadingState;

  // --------------------------------
  // EMAIL SIGN IN
  // --------------------------------
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setLoadingState(true);

    const result = await signInUser(email, password);

    if (!result.success) {
      setError(result.error ?? "Unable to sign in.");
      setLoadingState(false);
      return;
    }

    navigate("/home", {
      replace: true,
    });

    setLoadingState(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="
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
      leading-6
      text-slate-500
      dark:text-neutral-400
    "
        >
          Connect with your campus community.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="
          rounded-[24px]
          border
          border-slate-200
          bg-white
          p-6
          shadow-[0_16px_45px_-20px_rgba(15,23,42,0.18)]
          transition-colors
          dark:border-neutral-800
          dark:bg-[#171717]
          dark:shadow-[0_16px_45px_-20px_rgba(0,0,0,0.5)]
          sm:p-7
        "
      >
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
                dark:text-neutral-200
              "
            >
              Email address
            </label>

            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              required
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

                dark:border-neutral-700
                dark:bg-[#0f0f0f]
                dark:text-white
                dark:placeholder:text-neutral-500
                dark:hover:border-neutral-600
                dark:focus:border-violet-500
                dark:focus:bg-[#0f0f0f]
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
                  dark:text-neutral-200
                "
              >
                Password
              </label>

              <span
                className="
                  text-[11px]
                  font-medium
                  text-slate-400
                  dark:text-neutral-500
                "
              >
                Secure sign in
              </span>
            </div>

            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isSubmitting}
                required
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3.5
                  pr-12
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

                  dark:border-neutral-700
                  dark:bg-[#0f0f0f]
                  dark:text-white
                  dark:placeholder:text-neutral-500
                  dark:hover:border-neutral-600
                  dark:focus:border-violet-500
                  dark:focus:bg-[#0f0f0f]
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-lg
                  p-1.5
                  text-slate-400
                  transition-colors
                  hover:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:text-neutral-500
                  dark:hover:text-neutral-300
                "
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} />
                ) : (
                  <Eye size={18} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          <AuthError message={error} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full
              rounded-2xl
              bg-violet-600
              px-4
              py-3.5
              text-sm
              font-bold
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
            {isSubmitting ? "Signing you in..." : "Sign In"}
          </button>

          {/* Security note */}
          <p
            className="
              text-center
              text-[11px]
              leading-5
              text-slate-400
              dark:text-neutral-500
            "
          >
            Your account is securely authenticated with Clerk.
          </p>
        </form>
      </div>

      {/* Signup */}
      <p
        className="
          mt-6
          text-center
          text-sm
          text-slate-500
          dark:text-neutral-400
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
