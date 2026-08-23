const AuthDivider = () => {
  return (
    <div className="my-6 flex items-center gap-4">
      <div
        className="
          h-px
          flex-1
          bg-slate-200
          dark:bg-slate-800
        "
      />

      <span
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-wider
          text-slate-400
          dark:text-slate-500
        "
      >
        OR
      </span>

      <div
        className="
          h-px
          flex-1
          bg-slate-200
          dark:bg-slate-800
        "
      />
    </div>
  );
};

export default AuthDivider;
