// games types: описывает TypeScript-структуры данных для мини-игр.
import type { FeatherIconName } from '$types/icons';

export type GameId = 'memory' | 'sudoku' | 'minesweeper' | '2048';

export type GameCard = {
  id: GameId;
  title: string;
  icon: FeatherIconName;
  color: string;
  desc: string;
  iqReward: number;
  points: string;
  locked?: boolean;
};

export type DailyChallenge = {
  gameId: GameId;
  title: string;
  prize: string;
  icon: FeatherIconName;
  accentColor: string;
  colors: [string, string];
};

export type Game2048Direction = 'up' | 'down' | 'left' | 'right';

export type Game2048Tile = {
  id: number;
  row: number;
  col: number;
  value: number;
  isNew?: boolean;
  isMerged?: boolean;
};

export type MinesweeperCell = {
  r: number;
  c: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export type SudokuCell = {
  r: number;
  c: number;
  value: number;
  original: boolean;
  error: boolean;
};
