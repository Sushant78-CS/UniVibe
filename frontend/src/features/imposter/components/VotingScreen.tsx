import { Check, Vote, Users } from "lucide-react";
import { useState } from "react";

type Player = {
  id: number;
  name: string;
};

type VotingScreenProps = {
  players: Player[];
  votes: Record<number, number>;
  onVote: (voterId: number, targetId: number) => void;
  onFinishVoting: () => void;
};

export default function VotingScreen({
  players,
  votes,
  onVote,
  onFinishVoting,
}: VotingScreenProps) {
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);

  const currentVoter = players[currentVoterIndex];

  const selectedPlayerId = currentVoter ? votes[currentVoter.id] : undefined;

  const hasVoted = selectedPlayerId !== undefined;

  const handleVote = (targetId: number) => {
    if (!currentVoter) return;

    onVote(currentVoter.id, targetId);
  };

  const handleNext = () => {
    if (!hasVoted) return;

    if (currentVoterIndex === players.length - 1) {
      onFinishVoting();
      return;
    }

    setCurrentVoterIndex((index) => index + 1);
  };

  if (!currentVoter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-lg items-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Vote size={36} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
              Phase 3
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Time to Vote
            </h1>

            <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">
              Pass the phone to the player shown below.
            </p>
          </div>

          {/* Current voter */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Users size={20} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              It&apos;s your turn
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {currentVoter.name}
            </h2>

            <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
              Choose who you think is the Imposter.
            </p>
          </div>

          {/* Players */}
          <div className="space-y-2">
            {players.map((player) => {
              const isSelected = selectedPlayerId === player.id;

              const isSelf = player.id === currentVoter.id;

              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={isSelf}
                  onClick={() => handleVote(player.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-500/10"
                      : "border-slate-200 bg-white hover:border-violet-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  } ${isSelf ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {player.name}
                      </p>

                      {isSelf && (
                        <p className="text-xs text-slate-400 dark:text-neutral-500">
                          You
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">
                      <Check size={17} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Continue */}
          <button
            type="button"
            disabled={!hasVoted}
            onClick={handleNext}
            className="mt-6 w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentVoterIndex === players.length - 1
              ? "Reveal Result"
              : "Next Player"}
          </button>

          {/* Progress */}
          <div className="mt-5 flex justify-center gap-1.5">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`h-1.5 rounded-full transition-all ${
                  index <= currentVoterIndex
                    ? "w-6 bg-violet-600"
                    : "w-2 bg-slate-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-slate-400 dark:text-neutral-500">
            Vote privately. Don&apos;t show your choice to anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
