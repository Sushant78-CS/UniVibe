import { Home, Search, User, Newspaper } from "lucide-react";
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
      label: "Posts",
      icon: Newspaper,
      path: "/posts",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <nav
      className="
        fixed
        bottom-3
        left-1/2
        z-50
        w-[calc(100%-40px)]
        max-w-sm
        -translate-x-1/2
      "
    >
      <div
        className="
          flex
          items-center
          justify-around
          rounded-[22px]
          border
          border-slate-200
          bg-white/95
          px-1.5
          py-1.5
          shadow-lg
          shadow-slate-900/10
          backdrop-blur-xl
          dark:border-slate-800
          dark:bg-slate-900/95
          dark:shadow-black/30
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            location.pathname === tab.path ||
            (tab.path === "/posts" && location.pathname.startsWith("/posts"));

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`
                flex
                min-w-[60px]
                flex-col
                items-center
                gap-0.5
                rounded-[16px]
                px-2.5
                py-1.5
                text-[10px]
                font-medium
                transition-all
                duration-200
                ${
                  active
                    ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }
              `}
            >
              <Icon size={17} strokeWidth={2} />

              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingTabs;
