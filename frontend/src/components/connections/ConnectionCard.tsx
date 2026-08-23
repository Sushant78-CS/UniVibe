import { MessageCircle, UserRound } from "lucide-react";

export interface ConnectedPerson {
  connectionId: number;
  profileId: number;
  fullName: string;
  username: string;
  profileImage?: string | null;
}

interface ConnectionCardProps {
  person: ConnectedPerson;
  onViewProfile?: () => void;
  onMessage?: () => void;
}

const ConnectionCard = ({
  person,
  onViewProfile,
  onMessage,
}: ConnectionCardProps) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
      {/* Avatar */}
      <button
        type="button"
        onClick={onViewProfile}
        className="shrink-0"
        aria-label={`View ${person.fullName}'s profile`}
      >
        {person.profileImage ? (
          <img
            src={person.profileImage}
            alt={person.fullName}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <UserRound size={20} />
          </div>
        )}
      </button>

      {/* User info */}
      <button
        type="button"
        onClick={onViewProfile}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {person.fullName}
        </p>

        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          @{person.username}
        </p>
      </button>

      {/* Message */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMessage?.();
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-violet-50 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
        aria-label={`Message ${person.fullName}`}
      >
        <MessageCircle size={16} />
      </button>
    </div>
  );
};

export default ConnectionCard;
