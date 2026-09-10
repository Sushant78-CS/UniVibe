import { useClerk, useSignIn, useSignUp } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const SsoCallback = () => {
  const clerk = useClerk();

  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const navigate = useNavigate();

  const hasRun = useRef(false);

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current) {
        return;
      }

      hasRun.current = true;

      const finalize = async (resource: typeof signIn | typeof signUp) => {
        if (!resource) {
          navigate("/signup", {
            replace: true,
          });

          return;
        }

        await resource.finalize({
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(
                "SSO session has a current task:",
                session.currentTask,
              );

              return;
            }

            window.location.href = decorateUrl("/home");
          },
        });
      };

      try {
        // ==========================================
        // SIGN IN COMPLETE
        // ==========================================

        if (signIn?.status === "complete") {
          await finalize(signIn);
          return;
        }

        // ==========================================
        // SIGN UP COMPLETE
        // ==========================================

        if (signUp?.status === "complete") {
          await finalize(signUp);
          return;
        }

        // ==========================================
        // SIGN UP NEEDS MORE INFORMATION
        // ==========================================

        if (signUp?.status === "missing_requirements") {
          navigate("/profile/setup", {
            replace: true,
          });

          return;
        }

        // ==========================================
        // UNEXPECTED STATE
        // ==========================================

        console.error("SSO callback: unexpected state", {
          signInStatus: signIn?.status,
          signUpStatus: signUp?.status,
        });

        navigate("/signup", {
          replace: true,
        });
      } catch (error) {
        console.error("SSO callback failed:", error);

        navigate("/signup", {
          replace: true,
        });
      }
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
