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
