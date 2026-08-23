import { Link } from "react-router";

interface NavTabProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavTab({ to, icon, label, active = false }: NavTabProps) {
  return (
    <Link
      to={to}
      className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-all active:scale-95 ${
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {icon}

      <span>{label}</span>
    </Link>
  );
}

export default NavTab;
