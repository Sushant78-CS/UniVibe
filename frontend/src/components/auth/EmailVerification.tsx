import { useState } from "react";
import AuthError from "./AuthError";

interface ResendResult {
  success: boolean;
  error?: string;
}

interface EmailVerificationProps {
  email: string;
  loading?: boolean;
  error?: string | null;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<ResendResult>;
}

const EmailVerification = ({
  email,
  loading = false,
  error,
  onVerify,
  onResend,
}: EmailVerificationProps) => {
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.length !== 6) {
      return;
    }

    await onVerify(code);
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage("");

    try {
      const result = await onResend();

      if (result.success) {
        setResendMessage("A new verification code has been sent.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div
          className="
            mx-auto
            mb-5
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-violet-100
            text-3xl
            shadow-sm
            ring-1
            ring-violet-200
            dark:bg-violet-500/10
            dark:ring-violet-500/20
          "
        >
          ✉️
        </div>

        {/* Heading */}
        <h1
          className="
            text-3xl
            font-bold
            tracking-tight
            text-slate-950
            dark:text-white
          "
        >
          Verify your email
        </h1>

        <p
          className="
            mx-auto
            mt-2
            max-w-xs
            text-sm
            leading-6
            text-slate-500
            dark:text-slate-400
          "
        >
          Enter the 6-digit code we sent to
        </p>

        {/* Email */}
        <p
          className="
            mt-1
            break-all
            text-sm
            font-semibold
            text-violet-600
            dark:text-violet-400
          "
        >
          {email}
        </p>

        {/* Verification Card */}
        <div
          className="
            mt-7
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            text-left
            shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]
            dark:border-slate-800
            dark:bg-slate-900/80
            dark:shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]
          "
        >
          <form onSubmit={handleSubmit}>
            {/* Label */}
            <label
              htmlFor="verification-code"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              "
            >
              Verification code
            </label>

            {/* Code Input */}
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, ""));
              }}
              placeholder="000000"
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-4
                text-center
                text-2xl
                font-bold
                tracking-[0.45em]
                text-slate-900
                outline-none
                transition-all

                placeholder:text-slate-300
                placeholder:tracking-[0.3em]

                focus:border-violet-500
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10

                dark:border-slate-700
                dark:bg-slate-950
                dark:text-white
                dark:placeholder:text-slate-700
                dark:focus:bg-slate-950
              "
            />

            {/* Error */}
            <AuthError message={error} />

            {/* Success */}
            {resendMessage && (
              <p
                className="
                  mt-3
                  text-center
                  text-sm
                  font-medium
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                {resendMessage}
              </p>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-violet-600
                to-fuchsia-600
                px-4
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-violet-500/20
                transition-all

                hover:-translate-y-0.5
                hover:shadow-xl

                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:translate-y-0
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>
        </div>

        {/* Resend */}
        <div className="mt-6">
          <p
            className="
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="
              mt-1.5
              text-sm
              font-semibold
              text-violet-600
              transition-colors
              hover:text-violet-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:text-violet-400
              dark:hover:text-violet-300
            "
          >
            {resending ? "Sending..." : "Send a new code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
