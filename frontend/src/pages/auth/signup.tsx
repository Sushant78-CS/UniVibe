import AuthHero from "../../components/auth/AuthHero";
import SignUpForm from "../../components/auth/SignUpForm";
import AuthHeader from "../../components/auth/AuthHeader";
import ThemeToggle from "../../components/common/ThemeToggle";

const SignUpPage = () => {
  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        transition-colors
        duration-200
        dark:bg-black
        dark:text-white
      "
    >
      {/* =========================================
          MOBILE HEADER
          ========================================= */}

      <div
        className="
          border-b
          border-slate-200
          bg-white
          dark:border-neutral-800
          dark:bg-black
          lg:hidden
        "
      >
        <AuthHeader />
      </div>

      {/* =========================================
          MAIN
          ========================================= */}

      <div
        className="
          mx-auto
          flex
          min-h-[calc(100vh-80px)]
          w-full
          max-w-[1400px]
          lg:min-h-screen
        "
      >
        {/* =======================================
            LEFT — HERO
            ======================================= */}

        <AuthHero />

        {/* =======================================
            RIGHT — SIGN UP
            ======================================= */}

        <main
          className="
            relative
            flex
            min-h-full
            w-full
            items-center
            justify-center
            bg-slate-50
            px-5
            py-8
            sm:px-8
            lg:w-1/2
            lg:px-12
            lg:py-12
            dark:bg-black
            xl:px-16
          "
        >
          {/* =====================================
              THEME TOGGLE
              ===================================== */}

          <div
            className="
              absolute
              right-6
              top-6
              z-20
              hidden
              lg:block
            "
          >
            <ThemeToggle />
          </div>

          {/* =====================================
              FORM
              ===================================== */}
          <div className="flex w-full max-w-110 items-center justify-center -translate-y-10 lg:-translate-y-6">
            <SignUpForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignUpPage;
