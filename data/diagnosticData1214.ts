/**
 * diagnosticData1214.ts
 *
 * Single source of truth for the "Rebels" (12–14 y.o.) diagnostic module.
 *
 * BASIC  — 24 Vibe Check cards (Swipe Right/Left) based on RIASEC
 * PRO    — 30 RPG quest tasks ("Hackathon Team"), 3 acts
 */

// ─── BASIC Types (Vibe Check) ────────────────────────────────────────────────

export type RiasecType = "R" | "I" | "A" | "S" | "E" | "C";

export interface VibeCard {
  id: string; // e.g. "B01"
  type: RiasecType;
  moodboardDesc: string; // Description for image generation or placeholder
  text: string;
  imageUrl?: string;
}

// ─── PRO Types (Hackathon) ───────────────────────────────────────────────────

export type EntVector = "Math_IT" | "Science" | "Verbal";
export type ProSkill1214 =
  | "Logic"
  | "Spatial"
  | "Stress"
  | "Mediation"
  | "Leadership"
  | "Growth"
  | "Focus"
  | "Collab"
  | "Empathy"
  | "Caution"
  | "Ethics";

export type ProConstruct1214 = ProSkill1214 | EntVector | RiasecType;

export interface ProOption1214 {
  id: number;
  label: string;
  scoreMap: Partial<Record<ProConstruct1214, number>>;
  isCorrect?: boolean;
}

export interface ProTask1214 {
  id: string;
  act: 1 | 2 | 3;
  construct: string; // e.g. "Стресс", "Физика (Math_IT)", "Роль (RIASEC)"
  speaker: "system" | "max" | "alice" | "bot" | "jury";
  situation: string;
  options: ProOption1214[];
}

export interface StealthEvent1214 {
  taskId: string;
  enteredAt: number;
  answeredAt: number;
  selectedOptionId: number;
  scoreMap: Partial<Record<ProConstruct1214, number>>;
  /** For "Erased Messages" stealth logic (if implemented in UI) */
  erasedAggressive?: boolean;
}

// ─── BASIC: 24 Vibe Cards ────────────────────────────────────────────────────

export const VIBE_CARDS: VibeCard[] = [
  {
    id: "B01",
    type: "R",
    moodboardDesc: "Стол с инструментами, пайка плат, неон",
    text: "Собирать технику своими руками",
    imageUrl: "https://loremflickr.com/600/800/engineering,tools/all",
  },
  {
    id: "B02",
    type: "R",
    moodboardDesc: "Природа, палатка, горы, походный рюкзак",
    text: "Выживать в дикой природе, крафтить",
    imageUrl: "https://loremflickr.com/600/800/camping,mountains/all",
  },
  {
    id: "B03",
    type: "R",
    moodboardDesc: "Спортивный зал, кроссовки, фитнес-трекер",
    text: "Тренировки, спорт, движение",
    imageUrl: "https://loremflickr.com/600/800/gym,fitness/all",
  },
  {
    id: "B04",
    type: "R",
    moodboardDesc: "3D-принтер, робототехника, чертежи",
    text: "Создавать физические механизмы",
    imageUrl: "https://loremflickr.com/600/800/robotics,engineering/all",
  },

  {
    id: "B05",
    type: "I",
    moodboardDesc: "Темная комната, два монитора, строки кода",
    text: "Кодить",
    imageUrl: "https://loremflickr.com/600/800/coding,hacker/all",
  },
  {
    id: "B06",
    type: "I",
    moodboardDesc: "Микроскоп, светящиеся колбы, лаборатория",
    text: "Проводить химические эксперименты",
    imageUrl: "https://loremflickr.com/600/800/laboratory,science/all",
  },
  {
    id: "B07",
    type: "I",
    moodboardDesc: "Космос, телескоп, звездные карты",
    text: "Изучать то, что за пределами Земли",
    imageUrl: "https://loremflickr.com/600/800/space,telescope/all",
  },
  {
    id: "B08",
    type: "I",
    moodboardDesc: "Сложные графики, статистика, нейросети",
    text: "Анализировать большие данные (Big Data)",
    imageUrl: "https://loremflickr.com/600/800/data,analytics/all",
  },

  {
    id: "B09",
    type: "A",
    moodboardDesc: "Графический планшет, стилус, цифровой арт",
    text: "Рисовать арты и дизайн",
    imageUrl: "https://loremflickr.com/600/800/digitalart,design/all",
  },
  {
    id: "B10",
    type: "A",
    moodboardDesc: "Неоновая студия звукозаписи, микрофон",
    text: "Создавать свои треки и биты",
    imageUrl: "https://loremflickr.com/600/800/music,studio/all",
  },
  {
    id: "B11",
    type: "A",
    moodboardDesc: "Сцена, софиты, театральные маски",
    text: "Выступать перед публикой, играть роль",
    imageUrl: "https://loremflickr.com/600/800/theatre,stage/all",
  },
  {
    id: "B12",
    type: "A",
    moodboardDesc: "Камера, эстетичные кадры, пленка",
    text: "Снимать и монтировать видео",
    imageUrl: "https://loremflickr.com/600/800/filmmaking,camera/all",
  },

  {
    id: "B13",
    type: "S",
    moodboardDesc: "Группа людей, смех, уютное кафе",
    text: "Быть в центре компании, помогать друзьям",
    imageUrl: "https://loremflickr.com/600/800/friends,cafe/all",
  },
  {
    id: "B14",
    type: "S",
    moodboardDesc: "Волонтерская акция, спасение животных",
    text: "Делать мир добрее, спасать других",
    imageUrl: "https://loremflickr.com/600/800/volunteer,helping/all",
  },
  {
    id: "B15",
    type: "S",
    moodboardDesc: "Блогер, записывающий подкаст, вопросы",
    text: "Общаться с аудиторией, брать интервью",
    imageUrl: "https://loremflickr.com/600/800/podcast,interview/all",
  },
  {
    id: "B16",
    type: "S",
    moodboardDesc: "Школьный класс, объяснение у доски",
    text: "Учить других тому, что знаешь сам",
    imageUrl: "https://loremflickr.com/600/800/classroom,teaching/all",
  },

  {
    id: "B17",
    type: "E",
    moodboardDesc: "Дорогая машина, костюмы, небоскребы",
    text: "Строить свой бизнес и зарабатывать",
    imageUrl: "https://loremflickr.com/600/800/business,success/all",
  },
  {
    id: "B18",
    type: "E",
    moodboardDesc: "Презентация стартапа, графики роста",
    text: "Руководить командой и вести за собой",
    imageUrl: "https://loremflickr.com/600/800/startup,presentation/all",
  },
  {
    id: "B19",
    type: "E",
    moodboardDesc: "Соцсети, миллион подписчиков, реклама",
    text: "Продвигать проекты, маркетинг",
    imageUrl: "https://loremflickr.com/600/800/socialmedia,influencer/all",
  },
  {
    id: "B20",
    type: "E",
    moodboardDesc: "Суд, адвокаты, дебаты",
    text: "Защищать интересы и побеждать в спорах",
    imageUrl: "https://loremflickr.com/600/800/lawyer,court/all",
  },

  {
    id: "B21",
    type: "C",
    moodboardDesc: "Идеально убранный стол, планер, эстетика",
    text: "Планировать жизнь, списки и порядок",
    imageUrl: "https://loremflickr.com/600/800/planner,aesthetic/all",
  },
  {
    id: "B22",
    type: "C",
    moodboardDesc: "Строки базы данных, таблицы Excel, серверы",
    text: "Структурировать хаос в систему",
    imageUrl: "https://loremflickr.com/600/800/database,servers/all",
  },
  {
    id: "B23",
    type: "C",
    moodboardDesc: "Библиотека, ровные ряды книг, тишина",
    text: "Работать с текстами и архивами",
    imageUrl: "https://loremflickr.com/600/800/library,books/all",
  },
  {
    id: "B24",
    type: "C",
    moodboardDesc: "Финансы, калькулятор, акции",
    text: "Управлять бюджетом и инвестициями",
    imageUrl: "https://loremflickr.com/600/800/finance,charts/all",
  },
];

export const RIASEC_MAP: Record<RiasecType, string> = {
  R: "Практическое мышление",
  I: "Аналитическое мышление",
  A: "Креативность",
  S: "Эмпатия / Социум",
  E: "Лидерство",
  C: "Организованность",
};

// ─── PRO: 30 Hackathon Tasks ─────────────────────────────────────────────────

export const PRO_TASKS_1214: ProTask1214[] = [
  // ── ACT 1: Взлом и Кризис ──
  {
    id: "M01",
    act: 1,
    construct: "Стресс",
    speaker: "alice",
    situation: "Наш код для умной теплицы стерли! Защита хакатона завтра! 😱",
    options: [
      {
        id: 0,
        label: "Кто это сделал?! Найду — убью!",
        scoreMap: { Stress: -5 },
      },
      {
        id: 1,
        label: "Спокойно. Проверим бэкапы на сервере",
        scoreMap: { Stress: 10 },
      },
      { id: 2, label: "Ну всё, мы проиграли", scoreMap: {} }, // Избегание
    ],
  },
  {
    id: "M02",
    act: 1,
    construct: "Аналогии",
    speaker: "max",
    situation:
      "Я нашел зашифрованный архив. Аналогия: Вирус = Карантин, Баг в коде = ?",
    options: [
      { id: 0, label: "Удаление", scoreMap: {} },
      { id: 1, label: "Отладка", scoreMap: { Logic: 10, Math_IT: 5 } },
      { id: 2, label: "Программа", scoreMap: {} },
    ],
  },
  {
    id: "M03",
    act: 1,
    construct: "Пространство",
    speaker: "bot",
    situation:
      "Введите ключ доступа. Это развертка куба. Какая фигура получится?",
    options: [
      { id: 0, label: "Пирамида", scoreMap: {} },
      { id: 1, label: "Цилиндр", scoreMap: {} },
      { id: 2, label: "Куб", scoreMap: { Spatial: 10 } },
    ],
  },
  {
    id: "M04",
    act: 1,
    construct: "Медиация",
    speaker: "alice",
    situation: "Макс, это из-за твоих левых программ нас хакнули!",
    options: [
      { id: 0, label: "Алиса, не наезжай на него", scoreMap: {} },
      {
        id: 1,
        label: "Стоп. Ругаемся потом, сейчас восстанавливаем",
        scoreMap: { Mediation: 10 },
      },
      { id: 2, label: "Промолчать", scoreMap: {} },
    ],
  },
  {
    id: "M05",
    act: 1,
    construct: "Цифровая грамотность",
    speaker: "bot",
    situation:
      "Ваш аккаунт под угрозой. Перейдите по ссылке secure-login-free.com",
    options: [
      { id: 0, label: "Кликаем быстрее!", scoreMap: {} },
      {
        id: 1,
        label: "Это фишинг. Админы так не пишут",
        scoreMap: { Logic: 10 },
      },
      { id: 2, label: "Я перейду проверю", scoreMap: { Caution: -5 } },
    ],
  },
  {
    id: "M06",
    act: 1,
    construct: "Ряды",
    speaker: "max",
    situation: "Пароль от сервера — следующий байт: 16, 32, 64, 128, ... ?",
    options: [
      { id: 0, label: "200", scoreMap: {} },
      { id: 1, label: "256", scoreMap: { Logic: 10, Math_IT: 5 } },
      { id: 2, label: "512", scoreMap: {} },
    ],
  },
  {
    id: "M07",
    act: 1,
    construct: "Этика",
    speaker: "max",
    situation:
      "Давайте скачаем чужой проект из сети и выдадим за свой? Никто не заметит.",
    options: [
      {
        id: 0,
        label: "Давай, это единственный шанс",
        scoreMap: { Ethics: -10 },
      },
      {
        id: 1,
        label: "Нет, выходим с тем, что восстановим сами",
        scoreMap: { Ethics: 10 },
      },
      { id: 2, label: "Только если немного изменим", scoreMap: {} },
    ],
  },
  {
    id: "M08",
    act: 1,
    construct: "Обобщение",
    speaker: "alice",
    situation:
      "Какой тег поставить? Что общее у слов: Сервер, Роутер, Протокол?",
    options: [
      { id: 0, label: "Компьютеры", scoreMap: {} },
      { id: 1, label: "Сетевые технологии", scoreMap: { Logic: 10 } },
      { id: 2, label: "Интернет", scoreMap: {} },
    ],
  },
  {
    id: "M09",
    act: 1,
    construct: "Внимание",
    speaker: "alice",
    situation:
      "Какой формат скинуть преподу? PDF или PPTX? (В правилах просили PDF)",
    options: [
      { id: 0, label: "PDF", scoreMap: { Focus: 10 } },
      { id: 1, label: "PPTX", scoreMap: { Focus: -5 } },
      { id: 2, label: "DOCX", scoreMap: {} },
    ],
  },
  {
    id: "M10",
    act: 1,
    construct: "Делегирование",
    speaker: "max",
    situation: "Я нашел кусок кода, но собирать презентацию не умею.",
    options: [
      { id: 0, label: "Скидывай, я всё сам сделаю", scoreMap: {} },
      {
        id: 1,
        label: "Алиса, сделаешь дизайн? А мы соберем код",
        scoreMap: { Leadership: 10 },
      },
      { id: 2, label: "Разбирайся сам", scoreMap: { Collab: -10 } },
    ],
  },

  // ── ACT 2: Предметы ЕНТ ──
  {
    id: "M11",
    act: 2,
    construct: "Вектор (ЕНТ)",
    speaker: "alice",
    situation: "Нам нужно разделить задачи. За что ты возьмешься прямо сейчас?",
    options: [
      {
        id: 0,
        label: "Буду восстанавливать код программы",
        scoreMap: { Math_IT: 10, I: 5 },
      },
      {
        id: 1,
        label: "Пересчитаю формулы удобрений",
        scoreMap: { Science: 10, I: 5 },
      },
      {
        id: 2,
        label: "Напишу текст для питча и защиты",
        scoreMap: { Verbal: 10, A: 5, E: 5 },
      },
    ],
  },
  {
    id: "M12",
    act: 2,
    construct: "Биология",
    speaker: "alice",
    situation: "Смотри, датчик влажности сломался. Как растения теряют воду?",
    options: [
      { id: 0, label: "Испарение", scoreMap: {} },
      { id: 1, label: "Транспирация", scoreMap: { Science: 10 } },
      { id: 2, label: "Фотосинтез", scoreMap: {} },
    ],
  },
  {
    id: "M13",
    act: 2,
    construct: "Физика",
    speaker: "max",
    situation: "Нам нужно рассчитать мощность насоса. Формула работы: A = ?",
    options: [
      { id: 0, label: "F × S", scoreMap: { Math_IT: 10 } },
      { id: 1, label: "m × g", scoreMap: {} },
      { id: 2, label: "v / t", scoreMap: {} },
    ],
  },
  {
    id: "M14",
    act: 2,
    construct: "Литература",
    speaker: "alice",
    situation:
      "Нужен крутой слоган. Какое тут средство выразительности: 'Зеленое сердце города'?",
    options: [
      { id: 0, label: "Сравнение", scoreMap: {} },
      { id: 1, label: "Метафора", scoreMap: { Verbal: 10 } },
      { id: 2, label: "Эпитет", scoreMap: {} },
    ],
  },
  {
    id: "M15",
    act: 2,
    construct: "Математика",
    speaker: "max",
    situation:
      "Теплица 5 × 4 метра. Сколько кубов земли нужно, если слой 0.5 метра?",
    options: [
      { id: 0, label: "20 кубов", scoreMap: {} },
      { id: 1, label: "10 кубов", scoreMap: { Math_IT: 10, Logic: 5 } },
      { id: 2, label: "15 кубов", scoreMap: {} },
    ],
  },
  {
    id: "M16",
    act: 2,
    construct: "Вектор (ЕНТ)",
    speaker: "alice",
    situation: "Мы не успеваем! От чего откажемся в презентации?",
    options: [
      {
        id: 0,
        label: "Оставим код, уберем красивое описание",
        scoreMap: { Math_IT: 10 },
      },
      {
        id: 1,
        label: "Оставим анализ, уберем графики",
        scoreMap: { Science: 10 },
      },
      { id: 2, label: "Оставим текст, уберем схемы", scoreMap: { Verbal: 10 } },
    ],
  },
  {
    id: "M17",
    act: 2,
    construct: "География",
    speaker: "max",
    situation:
      "Инвестор спрашивает, где лучше строить теплицу в РК. Где больше всего солнца?",
    options: [
      { id: 0, label: "На севере", scoreMap: {} },
      { id: 1, label: "На юге (Кызылорда/Шымкент)", scoreMap: { Science: 10 } },
      { id: 2, label: "На востоке", scoreMap: {} },
    ],
  },
  {
    id: "M18",
    act: 2,
    construct: "Английский",
    speaker: "bot",
    situation: "System failure. Reboot required. (Что это значит?)",
    options: [
      { id: 0, label: "Ошибка системы. Нужна замена.", scoreMap: {} },
      {
        id: 1,
        label: "Сбой системы. Требуется перезагрузка.",
        scoreMap: { Verbal: 10 },
      },
      { id: 2, label: "Система удалена.", scoreMap: {} },
    ],
  },
  {
    id: "M19",
    act: 2,
    construct: "Информатика",
    speaker: "max",
    situation: "В какой системе счисления написан этот код: 1011001?",
    options: [
      { id: 0, label: "Десятичная", scoreMap: {} },
      { id: 1, label: "Шестнадцатеричная", scoreMap: {} },
      { id: 2, label: "Двоичная", scoreMap: { Math_IT: 10 } },
    ],
  },
  {
    id: "M20",
    act: 2,
    construct: "Рефлексия профиля",
    speaker: "alice",
    situation: "Какой предмет в школе тебе бы сейчас реально помог?",
    options: [
      { id: 0, label: "Алгебра и Информатика", scoreMap: { Math_IT: 10 } },
      { id: 1, label: "Биология и Химия", scoreMap: { Science: 10 } },
      {
        id: 2,
        label: "Русский/Казахский и Литература",
        scoreMap: { Verbal: 10 },
      },
    ],
  },

  // ── ACT 3: Soft-skills, Роли ──
  {
    id: "M21",
    act: 3,
    construct: "Роль (RIASEC)",
    speaker: "max",
    situation: "Остался час. Кто пойдет выступать перед жюри?",
    options: [
      { id: 0, label: "Я! Я легко продам нашу идею", scoreMap: { E: 10 } },
      {
        id: 1,
        label: "Иди ты, я лучше еще раз проверю код",
        scoreMap: { I: 10 },
      },
      { id: 2, label: "Давайте запишем красивое видео", scoreMap: { A: 10 } },
    ],
  },
  {
    id: "M22",
    act: 3,
    construct: "Роль (RIASEC)",
    speaker: "alice",
    situation: "Жюри задает каверзные вопросы. Как будем отвечать?",
    options: [
      {
        id: 0,
        label: "Опираться на сухие цифры и графики",
        scoreMap: { C: 10 },
      },
      { id: 1, label: "Отшучиваться и брать харизмой", scoreMap: { S: 10 } },
      { id: 2, label: "Покажем, как работает прототип", scoreMap: { R: 10 } },
    ],
  },
  {
    id: "M23",
    act: 3,
    construct: "Компромисс",
    speaker: "max",
    situation:
      "Я считаю, проект готов. Алиса говорит, что нужно всё переделать.",
    options: [
      { id: 0, label: "Макс прав, сдаем так", scoreMap: {} },
      { id: 1, label: "Алиса права, переделываем", scoreMap: {} },
      {
        id: 2,
        label: "Давайте исправим только критичные ошибки",
        scoreMap: { Mediation: 10 },
      },
    ],
  },
  {
    id: "M24",
    act: 3,
    construct: "Тайм-менеджмент",
    speaker: "alice",
    situation: "У нас 10 минут, а работы на полчаса!",
    options: [
      { id: 0, label: "Паника!", scoreMap: { Stress: -5 } },
      {
        id: 1,
        label: "Разделим задачи, каждый делает свое",
        scoreMap: { Leadership: 10 },
      },
      { id: 2, label: "Сдаем недоделанное", scoreMap: {} },
    ],
  },
  {
    id: "M25",
    act: 3,
    construct: "Growth Mindset",
    speaker: "jury",
    situation: "Ваша идея вторична, такое уже было.",
    options: [
      { id: 0, label: "Ну да, мы так и знали...", scoreMap: { Growth: -10 } },
      {
        id: 1,
        label: "Возможно, но мы улучшили алгоритм вот здесь...",
        scoreMap: { Growth: 10 },
      },
      { id: 2, label: "Вы ничего не понимаете!", scoreMap: {} }, // Агрессия
    ],
  },
  {
    id: "M26",
    act: 3,
    construct: "Эмпатия",
    speaker: "alice",
    situation: "Блин, я забыла слова на сцене... Позор.",
    options: [
      { id: 0, label: "Реально позор", scoreMap: { Empathy: -10 } },
      {
        id: 1,
        label: "Ничего страшного, все волнуются. Ты молодец!",
        scoreMap: { Empathy: 10 },
      },
      { id: 2, label: "Забыли", scoreMap: {} },
    ],
  },
  {
    id: "M27",
    act: 3,
    construct: "Роль (RIASEC)",
    speaker: "max",
    situation: "Хакатон кончился. Что было самым сложным?",
    options: [
      {
        id: 0,
        label: "Выступать перед людьми",
        scoreMap: { I: 5, R: 5, C: 5 },
      },
      { id: 1, label: "Писать код и считать", scoreMap: { S: 5, A: 5, E: 5 } },
      { id: 2, label: "Найти компромисс", scoreMap: {} },
    ],
  },
  {
    id: "M28",
    act: 3,
    construct: "Рефлексия",
    speaker: "alice",
    situation: "Если бы мы делали это снова, что бы мы изменили?",
    options: [
      { id: 0, label: "Я бы работал один", scoreMap: { Collab: -10 } },
      {
        id: 1,
        label: "Лучше бы планировали время",
        scoreMap: { Logic: 5, Growth: 10 },
      },
      { id: 2, label: "Всё было идеально", scoreMap: {} },
    ],
  },
  {
    id: "M29",
    act: 3,
    construct: "Вектор (ЕНТ)",
    speaker: "jury",
    situation: "Мы даем вам грант! На что потратите?",
    options: [
      {
        id: 0,
        label: "На закупку оборудования и железа",
        scoreMap: { Math_IT: 10 },
      },
      { id: 1, label: "На лабораторию и реактивы", scoreMap: { Science: 10 } },
      {
        id: 2,
        label: "На маркетинг и продвижение",
        scoreMap: { Verbal: 10, E: 5 },
      },
    ],
  },
  {
    id: "M30",
    act: 3,
    construct: "Итог",
    speaker: "system",
    situation: "Оцените свой уровень стресса во время игры.",
    options: [
      { id: 0, label: "Было очень страшно", scoreMap: {} },
      {
        id: 1,
        label: "Было напряженно, но я справился",
        scoreMap: { Growth: 10 },
      },
      { id: 2, label: "Вообще не напрягся", scoreMap: {} },
    ],
  },
];
