import { useState } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  label: string;
  tags: string[];
  placeholder?: string;
  suggestions?: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({
  label,
  tags,
  placeholder = "Type and press Enter",
  suggestions = [],
  onChange,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const cleanTag = tag.trim();

    if (!cleanTag) return;

    const exists = tags.some(
      (item) => item.toLowerCase() === cleanTag.toLowerCase(),
    );

    if (exists) {
      setInput("");
      return;
    }

    onChange([...tags, cleanTag]);
    setInput("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    }

    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

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

      {/* Tag Input */}
      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-3

          transition-all
          duration-200

          hover:border-slate-300

          focus-within:border-indigo-500
          focus-within:bg-white
          focus-within:ring-4
          focus-within:ring-indigo-100

          dark:border-slate-700
          dark:bg-slate-800

          dark:hover:border-slate-600

          dark:focus-within:border-indigo-500
          dark:focus-within:bg-slate-800
          dark:focus-within:ring-indigo-950
        "
      >
        {/* Selected Tags + Input */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selected Tags */}
          {tags.map((tag) => (
            <span
              key={tag}
              className="
                flex
                items-center
                gap-1.5
                rounded-full

                border
                border-indigo-100

                bg-indigo-100
                px-3
                py-1.5

                text-xs
                font-medium
                text-indigo-700

                dark:border-indigo-900
                dark:bg-indigo-950
                dark:text-indigo-300
              "
            >
              {tag}

              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full

                  text-indigo-500

                  transition-colors

                  hover:bg-indigo-200
                  hover:text-indigo-800

                  dark:text-indigo-400
                  dark:hover:bg-indigo-900
                  dark:hover:text-indigo-200
                "
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Input */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : "Add more..."}
            className="
              min-w-[140px]
              flex-1
              bg-transparent
              px-1
              py-1.5

              text-sm
              text-slate-900

              outline-none

              placeholder:text-slate-400

              dark:text-white
              dark:placeholder:text-slate-500
            "
          />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-3">
          <p
            className="
              mb-2
              text-xs
              font-medium
              text-slate-400
              dark:text-slate-500
            "
          >
            Suggestions
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter(
                (suggestion) =>
                  !tags.some(
                    (tag) => tag.toLowerCase() === suggestion.toLowerCase(),
                  ),
              )
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="
                    flex
                    items-center
                    gap-1

                    rounded-full
                    border

                    border-slate-200
                    bg-white

                    px-3
                    py-1.5

                    text-xs
                    font-medium
                    text-slate-600

                    transition-all
                    duration-200

                    hover:border-indigo-300
                    hover:bg-indigo-50
                    hover:text-indigo-600

                    active:scale-95

                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-slate-300

                    dark:hover:border-indigo-700
                    dark:hover:bg-indigo-950
                    dark:hover:text-indigo-300
                  "
                >
                  <Plus size={13} strokeWidth={2} />

                  {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TagInput;
