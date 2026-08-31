import { useSignIn } from "@clerk/react";
import { useNavigate } from "react-router";

interface SignInResult {
  success: boolean;
  error?: string;
}

const getClerkError = (error: any): string => {
  return (
    error?.errors?.[0]?.longMessage ||
    error?.errors?.[0]?.message ||
    error?.message ||
    "Unable to sign in. Please try again."
  );
};

const useClerkSignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const navigate = useNavigate();

  const loading = fetchStatus === "fetching";

  // --------------------------------
  // EMAIL + PASSWORD
  // --------------------------------

  const signInUser = async (
    email: string,
    password: string,
  ): Promise<SignInResult> => {
    try {
      const result = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      // Clerk returned an error
      if (result.error) {
        console.error("Clerk sign-in error:", result.error);

        return {
          success: false,
          error: getClerkError(result.error),
        };
      }

      // --------------------------------
      // SIGN IN COMPLETE
      // --------------------------------

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/home");

            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              navigate("/home", {
                replace: true,
              });
            }
          },
        });

        return {
          success: true,
        };
      }

      // --------------------------------
      // UNEXPECTED STATUS
      // --------------------------------

      console.error("Sign-in requires another step:", signIn.status);

      return {
        success: false,
        error: `Sign-in requires another step: ${signIn.status}`,
      };
    } catch (error: unknown) {
      console.error("Sign-in error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
      };
    }
  };

  // --------------------------------
  // GOOGLE
  // --------------------------------

  const signInWithGoogle = async (): Promise<SignInResult> => {
    try {
      console.log("signInWithGoogle called");
      if (!signIn) {
        return {
          success: false,
          error: "Sign-in is not ready yet.",
        };
      }

      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/home",
      });

      if (error) {
        console.error("Google sign-in error:", error);

        return {
          success: false,
          error: getClerkError(error),
        };
      }

      return {
        success: true,
      };
    } catch (error: unknown) {
      console.error("Google sign-in error:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Google sign-in failed.",
      };
    }
  };

  // --------------------------------
  // RETURN
  // --------------------------------

  return {
    signInUser,
    signInWithGoogle,
    loading,
    errors,
  };
};

export default useClerkSignIn;
