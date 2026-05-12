// diagnosticData911: вопросы, варианты ответов, skill-векторы и scoring data для диагностики 9-11.
/**
 * diagnosticData911.ts
 *
 * Single source of truth for the "Creators" (9–11 y.o.) diagnostic module.
 *
 * BASIC  — 12 «Would You Rather» situations
 * PRO    — 30 RPG quest tasks ("Тайна Лаборатории 404"), 3 acts
 */

// ─── BASIC Types ────────────────────────────────────────────────────────────

export type BasicSkill911 =
  | 'creativity'
  | 'logic'
  | 'empathy'
  | 'leadership'
  | 'communication'
  | 'adaptability'
  | 'analytics'
  | 'teamwork';

export interface WYROption {
  label: string;
  skill: BasicSkill911;
}

export interface WYRCard {
  id: string; // e.g. "B01"
  situation: string;
  optionA: WYROption;
  optionB: WYROption;
}

// ─── PRO Types ───────────────────────────────────────────────────────────────

export type ProSkill911 =
  | 'logic'
  | 'spatial'
  | 'creativity'
  | 'collab'
  | 'communication'
  | 'growth';

export interface ProOption911 {
  id: number;
  label: string;
  scoreMap: Partial<Record<ProSkill911, number>>;
  isCorrect?: boolean; // for Act 1 cognitive tasks
}

export interface ProTask911 {
  id: string; // e.g. "P01"
  act: 1 | 2 | 3;
  construct: string;
  situation: string; // narrative shown on screen
  /** Speaker of the message: "system" | "max" | "alice" */
  speaker: 'system' | 'max' | 'alice';
  options: ProOption911[];
}

export interface StealthEvent911 {
  taskId: string;
  enteredAt: number;
  answeredAt: number;
  selectedOptionId: number;
  scoreMap: Partial<Record<ProSkill911, number>>;
}

// ─── BASIC: 12 WYR Cards ─────────────────────────────────────────────────────

export const WYR_CARDS: WYRCard[] = [
  {
    id: 'B01',
    situation: 'Задали сложный проект в группе. Твоя роль?',
    optionA: { label: 'Придумаю самую крутую идею', skill: 'creativity' },
    optionB: { label: 'Распределю, кто что делает', skill: 'leadership' },
  },
  {
    id: 'B02',
    situation: 'Подарили сложную настольную игру.',
    optionA: { label: 'Сначала внимательно прочитаю правила', skill: 'logic' },
    optionB: {
      label: 'Начну играть, разберёмся по ходу',
      skill: 'adaptability',
    },
  },
  {
    id: 'B03',
    situation: 'Друг забыл слова на школьной сцене.',
    optionA: { label: 'Громко подскажу ему из зала', skill: 'leadership' },
    optionB: { label: 'Улыбнусь, чтобы он не паниковал', skill: 'empathy' },
  },
  {
    id: 'B04',
    situation: 'Вы заблудились в лесу (в игре или в жизни).',
    optionA: { label: 'Залезу повыше, чтобы осмотреться', skill: 'logic' },
    optionB: { label: 'Буду подбадривать команду', skill: 'communication' },
  },
  {
    id: 'B05',
    situation: 'У тебя есть час свободного времени.',
    optionA: { label: 'Буду рисовать / снимать видео', skill: 'creativity' },
    optionB: { label: 'Пойду гулять с компанией', skill: 'communication' },
  },
  {
    id: 'B06',
    situation: 'Вы с родителями собираете шкаф из ИКЕА.',
    optionA: { label: 'Буду подавать детали и болтики', skill: 'teamwork' },
    optionB: { label: 'Буду читать инструкцию и руководить', skill: 'logic' },
  },
  {
    id: 'B07',
    situation: 'В классе новенький, он ни с кем не говорит.',
    optionA: { label: 'Подойду познакомиться первым', skill: 'empathy' },
    optionB: { label: 'Подожду, пока он сам освоится', skill: 'adaptability' },
  },
  {
    id: 'B08',
    situation: 'Нужно сделать презентацию. Что важнее?',
    optionA: { label: 'Красивый дизайн и картинки', skill: 'creativity' },
    optionB: { label: 'Точные факты и цифры', skill: 'logic' },
  },
  {
    id: 'B09',
    situation: 'Ты придумал новую игру для двора.',
    optionA: { label: 'Сразу расскажу всем правила', skill: 'leadership' },
    optionB: {
      label: 'Сначала протестирую с лучшим другом',
      skill: 'analytics',
    },
  },
  {
    id: 'B10',
    situation: 'Учитель задал вопрос, на который нет ответа.',
    optionA: { label: 'Погуглю и найду точный факт', skill: 'logic' },
    optionB: { label: 'Придумаю свою невероятную теорию', skill: 'creativity' },
  },
  {
    id: 'B11',
    situation: 'Твоя команда проигрывает в спорте.',
    optionA: {
      label: 'Буду играть ещё агрессивнее ради победы',
      skill: 'leadership',
    },
    optionB: {
      label: 'Сплочу команду: «Главное — участие!»',
      skill: 'empathy',
    },
  },
  {
    id: 'B12',
    situation: 'Ты хочешь завести блог. О чём он будет?',
    optionA: {
      label: 'О том, как собирать вещи / проходить игры',
      skill: 'analytics',
    },
    optionB: {
      label: 'Развлекательный: пранки и челленджи',
      skill: 'creativity',
    },
  },
];

// ─── Skill label map ──────────────────────────────────────────────────────────

export const SKILL_LABELS_911: Record<BasicSkill911, string> = {
  creativity: 'Креативность',
  logic: 'Логика',
  empathy: 'Эмпатия',
  leadership: 'Лидерство',
  communication: 'Коммуникация',
  adaptability: 'Адаптивность',
  analytics: 'Аналитика',
  teamwork: 'Командная работа',
};

// ─── PRO: 30 Quest Tasks ──────────────────────────────────────────────────────

export const PRO_TASKS_911: ProTask911[] = [
  // ── ACT 1: Intelligence & Attention ──────────────────────────────────────
  {
    id: 'P01',
    act: 1,
    construct: 'Логика',
    speaker: 'system',
    situation: 'Дверь закрыта. Код: 🌞 🌙 ⭐ ⭐ 🌙 …что следующее?',
    options: [
      { id: 0, label: '⭐ Звезда', scoreMap: {} },
      { id: 1, label: '🌙 Луна', scoreMap: {} },
      { id: 2, label: '🌞 Солнце', scoreMap: { logic: 10 }, isCorrect: true },
    ],
  },
  {
    id: 'P02',
    act: 1,
    construct: 'Пространство',
    speaker: 'system',
    situation: 'Схема вентиляции. Стрелка указывает на Север, мы смотрим на Восток. Куда идти?',
    options: [
      { id: 0, label: '← Влево', scoreMap: { spatial: 10 }, isCorrect: true },
      { id: 1, label: '→ Вправо', scoreMap: {} },
      { id: 2, label: '↑ Прямо', scoreMap: {} },
    ],
  },
  {
    id: 'P03',
    act: 1,
    construct: 'Классификация',
    speaker: 'system',
    situation: 'Пароль — «лишнее» слово: Микроскоп, Телескоп, Лупа, Кирпич.',
    options: [
      { id: 0, label: 'Телескоп', scoreMap: {} },
      { id: 1, label: 'Кирпич', scoreMap: { logic: 10 }, isCorrect: true },
      { id: 2, label: 'Лупа', scoreMap: {} },
    ],
  },
  {
    id: 'P04',
    act: 1,
    construct: 'Внимание',
    speaker: 'system',
    situation: 'Лампы мигают: 🔵 🔴 🟢. Повтори код!',
    options: [
      { id: 0, label: '🔴 🔵 🟢', scoreMap: {} },
      { id: 1, label: '🔵 🔴 🟢', scoreMap: { logic: 10 }, isCorrect: true },
      { id: 2, label: '🟢 🔵 🔴', scoreMap: {} },
    ],
  },
  {
    id: 'P05',
    act: 1,
    construct: 'Математика',
    speaker: 'system',
    situation: 'На столе 3 красных колбы и 5 синих. Сколько убрать синих, чтобы стало поровну?',
    options: [
      { id: 0, label: 'Одну', scoreMap: {} },
      { id: 1, label: 'Две', scoreMap: { logic: 10 }, isCorrect: true },
      { id: 2, label: 'Три', scoreMap: {} },
    ],
  },
  {
    id: 'P06',
    act: 1,
    construct: 'Аналогия',
    speaker: 'system',
    situation: 'Подсказка на стене: «Лёд — Вода, Камень — ?»',
    options: [
      { id: 0, label: 'Песок', scoreMap: { logic: 10 }, isCorrect: true },
      { id: 1, label: 'Огонь', scoreMap: {} },
      { id: 2, label: 'Ветер', scoreMap: {} },
    ],
  },
  {
    id: 'P07',
    act: 1,
    construct: 'Пространство',
    speaker: 'system',
    situation: 'Нужно повернуть шестерёнку генератора. Куда крутим?',
    options: [
      { id: 0, label: 'По часовой ↻', scoreMap: {} },
      {
        id: 1,
        label: 'Против часовой ↺',
        scoreMap: { spatial: 10 },
        isCorrect: true,
      },
      { id: 2, label: 'Оставить', scoreMap: {} },
    ],
  },
  {
    id: 'P08',
    act: 1,
    construct: 'Алгоритмы',
    speaker: 'system',
    situation: 'Инструкция: «Сначала нажми красную кнопку, затем потяни рычаг.»',
    options: [
      { id: 0, label: 'Тяну рычаг', scoreMap: {} },
      {
        id: 1,
        label: 'Жму красную кнопку',
        scoreMap: { logic: 10 },
        isCorrect: true,
      },
      { id: 2, label: 'Жму всё сразу', scoreMap: {} },
    ],
  },
  {
    id: 'P09',
    act: 1,
    construct: 'Натуралист',
    speaker: 'system',
    situation: 'Робот просит отсортировать мусор. Куда кинуть яблоко?',
    options: [
      { id: 0, label: '🗑️ Пластик', scoreMap: {} },
      { id: 1, label: '🌿 Органика', scoreMap: { logic: 10 }, isCorrect: true },
      { id: 2, label: '🫙 Стекло', scoreMap: {} },
    ],
  },
  {
    id: 'P10',
    act: 1,
    construct: 'Логика (ШТУР)',
    speaker: 'system',
    situation: 'На весах 2 кубика весят как 1 шар. Что тяжелее?',
    options: [
      { id: 0, label: 'Шар ⚽', scoreMap: { logic: 10 }, isCorrect: true },
      { id: 1, label: 'Кубик 🟦', scoreMap: {} },
      { id: 2, label: 'Одинаково', scoreMap: {} },
    ],
  },
  // ── ACT 2: Soft Skills / 4K ───────────────────────────────────────────────
  {
    id: 'P11',
    act: 2,
    construct: 'Коллаборация',
    speaker: 'max',
    situation: 'Макс: «Я устал, уходим! Тут страшно!»',
    options: [
      { id: 0, label: '«Соберись!»', scoreMap: {} },
      { id: 1, label: '«Я иду первым» — поддержать', scoreMap: { collab: 10 } },
      { id: 2, label: '«Уходим»', scoreMap: {} },
    ],
  },
  {
    id: 'P12',
    act: 2,
    construct: 'Коммуникация',
    speaker: 'alice',
    situation: 'Алиса и Макс спорят, кто понесёт фонарь.',
    options: [
      { id: 0, label: '«Я заберу, я лидер»', scoreMap: {} },
      {
        id: 1,
        label: '«Несёт тот, у кого лучше зрение»',
        scoreMap: { communication: 10 },
      },
      { id: 2, label: '«Решайте сами»', scoreMap: {} },
    ],
  },
  {
    id: 'P13',
    act: 2,
    construct: 'Креативность',
    speaker: 'system',
    situation: 'Провод искрит. Изоленты нет. Чем обмотаем?',
    options: [
      { id: 0, label: 'Будем искать скотч', scoreMap: {} },
      { id: 1, label: 'Резиной от кроссовка', scoreMap: { creativity: 10 } },
      { id: 2, label: 'Оставим так', scoreMap: {} },
    ],
  },
  {
    id: 'P14',
    act: 2,
    construct: 'Лидерство',
    speaker: 'system',
    situation: 'Мост выдержит только двоих. Вас трое.',
    options: [
      { id: 0, label: '«Вы идите, я останусь»', scoreMap: {} },
      { id: 1, label: '«Перекиньте мне верёвку»', scoreMap: { collab: 10 } },
      { id: 2, label: '«Я и Макс идём»', scoreMap: {} },
    ],
  },
  {
    id: 'P15',
    act: 2,
    construct: 'Эмпатия',
    speaker: 'alice',
    situation: 'Алиса разбила колено и плачет.',
    options: [
      { id: 0, label: '«Хватит ныть!»', scoreMap: {} },
      {
        id: 1,
        label: '«Перевяжем, обопрись на меня»',
        scoreMap: { communication: 10 },
      },
      { id: 2, label: '«Оставим её тут»', scoreMap: {} },
    ],
  },
  {
    id: 'P16',
    act: 2,
    construct: 'Делегирование',
    speaker: 'system',
    situation: 'Нужно нажать 3 кнопки в разных углах одновременно.',
    options: [
      { id: 0, label: 'Попытаюсь сам', scoreMap: {} },
      { id: 1, label: 'Распределю всех по углам', scoreMap: { collab: 10 } },
      { id: 2, label: 'Будем жать по очереди', scoreMap: {} },
    ],
  },
  {
    id: 'P17',
    act: 2,
    construct: 'Критическое мышление',
    speaker: 'max',
    situation: 'ИИ говорит: «Идите в красную дверь». Макс верит.',
    options: [
      { id: 0, label: '«Идём, раз ИИ говорит»', scoreMap: {} },
      { id: 1, label: '«Сначала проверим датчиками»', scoreMap: { logic: 10 } },
      { id: 2, label: '«Идём в синюю назло»', scoreMap: {} },
    ],
  },
  {
    id: 'P18',
    act: 2,
    construct: 'Креативность',
    speaker: 'system',
    situation: 'Нужно достать ключ с полки. Есть швабра и скотч.',
    options: [
      { id: 0, label: 'Прыгать до посинения', scoreMap: {} },
      {
        id: 1,
        label: 'Примотать скотч к швабре',
        scoreMap: { creativity: 10 },
      },
      { id: 2, label: 'Искать стул', scoreMap: {} },
    ],
  },
  {
    id: 'P19',
    act: 2,
    construct: 'Медиация',
    speaker: 'alice',
    situation: 'Макс сломал прибор. Алиса на него кричит.',
    options: [
      { id: 0, label: 'Присоединюсь к Алисе', scoreMap: {} },
      {
        id: 1,
        label: '«Успокойтесь, починим»',
        scoreMap: { communication: 10 },
      },
      { id: 2, label: 'Буду молчать', scoreMap: {} },
    ],
  },
  {
    id: 'P20',
    act: 2,
    construct: 'Креативность',
    speaker: 'system',
    situation: 'Нас заметил дрон! Нужно его отвлечь.',
    options: [
      { id: 0, label: 'Побежим от него', scoreMap: {} },
      {
        id: 1,
        label: 'Бросим банку в другой угол',
        scoreMap: { creativity: 10 },
      },
      { id: 2, label: 'Замрем', scoreMap: {} },
    ],
  },
  // ── ACT 3: Crisis & Growth Mindset ───────────────────────────────────────
  {
    id: 'P21',
    act: 3,
    construct: 'Growth Mindset',
    speaker: 'system',
    situation: 'СИСТЕМА: ОШИБКА! Дверь заблокирована.',
    options: [
      { id: 0, label: '«Всё, мы проиграли»', scoreMap: {} },
      { id: 1, label: '«Ищем вентиляцию»', scoreMap: { growth: 15 } },
      { id: 2, label: '«Это Макс виноват!»', scoreMap: {} },
    ],
  },
  {
    id: 'P22',
    act: 3,
    construct: 'Упорство',
    speaker: 'max',
    situation: 'Нашли рубильник под током. Макс хочет рискнуть.',
    options: [
      { id: 0, label: '«Давай, рискнём!»', scoreMap: {} },
      { id: 1, label: '«Наденем перчатки»', scoreMap: { logic: 10 } },
      { id: 2, label: '«Не трогаем»', scoreMap: {} },
    ],
  },
  {
    id: 'P23',
    act: 3,
    construct: 'Гибкость',
    speaker: 'system',
    situation: 'План лаборатории сгорел. Что делаем?',
    options: [
      { id: 0, label: '«Мы обречены»', scoreMap: {} },
      {
        id: 1,
        label: '«Нарисуем карту углём»',
        scoreMap: { creativity: 10, growth: 10 },
      },
      { id: 2, label: '«Идём наугад»', scoreMap: {} },
    ],
  },
  {
    id: 'P24',
    act: 3,
    construct: 'Стресс-тест',
    speaker: 'system',
    situation: '⏱️ Таймер тикает (10 сек)! Какой провод режем?',
    options: [
      { id: 0, label: '🔴 Красный (Паника)', scoreMap: {} },
      { id: 1, label: '🔵 Синий', scoreMap: { logic: 10 } },
      { id: 2, label: 'Ждём взрыва', scoreMap: {} },
    ],
  },
  {
    id: 'P25',
    act: 3,
    construct: 'Просоциальность',
    speaker: 'max',
    situation: 'Выход открыт, но Макс застрял.',
    options: [
      { id: 0, label: 'Выбегу один', scoreMap: {} },
      { id: 1, label: 'Вернусь за Максом', scoreMap: { collab: 15 } },
      { id: 2, label: '«Ползи быстрее!»', scoreMap: {} },
    ],
  },
  {
    id: 'P26',
    act: 3,
    construct: 'Критика',
    speaker: 'alice',
    situation: 'Алиса говорит: «Твоя идея была глупой».',
    options: [
      { id: 0, label: '«Сама ты глупая!»', scoreMap: {} },
      {
        id: 1,
        label: '«Давай обсудим почему»',
        scoreMap: { growth: 10, communication: 10 },
      },
      { id: 2, label: '«Мне всё равно»', scoreMap: {} },
    ],
  },
  {
    id: 'P27',
    act: 3,
    construct: 'Рефлексия',
    speaker: 'system',
    situation: 'Квест пройден! Что помогло выжить?',
    options: [
      { id: 0, label: '«Я самый умный»', scoreMap: {} },
      { id: 1, label: '«Мы работали как команда»', scoreMap: { collab: 10 } },
      { id: 2, label: '«Просто повезло»', scoreMap: {} },
    ],
  },
  {
    id: 'P28',
    act: 3,
    construct: 'Упорство',
    speaker: 'system',
    situation: 'Дверь тяжёлая. Что делаем?',
    options: [
      { id: 0, label: 'Толкну и брошу', scoreMap: {} },
      {
        id: 1,
        label: 'Толкаем вместе на счёт «3»',
        scoreMap: { collab: 10, growth: 10 },
      },
      { id: 2, label: 'Ждём спасателей', scoreMap: {} },
    ],
  },
  {
    id: 'P29',
    act: 3,
    construct: 'Аналитика',
    speaker: 'system',
    situation: 'СИСТЕМА: Оцените сложность миссии.',
    options: [
      { id: 0, label: '«Слишком легко»', scoreMap: {} },
      { id: 1, label: '«Было трудно, но интересно»', scoreMap: { growth: 10 } },
      { id: 2, label: '«Слишком сложно»', scoreMap: {} },
    ],
  },
  {
    id: 'P30',
    act: 3,
    construct: 'Финал',
    speaker: 'system',
    situation: 'ИИ: «Готовы стать Исследователями?»',
    options: [
      { id: 0, label: '«Да, жду задач!»', scoreMap: { growth: 10 } },
      { id: 1, label: '«Если будет легко»', scoreMap: {} },
      { id: 2, label: '«Нет, не понравилось»', scoreMap: {} },
    ],
  },
];

// ─── Stealth Patterns ─────────────────────────────────────────────────────────

export interface StealthPattern911 {
  id: string;
  label: string;
  match: (e: StealthEvent911) => boolean;
}

export const STEALTH_PATTERNS_911: StealthPattern911[] = [
  {
    id: 'decisive',
    label: 'Решительный',
    match: (e) => e.answeredAt - e.enteredAt < 4000,
  },
  {
    id: 'thoughtful',
    label: 'Вдумчивый',
    match: (e) => e.answeredAt - e.enteredAt > 9000,
  },
  {
    id: 'growth_responder',
    label: 'Growth Mindset',
    match: (e) => (e.scoreMap.growth ?? 0) > 0,
  },
  {
    id: 'collaborator',
    label: 'Командный игрок',
    match: (e) => (e.scoreMap.collab ?? 0) > 0,
  },
];
