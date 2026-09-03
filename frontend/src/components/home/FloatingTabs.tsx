import { Home, Search, User, Newspaper, Plus } from "lucide-react";

import { useLocation, useNavigate } from "react-router";

import { useEffect, useRef, useState } from "react";

const FloatingTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      /*
       * Always show navigation near the top.
       */
      if (currentScrollY < 20) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      /*
       * Scrolling down → hide.
       */
      if (currentScrollY > lastScrollY.current + 5) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        /*
         * Scrolling up → show.
         */
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`
        fixed
        bottom-5
        left-1/2
        z-50
        w-[calc(100%-24px)]
        max-w-sm
        -translate-x-1/2
        transition-all
        duration-300
        ease-out

        ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-[130px] opacity-0 pointer-events-none"
        }
      `}
    >
      <div
        className="
          relative
          flex
          h-[66px]
          items-center
          rounded-[24px]
          border
          border-slate-200/80
          bg-white/95
          px-2
          shadow-[0_10px_35px_rgba(15,23,42,0.16)]
          backdrop-blur-xl

          dark:border-slate-700/80
          dark:bg-slate-900/95
          dark:shadow-[0_10px_35px_rgba(0,0,0,0.45)]
        "
      >
        {/* LEFT */}
        <div className="flex flex-1 items-center justify-around">
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;

            const active = location.pathname === tab.path;

            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`
                  flex
                  min-w-[54px]
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  rounded-[16px]
                  px-2
                  py-2
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
                <Icon size={18} strokeWidth={2} />

                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CENTER CREATE POST */}
        <div
          className="
            relative
            flex
            w-[70px]
            shrink-0
            justify-center
          "
        >
          <button
            type="button"
            onClick={() => navigate("/posts/create")}
            aria-label="Create post"
            className="
              absolute
              -top-[38px]

              flex
              h-[58px]
              w-[58px]
              items-center
              justify-center

              rounded-full

              bg-violet-600
              text-white

              shadow-[0_8px_25px_rgba(124,58,237,0.40)]

              ring-[5px]
              ring-white

              transition-all
              duration-200

              hover:scale-105
              hover:bg-violet-700

              active:scale-95

              dark:bg-violet-500
              dark:ring-slate-900
              dark:shadow-[0_8px_25px_rgba(139,92,246,0.35)]
              dark:hover:bg-violet-600
            "
          >
            <Plus size={29} strokeWidth={2.5} />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex flex-1 items-center justify-around">
          {tabs.slice(2).map((tab) => {
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
                  min-w-[54px]
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  rounded-[16px]
                  px-2
                  py-2
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
                <Icon size={18} strokeWidth={2} />

                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default FloatingTabs;
