import { create } from "zustand";

interface ThemeStore {
  darkMode: boolean;
  toggleTheme: () => void;
  setTheme: (darkMode: boolean) => void;
}

const getStoredTheme = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem("univibe-theme") === "dark";
};

const applyTheme = (darkMode: boolean) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  if (darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const initialTheme = getStoredTheme();

// Apply theme immediately when store loads
applyTheme(initialTheme);

export const useThemeStore = create<ThemeStore>((set) => ({
  darkMode: initialTheme,

  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.darkMode;

      localStorage.setItem("univibe-theme", newTheme ? "dark" : "light");

      applyTheme(newTheme);

      return {
        darkMode: newTheme,
      };
    });
  },

  setTheme: (darkMode) => {
    localStorage.setItem("univibe-theme", darkMode ? "dark" : "light");

    applyTheme(darkMode);

    set({
      darkMode,
    });
  },
}));
