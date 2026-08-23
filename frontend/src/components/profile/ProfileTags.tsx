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
      <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export default ProfileTags;
