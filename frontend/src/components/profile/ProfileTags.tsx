interface ProfileTagsProps {
  title: string;
  tags: string[];
  emptyText?: string;
}

function ProfileTags({
  title,
  tags,
  emptyText = "Nothing added yet",
}: ProfileTagsProps) {
  return (
    <section>
      <h3
        className="
          mb-2
          text-sm
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        {title}
      </h3>

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-3.5
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  rounded-full
                  bg-indigo-50
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-indigo-600
                  dark:bg-indigo-950
                  dark:text-indigo-400
                "
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export default ProfileTags;
