const LandingLoader = () => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
        transition-colors
        duration-200
        dark:bg-black
      "
    >
      <div className="flex flex-col items-center space-y-8">
        {/* ===== UniVibe Logo ===== */}
        <div className="relative flex items-center justify-center">
          {/* Soft glow behind logo */}
          <div
            className="
              absolute
              -inset-6
              rounded-full
              bg-violet-500/20
              blur-2xl
              dark:bg-violet-400/20
            "
          />
          <h1
            className="
              relative
              text-6xl
              font-black
              tracking-tight
              text-neutral-900
              animate-[fadeScale_0.6s_ease-out]
              dark:text-white
              sm:text-7xl
            "
          >
            <span
              className="
                bg-gradient-to-r
                from-violet-600
                to-purple-500
                bg-clip-text
                text-transparent
                dark:from-violet-400
                dark:to-purple-300
              "
            >
              UniVibe
            </span>
          </h1>
        </div>

        {/* ===== Loading Dots (Google‑inspired) ===== */}
        <div className="flex items-center gap-2">
          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-violet-600
              animate-[bounce_1.4s_ease-in-out_infinite]
              dark:bg-violet-400
            "
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-violet-600
              animate-[bounce_1.4s_ease-in-out_infinite]
              dark:bg-violet-400
            "
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-violet-600
              animate-[bounce_1.4s_ease-in-out_infinite]
              dark:bg-violet-400
            "
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>

      {/* ===== Custom Keyframes ===== */}
      <style>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingLoader;
