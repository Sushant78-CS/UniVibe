import { GraduationCap, MapPin } from "lucide-react";

interface PersonProfileDetailsProps {
  bio?: string;
  department?: string;
  year?: string;
  college?: string;
  interests: string[];
}

const PersonProfileDetails = ({
  bio,
  department,
  year,
  college,
  interests,
}: PersonProfileDetailsProps) => {
  return (
    <section className="px-4">
      {/* ======================================
          BIO
      ====================================== */}

      {bio && (
        <div className="mt-5">
          <p
            className="
              whitespace-pre-wrap
              text-sm
              leading-5
              text-neutral-700
              dark:text-neutral-300
            "
          >
            {bio}
          </p>
        </div>
      )}

      {/* ======================================
          INFO
      ====================================== */}

      <div
        className="
          mt-6
          divide-y
          divide-neutral-200
          border-y
          border-neutral-200
          dark:divide-neutral-800
          dark:border-neutral-800
        "
      >
        {/* EDUCATION */}

        <div className="flex items-center gap-3 py-4">
          <GraduationCap size={17} className="text-neutral-500" />

          <div className="min-w-0">
            <p
              className="
                text-xs
                text-neutral-500
                dark:text-neutral-500
              "
            >
              Education
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-sm
                font-medium
                text-neutral-900
                dark:text-white
              "
            >
              {department || "Student"}
            </p>

            {year && (
              <p
                className="
                  mt-0.5
                  text-xs
                  text-neutral-500
                "
              >
                {year}
              </p>
            )}
          </div>
        </div>

        {/* COLLEGE */}

        {college && (
          <div className="flex items-center gap-3 py-4">
            <MapPin size={17} className="text-neutral-500" />

            <div className="min-w-0">
              <p
                className="
                  text-xs
                  text-neutral-500
                "
              >
                College
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-sm
                  font-medium
                  text-neutral-900
                  dark:text-white
                "
              >
                {college}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================
          INTERESTS
      ====================================== */}

      <div className="mt-6">
        <h3
          className="
            text-sm
            font-semibold
            text-neutral-900
            dark:text-white
          "
        >
          Interests
        </h3>

        {interests.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="
                    rounded-full
                    border
                    border-violet-200
                    px-3
                    py-1.5
                    text-[11px]
                    font-medium
                    text-violet-700
                    dark:border-violet-500/25
                    dark:text-violet-300
                  "
              >
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            No interests added yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default PersonProfileDetails;
