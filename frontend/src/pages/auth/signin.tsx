import AuthHero from "../../components/auth/AuthHero";
import AuthHeader from "../../components/auth/AuthHeader";
import SignInForm from "../../components/auth/SignInForm";
import ThemeToggle from "../../components/common/ThemeToggle";

const SignInPage = () => {
  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        transition-colors
        duration-300
        dark:bg-black
        dark:text-white
      "
    >
      {/* Mobile Header */}
      <div className="border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-black lg:hidden">
        <AuthHeader />
      </div>

      {/* Main Layout */}
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
        {/* Left Hero */}
        <AuthHero />

        {/* Right Section */}
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
            dark:bg-black
            lg:w-1/2
            lg:px-12
            lg:py-12
            xl:px-16
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

          {/* Sign In */}
          <div
            className="
              flex
              w-full
              max-w-[440px]
              items-center
              justify-center
              -translate-y-10
              lg:-translate-y-6
            "
          >
            <SignInForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignInPage;
