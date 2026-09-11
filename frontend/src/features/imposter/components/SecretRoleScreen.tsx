import { ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";

type SecretRoleScreenProps = {
  playerName: string;
  word: string;
  hint: string;
  category: string;
  isImposter: boolean;
  isRevealed: boolean;
  isLastPlayer: boolean;
  onReveal: () => void;
  onNext: () => void;
};

export default function SecretRoleScreen({
  playerName,
  word,
  hint,
  category,
  isImposter,
  isRevealed,
  isLastPlayer,
  onReveal,
  onNext,
}: SecretRoleScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-lg items-center">
        <div className="w-full">
          {/* Player indicator */}
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              Secret role
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {playerName}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">
              Make sure nobody else is looking.
            </p>
          </div>

          {/* Secret card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            {!isRevealed ? (
              <>
                {/* Hidden state */}
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                    <Eye size={34} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Your secret is ready
                  </h2>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-neutral-400">
                    Tap below to see your role. Do not show it to anyone else.
                  </p>

                  <button
                    type="button"
                    onClick={onReveal}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.99]"
                  >
                    <Eye size={18} />
                    Reveal My Secret
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Revealed state */}
                {isImposter ? (
                  <div className="text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      <ShieldAlert size={38} />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500 dark:text-red-400">
                      Secret role
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-red-600 dark:text-red-400">
                      YOU ARE THE IMPOSTER
                    </h2>

                    <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-left dark:bg-neutral-800">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                        Your clue
                      </p>

                      <p className="mt-2 text-base font-medium leading-6 text-slate-700 dark:text-neutral-200">
                        {hint}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 p-5 text-left dark:border-neutral-700">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                        Category
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                        {category}
                      </p>
                    </div>

                    <p className="mt-6 text-xs leading-5 text-slate-400 dark:text-neutral-500">
                      Blend in during the discussion. Try to figure out the
                      secret word without getting caught.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <Eye size={38} />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
                      The secret word is
                    </p>

                    <h2 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
                      {word}
                    </h2>

                    <div className="mt-8 rounded-2xl border border-slate-200 p-5 text-left dark:border-neutral-700">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                        Category
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                        {category}
                      </p>
                    </div>

                    <p className="mt-6 text-xs leading-5 text-slate-400 dark:text-neutral-500">
                      Remember the word. Don't say it directly during the
                      discussion.
                    </p>
                  </div>
                )}

                {/* Pass phone */}
                <div className="mt-8 border-t border-slate-100 pt-6 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={onNext}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.99]"
                  >
                    <EyeOff size={18} />

                    {isLastPlayer
                      ? "Hide & Start Discussion"
                      : "Hide & Pass Phone"}

                    <ArrowRight size={18} />
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-400 dark:text-neutral-500">
                    Make sure the next player cannot see your secret.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Progress */}
          <div className="mt-6 flex justify-center gap-1.5">
            {/* Progress dots will be added by the parent */}
          </div>
        </div>
      </div>
    </div>
  );
}
