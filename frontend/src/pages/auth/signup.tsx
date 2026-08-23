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
        duration-300
        dark:bg-slate-950
        dark:text-white
      "
    >
      {/* Mobile Header */}
      <AuthHeader />

      {/* Main Authentication Layout */}
      <div
        className="
          mx-auto
          flex
          min-h-[calc(100vh-80px)]
          w-full
          max-w-[1600px]

          lg:min-h-screen
        "
      >
        {/* ============================= */}
        {/* LEFT - HERO */}
        {/* ============================= */}

        <AuthHero />

        {/* ============================= */}
        {/* RIGHT - SIGN UP */}
        {/* ============================= */}

        <main
          className="
            relative
            flex
            w-full
            items-center
            justify-center

            bg-slate-50

            px-5
            py-8

            sm:px-8
            sm:py-10

            dark:bg-slate-950

            lg:w-1/2
            lg:px-12
            lg:py-12

            xl:px-20
          "
        >
          {/* Desktop Theme Toggle */}
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

          {/* Sign Up Form */}
          {/* <div
            className="
              flex
              w-full
              items-center
              justify-center
            "
          > */}
          <div
            className="
            flex
            w-full
            items-center
            justify-center
          "
          >
            <SignUpForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignUpPage;
