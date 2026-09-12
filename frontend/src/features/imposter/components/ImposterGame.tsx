import ImposterSetup from "./ImposterSetup";
import SecretRoleScreen from "./SecretRoleScreen";
import DiscussionScreen from "./DiscussionScreen";
import VotingScreen from "./VotingScreen";
import ResultScreen from "./ResultScreen";

import { useImposterGame } from "../hooks/useImposterGame";

export default function ImposterGame() {
  const {
    playerCount,
    players,
    updatePlayerCount,
    updatePlayerName,

    game,
    currentRevealPlayer,
    isRevealVisible,

    revealSecret,
    nextRevealPlayer,

    startVoting,

    castVote,
    finishVoting,

    startGame,
    restartGame,
    backToSetup,

    minPlayers,
    maxPlayers,
  } = useImposterGame();

  /*
   * No game has started yet.
   * Show setup screen.
   */
  if (!game) {
    return (
      <ImposterSetup
        playerCount={playerCount}
        minPlayers={minPlayers}
        maxPlayers={maxPlayers}
        players={players}
        onPlayerCountChange={updatePlayerCount}
        onPlayerNameChange={updatePlayerName}
        onStart={startGame}
      />
    );
  }

  /*
   * Secret reveal phase.
   */
  if (game.phase === "REVEAL" && currentRevealPlayer) {
    const isImposter = currentRevealPlayer.id === game.imposterId;

    const isLastPlayer = game.currentRevealIndex === game.players.length - 1;

    return (
      <SecretRoleScreen
        playerName={currentRevealPlayer.name}
        word={game.word}
        hint={game.hint}
        category={game.category}
        isImposter={isImposter}
        isRevealed={isRevealVisible}
        isLastPlayer={isLastPlayer}
        onReveal={revealSecret}
        onNext={nextRevealPlayer}
      />
    );
  }

  /*
   * Discussion phase.
   */
  if (game.phase === "DISCUSSION") {
    return (
      <DiscussionScreen players={game.players} onStartVoting={startVoting} />
    );
  }

  /*
   * Voting phase.
   */
  if (game.phase === "VOTING") {
    return (
      <VotingScreen
        players={game.players}
        votes={game.votes}
        onVote={castVote}
        onFinishVoting={finishVoting}
      />
    );
  }

  /*
   * Result phase.
   */
  if (game.phase === "RESULT") {
    return (
      <ResultScreen
        players={game.players}
        word={game.word}
        imposterId={game.imposterId}
        eliminatedPlayerId={game.eliminatedPlayerId}
        imposterCaught={game.imposterCaught}
        imposterWon={game.imposterWon}
        onPlayAgain={restartGame}
        onBackToSetup={backToSetup}
      />
    );
  }

  return null;
}
