import { AlertCircle, Check, Loader2, X } from "lucide-react";

import { useEffect } from "react";

import { usePublishingStore } from "../../store/publishingStore";

export default function PublishProgress() {
  const { status, progress, message, error, reset } = usePublishingStore();

  /*
   * ==========================================
   * AUTO REMOVE SUCCESS
   * ==========================================
   */

  useEffect(() => {
    if (status !== "SUCCESS") {
      return;
    }

    const timeout = window.setTimeout(() => {
      reset();
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [status, reset]);

  /*
   * ==========================================
   * AUTO REMOVE ERROR
   * ==========================================
   */

  useEffect(() => {
    if (status !== "ERROR") {
      return;
    }

    const timeout = window.setTimeout(() => {
      reset();
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [status, reset]);

  /*
   * ==========================================
   * IDLE
   * ==========================================
   */

  if (status === "IDLE") {
    return null;
  }

  const isWorking =
    status === "COMPRESSING" || status === "UPLOADING" || status === "CREATING";

  const isSuccess = status === "SUCCESS";

  const isError = status === "ERROR";

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div
      className="
        fixed
        bottom-[5.25rem]
        right-3
        z-[200]
        w-[calc(100vw-1.5rem)]
        max-w-[280px]
        sm:right-5
        sm:max-w-[300px]
        md:bottom-5
      "
    >
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-900
          shadow-[0_10px_35px_rgba(15,23,42,0.16)]
          transition-colors
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-white
          dark:shadow-[0_10px_35px_rgba(0,0,0,0.45)]
        "
      >
        {/* ==================================
            CONTENT
            ================================== */}

        <div
          className="
            flex
            items-center
            gap-3
            px-3
            py-2.5
          "
        >
          {/* ==================================
              STATUS ICON
              ================================== */}

          <div className="shrink-0">
            {/* WORKING */}

            {isWorking && (
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-100
                  dark:bg-violet-500/15
                "
              >
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                    text-violet-600
                    dark:text-violet-400
                  "
                />
              </div>
            )}

            {/* SUCCESS */}

            {isSuccess && (
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-100
                  dark:bg-emerald-500/15
                "
              >
                <Check
                  className="
                    h-4
                    w-4
                    text-emerald-600
                    dark:text-emerald-400
                  "
                />
              </div>
            )}

            {/* ERROR */}

            {isError && (
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-red-100
                  dark:bg-red-500/15
                "
              >
                <AlertCircle
                  className="
                    h-4
                    w-4
                    text-red-600
                    dark:text-red-400
                  "
                />
              </div>
            )}
          </div>

          {/* ==================================
              TEXT
              ================================== */}

          <div className="min-w-0 flex-1">
            <p
              className="
                truncate
                text-xs
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              {isSuccess
                ? "Post published"
                : isError
                  ? "Publishing failed"
                  : "Publishing post"}
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-[11px]
                text-slate-500
                dark:text-slate-400
              "
            >
              {error || message}
            </p>
          </div>

          {/* ==================================
              DISMISS ERROR
              ================================== */}

          {isError && (
            <button
              type="button"
              onClick={reset}
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                dark:text-slate-500
                dark:hover:bg-slate-800
                dark:hover:text-slate-200
              "
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ==================================
            PROGRESS BAR
            ================================== */}

        {isWorking && (
          <div
            className="
              h-1
              w-full
              bg-slate-200
              dark:bg-slate-800
            "
          >
            <div
              className="
                h-full
                bg-violet-600
                transition-[width]
                duration-200
                dark:bg-violet-500
              "
              style={{
                width: status === "COMPRESSING" ? "35%" : `${progress}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
