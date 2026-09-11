export type GamePhase = "SETUP" | "REVEAL" | "DISCUSSION" | "VOTING" | "RESULT";

export type Player = {
  id: number;
  name: string;
};

export type ImposterWord = {
  word: string;
  hint: string;
  category: string;
};

export type VoteMap = Record<number, number>;

export type GameState = {
  players: Player[];

  word: string;
  hint: string;
  category: string;

  imposterId: number;

  phase: GamePhase;

  currentRevealIndex: number;

  votes: VoteMap;

  eliminatedPlayerId: number | null;

  imposterCaught: boolean | null;

  imposterGuess: string | null;

  imposterWon: boolean | null;
};
