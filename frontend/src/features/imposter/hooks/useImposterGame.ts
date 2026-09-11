import { useCallback, useMemo, useState } from "react";

import { IMPOSTER_WORDS } from "../data/imposterWords";
import type { GameState, Player } from "../types/imposter";
import {
  createPlayers,
  getRandomImposter,
  getRandomWord,
  isCorrectGuess,
} from "../utils/gameUtils";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export function useImposterGame() {
  const [playerCount, setPlayerCount] = useState(4);

  const [players, setPlayers] = useState<Player[]>(createPlayers(4));

  const [game, setGame] = useState<GameState | null>(null);

  const [isRevealVisible, setIsRevealVisible] = useState(false);

  /**
   * Update the number of players.
   */
  const updatePlayerCount = useCallback((count: number) => {
    const safeCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));

    setPlayerCount(safeCount);
    setPlayers(createPlayers(safeCount));
  }, []);

  /**
   * Update a player's name.
   */
  const updatePlayerName = useCallback((playerId: number, name: string) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === playerId
          ? {
              ...player,
              name,
            }
          : player,
      ),
    );
  }, []);

  /**
   * Start a new game.
   */
  const startGame = useCallback(() => {
    const selectedWord = getRandomWord(IMPOSTER_WORDS);
    const selectedImposter = getRandomImposter(players);

    setGame({
      players,
      word: selectedWord.word,
      hint: selectedWord.hint,
      category: selectedWord.category,
      imposterId: selectedImposter.id,
      phase: "REVEAL",
      currentRevealIndex: 0,
      votes: {},
      eliminatedPlayerId: null,
      imposterCaught: null,
      imposterGuess: null,
      imposterWon: null,
    });

    setIsRevealVisible(false);
  }, [players]);

  /**
   * Get the player whose secret is currently being revealed.
   */
  const currentRevealPlayer = useMemo(() => {
    if (!game) {
      return null;
    }

    return game.players[game.currentRevealIndex] ?? null;
  }, [game]);

  /**
   * Reveal the secret for the current player.
   */
  const revealSecret = useCallback(() => {
    setIsRevealVisible(true);
  }, []);

  /**
   * Hide the secret again.
   */
  const hideSecret = useCallback(() => {
    setIsRevealVisible(false);
  }, []);

  /**
   * Move to the next player during the reveal phase.
   */
  const nextRevealPlayer = useCallback(() => {
    setGame((currentGame) => {
      if (!currentGame) {
        return currentGame;
      }

      const nextIndex = currentGame.currentRevealIndex + 1;

      if (nextIndex >= currentGame.players.length) {
        return {
          ...currentGame,
          phase: "DISCUSSION",
          currentRevealIndex: 0,
        };
      }

      return {
        ...currentGame,
        currentRevealIndex: nextIndex,
      };
    });

    setIsRevealVisible(false);
  }, []);

  /**
   * Move from discussion to voting.
   */
  const startVoting = useCallback(() => {
    setGame((currentGame) => {
      if (!currentGame) {
        return currentGame;
      }

      return {
        ...currentGame,
        phase: "VOTING",
        votes: {},
      };
    });
  }, []);

  /**
   * Register a vote.
   *
   * voterId = player casting the vote
   * targetId = player being voted for
   */
  const castVote = useCallback((voterId: number, targetId: number) => {
    setGame((currentGame) => {
      if (!currentGame) {
        return currentGame;
      }

      return {
        ...currentGame,
        votes: {
          ...currentGame.votes,
          [voterId]: targetId,
        },
      };
    });
  }, []);

  /**
   * Count all votes and determine the player with the
   * highest number of votes.
   */
  const finishVoting = useCallback(() => {
    setGame((currentGame) => {
      if (!currentGame) {
        return currentGame;
      }

      const voteCounts: Record<number, number> = {};

      Object.values(currentGame.votes).forEach((targetId) => {
        voteCounts[targetId] = (voteCounts[targetId] ?? 0) + 1;
      });

      let eliminatedPlayerId: number | null = null;
      let highestVotes = 0;

      Object.entries(voteCounts).forEach(([playerId, count]) => {
        const numericPlayerId = Number(playerId);

        if (count > highestVotes) {
          highestVotes = count;
          eliminatedPlayerId = numericPlayerId;
        }
      });

      const imposterCaught = eliminatedPlayerId === currentGame.imposterId;

      return {
        ...currentGame,
        phase: "RESULT",
        eliminatedPlayerId,
        imposterCaught,
        imposterGuess: null,
        imposterWon: null,
      };
    });
  }, []);

  /**
   * Let the caught Imposter make their final guess.
   */
  const submitImposterGuess = useCallback((guess: string) => {
    setGame((currentGame) => {
      if (!currentGame) {
        return currentGame;
      }

      const correct = isCorrectGuess(guess, currentGame.word);

      return {
        ...currentGame,
        imposterGuess: guess,
        imposterWon: correct,
      };
    });
  }, []);

  /**
   * Start another round with the same players.
   */
  const restartGame = useCallback(() => {
    const selectedWord = getRandomWord(IMPOSTER_WORDS);
    const selectedImposter = getRandomImposter(players);

    setGame({
      players,
      word: selectedWord.word,
      hint: selectedWord.hint,
      category: selectedWord.category,
      imposterId: selectedImposter.id,
      phase: "REVEAL",
      currentRevealIndex: 0,
      votes: {},
      eliminatedPlayerId: null,
      imposterCaught: null,
      imposterGuess: null,
      imposterWon: null,
    });

    setIsRevealVisible(false);
  }, [players]);

  /**
   * Return to setup.
   */
  const backToSetup = useCallback(() => {
    setGame(null);
    setIsRevealVisible(false);
  }, []);

  return {
    // Setup
    playerCount,
    players,
    updatePlayerCount,
    updatePlayerName,

    // Game
    game,
    currentRevealPlayer,
    isRevealVisible,

    // Reveal
    revealSecret,
    hideSecret,
    nextRevealPlayer,

    // Discussion
    startVoting,

    // Voting
    castVote,
    finishVoting,

    // Result
    submitImposterGuess,

    // Navigation
    startGame,
    restartGame,
    backToSetup,

    // Constants
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
  };
}
