import { Download, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { useInstallPWA } from "../../hooks/useInstallPWA";

const InstallAppButton = () => {
  const { installApp, canInstall, isInstalled, isIOS } = useInstallPWA();

  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show the section if UniVibe is already installed.
  if (isInstalled) {
    return null;
  }

  // --------------------------------------------------
  // Android / Chrome / Edge
  // --------------------------------------------------

  if (canInstall) {
    return (
      <section className="mb-6">
        <p
          className="
            mb-2
            px-1
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            text-slate-500
            dark:text-neutral-500
          "
        >
          App
        </p>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            dark:border-neutral-800
            dark:bg-[#171717]
          "
        >
          <div
            className="
              flex
              min-h-[72px]
              items-center
              gap-3
              px-4
              py-3.5
            "
          >
            {/* Icon */}
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
                dark:bg-violet-500/10
                dark:text-violet-400
              "
            >
              <Smartphone size={18} />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Install UniVibe</p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                  dark:text-neutral-400
                "
              >
                Add UniVibe to your device for quick access.
              </p>
            </div>

            {/* Install button */}
            <button
              type="button"
              onClick={installApp}
              className="
                flex
                shrink-0
                items-center
                gap-1.5
                rounded-xl
                bg-violet-600
                px-3.5
                py-2
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-violet-700
                active:scale-95
              "
            >
              <Download size={15} />
              Install
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------
  // iPhone / iPad
  // --------------------------------------------------

  if (isIOS) {
    return (
      <section className="mb-6">
        <p
          className="
            mb-2
            px-1
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            text-slate-500
            dark:text-neutral-500
          "
        >
          App
        </p>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            dark:border-neutral-800
            dark:bg-[#171717]
          "
        >
          <div
            className="
              flex
              min-h-[72px]
              items-center
              gap-3
              px-4
              py-3.5
            "
          >
            {/* Icon */}
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
                dark:bg-violet-500/10
                dark:text-violet-400
              "
            >
              <Smartphone size={18} />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Install UniVibe</p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                  dark:text-neutral-400
                "
              >
                Add UniVibe to your Home Screen.
              </p>
            </div>

            {/* Install button */}
            <button
              type="button"
              onClick={() => setShowIOSInstructions(true)}
              className="
                shrink-0
                rounded-xl
                bg-violet-600
                px-3.5
                py-2
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-violet-700
                active:scale-95
              "
            >
              Install
            </button>
          </div>
        </div>

        {/* iOS Instructions Modal */}
        {showIOSInstructions && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-end
              justify-center
              bg-black/60
            "
          >
            <div
              className="
                w-full
                max-w-[680px]
                rounded-t-3xl
                bg-white
                p-6
                dark:bg-[#171717]
              "
            >
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Install UniVibe</h2>

                <button
                  type="button"
                  onClick={() => setShowIOSInstructions(false)}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-slate-500
                    hover:bg-slate-100
                    dark:text-neutral-400
                    dark:hover:bg-neutral-800
                  "
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-600
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    1
                  </span>

                  <p className="text-sm text-slate-600 dark:text-neutral-300">
                    Open UniVibe in <strong>Safari</strong>.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-600
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    2
                  </span>

                  <p className="text-sm text-slate-600 dark:text-neutral-300">
                    Tap the <strong>Share</strong> button.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-600
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    3
                  </span>

                  <p className="text-sm text-slate-600 dark:text-neutral-300">
                    Select <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-600
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    4
                  </span>

                  <p className="text-sm text-slate-600 dark:text-neutral-300">
                    Tap <strong>Add</strong>.
                  </p>
                </div>
              </div>

              {/* Done */}
              <button
                type="button"
                onClick={() => setShowIOSInstructions(false)}
                className="
                  mt-7
                  w-full
                  rounded-xl
                  bg-violet-600
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-violet-700
                "
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  return null;
};

export default InstallAppButton;
