import { Sparkles } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

const AuthHeader = () => {
  return (
    <div className="flex items-center justify-between px-5 py-5 lg:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-indigo-600
                to-purple-600
                text-lg
                font-bold
                text-white
                shadow-md
              "
        >
          <Sparkles size={20} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            UniVibe
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your campus. Your people.
          </p>
        </div>
      </div>

      {/* Mobile Theme Toggle */}
      <ThemeToggle />
    </div>
  );
};

export default AuthHeader;
