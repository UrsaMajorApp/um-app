// Константы UI диагностики: цвета, подписи и параметры отображения диагностических карточек.
export const DIAGNOSTIC_SWIPE_THRESHOLD = 90;
export const DIAGNOSTIC_SWIPE_VELOCITY = 850;
export const DIAGNOSTIC_SWIPE_EXIT_DISTANCE = 1200;

export const PRO_QUEST_STAR_POSITIONS = [
  { id: 'star-alpha', top: '12%', left: '18%', size: 3, opacity: 0.62 },
  { id: 'star-beta', top: '18%', left: '72%', size: 4, opacity: 0.48 },
  { id: 'star-gamma', top: '25%', left: '42%', size: 2, opacity: 0.72 },
  { id: 'star-delta', top: '34%', left: '86%', size: 3, opacity: 0.38 },
  { id: 'star-epsilon', top: '45%', left: '9%', size: 5, opacity: 0.52 },
  { id: 'star-zeta', top: '52%', left: '64%', size: 2, opacity: 0.8 },
  { id: 'star-eta', top: '61%', left: '31%', size: 4, opacity: 0.45 },
  { id: 'star-theta', top: '69%', left: '78%', size: 3, opacity: 0.68 },
  { id: 'star-iota', top: '76%', left: '15%', size: 2, opacity: 0.58 },
  { id: 'star-kappa', top: '82%', left: '53%', size: 5, opacity: 0.34 },
  { id: 'star-lambda', top: '88%', left: '91%', size: 3, opacity: 0.5 },
  { id: 'star-mu', top: '8%', left: '51%', size: 2, opacity: 0.74 },
] as const;

export const REBELS_HACKATHON_SPEAKERS = {
  system: { name: 'СИСТЕМА', color: '#818CF8', bg: '#1E1B4B' },
  max: { name: 'Макс', color: '#38BDF8', bg: '#0F172A' },
  alice: { name: 'Алиса', color: '#E879F9', bg: '#1F0B2E' },
  bot: { name: 'Бот', color: '#34D399', bg: '#064E3B' },
  jury: { name: 'Жюри', color: '#FBBF24', bg: '#451A03' },
} as const;

export const CREATORS_NOVELLA_SPEAKER_CONFIG = {
  system: {
    name: '🖥️ СИСТЕМА',
    avatar: '🖥️',
    bubbleColor: '#1E1B4B',
    textColor: '#C7D2FE',
    nameColor: '#818CF8',
  },
  max: {
    name: '👦 Макс',
    avatar: '👦',
    bubbleColor: '#0F172A',
    textColor: '#BAE6FD',
    nameColor: '#38BDF8',
  },
  alice: {
    name: '👧 Алиса',
    avatar: '👧',
    bubbleColor: '#1F0B2E',
    textColor: '#F5D0FE',
    nameColor: '#E879F9',
  },
} as const;

export const CREATORS_NOVELLA_ACT_LABELS: Record<1 | 2 | 3, string> = {
  1: 'АКТ 1 · Вход в систему',
  2: 'АКТ 2 · Командная работа',
  3: 'АКТ 3 · Кризис',
};

export const ARCHITECTS_OS_MODULE_STYLES = {
  mail: {
    icon: '📧',
    title: 'Корпоративная Почта',
    bg: '#FFFFFF',
    headerBg: '#F3F4F6',
    color: '#4B5563',
  },
  slack: {
    icon: '💬',
    title: 'Чат Команды',
    bg: '#4A154B',
    headerBg: '#350D36',
    color: '#FFFFFF',
  },
  trello: {
    icon: '📊',
    title: 'Task Tracker',
    bg: '#0079BF',
    headerBg: '#005C91',
    color: '#FFFFFF',
  },
} as const;
