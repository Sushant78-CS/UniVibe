import Header from "../components/home/Header";
import ConnectionsSection from "../components/home/ConnectionsSection";
import FloatingTabs from "../components/home/FloatingTabs";
import CampusFeed from "../components/posts/CampusFeed";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN ================= */}
      <main className="mx-auto w-full max-w-6xl px-5 pt-0 pb-5 sm:px-8">
        {/* ================= CONNECTIONS ================= */}
        <ConnectionsSection />

        {/* ================= CAMPUS POSTS ================= */}
        <section className="mt-8">
          <CampusFeed />
        </section>
      </main>

      {/* ================= BOTTOM NAV ================= */}
      <FloatingTabs />
    </div>
  );
}

export default Home;
