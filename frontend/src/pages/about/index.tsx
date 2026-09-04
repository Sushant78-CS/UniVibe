import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

function AboutPage() {
  const navigate = useNavigate();

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
      {/* Header */}
      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-slate-200
          bg-white/95
          backdrop-blur
          dark:border-neutral-800
          dark:bg-black/95
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-full
            max-w-[680px]
            items-center
            gap-3
            px-4
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-600
              transition
              hover:bg-slate-100
              dark:text-neutral-300
              dark:hover:bg-[#171717]
            "
          >
            <ArrowLeft size={19} />
          </button>

          <h1 className="text-base font-semibold">About UniVibe</h1>
        </div>
      </header>

      <main
        className="
          mx-auto
          w-full
          max-w-[680px]
          px-4
          pb-24
          pt-6
        "
      >
        {/* Hero */}
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            dark:border-neutral-800
            dark:bg-[#171717]
          "
        >
          <div className="flex flex-col items-center text-center">
            <h2 className="mt-4 text-xl font-bold">UniVibe</h2>

            <p
              className="
                mt-1
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-violet-600
                dark:text-violet-400
              "
            >
              Campus Community
            </p>

            <p
              className="
                mt-4
                max-w-md
                text-sm
                leading-6
                text-slate-600
                dark:text-neutral-400
              "
            >
              UniVibe is a campus-focused social platform designed to help
              students discover people, share updates, build connections, and
              stay connected with their college community.
            </p>
          </div>
        </section>

        {/* What you can do */}
        <section className="mt-6">
          <p
            className="
              mb-2
              px-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
              dark:text-neutral-500
            "
          >
            What you can do
          </p>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <Feature
              icon={<Users size={18} />}
              title="Discover students"
              description="Find people from your campus, course, and interests."
            />

            <Feature
              icon={<MessageCircle size={18} />}
              title="Message people"
              description="Have private conversations with your connections."
            />

            <Feature
              icon={<Heart size={18} />}
              title="Share campus updates"
              description="Post events, news, activities, and other updates."
            />

            <Feature
              icon={<Bell size={18} />}
              title="Stay updated"
              description="Receive notifications for messages and connection requests."
            />

            <Feature
              icon={<Zap size={18} />}
              title="Connect faster"
              description="Build your campus network around shared interests."
            />
          </div>
        </section>

        {/* Built with */}
        <section className="mt-6">
          <p
            className="
              mb-2
              px-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
              dark:text-neutral-500
            "
          >
            Built for students
          </p>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              dark:border-neutral-800
              dark:bg-[#171717]
            "
          >
            <p
              className="
                text-sm
                leading-6
                text-slate-600
                dark:text-neutral-400
              "
            >
              UniVibe brings social discovery, campus networking, posts,
              messaging, and notifications into one student-focused experience.
            </p>

            <div
              className="
                mt-4
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-violet-100
                bg-violet-50
                px-3
                py-2.5
                dark:border-violet-500/20
                dark:bg-violet-500/10
              "
            >
              <ShieldCheck
                size={17}
                className="
                  shrink-0
                  text-violet-600
                  dark:text-violet-400
                "
              />

              <p
                className="
                  text-xs
                  text-violet-700
                  dark:text-violet-300
                "
              >
                Built with a focus on a simple, connected campus experience.
              </p>
            </div>
          </div>
        </section>

        {/* Version */}
        <section
          className="
            mt-6
            text-center
          "
        >
          <p
            className="
              text-[11px]
              text-slate-400
              dark:text-neutral-600
            "
          >
            UniVibe · Campus Community
          </p>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
              dark:text-neutral-600
            "
          >
            Version 1.0
          </p>
        </section>
      </main>
    </div>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        border-b
        border-slate-100
        px-4
        py-4
        last:border-b-0
        dark:border-neutral-800
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-violet-50
          text-violet-600
          dark:bg-violet-500/10
          dark:text-violet-400
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>

        <p
          className="
            mt-0.5
            text-xs
            leading-5
            text-slate-500
            dark:text-neutral-400
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
