import type { CreatePostData } from "../../../api/postApi";

interface PostDetailsFormProps {
  description: string;
  category: CreatePostData["category"];
  disabled?: boolean;

  onDescriptionChange: (value: string) => void;

  onCategoryChange: (value: CreatePostData["category"]) => void;
}

const PostDetailsForm = ({
  description,
  category,
  disabled = false,
  onDescriptionChange,
  onCategoryChange,
}: PostDetailsFormProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Post Details
        </h2>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Update the text and category of your post.
        </p>
      </div>

      {/* DESCRIPTION */}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Description
          </label>

          <span className="text-[11px] text-slate-400">
            {description.length}/1000
          </span>
        </div>

        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={1000}
          rows={6}
          disabled={disabled}
          placeholder="What's happening around campus?"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
        />
      </div>

      {/* CATEGORY */}

      <div className="mt-5">
        <label className="mb-2 block text-xs font-semibold text-slate-800 dark:text-slate-200">
          Category
        </label>

        <select
          value={category}
          disabled={disabled}
          onChange={(event) =>
            onCategoryChange(event.target.value as CreatePostData["category"])
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="GENERAL">General</option>

          <option value="EVENT">Event</option>

          <option value="NEWS">News</option>

          <option value="ANNOUNCEMENT">Announcement</option>

          <option value="ACHIEVEMENT">Achievement</option>
        </select>
      </div>
    </section>
  );
};

export default PostDetailsForm;
