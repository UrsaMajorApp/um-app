/**
 * diagnosticData.ts
 *
 * Single source of truth for the "Explorers" (6–8 y.o.) diagnostic module.
 *
 * ────────────────────────────────────────────────────────────────────────
 * FOR BACKEND DEVELOPERS:
 *   Every constant exported below is JSON-serialisable.  When the API is
 *   ready, replace these imports with fetch() calls — the frontend code
 *   (hooks + components) consumes the **same shapes** and will not break.
 * ────────────────────────────────────────────────────────────────────────
 */

// ─── Shared types ────────────────────────────────────────────────────────

export type SkillCategory = 'tech' | 'art' | 'nature' | 'sport';

export interface BasicCard {
  id: string; // e.g. "B01"
  category: SkillCategory;
  /** Primary skill vector this card measures. */
  vector: string;
  /** Large emoji shown on the card (fallback for missing images). */
  emoji: string;
  /** Label shown below the emoji. */
  label: string;
  /** Audio question read aloud by the mascot. */
  audioQuestion: string;
}

export interface TaskOption {
  id: number;
  /** Emoji or tiny text label. */
  emoji: string;
  label: string;
  /** Points awarded per skill when this option is selected. */
  scoreMap: Record<string, number>;
}

export interface ProTask {
  id: string; // e.g. "P01"
  type:
    | 'analogy'
    | 'classification'
    | 'spatial'
    | 'counting'
    | 'sequence'
    | 'empathy'
    | 'cooperation'
    | 'leadership';
  /** Audio question read aloud by the mascot. */
  audioQuestion: string;
  /** Hint text shown on screen (minimal, icons preferred). */
  visualHint?: string;
  options: TaskOption[];
  /** Index of the "correct" answer (for scoring). -1 if no single correct. */
  correctIndex: number;
}

/** One tap / interaction event collected silently. */
export interface StealthEvent {
  taskId: string;
  enteredAt: number; // Date.now()
  answeredAt: number; // Date.now()
  attempts: number;
  selectedOptionId: number;
  correct: boolean;
}

export interface DiagnosticSession {
  userId: string;
  childId: string;
  ageGroup: '6-8';
  tier: 'basic' | 'pro';
  basicSwipes: { cardId: string; liked: boolean; timestamp: number }[];
  proEvents: StealthEvent[];
  startedAt: number;
  finishedAt?: number;
}

// ─── Skill vector mapping ───────────────────────────────────────────────

export const SKILL_VECTORS: Record<SkillCategory, { primary: string; secondary: string }> = {
  tech: {
    primary: 'Пространственная логика',
    secondary: 'Конструктивное мышление',
  },
  art: { primary: 'Креативность', secondary: 'Образное мышление' },
  nature: { primary: 'Исследовательский навык', secondary: 'Наблюдательность' },
  sport: { primary: 'Кинестетический интеллект', secondary: 'Энергичность' },
};

// ─── BASIC: 12 Swipe Cards ──────────────────────────────────────────────

export const BASIC_CARDS: BasicCard[] = [
  {
    id: 'B01',
    category: 'tech',
    vector: 'Пространственная логика',
    emoji: '🧱',
    label: 'Конструктор',
    audioQuestion: 'Любишь собирать башни и конструкторы?',
  },
  {
    id: 'B02',
    category: 'tech',
    vector: 'Пространственная логика',
    emoji: '🤖',
    label: 'Робот',
    audioQuestion: 'Хочешь управлять роботами?',
  },
  {
    id: 'B03',
    category: 'tech',
    vector: 'Пространственная логика',
    emoji: '🎮',
    label: 'Планшет с игрой',
    audioQuestion: 'Нравится играть в развивающие игры на планшете?',
  },
  {
    id: 'B04',
    category: 'art',
    vector: 'Креативность',
    emoji: '🎨',
    label: 'Палитра и кисть',
    audioQuestion: 'Тебе нравится рисовать красками?',
  },
  {
    id: 'B05',
    category: 'art',
    vector: 'Креативность',
    emoji: '🎤',
    label: 'Микрофон',
    audioQuestion: 'Любишь петь песни и выступать?',
  },
  {
    id: 'B06',
    category: 'art',
    vector: 'Креативность',
    emoji: '🏺',
    label: 'Пластилин',
    audioQuestion: 'Нравится лепить из пластилина?',
  },
  {
    id: 'B07',
    category: 'nature',
    vector: 'Наблюдательность',
    emoji: '🐶',
    label: 'Щенок',
    audioQuestion: 'Любишь играть с животными?',
  },
  {
    id: 'B08',
    category: 'nature',
    vector: 'Наблюдательность',
    emoji: '🌱',
    label: 'Цветок и лейка',
    audioQuestion: 'Интересно сажать растения и поливать их?',
  },
  {
    id: 'B09',
    category: 'nature',
    vector: 'Наблюдательность',
    emoji: '🔍',
    label: 'Лупа и жук',
    audioQuestion: 'Любишь рассматривать жуков на улице?',
  },
  {
    id: 'B10',
    category: 'sport',
    vector: 'Кинестетический интеллект',
    emoji: '⚽',
    label: 'Футбольный мяч',
    audioQuestion: 'Нравится бегать и играть с мячом?',
  },
  {
    id: 'B11',
    category: 'sport',
    vector: 'Кинестетический интеллект',
    emoji: '🚲',
    label: 'Велосипед',
    audioQuestion: 'Любишь кататься на велосипеде?',
  },
  {
    id: 'B12',
    category: 'sport',
    vector: 'Кинестетический интеллект',
    emoji: '🤸',
    label: 'Батут',
    audioQuestion: 'Тебе нравится прыгать на батуте?',
  },
];

// ─── PRO: 8 Quest Tasks ─────────────────────────────────────────────────

export const PRO_TASKS: ProTask[] = [
  {
    id: 'P01',
    type: 'analogy',
    audioQuestion: 'Птице нужно гнездо. А что нужно собаке?',
    visualHint: '🐦 ➔ 🪺   🐶 ➔ ?',
    correctIndex: 1,
    options: [
      { id: 0, emoji: '🦴', label: 'Косточка', scoreMap: {} },
      { id: 1, emoji: '🏠', label: 'Будка', scoreMap: { logical: 10 } },
      { id: 2, emoji: '🐱', label: 'Кот', scoreMap: {} },
    ],
  },
  {
    id: 'P02',
    type: 'classification',
    audioQuestion: 'Очисти путь! Кто здесь лишний?',
    visualHint: 'Найди лишнее!',
    correctIndex: 3,
    options: [
      { id: 0, emoji: '🚀', label: 'Ракета', scoreMap: {} },
      { id: 1, emoji: '🛰️', label: 'Спутник', scoreMap: {} },
      { id: 2, emoji: '👨‍🚀', label: 'Космонавт', scoreMap: {} },
      { id: 3, emoji: '👟', label: 'Ботинок', scoreMap: { logical: 10 } },
    ],
  },
  {
    id: 'P03',
    type: 'spatial',
    audioQuestion: 'Нам нужен синий астероид. Он выше красного, но ниже жёлтого!',
    visualHint: '🟡\n🔵\n🔴',
    correctIndex: 1,
    options: [
      { id: 0, emoji: '🔴', label: 'Красный', scoreMap: {} },
      { id: 1, emoji: '🔵', label: 'Синий', scoreMap: { spatial: 10 } },
      { id: 2, emoji: '🟡', label: 'Жёлтый', scoreMap: {} },
    ],
  },
  {
    id: 'P04',
    type: 'counting',
    audioQuestion: 'Для мотора нужно 5 кристаллов. У нас есть 3. Сколько добавить?',
    visualHint: '💎💎💎 + ? = 💎💎💎💎💎',
    correctIndex: 1,
    options: [
      { id: 0, emoji: '1️⃣', label: 'Один', scoreMap: {} },
      { id: 1, emoji: '2️⃣', label: 'Два', scoreMap: { math: 10 } },
      { id: 2, emoji: '4️⃣', label: 'Четыре', scoreMap: {} },
    ],
  },
  {
    id: 'P05',
    type: 'sequence',
    audioQuestion: 'Почини мост! Какая деталь следующая?',
    visualHint: '🔵 🟥 🔵 🟥 🔵 ❓',
    correctIndex: 1,
    options: [
      { id: 0, emoji: '🟢', label: 'Зелёный', scoreMap: {} },
      { id: 1, emoji: '🟥', label: 'Красный', scoreMap: { logical: 10 } },
      { id: 2, emoji: '🔵', label: 'Синий', scoreMap: {} },
    ],
  },
  {
    id: 'P06',
    type: 'empathy',
    audioQuestion: 'У инопланетянина забрали игрушку. Что он чувствует?',
    visualHint: '👽 — 🧸 = ?',
    correctIndex: 1,
    options: [
      { id: 0, emoji: '😠', label: 'Злость', scoreMap: { empathy: 5 } },
      { id: 1, emoji: '😢', label: 'Грусть', scoreMap: { empathy: 10 } },
      { id: 2, emoji: '😄', label: 'Радость', scoreMap: {} },
    ],
  },
  {
    id: 'P07',
    type: 'cooperation',
    audioQuestion: 'Робот упал. Что сделаем?',
    visualHint: '🤖💥',
    correctIndex: 1,
    options: [
      { id: 0, emoji: '🚶', label: 'Пройти мимо', scoreMap: {} },
      { id: 1, emoji: '🤝', label: 'Подать руку', scoreMap: { empathy: 10 } },
      { id: 2, emoji: '😂', label: 'Посмеяться', scoreMap: { empathy: -5 } },
    ],
  },
  {
    id: 'P08',
    type: 'leadership',
    audioQuestion: 'Впереди пещера. Как пойдём?',
    visualHint: '🕳️🔦',
    correctIndex: -1, // No single correct — personality-based
    options: [
      {
        id: 0,
        emoji: '🦸',
        label: 'Я пойду первым!',
        scoreMap: { leadership: 10 },
      },
      {
        id: 1,
        emoji: '🛡️',
        label: 'Спрячусь за робота',
        scoreMap: { caution: 10 },
      },
    ],
  },
];

// ─── Stealth Analytics Patterns ─────────────────────────────────────────

export interface StealthPattern {
  id: string;
  label: string;
  description: string;
  match: (event: StealthEvent) => boolean;
}

export const STEALTH_PATTERNS: StealthPattern[] = [
  {
    id: 'confident_analyst',
    label: 'Уверенный Аналитик',
    description: 'Высокая скорость нейронных связей.',
    match: (e) => e.answeredAt - e.enteredAt < 3000 && e.correct && e.attempts === 1,
  },
  {
    id: 'thoughtful',
    label: 'Вдумчивый / Тревожный',
    description: 'Осторожность, склонность к глубокому анализу.',
    match: (e) => e.answeredAt - e.enteredAt > 8000 && e.correct && e.attempts === 1,
  },
  {
    id: 'impulsive',
    label: 'Импульсивный',
    description: 'Возможный СДВГ-паттерн, невнимательность.',
    match: (e) => e.answeredAt - e.enteredAt < 2000 && !e.correct && e.attempts > 1,
  },
  {
    id: 'frustration',
    label: 'Зона фрустрации',
    description: 'Задание выше текущего когнитивного лимита.',
    match: (e) => e.answeredAt - e.enteredAt > 10000 && !e.correct && e.attempts > 1,
  },
];

// ─── Category color mapping (for UI) ────────────────────────────────────

export const CATEGORY_COLORS: Record<SkillCategory, { bg: string; text: string; accent: string }> =
  {
    tech: { bg: '#EDE9FE', text: '#6C5CE7', accent: '#8B5CF6' },
    art: { bg: '#FCE7F3', text: '#EC4899', accent: '#F472B6' },
    nature: { bg: '#ECFDF5', text: '#10B981', accent: '#34D399' },
    sport: { bg: '#FEF3C7', text: '#F59E0B', accent: '#FBBF24' },
  };
