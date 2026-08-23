import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router";

function DiscoverBanner() {
  return (
    <section className="mt-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-950 sm:p-8">
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/10" />

        <div className="relative">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Sparkles size={21} />
          </div>

          <h3 className="text-2xl font-bold">Ready to discover your vibe?</h3>

          <p className="mt-2 max-w-lg text-sm leading-6 text-indigo-100">
            Explore students from your campus and find people who share the same
            interests as you.
          </p>

          <Link
            to="/discover"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-95"
          >
            Start Discovering
            <ChevronRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DiscoverBanner;
