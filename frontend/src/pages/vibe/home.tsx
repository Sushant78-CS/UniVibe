import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MessageCircle,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router";
import FloatingTabs from "../../components/home/FloatingTabs";

const VibeHome = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        dark:bg-black
        dark:text-white
      "
    >
      <main
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[680px]
          px-4
          pb-24
          pt-5
          sm:px-5
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-5">
          <h1
            className="
              text-xl
              font-bold
              tracking-tight
              text-violet-600
              dark:text-violet-400
            "
          >
            UniVibe
          </h1>

          <p
            className="
              mt-0.5
              text-xs
              text-slate-500
              dark:text-neutral-500
            "
          >
            Connect, discover & participate.
          </p>
        </header>

        {/* =====================================================
            MAIN OPTIONS
        ===================================================== */}

        <section className="space-y-3">
          {/* ===================================================
              RANDOM GROUP
          =================================================== */}

          <button
            type="button"
            onClick={() => navigate("/vibe/random")}
            className="
              group
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              text-left
              shadow-sm
              outline-none
              transition-all
              duration-150
              hover:border-violet-300
              hover:shadow-md
              active:scale-[0.985]
              dark:border-neutral-800
              dark:bg-[#0d0d0d]
              dark:hover:border-violet-800
            "
          >
            <div className="flex items-center gap-3">
              {/* Icon */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-950/50
                  dark:text-violet-400
                "
              >
                <Users size={21} strokeWidth={2} />
              </div>

              {/* Content */}

              <div className="min-w-0 flex-1">
                <h2
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Random Group
                </h2>

                <p
                  className="
                    mt-1
                    line-clamp-2
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-neutral-500
                  "
                >
                  Meet students randomly and start an anonymous conversation.
                </p>
              </div>

              {/* Arrow */}

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition-transform
                  duration-150
                  group-hover:translate-x-0.5
                  dark:text-neutral-600
                "
              >
                <ArrowRight size={17} />
              </div>
            </div>

            {/* Bottom action */}

            <div
              className="
                mt-3
                flex
                items-center
                gap-1.5
                border-t
                border-slate-100
                pt-3
                text-[10px]
                font-medium
                text-violet-600
                dark:border-neutral-800
                dark:text-violet-400
              "
            >
              <MessageCircle size={13} />

              <span>Start a random conversation</span>

              <ChevronRight size={12} />
            </div>
          </button>

          {/* ===================================================
              EVENTS
          =================================================== */}

          <button
            type="button"
            onClick={() => navigate("/vibe/events")}
            className="
              group
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              text-left
              shadow-sm
              outline-none
              transition-all
              duration-150
              hover:border-violet-300
              hover:shadow-md
              active:scale-[0.985]
              dark:border-neutral-800
              dark:bg-[#0d0d0d]
              dark:hover:border-violet-800
            "
          >
            <div className="flex items-center gap-3">
              {/* Icon */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-100
                  text-violet-600
                  dark:bg-violet-950/50
                  dark:text-violet-400
                "
              >
                <CalendarDays size={21} strokeWidth={2} />
              </div>

              {/* Content */}

              <div className="min-w-0 flex-1">
                <h2
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Events
                </h2>

                <p
                  className="
                    mt-1
                    line-clamp-2
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-neutral-500
                  "
                >
                  Discover college events, workshops, fests and activities
                  around your campus.
                </p>
              </div>

              {/* Arrow */}

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition-transform
                  duration-150
                  group-hover:translate-x-0.5
                  dark:text-neutral-600
                "
              >
                <ArrowRight size={17} />
              </div>
            </div>

            {/* Bottom action */}

            <div
              className="
                mt-3
                flex
                items-center
                gap-1.5
                border-t
                border-slate-100
                pt-3
                text-[10px]
                font-medium
                text-violet-600
                dark:border-neutral-800
                dark:text-violet-400
              "
            >
              <CalendarDays size={13} />

              <span>Explore upcoming events</span>

              <ChevronRight size={12} />
            </div>
          </button>
        </section>

        {/* =====================================================
            FOOTER NOTE
        ===================================================== */}

        <p
          className="
            mt-6
            text-center
            text-[9px]
            leading-4
            text-slate-400
            dark:text-neutral-700
          "
        >
          Be kind, respectful and have fun.
        </p>
      </main>

      <FloatingTabs />
    </div>
  );
};

export default VibeHome;
