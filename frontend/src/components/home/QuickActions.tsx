import { Compass, Heart, MessageCircle, Users } from "lucide-react";

import QuickActionCard from "./QuickActionCard";

function QuickActions() {
  return (
    <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <QuickActionCard
        icon={<Compass size={20} />}
        title="Discover"
        description="Find people"
      />

      <QuickActionCard
        icon={<Users size={20} />}
        title="Communities"
        description="Join groups"
      />

      <QuickActionCard
        icon={<MessageCircle size={20} />}
        title="Messages"
        description="Chat with people"
      />

      <QuickActionCard
        icon={<Heart size={20} />}
        title="Your Matches"
        description="People you vibe with"
      />
    </section>
  );
}

export default QuickActions;
