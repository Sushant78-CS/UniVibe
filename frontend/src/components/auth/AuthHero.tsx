import AuthLogo from "./AuthLogo";
import AuthFeatureCard from "./AuthFeatureCard";

const AuthHero = () => {
  return (
    <section
      className="
        relative
        hidden
        min-h-screen
        w-1/2
        overflow-hidden
        bg-gradient-to-br
        from-violet-600
        via-purple-600
        to-fuchsia-600
        px-10
        py-10
        lg:block
        xl:px-12
      "
    >
      {/* Decorative circles */}
      <div
        className="
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-white/10
        "
      />

      <div
        className="
          absolute
          -bottom-32
          -left-32
          h-80
          w-80
          rounded-full
          bg-white/10
        "
      />

      <div
        className="
          relative
          z-10
          flex
          min-h-[calc(100vh-5rem)]
          flex-col
        "
      >
        {/* Logo */}
        <AuthLogo />

        {/* Main Content */}
        <div className="my-auto max-w-lg">
          <p
            className="
              mb-3
              text-xs
              font-bold
              tracking-[0.18em]
              text-white/70
            "
          >
            CAMPUS COMMUNITY
          </p>

          <h2
            className="
              text-4xl
              font-bold
              leading-tight
              tracking-tight
              text-white
              xl:text-5xl
            "
          >
            Find your people.
            <br />
            Find your vibe.
          </h2>

          <p
            className="
              mt-4
              max-w-md
              text-sm
              leading-6
              text-white/75
            "
          >
            Connect with students, discover interests, and be part of your
            campus community.
          </p>

          {/* Features */}
          <div className="mt-7 grid grid-cols-3 gap-3">
            <AuthFeatureCard icon="🤝" title="Meet People" />

            <AuthFeatureCard icon="✨" title="Find Your Vibe" />

            <AuthFeatureCard icon="🏫" title="Campus Life" />
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/60">
          © 2026 UniVibe · Your campus. Your people.
        </p>
      </div>
    </section>
  );
};

export default AuthHero;
