import { ChevronDown } from "lucide-react";

interface ProfileSelectProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

function ProfileSelect({
  label,
  value,
  options,
  placeholder = "Select an option",
  onChange,
}: ProfileSelectProps) {
  return (
    <div className="w-full">
      {/* Label */}
      <label
        className="
          mb-2
          block
          text-sm
          font-semibold
          text-slate-700

          dark:text-slate-200
        "
      >
        {label}
      </label>

      {/* Select Wrapper */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            appearance-none
            rounded-2xl

            border
            border-slate-200

            bg-slate-50

            px-4
            py-3.5
            pr-11

            text-sm
            text-slate-900

            outline-none

            transition-all
            duration-200

            hover:border-slate-300

            focus:border-indigo-500
            focus:bg-white
            focus:ring-4
            focus:ring-indigo-100

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-white

            dark:hover:border-slate-600

            dark:focus:border-indigo-500
            dark:focus:bg-slate-800
            dark:focus:ring-indigo-950
          "
        >
          <option
            value=""
            disabled
            className="text-slate-400 dark:bg-slate-800 dark:text-slate-500"
          >
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
            >
              {option}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            flex
            -translate-y-1/2
            items-center
            justify-center

            text-slate-400

            dark:text-slate-500
          "
        >
          <ChevronDown size={18} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

export default ProfileSelect;
