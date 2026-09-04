interface ProfileInputProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ProfileInput({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
  disabled = false,
}: ProfileInputProps) {
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

      {/* Input */}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          px-4
          py-3.5
          text-sm
          text-slate-900
          outline-none
          transition-all
          duration-200

          placeholder:text-slate-400

          hover:border-slate-300

          focus:border-violet-500
          focus:bg-white
          focus:ring-4
          focus:ring-violet-500/10

          disabled:cursor-not-allowed
          disabled:opacity-60

          dark:border-neutral-700
          dark:bg-[#0f0f0f]
          dark:text-white
          dark:placeholder:text-neutral-500

          dark:hover:border-neutral-600

          dark:focus:border-violet-500
          dark:focus:bg-[#0f0f0f]
          dark:focus:ring-violet-500/10

          dark:disabled:bg-[#111111]
        "
      />
    </div>
  );
}

export default ProfileInput;
