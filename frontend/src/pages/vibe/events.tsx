import { ArrowLeft, CalendarDays, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

const EventsPage = () => {
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
          flex
          min-h-screen
          w-full
          max-w-[680px]
          flex-col
          px-4
          pb-24
          pt-5
          sm:px-5
        "
      >
        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/vibe")}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:bg-slate-100
              dark:border-neutral-800
              dark:bg-[#0d0d0d]
              dark:text-neutral-300
              dark:hover:bg-neutral-900
            "
            aria-label="Back"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <h1
              className="
                text-lg
                font-bold
                tracking-tight
                text-violet-600
                dark:text-violet-400
              "
            >
              Events
            </h1>

            <p
              className="
                text-[10px]
                text-slate-500
                dark:text-neutral-500
              "
            >
              Discover what's happening on campus.
            </p>
          </div>
        </header>

        {/* Coming Soon */}
        <section className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm text-center">
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-violet-100
                text-violet-600
                dark:bg-violet-950/50
                dark:text-violet-400
              "
            >
              <CalendarDays size={30} strokeWidth={1.8} />
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-violet-500" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-violet-600
                  dark:text-violet-400
                "
              >
                Coming Soon
              </span>
            </div>

            <h2
              className="
                mt-2
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                dark:text-white
              "
            >
              Campus Events
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-xs
                text-xs
                leading-5
                text-slate-500
                dark:text-neutral-500
              "
            >
              We're building a better way to discover college events, workshops,
              fests and activities around you.
            </p>

            <div
              className="
                mx-auto
                mt-6
                w-fit
                rounded-full
                border
                border-violet-200
                bg-violet-50
                px-4
                py-2
                text-[10px]
                font-medium
                text-violet-600
                dark:border-violet-900
                dark:bg-violet-950/30
                dark:text-violet-400
              "
            >
              Something exciting is on the way
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EventsPage;
