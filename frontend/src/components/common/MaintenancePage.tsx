import { Clock3, Database, Wrench } from "lucide-react";

const MaintenancePage = () => {
  return (
    <main className="min-h-dvh bg-[#0B0812] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-[680px]">
          {/* Brand */}
          <div className="mb-7 flex flex-col items-center sm:mb-8">
            <div
              className="
            text-[25px]
            font-extrabold
            leading-none
            tracking-[-0.055em]
            text-violet-600
            sm:text-[27px]
          "
            >
              UniVibe
            </div>

            <div
              className="
            mt-1
            text-[7px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-white/30
            sm:text-[8px]
          "
            >
              Campus Community
            </div>
          </div>

          {/* Maintenance Card */}
          <section
            className="
          rounded-2xl
          border
          border-white/[0.08]
          bg-white/[0.035]
          shadow-[0_24px_80px_rgba(0,0,0,0.35)]
          sm:rounded-3xl
        "
          >
            <div className="px-5 py-7 sm:px-10 sm:py-10">
              {/* Status Icon */}
              <div className="mb-6 flex justify-center">
                <div
                  className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-violet-400/15
                bg-violet-500/[0.08]
                sm:h-16
                sm:w-16
              "
                >
                  <Wrench
                    size={27}
                    strokeWidth={1.8}
                    className="text-violet-400"
                  />
                </div>
              </div>

              {/* Label */}
              <p
                className="
              text-center
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-violet-400
              sm:text-xs
            "
              >
                Temporary Maintenance
              </p>

              {/* Heading */}
              <h1
                className="
              mx-auto
              mt-3
              max-w-lg
              text-center
              text-3xl
              font-bold
              leading-tight
              tracking-tight
              sm:text-4xl
            "
              >
                We'll be back shortly.
              </h1>

              {/* Description */}
              <p
                className="
              mx-auto
              mt-4
              max-w-lg
              text-center
              text-sm
              leading-6
              text-white/50
              sm:text-base
              sm:leading-7
            "
              >
                UniVibe is currently undergoing infrastructure maintenance.
                We're making a few improvements behind the scenes to keep the
                campus community running smoothly.
              </p>

              {/* Status */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div
                  className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                p-4
              "
                >
                  <div
                    className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/[0.08]
                "
                  >
                    <Database
                      size={19}
                      strokeWidth={1.8}
                      className="text-violet-400"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Infrastructure</p>

                    <p className="mt-1 text-xs text-white/35">
                      Update in progress
                    </p>
                  </div>
                </div>

                <div
                  className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                p-4
              "
                >
                  <div
                    className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/[0.08]
                "
                  >
                    <Clock3
                      size={19}
                      strokeWidth={1.8}
                      className="text-violet-400"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Service Status</p>

                    <p className="mt-1 text-xs text-white/35">
                      Temporarily unavailable
                    </p>
                  </div>
                </div>
              </div>

              {/* Data message */}
              <div
                className="
              mt-5
              rounded-xl
              border
              border-violet-400/[0.08]
              bg-violet-500/[0.035]
              px-4
              py-3.5
              text-center
            "
              >
                <p className="text-xs leading-5 text-white/40 sm:text-sm">
                  Your account and data remain safe while we're working on the
                  infrastructure.
                </p>
              </div>

              {/* Bottom */}
              <p className="mt-6 text-center text-xs text-white/25">
                Thank you for your patience{" "}
              </p>
            </div>
          </section>

          {/* Copyright */}
          <p className="mt-5 text-center text-[10px] text-white/20 sm:text-xs">
            © {new Date().getFullYear()} UniVibe
          </p>
        </div>
      </div>
    </main>
  );
};

export default MaintenancePage;
