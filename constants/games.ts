// Games constants: настройки мини-игр, уровней и отображения game-IQ.
import type { DailyChallenge, GameCard } from '$types/games';

export const GAME_2048_GRID_SIZE = 4;
export const GAME_2048_CELL_MARGIN = 10;
export const GAME_2048_MAX_BOARD_SIZE = 520;
export const GAME_2048_GRID_COORDINATES = Array.from({ length: GAME_2048_GRID_SIZE }, (_, row) => ({
  row,
  key: `row-${row}`,
  cells: Array.from({ length: GAME_2048_GRID_SIZE }, (__, col) => ({
    col,
    key: `cell-${row}-${col}`,
  })),
}));

export const GAME_2048_TILE_COLORS: Record<number, string> = {
  2: '#EEE4DA',
  4: '#EDE0C8',
  8: '#F2B179',
  16: '#F59563',
  32: '#F67C5F',
  64: '#F65E3B',
  128: '#EDCF72',
  256: '#EDCC61',
  512: '#EDC850',
  1024: '#EDC53F',
  2048: '#EDC22E',
};

export const GAME_2048_TEXT_COLORS: Record<string | number, string> = {
  2: '#776E65',
  4: '#776E65',
  default: 'white',
};

export const MEMORY_GRID_SIZE = 4;
export const MEMORY_GRID_GAP = 12;
export const MEMORY_MAX_BOARD_SIZE = 560;

export const MEMORY_EMOJIS = ['🚀', '🎨', '🧩', '🧪', '🧬', '🧠', '💻', '🎮'];
export const MEMORY_CARDS = MEMORY_EMOJIS.flatMap((emoji) => [
  { id: `${emoji}-first`, emoji },
  { id: `${emoji}-second`, emoji },
]);

export const MINESWEEPER_GRID_SIZE = 10;
export const MINESWEEPER_MINES_COUNT = 15;
export const MINESWEEPER_MAX_BOARD_SIZE = 620;
export const MINESWEEPER_NUMBER_COLORS: Record<number, string> = {
  1: '#3B82F6',
  2: '#10B981',
  3: '#EF4444',
  4: '#6366F1',
  5: '#8B5CF6',
  6: '#EC4899',
  7: '#F59E0B',
  8: '#1F2937',
};

export const SUDOKU_GRID_SIZE = 9;
export const SUDOKU_BOARD_PADDING = 24;
export const SUDOKU_MAX_BOARD_SIZE = 560;
export const SUDOKU_BASE_BOARD = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [4, 5, 6, 7, 8, 9, 1, 2, 3],
  [7, 8, 9, 1, 2, 3, 4, 5, 6],
  [2, 3, 1, 5, 6, 4, 8, 9, 7],
  [5, 6, 4, 8, 9, 7, 2, 3, 1],
  [8, 9, 7, 2, 3, 1, 5, 6, 4],
  [3, 1, 2, 6, 4, 5, 9, 7, 8],
  [6, 4, 5, 9, 7, 8, 3, 1, 2],
  [9, 7, 8, 3, 1, 2, 6, 4, 5],
];

export const GAMES: GameCard[] = [
  {
    id: 'memory',
    title: 'Пары',
    icon: 'cpu',
    color: '#6C5CE7',
    desc: 'Тренируй зрительную память',
    iqReward: 20,
    points: '+20 IQ',
  },
  {
    id: 'sudoku',
    title: 'Судоку',
    icon: 'grid',
    color: '#3B82F6',
    desc: 'Математическая логика',
    iqReward: 50,
    points: '+50 IQ',
  },
  {
    id: 'minesweeper',
    title: 'Сапер',
    icon: 'target',
    color: '#EF4444',
    desc: 'Стратегическое мышление',
    iqReward: 40,
    points: '+40 IQ',
  },
  {
    id: '2048',
    title: '2048',
    icon: 'hash',
    color: '#F59E0B',
    desc: 'Складывай числа',
    iqReward: 30,
    points: '+30 IQ',
  },
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    gameId: 'minesweeper',
    title: 'Турнир по Саперу',
    prize: 'Приз: 500 монет + редкий бейдж',
    icon: 'award',
    accentColor: '#F59E0B',
    colors: ['#1F2937', '#111827'],
  },
  {
    gameId: 'sudoku',
    title: 'Судоку-спринт',
    prize: 'Приз: 400 монет + серия логика',
    icon: 'grid',
    accentColor: '#3B82F6',
    colors: ['#172554', '#1E3A8A'],
  },
  {
    gameId: 'memory',
    title: 'Марафон памяти',
    prize: 'Приз: 300 монет + бейдж фокус',
    icon: 'cpu',
    accentColor: '#A78BFA',
    colors: ['#3B0764', '#581C87'],
  },
  {
    gameId: '2048',
    title: 'Комбо 2048',
    prize: 'Приз: 350 монет + буст IQ',
    icon: 'hash',
    accentColor: '#F59E0B',
    colors: ['#7C2D12', '#431407'],
  },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getLocalDayIndex(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

export function getDailyChallenge(date = new Date()) {
  return DAILY_CHALLENGES[getLocalDayIndex(date) % DAILY_CHALLENGES.length];
}

export function getGameById(id: string | string[] | undefined) {
  const gameId = Array.isArray(id) ? id[0] : id;
  return GAMES.find((game) => game.id === gameId);
}
