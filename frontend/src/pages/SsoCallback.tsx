import { useClerk, useSignIn, useSignUp } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router"; // adjust to your router

const SsoCallback = () => {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      const finalize = async (resource: typeof signIn | typeof signUp) => {
        await resource.finalize({
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              // handle session tasks if you use them
              return;
            }
            window.location.href = decorateUrl("/profile/setup");
          },
        });
      };

      if (signIn.status === "complete") {
        await finalize(signIn);
        return;
      }

      if (signUp.status === "complete") {
        await finalize(signUp);
        return;
      }

      if (signUp.status === "missing_requirements") {
        navigate("/profile/setup"); // your "continue sign-up" route
        return;
      }

      console.error("SSO callback: unexpected state", { signIn, signUp });
      navigate("/signup");
    })();
  }, [clerk, signIn, signUp, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Signing you in...
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Please wait a moment.
        </p>
        <div id="clerk-captcha" />
      </div>
    </div>
  );
};

export default SsoCallback;
