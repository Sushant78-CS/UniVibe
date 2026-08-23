import { Search } from "lucide-react";

function SearchBar() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-950">
      <Search size={19} className="shrink-0 text-slate-400" />

      <input
        type="text"
        placeholder="Search students, interests..."
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
      />
    </div>
  );
}

export default SearchBar;
