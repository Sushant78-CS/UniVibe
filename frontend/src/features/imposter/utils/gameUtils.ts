import type { ImposterWord, Player } from "../types/imposter";

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getRandomWord(words: ImposterWord[]): ImposterWord {
  return getRandomItem(words);
}

export function getRandomImposter(players: Player[]): Player {
  return getRandomItem(players);
}

export function createPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Player ${index + 1}`,
  }));
}

export function normalizeGuess(value: string): string {
  return value.trim().toLowerCase();
}

export function isCorrectGuess(guess: string, word: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(word);
}
