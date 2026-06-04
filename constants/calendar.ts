// Calendar constants: подписи, цвета и настройки отображения расписания.
export const RUSSIAN_CALENDAR_LOCALE = {
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  monthNamesShort: [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ],
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  dayNamesShort: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
  today: 'Сегодня',
} as const;

export const RUSSIAN_GENITIVE_MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

export const RUSSIAN_MONTHS = RUSSIAN_CALENDAR_LOCALE.monthNames;
export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export const DAY_ALIASES: Record<number, string[]> = {
  0: ['вс', 'воск', 'sun', 'sunday'],
  1: ['пн', 'пон', 'mon', 'monday'],
  2: ['вт', 'втор', 'tue', 'tues', 'tuesday'],
  3: ['ср', 'сред', 'wed', 'wednesday'],
  4: ['чт', 'чет', 'четв', 'thu', 'thur', 'thurs', 'thursday'],
  5: ['пт', 'пят', 'fri', 'friday'],
  6: ['сб', 'суб', 'sat', 'saturday'],
};

export const SCHEDULE_TOKENS = [
  ['Вс', 'Воскресенье'],
  ['Пн', 'Понедельник'],
  ['Вт', 'Вторник'],
  ['Ср', 'Среда'],
  ['Чт', 'Четверг'],
  ['Пт', 'Пятница'],
  ['Сб', 'Суббота'],
] as const;
