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

          focus:border-indigo-500
          focus:bg-white
          focus:ring-4
          focus:ring-indigo-100

          disabled:cursor-not-allowed
          disabled:opacity-60

          dark:border-slate-700
          dark:bg-slate-800
          dark:text-white

          dark:placeholder:text-slate-500

          dark:hover:border-slate-600

          dark:focus:border-indigo-500
          dark:focus:bg-slate-800
          dark:focus:ring-indigo-950

          dark:disabled:bg-slate-900
        "
      />
    </div>
  );
}

export default ProfileInput;
