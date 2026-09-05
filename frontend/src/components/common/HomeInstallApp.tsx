import { useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useInstallPWA } from "../../hooks/useInstallPWA";

const HomeInstallApp = () => {
  const { installApp, canInstall, isInstalled, isIOS } = useInstallPWA();

  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / supported browsers
  if (canInstall) {
    const handleInstall = async () => {
      if (installing) return;

      setInstalling(true);

      try {
        await installApp();
      } catch (error) {
        console.error("Failed to install UniVibe:", error);
      } finally {
        setInstalling(false);
      }
    };

    return (
      <div className="mx-2 mb-3 rounded-2xl bg-[#181818] border border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center shrink-0">
            <Download size={19} className="text-purple-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              Install UniVibe
            </h3>

            <p className="text-[11px] text-gray-400 mt-0.5">
              Get faster access from your Home Screen.
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleInstall}
            disabled={installing}
            className="
              shrink-0
              px-4
              py-2
              rounded-xl
              bg-purple-600
              hover:bg-purple-500
              active:scale-95
              text-white
              text-xs
              font-semibold
              transition-all
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {installing ? "Installing..." : "Install"}
          </button>
        </div>
      </div>
    );
  }

  // iPhone / iPad
  if (isIOS) {
    return (
      <>
        <div className="mx-2 mb-3 rounded-2xl bg-[#181818] border border-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center shrink-0">
              <Share size={18} className="text-purple-400" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">Add UniVibe</h3>

              <p className="text-[11px] text-gray-400 mt-0.5">
                Add UniVibe to your Home Screen.
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(true)}
              className="
                shrink-0
                px-4
                py-2
                rounded-xl
                bg-purple-600
                hover:bg-purple-500
                active:scale-95
                text-white
                text-xs
                font-semibold
                transition-all
              "
            >
              Add
            </button>
          </div>
        </div>

        {/* iOS instructions */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70">
            <div className="w-full max-w-md rounded-t-3xl bg-[#181818] p-5 pb-7">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Add UniVibe to Home Screen
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Follow these steps on your iPhone or iPad.
                  </p>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <X size={17} className="text-gray-300" />
                </button>
              </div>

              {/* Step 1 */}
              <div className="flex gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">1</span>
                </div>

                <div>
                  <p className="text-sm text-white font-medium">
                    Tap the Share button
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Use the Share icon in Safari.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">2</span>
                </div>

                <div>
                  <p className="text-sm text-white font-medium">
                    Select "Add to Home Screen"
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Scroll through the Share menu if you don't see it.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">3</span>
                </div>

                <div>
                  <p className="text-sm text-white font-medium">Tap "Add"</p>

                  <p className="text-xs text-gray-400 mt-1">
                    UniVibe will appear on your Home Screen.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="
                  w-full
                  mt-6
                  py-3
                  rounded-xl
                  bg-purple-600
                  text-white
                  text-sm
                  font-semibold
                "
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default HomeInstallApp;
