import { useState } from "react";
import { useNavigate } from "react-router";

import AuthDivider from "./AuthDivider";
import AuthError from "./AuthError";
import GoogleButton from "./GoogleButton";
import AuthFooter from "./AuthFooter";
import EmailVerification from "./EmailVerification";
import useClerkSignUp from "../../hooks/useClerkSignUp";
import { useUserApi } from "../../api/userApi";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { syncUser } = useUserApi();

  const {
    signUpUser,
    verifyEmail,
    resendVerificationCode,
    isVerificationRequired,
    email: verificationEmail,
    loading,
  } = useClerkSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // --------------------------------
  // SIGN UP
  // --------------------------------

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const result = await signUpUser({
      email,
      password,
    });

    if (!result.success) {
      setError(result.error ?? "Signup failed.");
    }
  };

  // --------------------------------
  // VERIFY EMAIL
  // --------------------------------

  const handleVerify = async (code: string) => {
    setError(null);

    const result = await verifyEmail(code);

    if (!result.success) {
      setError("The verification code is invalid or has expired.");
      return;
    }

    try {
      await syncUser({ email });
      navigate("/profile/setup", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to sync user:", error);
      setError(
        "Your email was verified, but we couldn't create your account. Please try again.",
      );
    }

    // Clerk session is active now
  };

  // --------------------------------
  // RESEND VERIFICATION
  // --------------------------------

  const handleResend = async () => {
    const result = await resendVerificationCode();

    if (!result.success) {
      setError("Unable to resend verification code.");
    }

    return result;
  };

  // --------------------------------
  // GOOGLE
  // --------------------------------

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);

    // Connect Google OAuth here later
    console.log("Google signup clicked");
  };

  // --------------------------------
  // EMAIL VERIFICATION SCREEN
  // --------------------------------

  if (isVerificationRequired) {
    return (
      <EmailVerification
        email={verificationEmail}
        loading={loading}
        error={error}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    );
  }

  // --------------------------------
  // SIGN UP UI
  // --------------------------------

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
          JOIN YOUR CAMPUS
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
      sm:text-4xl
    "
        >
          Create your UniVibe account
        </h1>

        <p
          className="
      mt-2
      text-sm
      text-slate-500
      dark:text-slate-400
    "
        >
          Meet people. Find your vibe.
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
          dark:border-slate-800
          dark:bg-slate-950/70
          dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]
          sm:p-7
        "
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
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
              id="email"
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
                duration-200

                placeholder:text-slate-400

                hover:border-slate-300

                focus:border-violet-500
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-slate-700
                dark:bg-slate-900
                dark:text-white
                dark:placeholder:text-slate-500
                dark:hover:border-slate-600
                dark:focus:border-violet-500
                dark:focus:bg-slate-900
                dark:focus:ring-violet-500/10
              "
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Password
              </label>

              <span
                className="
                  text-xs
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Min. 8 characters
              </span>
            </div>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
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
                duration-200

                placeholder:text-slate-400

                hover:border-slate-300

                focus:border-violet-500
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-slate-700
                dark:bg-slate-900
                dark:text-white
                dark:placeholder:text-slate-500
                dark:hover:border-slate-600
                dark:focus:border-violet-500
                dark:focus:bg-slate-900
                dark:focus:ring-violet-500/10
              "
            />
          </div>

          {/* Error */}
          <AuthError message={error} />

          {/* Clerk CAPTCHA */}
          <div id="clerk-captcha" />

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
              hover:shadow-violet-500/25

              active:translate-y-0

              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
            "
          >
            <span className="relative z-10">
              {loading ? "Creating account..." : "Create My UniVibe Account"}
            </span>

            {/* Hover shine */}
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
        <GoogleButton onClick={handleGoogle} loading={googleLoading} />
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};

export default SignUpForm;
