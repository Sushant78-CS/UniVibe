import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router";

import AuthError from "./AuthError";
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

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * ==========================================
   * SIGN UP
   * ==========================================
   */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
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
      email: normalizedEmail,
      password,
    });

    if (!result.success) {
      setError(result.error ?? "Signup failed.");
    }
  };

  /*
   * ==========================================
   * VERIFY EMAIL
   * ==========================================
   */

  const handleVerify = async (code: string) => {
    setError(null);

    const result = await verifyEmail(code);

    if (!result.success) {
      setError("The verification code is invalid or has expired.");
      return;
    }

    try {
      await syncUser({
        email,
      });

      navigate("/profile/setup", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to sync user:", error);

      setError(
        "Your email was verified, but we couldn't create your account. Please try again.",
      );
    }
  };

  /*
   * ==========================================
   * RESEND
   * ==========================================
   */

  const handleResend = async () => {
    const result = await resendVerificationCode();

    if (!result.success) {
      setError("Unable to resend verification code.");
    }

    return result;
  };

  /*
   * ==========================================
   * EMAIL VERIFICATION
   * ==========================================
   */

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

  /*
   * ==========================================
   * SIGN UP UI
   * ==========================================
   */

  return (
    <div className="w-full max-w-md">
      {/* ======================================
          INTRO
          ====================================== */}

      <div className="mb-7">
        <div
          className="
            mb-3
            inline-flex
            items-center
            rounded-full
            border
            border-violet-200
            bg-violet-50
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-violet-600
            dark:border-violet-900
            dark:bg-violet-950/50
            dark:text-violet-300
          "
        >
          Join UniVibe
        </div>

        <h1
          className="
            text-3xl
            font-bold
            leading-tight
            tracking-[-0.03em]
            text-slate-950
            dark:text-white
            sm:text-4xl
          "
        >
          Create your account
        </h1>

        <p
          className="
            mt-2
            max-w-sm
            text-sm
            leading-6
            text-slate-500
            dark:text-neutral-400
          "
        >
          Join your campus community and start connecting with people, clubs,
          and events.
        </p>
      </div>

      {/* ======================================
          FORM CARD
          ====================================== */}

      <div
        className="
          rounded-[26px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-[0_12px_40px_-20px_rgba(15,23,42,0.22)]
          dark:border-neutral-800
          dark:bg-[#171717]
          dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)]
          sm:p-7
        "
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ==================================
              EMAIL
              ================================== */}

          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-xs
                font-semibold
                text-slate-700
                dark:text-neutral-200
              "
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                  dark:text-neutral-500
                "
              />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-11
                  pr-4
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-violet-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-violet-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  dark:border-neutral-800
                  dark:bg-[#0f0f0f]
                  dark:text-white
                  dark:placeholder:text-neutral-600
                  dark:hover:border-neutral-700
                  dark:focus:border-violet-500
                  dark:focus:bg-[#0f0f0f]
                  dark:focus:ring-violet-500/10
                "
              />
            </div>
          </div>

          {/* ==================================
              PASSWORD
              ================================== */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="
                  text-xs
                  font-semibold
                  text-slate-700
                  dark:text-neutral-200
                "
              >
                Password
              </label>

              <span
                className="
                  text-[10px]
                  font-medium
                  text-slate-400
                  dark:text-neutral-500
                "
              >
                At least 8 characters
              </span>
            </div>

            <div className="relative">
              <LockKeyhole
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                  dark:text-neutral-500
                "
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={loading}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-11
                  pr-12
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-violet-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-violet-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  dark:border-neutral-800
                  dark:bg-[#0f0f0f]
                  dark:text-white
                  dark:placeholder:text-neutral-600
                  dark:hover:border-neutral-700
                  dark:focus:border-violet-500
                  dark:focus:bg-[#0f0f0f]
                  dark:focus:ring-violet-500/10
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={loading}
                className="
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-8
                  w-8
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-200
                  hover:text-slate-700
                  dark:text-neutral-500
                  dark:hover:bg-neutral-800
                  dark:hover:text-neutral-200
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* ==================================
              PASSWORD STRENGTH
              ================================== */}

          {password.length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((segment) => {
                  const strength =
                    password.length >= 12
                      ? 4
                      : password.length >= 10
                        ? 3
                        : password.length >= 8
                          ? 2
                          : 1;

                  return (
                    <div
                      key={segment}
                      className={`
                          h-1
                          flex-1
                          rounded-full
                          transition-colors
                          ${
                            segment <= strength
                              ? "bg-violet-500"
                              : "bg-slate-200 dark:bg-neutral-800"
                          }
                        `}
                    />
                  );
                })}
              </div>

              <p
                className="
                  text-[10px]
                  text-slate-400
                  dark:text-neutral-500
                "
              >
                {password.length < 8
                  ? "Password is too short"
                  : password.length < 10
                    ? "Good start — make it longer for better security"
                    : password.length < 12
                      ? "Good password"
                      : "Strong password"}
              </p>
            </div>
          )}

          {/* ==================================
              ERROR
              ================================== */}

          <AuthError message={error} />

          {/* ==================================
              CLERK CAPTCHA
              ================================== */}
          <div
            id="clerk-captcha"
            className="min-h-0"
            data-cl-theme="auto"
            data-cl-size="flexible"
          />

          {/* ==================================
              SUBMIT
              ================================== */}

          <button
            type="submit"
            disabled={loading}
            className="
              group
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-violet-600
              px-4
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-violet-600/15
              transition-all
              hover:bg-violet-700
              hover:shadow-lg
              hover:shadow-violet-600/20
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:bg-violet-500
              dark:hover:bg-violet-600
            "
          >
            <span>{loading ? "Creating account..." : "Create account"}</span>

            {!loading && (
              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            )}
          </button>

          {/* ==================================
              TRUST TEXT
              ================================== */}

          <p
            className="
              text-center
              text-[10px]
              leading-5
              text-slate-400
              dark:text-neutral-500
            "
          >
            {/* Your account is secured by Clerk. */}
            <br />
            You'll verify your email before setting up your profile.
          </p>
        </form>
      </div>

      {/* ======================================
          FOOTER
          ====================================== */}

      <div className="mt-5">
        <AuthFooter />
      </div>
    </div>
  );
};

export default SignUpForm;
