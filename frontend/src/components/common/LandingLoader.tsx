const LandingLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center">
        {/* ================= UNIVIBE LOGO ================= */}

        <div className="relative flex items-center justify-center">
          {/* Glow */}

          <div
            className="
              absolute
              h-20
              w-40
              rounded-full
              bg-violet-600/20
              blur-3xl
            "
          />

          {/* Wordmark */}

          <h1
            className="
              relative
              bg-gradient-to-r
              from-violet-400
              via-purple-400
              to-fuchsia-400
              bg-clip-text
              text-5xl
              font-extrabold
              tracking-[-0.06em]
              text-transparent
            "
          >
            UniVibe
          </h1>
        </div>

        {/* Tagline */}

        <p
          className="
            mt-3
            text-[11px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-slate-500
          "
        >
          Campus Community
        </p>

        {/* Loading indicator */}

        <div className="mt-8 flex items-center gap-1.5">
          <span
            className="
              h-1.5
              w-1.5
              animate-bounce
              rounded-full
              bg-violet-400
              [animation-delay:-0.3s]
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              animate-bounce
              rounded-full
              bg-violet-400
              [animation-delay:-0.15s]
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              animate-bounce
              rounded-full
              bg-violet-400
            "
          />
        </div>

        {/* Loading text */}

        <p
          className="
            mt-3
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-slate-600
          "
        >
          Loading
        </p>
      </div>
    </div>
  );
};

export default LandingLoader;
