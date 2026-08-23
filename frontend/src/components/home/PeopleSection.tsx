import { ChevronRight, Sparkles } from "lucide-react";

import PersonCard from "./PersonCard";

function PeopleSection() {
  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" />

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              People you may vibe with
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on your interests and campus
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          See all
          <ChevronRight size={16} />
        </button>
      </div>

      {/* People */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PersonCard
          name="Aarav"
          course="BSc Computer Science"
          year="2nd Year"
          interests={["Coding", "Gaming", "Music"]}
          match="92%"
        />

        <PersonCard
          name="Ananya"
          course="BBA"
          year="2nd Year"
          interests={["Photography", "Travel", "Movies"]}
          match="87%"
        />

        <PersonCard
          name="Rohan"
          course="BSc IT"
          year="3rd Year"
          interests={["Football", "Coding", "Startups"]}
          match="84%"
        />
      </div>
    </section>
  );
}

export default PeopleSection;
