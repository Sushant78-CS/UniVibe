import { Home, Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const FloatingTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      label: "Home",
      icon: Home,
      path: "/home",
    },
    {
      label: "Discover",
      icon: Search,
      path: "/discover",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2">
      <div className="flex items-center justify-around rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active = location.pathname === tab.path;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex min-w-[80px] flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition ${
                active
                  ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon size={19} />

              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingTabs;
