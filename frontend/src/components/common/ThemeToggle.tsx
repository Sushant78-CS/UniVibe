import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

function ThemeToggle() {
  const { darkMode, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="
        flex h-10 w-10
        items-center justify-center
        rounded-xl

        border border-slate-200
        bg-white
        text-slate-600
        shadow-sm

        transition-all
        duration-200

        hover:border-indigo-200
        hover:bg-indigo-50
        hover:text-indigo-600

        active:scale-95

        dark:border-slate-700
        dark:bg-slate-900
        dark:text-yellow-400

        dark:hover:border-slate-600
        dark:hover:bg-slate-800
        dark:hover:text-yellow-300
      "
    >
      {darkMode ? (
        <Sun size={19} strokeWidth={2} />
      ) : (
        <Moon size={19} strokeWidth={2} />
      )}
    </button>
  );
}

export default ThemeToggle;
