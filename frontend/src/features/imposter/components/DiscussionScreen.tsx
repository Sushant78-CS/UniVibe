import { MessageCircle, Users } from "lucide-react";

type DiscussionScreenProps = {
  players: {
    id: number;
    name: string;
  }[];
  onStartVoting: () => void;
};

export default function DiscussionScreen({
  players,
  onStartVoting,
}: DiscussionScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-lg items-center">
        <div className="w-full">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <MessageCircle size={36} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
              Phase 2
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Discussion
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-neutral-400">
              Talk about the secret word. Give clues without making the word too
              obvious.
            </p>
          </div>

          {/* Players */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                <Users size={18} />
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Players
                </p>

                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {players.length} people are playing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-500/5">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Don't reveal the word
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
              Describe it, but don't say it directly. The Imposter is listening
              and trying to figure it out.
            </p>
          </div>

          {/* Start voting */}
          <button
            type="button"
            onClick={onStartVoting}
            className="mt-6 w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.99]"
          >
            Start Voting
          </button>
        </div>
      </div>
    </div>
  );
}
