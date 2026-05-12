// diagnosticData1517: вопросы, варианты ответов, skill-векторы и scoring data для диагностики 15-17.
/**
 * diagnosticData1517.ts
 *
 * Single source of truth for the "Architects" (15–17 y.o.) diagnostic module.
 *
 * BASIC  — 24 Career Match cards (Swipe Right/Left) based on Edgar Schein's Career Anchors
 * PRO    — 30 OS Tasks (Mail, Slack, Trello) "Intern's First Day"
 */

// ─── BASIC Types (Career Anchors) ────────────────────────────────────────────

export type AnchorType =
  | 'Autonomy'
  | 'Stability'
  | 'Mastery'
  | 'Management'
  | 'Entrepreneurship'
  | 'Service'
  | 'Challenge'
  | 'Lifestyle';

export interface CareerCard {
  id: string; // e.g. "B01"
  anchor: AnchorType;
  visualDesc: string; // Description for UI placeholder
  text: string;
  imageUrl?: string;
}

export const ANCHOR_MAP: Record<AnchorType, string> = {
  Autonomy: 'Самоорганизация (Автономия)',
  Stability: 'Стабильность и рутина',
  Mastery: 'Экспертность (Hard Skills)',
  Management: 'Управленческие навыки',
  Entrepreneurship: 'Толерантность к риску',
  Service: 'Эмпатия и социальная ответственность',
  Challenge: 'Конкурентность и вызов',
  Lifestyle: 'Work-Life Balance',
};

// ─── PRO Types (OS Simulation) ───────────────────────────────────────────────

export type OsModule = 'mail' | 'slack' | 'trello';

export type ProConstruct1517 =
  | 'ENT_MathPhys'
  | 'ENT_ChemBio'
  | 'ENT_Humanities'
  | 'ENT_Creative'
  | 'IQ_Analytical'
  | 'IQ_Verbal'
  | 'ONET_Attention'
  | 'ONET_Stress_Tolerance'
  | 'ONET_Analytical_Thinking'
  | 'VIA_Teamwork'
  | 'VIA_Honesty'
  | 'VIA_Perseverance'
  | 'VIA_Leadership'
  | 'Stress';

export interface ProOption1517 {
  id: number;
  label: string;
  scoreMap: Partial<Record<ProConstruct1517, number>>;
}

export interface ProTask1517 {
  id: string;
  module: OsModule;
  sender: string;
  situation: string;
  options: ProOption1517[];
}

export interface StealthEvent1517 {
  taskId: string;
  enteredAt: number;
  answeredAt: number;
  selectedOptionId: number;
  scoreMap: Partial<Record<ProConstruct1517, number>>;
  /** For tracking backspaces in Slack or frantic clicks in Trello (simulated) */
  erasedOrFrantic?: boolean;
}

// ─── BASIC: 24 Career Cards ──────────────────────────────────────────────────

export const CAREER_CARDS: CareerCard[] = [
  {
    id: 'B01',
    anchor: 'Autonomy',
    visualDesc: 'Фрилансер с ноутбуком у моря',
    text: 'Работать по своему графику, без начальников над душой',
    imageUrl: 'https://loremflickr.com/600/800/freelance,beach/all',
  },
  {
    id: 'B02',
    anchor: 'Autonomy',
    visualDesc: 'Пустой коворкинг / Кафе',
    text: 'Самостоятельно решать, где и как выполнять задачу',
    imageUrl: 'https://loremflickr.com/600/800/coworking,cafe/all',
  },
  {
    id: 'B03',
    anchor: 'Autonomy',
    visualDesc: 'Дорога, машина, путешествие',
    text: 'Быть независимым подрядчиком (фриланс / свой проект)',
    imageUrl: 'https://loremflickr.com/600/800/roadtrip,car/all',
  },

  {
    id: 'B04',
    anchor: 'Stability',
    visualDesc: 'Современный офис, бейдж',
    text: 'Работа в крупной корпорации с соцпакетом и гарантией',
    imageUrl: 'https://loremflickr.com/600/800/office,corporate/all',
  },
  {
    id: 'B05',
    anchor: 'Stability',
    visualDesc: 'Растущий график зарплаты',
    text: 'Понятный карьерный рост: знаешь, кем будешь через 5 лет',
    imageUrl: 'https://loremflickr.com/600/800/chart,growth/all',
  },
  {
    id: 'B06',
    anchor: 'Stability',
    visualDesc: 'Государственное учреждение',
    text: 'Госслужба: спокойствие и уверенность в завтрашнем дне',
    imageUrl: 'https://loremflickr.com/600/800/government,building/all',
  },

  {
    id: 'B07',
    anchor: 'Mastery',
    visualDesc: 'Сложный код / Хирургич. стол',
    text: 'Быть узким специалистом-экспертом, лучшим в своем деле',
    imageUrl: 'https://loremflickr.com/600/800/expert,skill/all',
  },
  {
    id: 'B08',
    anchor: 'Mastery',
    visualDesc: 'Лаборатория / Исследования',
    text: 'Глубоко изучать одну тему, делать научные открытия',
    imageUrl: 'https://loremflickr.com/600/800/research,science/all',
  },
  {
    id: 'B09',
    anchor: 'Mastery',
    visualDesc: 'Сертификаты, стопки книг',
    text: 'Постоянно учиться сложным техническим вещам',
    imageUrl: 'https://loremflickr.com/600/800/books,learning/all',
  },

  {
    id: 'B10',
    anchor: 'Management',
    visualDesc: 'Переговорная, человек во главе',
    text: 'Управлять людьми, распределять задачи и бюджеты',
    imageUrl: 'https://loremflickr.com/600/800/meeting,manager/all',
  },
  {
    id: 'B11',
    anchor: 'Management',
    visualDesc: 'Презентация на сцене',
    text: 'Отвечать за финальный результат всей компании',
    imageUrl: 'https://loremflickr.com/600/800/presentation,stage/all',
  },
  {
    id: 'B12',
    anchor: 'Management',
    visualDesc: 'Рукопожатие в костюмах',
    text: 'Проводить переговоры и принимать жесткие решения',
    imageUrl: 'https://loremflickr.com/600/800/handshake,business/all',
  },

  {
    id: 'B13',
    anchor: 'Entrepreneurship',
    visualDesc: 'Стартап-команда, стикеры',
    text: 'Создать бизнес с нуля и стать фаундером',
    imageUrl: 'https://loremflickr.com/600/800/startup,team/all',
  },
  {
    id: 'B14',
    anchor: 'Entrepreneurship',
    visualDesc: 'Риск, графики акций, крипта',
    text: 'Рисковать деньгами ради сверхприбыли и инноваций',
    imageUrl: 'https://loremflickr.com/600/800/crypto,trading/all',
  },
  {
    id: 'B15',
    anchor: 'Entrepreneurship',
    visualDesc: 'Бренд одежды / Приложение',
    text: 'Придумывать продукты, которых еще нет на рынке',
    imageUrl: 'https://loremflickr.com/600/800/design,innovation/all',
  },

  {
    id: 'B16',
    anchor: 'Service',
    visualDesc: 'Врач с пациентом / Волонтеры',
    text: 'Делать работу, которая реально спасает жизни людей',
    imageUrl: 'https://loremflickr.com/600/800/doctor,volunteer/all',
  },
  {
    id: 'B17',
    anchor: 'Service',
    visualDesc: 'Экология, зеленые технологии',
    text: 'Решать глобальные проблемы (экология, образование)',
    imageUrl: 'https://loremflickr.com/600/800/ecology,green/all',
  },
  {
    id: 'B18',
    anchor: 'Service',
    visualDesc: 'Психолог / Учитель',
    text: 'Помогать людям развиваться и решать их боли',
    imageUrl: 'https://loremflickr.com/600/800/psychologist,teacher/all',
  },

  {
    id: 'B19',
    anchor: 'Challenge',
    visualDesc: 'Трофей, кубок, хакатон',
    text: 'Работать там, где жесткая конкуренция и нужно побеждать',
    imageUrl: 'https://loremflickr.com/600/800/trophy,hackathon/all',
  },
  {
    id: 'B20',
    anchor: 'Challenge',
    visualDesc: 'Альпинист на вершине',
    text: 'Браться за невозможные задачи, от которых все отказались',
    imageUrl: 'https://loremflickr.com/600/800/climber,mountain/all',
  },
  {
    id: 'B21',
    anchor: 'Challenge',
    visualDesc: 'Биржа, трейдинг',
    text: 'Обойти конкурентов на рынке любой ценой',
    imageUrl: 'https://loremflickr.com/600/800/stockmarket,trading/all',
  },

  {
    id: 'B22',
    anchor: 'Lifestyle',
    visualDesc: 'Семья, пикник, выходной',
    text: 'Работа не должна мешать личной жизни и хобби',
    imageUrl: 'https://loremflickr.com/600/800/family,picnic/all',
  },
  {
    id: 'B23',
    anchor: 'Lifestyle',
    visualDesc: 'Выключенный телефон',
    text: 'В 18:00 закрывать ноутбук и забывать о работе до утра',
    imageUrl: 'https://loremflickr.com/600/800/relax,off/all',
  },
  {
    id: 'B24',
    anchor: 'Lifestyle',
    visualDesc: 'Йога, здоровье, спорт',
    text: 'Если работа вредит здоровью или нервам — увольняться',
    imageUrl: 'https://loremflickr.com/600/800/yoga,health/all',
  },
];

// ─── PRO: 30 OS Tasks (Mail, Slack, Trello) ──────────────────────────────────

export const PRO_TASKS_1517: ProTask1517[] = [
  // ── MODULE 1: Рабочая почта (Оценка ответственности и IQ) ──
  {
    id: 'P01',
    module: 'mail',
    sender: 'HR',
    situation: 'Подпиши договор о неразглашении (NDA). Файл на 15 страниц.',
    options: [
      { id: 0, label: 'Подписать не глядя', scoreMap: {} },
      {
        id: 1,
        label: 'Пробежаться глазами и подписать',
        scoreMap: { ONET_Attention: 10 },
      },
      { id: 2, label: 'Проигнорировать', scoreMap: {} },
    ],
  },
  {
    id: 'P02',
    module: 'mail',
    sender: 'IT',
    situation: 'Ваш пароль — следующая буква: А, В, Д, Ж, ... ? (Амтхауэр)',
    options: [
      { id: 0, label: 'З', scoreMap: {} },
      { id: 1, label: 'И', scoreMap: { IQ_Analytical: 10 } },
      { id: 2, label: 'К', scoreMap: {} },
    ],
  },
  {
    id: 'P03',
    module: 'mail',
    sender: 'Шеф',
    situation: 'Выбери отдел, к которому прикрепишься!',
    options: [
      { id: 0, label: 'Отдел данных', scoreMap: { ENT_MathPhys: 10 } },
      { id: 1, label: 'R&D / Лаборатория', scoreMap: { ENT_ChemBio: 10 } },
      { id: 2, label: 'PR и Тексты', scoreMap: { ENT_Humanities: 10 } },
    ],
  },
  {
    id: 'P04',
    module: 'mail',
    sender: 'Финансы',
    situation: 'Какая фигура лишняя: Ромб, Треугольник, Квадрат, Круг?',
    options: [
      { id: 0, label: 'Ромб', scoreMap: {} },
      { id: 1, label: 'Квадрат', scoreMap: {} },
      { id: 2, label: 'Круг', scoreMap: { IQ_Analytical: 10 } },
    ],
  },
  {
    id: 'P05',
    module: 'mail',
    sender: 'Бухгалтерия',
    situation: 'Вы забыли прикрепить справку. Зарплаты не будет.',
    options: [
      { id: 0, label: 'Сам виноват, забыл', scoreMap: { Stress: -5 } },
      {
        id: 1,
        label: 'Ок, сейчас оперативно дошлю',
        scoreMap: { ONET_Stress_Tolerance: 10 },
      },
      { id: 2, label: 'Это ваша работа!', scoreMap: {} },
    ],
  },
  {
    id: 'P06',
    module: 'mail',
    sender: 'Клиент',
    situation: 'Ваш продукт — мусор! Верните деньги!',
    options: [
      { id: 0, label: 'Ответить резко', scoreMap: {} },
      {
        id: 1,
        label: 'Переслать менеджеру по конфликтам',
        scoreMap: { VIA_Teamwork: 10 },
      },
      { id: 2, label: 'Удалить письмо', scoreMap: {} },
    ],
  },
  {
    id: 'P07',
    module: 'mail',
    sender: 'Рассылка',
    situation: 'Статья: Как работают нейросети (10 страниц текста).',
    options: [
      { id: 0, label: 'Удалить', scoreMap: {} },
      { id: 1, label: 'Отложить на потом', scoreMap: {} },
      {
        id: 2,
        label: 'Прочитать выводы по диагонали',
        scoreMap: { IQ_Verbal: 10 },
      },
    ],
  },
  {
    id: 'P08',
    module: 'mail',
    sender: 'IT',
    situation: 'Аналогия: Уравнение = Корень, Закон = ?',
    options: [
      { id: 0, label: 'Правило', scoreMap: {} },
      { id: 1, label: 'Следствие', scoreMap: { IQ_Verbal: 10 } },
      { id: 2, label: 'Адвокат', scoreMap: {} },
    ],
  },
  {
    id: 'P09',
    module: 'mail',
    sender: 'HR',
    situation: 'На корпоратив мы идем в горы. Запишись.',
    options: [
      { id: 0, label: 'Не пойду', scoreMap: {} },
      {
        id: 1,
        label: 'Иду, отличный нетворкинг',
        scoreMap: { VIA_Teamwork: 10 },
      },
      { id: 2, label: 'Только если заставят', scoreMap: {} },
    ],
  },
  {
    id: 'P10',
    module: 'mail',
    sender: 'Шеф',
    situation: 'У тебя ошибка в отчете за вчера. Исправь.',
    options: [
      { id: 0, label: 'Это не моя ошибка!', scoreMap: { VIA_Honesty: -10 } },
      {
        id: 1,
        label: 'Где именно? Сейчас исправлю',
        scoreMap: { VIA_Perseverance: 10 },
      },
      { id: 2, label: 'Ок', scoreMap: {} },
    ],
  },

  // ── MODULE 2: Slack (Оценка ЕНТ и VIA в динамике) ──
  {
    id: 'P11',
    module: 'slack',
    sender: 'Макс',
    situation: 'Шеф просит сделать расчеты, а я не успеваю. Поможешь?',
    options: [
      { id: 0, label: 'Разбирайся сам', scoreMap: {} },
      {
        id: 1,
        label: 'Скидывай формулы',
        scoreMap: { ENT_MathPhys: 10, VIA_Teamwork: 10 },
      },
      {
        id: 2,
        label: 'Давай я лучше текст напишу',
        scoreMap: { ENT_Humanities: 10 },
      },
    ],
  },
  {
    id: 'P12',
    module: 'slack',
    sender: 'Алиса',
    situation: 'Какую палитру берем для эко-бренда? Я запуталась.',
    options: [
      {
        id: 0,
        label: 'Природные: зеленый, крафт',
        scoreMap: { ENT_Creative: 10 },
      },
      { id: 1, label: 'Мне без разницы', scoreMap: {} },
      { id: 2, label: 'Спроси у маркетологов', scoreMap: {} },
    ],
  },
  {
    id: 'P13',
    module: 'slack',
    sender: 'Шеф',
    situation: 'Идея, как сократить расходы на пластик в офисе!',
    options: [
      { id: 0, label: 'Промолчать', scoreMap: {} },
      {
        id: 1,
        label: 'Раздать всем стеклянные бутылки',
        scoreMap: { ONET_Analytical_Thinking: 10 },
      },
      { id: 2, label: 'Штрафовать за пластик', scoreMap: {} },
    ],
  },
  {
    id: 'P14',
    module: 'slack',
    sender: 'Макс',
    situation: 'Я удалил базу клиентов... Не говори шефу, умоляю!',
    options: [
      { id: 0, label: 'Скроем это', scoreMap: { VIA_Honesty: -10 } },
      {
        id: 1,
        label: 'Идем к IT, пока можно восстановить',
        scoreMap: { VIA_Honesty: 10, VIA_Leadership: 10 },
      },
      { id: 2, label: 'Я сам расскажу шефу!', scoreMap: {} },
    ],
  },
  {
    id: 'P15',
    module: 'slack',
    sender: 'Алиса',
    situation: 'Помоги с биологией продукта. Ферменты — это...',
    options: [
      { id: 0, label: 'Углеводы', scoreMap: {} },
      { id: 1, label: 'Белки', scoreMap: { ENT_ChemBio: 10 } },
      { id: 2, label: 'Жиры', scoreMap: {} },
    ],
  },
  {
    id: 'P16',
    module: 'slack',
    sender: 'Шеф',
    situation: "Переведи клиенту: 'We need to leverage our assets'.",
    options: [
      { id: 0, label: 'Нам нужно продать имущество', scoreMap: {} },
      {
        id: 1,
        label: 'Нам нужно использовать ресурсы',
        scoreMap: { ENT_Humanities: 10 },
      },
      { id: 2, label: 'Нужно поднять цены', scoreMap: {} },
    ],
  },
  {
    id: 'P17',
    module: 'slack',
    sender: 'Макс',
    situation: 'Я выгорел и увольняюсь. График бешеный.',
    options: [
      { id: 0, label: 'Тут ужасно, я тоже уйду', scoreMap: {} },
      {
        id: 1,
        label: 'Возьми отгул, выдохни, мы прикроем',
        scoreMap: { VIA_Teamwork: 10 },
      },
      { id: 2, label: 'Соберись!', scoreMap: {} },
    ],
  },
  {
    id: 'P18',
    module: 'slack',
    sender: 'Алиса',
    situation: 'Напомни формулу вероятности: P(A) = ?',
    options: [
      { id: 0, label: 'm / n', scoreMap: { ENT_MathPhys: 10 } },
      { id: 1, label: 'm * n', scoreMap: {} },
      { id: 2, label: 'n / m', scoreMap: {} },
    ],
  },
  {
    id: 'P19',
    module: 'slack',
    sender: 'Шеф',
    situation: 'Нужно провести анализ конкурентов. Возьмешься?',
    options: [
      { id: 0, label: 'Нет, это скучно', scoreMap: {} },
      {
        id: 1,
        label: 'Да, соберу в таблицу',
        scoreMap: { ONET_Analytical_Thinking: 10 },
      },
      { id: 2, label: 'Если больше некому', scoreMap: {} },
    ],
  },
  {
    id: 'P20',
    module: 'slack',
    sender: 'Макс',
    situation: 'Ты подставил меня на собрании! Зачем сказал про ошибку?',
    options: [
      { id: 0, label: 'Сам виноват!', scoreMap: {} },
      {
        id: 1,
        label: 'Извини, не хотел задеть. Как исправить?',
        scoreMap: { VIA_Leadership: 10 },
      },
      { id: 2, label: 'Игнор', scoreMap: {} },
    ],
  },

  // ── MODULE 3: Trello (Оценка профиля ЕНТ и Лидерства) ──
  // (Adding a few extra to reach 30, keeping the structure)
  {
    id: 'P21',
    module: 'trello',
    sender: 'Система',
    situation: 'Выбор новой задачи в бэклоге:',
    options: [
      {
        id: 0,
        label: 'Написать скрипт парсера',
        scoreMap: { ENT_MathPhys: 10 },
      },
      {
        id: 1,
        label: 'Отредактировать статью',
        scoreMap: { ENT_Humanities: 10 },
      },
      { id: 2, label: 'Нарисовать мокапы', scoreMap: { ENT_Creative: 10 } },
    ],
  },
  {
    id: 'P22',
    module: 'trello',
    sender: 'Система',
    situation: 'Кризисная задача: сайт упал от наплыва пользователей.',
    options: [
      { id: 0, label: 'Паника!', scoreMap: { Stress: -10 } },
      {
        id: 1,
        label: 'Перезапустить сервер',
        scoreMap: { ONET_Analytical_Thinking: 10 },
      },
      {
        id: 2,
        label: 'Сообщить клиентам',
        scoreMap: { ENT_Humanities: 10, VIA_Teamwork: 5 },
      },
    ],
  },
  {
    id: 'P23',
    module: 'trello',
    sender: 'Система',
    situation: 'Вам назначили скучную рутинную задачу (Data Entry).',
    options: [
      { id: 0, label: 'Перекинуть на другого', scoreMap: {} },
      {
        id: 1,
        label: 'Сделать быстро и забыть',
        scoreMap: { VIA_Perseverance: 10 },
      },
      { id: 2, label: 'Саботировать', scoreMap: { VIA_Honesty: -10 } },
    ],
  },
  {
    id: 'P24',
    module: 'trello',
    sender: 'Система',
    situation: 'Нужно организовать тимбилдинг команды.',
    options: [
      { id: 0, label: 'Я организую!', scoreMap: { VIA_Leadership: 10 } },
      { id: 1, label: 'Пусть кто-то другой', scoreMap: {} },
      { id: 2, label: 'Главное, чтобы не в горы', scoreMap: {} },
    ],
  },
  {
    id: 'P25',
    module: 'trello',
    sender: 'Система',
    situation: 'Баг-репорт: Неправильно считается процент скидки.',
    options: [
      {
        id: 0,
        label: 'Проверить формулу в коде',
        scoreMap: { ENT_MathPhys: 10, ONET_Analytical_Thinking: 5 },
      },
      { id: 1, label: 'Закрыть тикет', scoreMap: {} },
      { id: 2, label: 'Спросить бухгалтера', scoreMap: {} },
    ],
  },
  {
    id: 'P26',
    module: 'trello',
    sender: 'Система',
    situation: 'Задача: Написать речь для CEO.',
    options: [
      { id: 0, label: 'Я напишу', scoreMap: { ENT_Humanities: 10 } },
      { id: 1, label: 'Сгенерировать в ChatGPT и не читать', scoreMap: {} },
      { id: 2, label: 'Отказаться', scoreMap: {} },
    ],
  },
  {
    id: 'P27',
    module: 'trello',
    sender: 'Система',
    situation: 'Дедлайн через 10 минут! А задач еще много!',
    options: [
      { id: 0, label: 'Бросить всё', scoreMap: { Stress: -10 } },
      {
        id: 1,
        label: 'Сфокусироваться на одной',
        scoreMap: { ONET_Stress_Tolerance: 10 },
      },
      { id: 2, label: 'Пытаться сделать всё сразу', scoreMap: {} },
    ],
  },
  {
    id: 'P28',
    module: 'trello',
    sender: 'Шеф',
    situation: 'Предлагаю должность Младшего Руководителя.',
    options: [
      { id: 0, label: 'Согласиться', scoreMap: { VIA_Leadership: 10 } },
      { id: 1, label: 'Остаться экспертом-специалистом', scoreMap: {} }, // Correlates to Mastery
      { id: 2, label: 'Уйти', scoreMap: {} },
    ],
  },
  {
    id: 'P29',
    module: 'trello',
    sender: 'Система',
    situation: 'За что выписать тебе первую премию?',
    options: [
      {
        id: 0,
        label: 'За безошибочный код/расчеты',
        scoreMap: { ENT_MathPhys: 10 },
      },
      { id: 1, label: 'За крутые идеи', scoreMap: { ENT_Humanities: 10 } },
      { id: 2, label: 'За спасение команды', scoreMap: { VIA_Leadership: 10 } },
    ],
  },
  {
    id: 'P30',
    module: 'trello',
    sender: 'Система',
    situation: 'Как оценишь свой первый рабочий день?',
    options: [
      { id: 0, label: 'Это был ад, я устал', scoreMap: {} },
      {
        id: 1,
        label: 'Сложно, но я понял бизнес',
        scoreMap: { VIA_Perseverance: 10 },
      },
      { id: 2, label: 'Скучно', scoreMap: {} },
    ],
  },
];
