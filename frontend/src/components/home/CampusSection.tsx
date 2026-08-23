import { ChevronRight } from "lucide-react";

import CampusCard from "./CampusCard";

function CampusSection() {
  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Explore your campus
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Find communities and activities
          </p>
        </div>

        <ChevronRight size={18} className="text-slate-400" />
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <CampusCard
          emoji="💻"
          title="Tech Community"
          members="128 members"
          description="Developers, designers and tech enthusiasts."
        />

        <CampusCard
          emoji="🎨"
          title="Creative Club"
          members="76 members"
          description="Photography, art, design and creativity."
        />
      </div>
    </section>
  );
}

export default CampusSection;
