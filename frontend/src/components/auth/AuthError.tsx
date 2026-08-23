interface AuthErrorProps {
  message?: string | null;
}

const AuthError = ({ message }: AuthErrorProps) => {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="
        mt-4
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-red-200
        bg-red-50
        px-4
        py-3
        shadow-sm
        dark:border-red-500/20
        dark:bg-red-500/10
        dark:shadow-none
      "
    >
      {/* Error icon */}
      <div
        className="
          mt-0.5
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-red-100
          text-xs
          font-bold
          text-red-600
          dark:bg-red-500/20
          dark:text-red-400
        "
      >
        !
      </div>

      {/* Error message */}
      <p
        className="
          text-sm
          leading-5
          text-red-700
          dark:text-red-400
        "
      >
        {message}
      </p>
    </div>
  );
};

export default AuthError;
