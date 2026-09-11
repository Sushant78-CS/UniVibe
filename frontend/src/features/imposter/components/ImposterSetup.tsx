import { Gamepad2, Minus, Plus, Users } from "lucide-react";

type ImposterSetupProps = {
  playerCount: number;
  minPlayers: number;
  maxPlayers: number;
  players: {
    id: number;
    name: string;
  }[];
  onPlayerCountChange: (count: number) => void;
  onPlayerNameChange: (playerId: number, name: string) => void;
  onStart: () => void;
};

export default function ImposterSetup({
  playerCount,
  minPlayers,
  maxPlayers,
  players,
  onPlayerCountChange,
  onPlayerNameChange,
  onStart,
}: ImposterSetupProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <Gamepad2 size={30} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Imposter
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">
            Find the player who doesn't know the word.
          </p>
        </div>

        {/* Player count */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Users size={18} />
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Number of players
              </p>

              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {minPlayers}–{maxPlayers} players
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => onPlayerCountChange(playerCount - 1)}
              disabled={playerCount <= minPlayers}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            >
              <Minus size={18} />
            </button>

            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {playerCount}
            </span>

            <button
              type="button"
              onClick={() => onPlayerCountChange(playerCount + 1)}
              disabled={playerCount >= maxPlayers}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Player names */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            Player names
          </h2>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  {index + 1}
                </div>

                <input
                  type="text"
                  value={player.name}
                  onChange={(event) =>
                    onPlayerNameChange(player.id, event.target.value)
                  }
                  placeholder={`Player ${index + 1}`}
                  maxLength={20}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Start */}
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.99]"
        >
          Start Game
        </button>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-neutral-500">
          One phone • Pass & play
        </p>
      </div>
    </div>
  );
}
