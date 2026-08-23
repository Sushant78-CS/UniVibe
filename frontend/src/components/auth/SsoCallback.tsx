import { AuthenticateWithRedirectCallback } from "@clerk/react";

const SsoCallback = () => {
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
      </div>

      <AuthenticateWithRedirectCallback />
    </div>
  );
};

export default SsoCallback;
