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
    <div className="px-4">
      {/* BIO */}

      {bio && (
        <section className="mt-5">
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
        </section>
      )}

      {/* EDUCATION */}

      <section className="mt-5">
        <div className="flex items-center gap-2">
          <GraduationCap
            size={16}
            className="
              text-neutral-500
              dark:text-neutral-400
            "
          />

          <span
            className="
              text-xs
              font-medium
              text-neutral-500
              dark:text-neutral-400
            "
          >
            Education
          </span>
        </div>

        <div className="mt-2">
          <p
            className="
              text-sm
              font-semibold
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
                dark:text-neutral-500
              "
            >
              {year}
            </p>
          )}
        </div>
      </section>

      {/* COLLEGE */}

      {college && (
        <section className="mt-5">
          <div className="flex items-center gap-2">
            <MapPin
              size={16}
              className="
                text-neutral-500
                dark:text-neutral-400
              "
            />

            <span
              className="
                text-xs
                font-medium
                text-neutral-500
                dark:text-neutral-400
              "
            >
              College
            </span>
          </div>

          <p
            className="
              mt-2
              text-sm
              font-semibold
              text-neutral-900
              dark:text-white
            "
          >
            {college}
          </p>
        </section>
      )}

      {/* INTERESTS */}

      <section className="mt-5">
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
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="
                    rounded-full
                    border
                    border-violet-200
                    bg-violet-50
                    px-3
                    py-1.5
                    text-[11px]
                    font-medium
                    text-violet-700
                    dark:border-violet-500/20
                    dark:bg-violet-500/10
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
              dark:text-neutral-500
            "
          >
            No interests added yet.
          </p>
        )}
      </section>
    </div>
  );
};

export default PersonProfileDetails;
