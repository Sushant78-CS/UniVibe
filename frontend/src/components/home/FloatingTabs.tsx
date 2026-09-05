import { Home, Search, User, Plus, Radio } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useLocation, useNavigate } from "react-router";

const FloatingTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);

  /*
   * ============================================
   * NAVIGATION TABS
   * ============================================
   */

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
      label: "Vibe",
      icon: Radio,
      path: "/vibe",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  /*
   * ============================================
   * HIDE NAVIGATION WHILE SCROLLING DOWN
   * ============================================
   */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      /*
       * Always show near the top.
       */
      if (currentScrollY <= 20) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      /*
       * Scrolling down.
       */
      if (currentScrollY > lastScrollY.current + 8) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        /*
         * Scrolling up.
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

  /*
   * ============================================
   * ACTIVE TAB
   * ============================================
   */

  const isActive = (path: string) => {
    if (path === "/vibe") {
      return location.pathname === "/vibe" || location.pathname === "/vibe/";
    }

    return location.pathname === path;
  };

  /*
   * ============================================
   * TAB BUTTON
   * ============================================
   */

  const renderTab = (tab: (typeof tabs)[number]) => {
    const Icon = tab.icon;
    const active = isActive(tab.path);

    return (
      <button
        key={tab.path}
        type="button"
        onClick={() => navigate(tab.path)}
        aria-current={active ? "page" : undefined}
        className="
          flex
          min-w-[52px]
          flex-1
          flex-col
          items-center
          justify-center
          gap-1
          py-2
          outline-none
          transition-transform
          duration-150
          active:scale-90
        "
      >
        <Icon
          size={22}
          strokeWidth={active ? 2.4 : 1.9}
          className={
            active
              ? "text-violet-600 dark:text-violet-400"
              : "text-slate-500 dark:text-neutral-500"
          }
          fill="none"
        />

        <span
          className={`
            text-[9px]
            leading-none
            ${
              active
                ? "font-semibold text-violet-600 dark:text-violet-400"
                : "font-medium text-slate-400 dark:text-neutral-600"
            }
          `}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`
        fixed
        inset-x-0
        bottom-0
        z-50
        transition-transform
        duration-300
        ease-out

        ${visible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div
        className="
          relative
          border-t
          border-slate-200
          bg-white
          pb-[env(safe-area-inset-bottom)]

          dark:border-neutral-800
          dark:bg-black
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[64px]
            w-full
            max-w-[680px]
            items-center
            px-3
            sm:px-4
          "
        >
          {/* ==================================
              LEFT
              ================================== */}

          <div className="flex flex-1 items-center">
            {renderTab(tabs[0])}
            {renderTab(tabs[1])}
          </div>

          {/* ==================================
              CREATE
              ================================== */}

          <div
            className="
              flex
              w-[72px]
              shrink-0
              items-center
              justify-center
            "
          >
            <button
              type="button"
              onClick={() => navigate("/posts/create")}
              aria-label="Create post"
              className="
                flex
                h-[48px]
                w-[48px]
                items-center
                justify-center
                rounded-full
                border
                border-slate-300
                bg-white
                text-slate-900
                shadow-[0_4px_12px_rgba(15,23,42,0.08)]
                outline-none
                transition-all
                duration-150
                hover:border-violet-500
                hover:text-violet-600
                active:scale-90
                focus-visible:ring-2
                focus-visible:ring-violet-500/30

                dark:border-neutral-700
                dark:bg-[#171717]
                dark:text-white
                dark:shadow-none
                dark:hover:border-violet-500
                dark:hover:text-violet-400
              "
            >
              <Plus size={25} strokeWidth={2} />
            </button>
          </div>

          {/* ==================================
              RIGHT
              ================================== */}

          <div className="flex flex-1 items-center">
            {renderTab(tabs[2])}
            {renderTab(tabs[3])}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FloatingTabs;
