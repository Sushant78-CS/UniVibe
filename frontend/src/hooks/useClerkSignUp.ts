import { useSignUp } from "@clerk/react";
import { useState } from "react";

interface SignUpData {
  email: string;
  password: string;
}

const useClerkSignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();

  const [isVerificationRequired, setIsVerificationRequired] = useState(false);

  const [email, setEmail] = useState("");

  const loading = fetchStatus === "fetching";

  const signUpUser = async ({ email, password }: SignUpData) => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
    });

    if (error) {
      console.error("Clerk signup error:", error);

      return {
        success: false,
        error: error.message,
      };
    }

    const verificationResult = await signUp.verifications.sendEmailCode();

    if (verificationResult.error) {
      console.error("Verification error:", verificationResult.error);

      return {
        success: false,
        error: verificationResult.error.message,
      };
    }

    setEmail(email);
    setIsVerificationRequired(true);

    return {
      success: true,
    };
  };

  const verifyEmail = async (code: string) => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (error) {
      console.error("Email verification error:", error);

      return {
        success: false,
        error: error.message,
      };
    }

    if (signUp.status !== "complete") {
      return {
        success: false,
        error: "Email verified, but signup is not complete yet.",
      };
    }

    const { error: finalizeError } = await signUp.finalize();

    if (finalizeError) {
      console.error("Signup finalization error:", finalizeError);

      return {
        success: false,
        error: finalizeError.message,
      };
    }

    return {
      success: true,
    };
  };

  const resendVerificationCode = async () => {
    const { error } = await signUp.verifications.sendEmailCode();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  };

  return {
    signUpUser,
    verifyEmail,
    resendVerificationCode,

    isVerificationRequired,
    setIsVerificationRequired,

    email,
    loading,

    errors,
  };
};

export default useClerkSignUp;
