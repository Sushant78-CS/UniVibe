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
          text-slate-800
          dark:text-neutral-200
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

            focus:border-violet-500
            focus:bg-white
            focus:ring-4
            focus:ring-violet-500/10

            dark:border-neutral-700
            dark:bg-[#0f0f0f]
            dark:text-white

            dark:hover:border-neutral-600

            dark:focus:border-violet-500
            dark:focus:bg-[#0f0f0f]
            dark:focus:ring-violet-500/10
          "
        >
          {/* Placeholder */}
          <option
            value=""
            disabled
            className="
              bg-white
              text-slate-400
              dark:bg-[#0f0f0f]
              dark:text-neutral-500
            "
          >
            {placeholder}
          </option>

          {/* Options */}
          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="
                bg-white
                text-slate-900
                dark:bg-[#171717]
                dark:text-white
              "
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
            dark:text-neutral-500
          "
        >
          <ChevronDown size={18} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

export default ProfileSelect;
