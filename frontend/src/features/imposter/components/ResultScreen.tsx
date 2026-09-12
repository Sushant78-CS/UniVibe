import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";

type ResultScreenProps = {
  players: {
    id: number;
    name: string;
  }[];
  word: string;
  imposterId: number;
  eliminatedPlayerId: number | null;
  imposterCaught: boolean | null;
  imposterWon: boolean | null;
  onPlayAgain: () => void;
  onBackToSetup: () => void;
};

export default function ResultScreen({
  players,
  word,
  imposterId,
  eliminatedPlayerId,
  imposterCaught,
  imposterWon,
  onPlayAgain,
  onBackToSetup,
}: ResultScreenProps) {
  const imposter = players.find((player) => player.id === imposterId);

  const eliminatedPlayer = players.find(
    (player) => player.id === eliminatedPlayerId,
  );

  const imposterFinalWinner = imposterWon === true || imposterCaught === false;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="pt-8 text-center">
          <div
            className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
              imposterFinalWinner
                ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            }`}
          >
            {imposterFinalWinner ? (
              <Trophy size={38} />
            ) : (
              <CheckCircle2 size={38} />
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
            Final Result
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {imposterFinalWinner ? "The Imposter Wins!" : "The Players Win!"}
          </h1>
        </div>

        {/* Word reveal */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
            The secret word was
          </p>

          <div className="mt-3 flex items-center justify-center">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">
              {word}
            </h2>
          </div>
        </div>

        {/* Imposter */}
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-500/5">
          <p className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
            The Imposter
          </p>

          <p className="mt-1 text-xl font-black text-red-700 dark:text-red-300">
            {imposter?.name ?? "Unknown"}
          </p>
        </div>

        {/* Vote result */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
            Most voted player
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {eliminatedPlayer?.name ?? "No one"}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {imposterCaught ? (
              <>
                <CheckCircle2 size={17} className="text-emerald-500" />

                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  The Imposter was caught!
                </span>
              </>
            ) : (
              <>
                <XCircle size={17} className="text-red-500" />

                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  The group voted incorrectly.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3 pb-8">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.99]"
          >
            <RotateCcw size={18} />
            Play Again
          </button>

          <button
            type="button"
            onClick={onBackToSetup}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Change Players
          </button>
        </div>
      </div>
    </div>
  );
}
