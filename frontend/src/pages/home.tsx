import Header from "../components/home/Header";
import ConnectionsSection from "../components/home/ConnectionsSection";
import FloatingTabs from "../components/home/FloatingTabs";
import CampusFeed from "../components/posts/CampusFeed";
import NotificationPrompt from "../components/notifications/NotificationPrompt";
import HomeInstallApp from "../components/common/HomeInstallApp";

function Home() {
  return (
    <div
      className="
        min-h-screen
        bg-white
        text-slate-900
        transition-colors
        duration-200
        dark:bg-black
        dark:text-white
      "
    >
      {/* Header */}
      <Header />
      <HomeInstallApp />

      {/* Main social feed */}
      <main
        className="
          mx-auto
          w-full
          max-w-[680px]
          pb-24
        "
      >
        {/* Connections */}
        <ConnectionsSection />
        <NotificationPrompt />
        {/* Feed */}
        <CampusFeed />
      </main>

      {/* Bottom navigation */}
      <FloatingTabs />
    </div>
  );
}

export default Home;
