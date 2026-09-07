interface VibeJoinBannerProps {
  joining: boolean;
  onJoin: () => void;
}

const VibeJoinBanner = ({ joining, onJoin }: VibeJoinBannerProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
      <div
        className="
          relative
          w-full
          max-w-5xl
          overflow-hidden
          rounded-2xl
          border
          border-stone-200
          bg-[#faf9f6]
          shadow-[0_8px_30px_rgba(0,0,0,0.08)]
          dark:border-neutral-800
          dark:bg-neutral-900
          dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]
        "
      >
        {/* PAPER TEXTURE */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            opacity-[0.3]
            dark:opacity-[0.12]
            bg-[radial-gradient(rgba(120,113,108,0.12)_0.7px,transparent_0.7px)]
            [background-size:8px_8px]
          "
        />

        {/* DECORATIVE PAPER SHAPES */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-72
            w-72
            rotate-12
            rounded-[35%]
            bg-violet-100/70
            dark:bg-violet-950/30
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-20
            h-72
            w-72
            -rotate-12
            rounded-[40%]
            bg-stone-100
            dark:bg-neutral-800/50
          "
        />

        {/* CONTENT */}
        <div
          className="
            relative
            flex
            min-h-[320px]
            flex-col
            justify-between
            gap-10
            px-6
            py-10
            sm:min-h-[380px]
            sm:px-10
            sm:py-12
            lg:min-h-[430px]
            lg:flex-row
            lg:items-center
            lg:px-16
            lg:py-14
          "
        >
          {/* LEFT CONTENT */}
          <div className="max-w-xl">
            {/* LABEL */}
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-violet-500
                dark:text-violet-400
              "
            >
              UNIVIBE
            </p>

            {/* TITLE */}
            <h1
              className="
                mt-5
                text-5xl
                font-black
                uppercase
                leading-[0.9]
                tracking-[-0.04em]
                text-neutral-900
                sm:text-6xl
                lg:text-7xl
                dark:text-white
              "
            >
              Enter
              <br />
              The Vibe
            </h1>

            {/* LINE */}
            <div
              className="
                mt-6
                h-1
                w-20
                rounded-full
                bg-violet-500
              "
            />

            {/* DESCRIPTION */}
            <p
              className="
                mt-6
                max-w-md
                text-sm
                leading-6
                text-neutral-500
                sm:text-base
                dark:text-neutral-400
              "
            >
              Meet random people. Say what's on your mind. Keep the conversation
              anonymous.
            </p>

            {/* INFO */}
            <p
              className="
                mt-5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-neutral-400
                dark:text-neutral-500
              "
            >
              RANDOM · ANONYMOUS · 24 HOURS
            </p>
          </div>

          {/* RIGHT POSTER AREA */}
          <div
            className="
              relative
              flex
              min-h-[170px]
              w-full
              max-w-[260px]
              shrink-0
              items-center
              justify-center
              self-center
              lg:min-h-[230px]
              lg:max-w-[290px]
              lg:self-auto
            "
          >
            {/* POSTER SHEET */}
            <div
              className="
                relative
                flex
                h-[170px]
                w-[210px]
                rotate-[-4deg]
                flex-col
                items-center
                justify-center
                border
                border-stone-200
                bg-white
                px-5
                text-center
                shadow-[4px_8px_18px_rgba(0,0,0,0.10)]
                transition-transform
                duration-300
                hover:rotate-[-1deg]
                sm:h-[190px]
                sm:w-[235px]
                lg:h-[220px]
                lg:w-[270px]
                dark:border-neutral-700
                dark:bg-neutral-800
              "
            >
              {/* SMALL TOP TEXT */}
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-violet-500
                  dark:text-violet-400
                "
              >
                THIS IS YOUR SPACE
              </p>

              {/* BIG VIBE TEXT */}
              <p
                className="
                  mt-3
                  text-4xl
                  font-black
                  uppercase
                  tracking-[-0.05em]
                  text-neutral-900
                  sm:text-5xl
                  dark:text-white
                "
              >
                VIBE
              </p>

              {/* SMALL LINE */}
              <div
                className="
                  mt-3
                  h-px
                  w-10
                  bg-neutral-300
                  dark:bg-neutral-600
                "
              />

              <p
                className="
                  mt-3
                  text-[9px]
                  leading-4
                  text-neutral-400
                  dark:text-neutral-500
                "
              >
                Random conversations.
                <br />
                No names. No pressure.
              </p>

              {/* TAPE EFFECT */}
              <div
                className="
                  absolute
                  -top-3
                  left-1/2
                  h-7
                  w-16
                  -translate-x-1/2
                  rotate-2
                  bg-violet-100/80
                  dark:bg-violet-900/40
                "
              />
            </div>
          </div>
        </div>

        {/* JOIN BUTTON */}
        <div
          className="
            absolute
            bottom-5
            left-6
            sm:left-10
            lg:bottom-8
            lg:left-16
          "
        >
          <button
            type="button"
            onClick={onJoin}
            disabled={joining}
            className="
              rounded-xl
              border
              border-violet-600
              bg-violet-600
              px-7
              py-3
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-violet-700
              hover:shadow-md
              active:scale-[0.97]
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-violet-500
              dark:bg-violet-600
              dark:hover:bg-violet-500
            "
          >
            {joining ? "Joining..." : "Join Vibe →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VibeJoinBanner;
