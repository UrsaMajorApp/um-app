-- Миграция Supabase: применяет изменение схемы или seed-данных для onboarding questions.
-- Onboarding / diagnostic questionnaires for each audience type.
-- Questions were previously hardcoded in the app bundle; moving here allows
-- content edits without an app deploy.

create table if not exists public.onboarding_questions (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('parent', 'org', 'child', 'youth', 'parent_diagnostic')),
  display_order int not null default 0,
  question_text text not null,
  answers text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_questions_audience_idx
  on public.onboarding_questions(audience, display_order)
  where active = true;

alter table public.onboarding_questions enable row level security;

drop policy if exists "public reads active onboarding questions" on public.onboarding_questions;
create policy "public reads active onboarding questions" on public.onboarding_questions
  for select using (active = true);

drop policy if exists "admin manages onboarding questions" on public.onboarding_questions;
create policy "admin manages onboarding questions" on public.onboarding_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Seed data ────────────────────────────────────────────────────────────────

-- parent onboarding (profile/parent/testing.tsx)
insert into public.onboarding_questions (audience, display_order, question_text, answers) values
  ('parent', 1, 'Сколько лет вашему ребёнку?',
    '{"6–8 лет","9–11 лет","12–14 лет","15–17 лет"}'),
  ('parent', 2, 'Что ему интересно больше всего?',
    '{"Технологии","Творчество","Спорт","Точные науки"}'),
  ('parent', 3, 'Какой формат обучения вам подходит?',
    '{"Онлайн","Офлайн","Смешанный"}'),
  ('parent', 4, 'Какая цель обучения для вас важнее?',
    '{"Подготовка к экзаменам","Развитие мышления","Профориентация","Общее развитие"}'),
  ('parent', 5, 'Сколько времени в неделю ребёнок готов учиться дополнительно?',
    '{"1–2 раза","3–4 раза","Каждый день"}')
on conflict do nothing;

-- org onboarding (profile/organization/testing.tsx)
insert into public.onboarding_questions (audience, display_order, question_text, answers) values
  ('org', 1, 'Какого типа у вас организация?',
    '{"Образовательный центр","Частная школа","Кружок/студия","Онлайн-платформа"}'),
  ('org', 2, 'Основное направление занятий:',
    '{"IT и технологии","Творчество","Спорт","Точные науки"}'),
  ('org', 3, 'С каким возрастом вы работаете?',
    '{"6–9 лет","10–13 лет","14–17 лет","Все возраста"}'),
  ('org', 4, 'Какой формат занятий у вас основной?',
    '{"Офлайн","Онлайн","Смешанный"}'),
  ('org', 5, 'Какая главная цель для вашей организации?',
    '{"Масштабирование","Привлечение учеников","Автоматизация процессов","Повышение качества обучения"}')
on conflict do nothing;

-- child diagnostic (profile/youth/testing.tsx, 9–11 fallback)
insert into public.onboarding_questions (audience, display_order, question_text, answers) values
  ('child', 1, 'Какая твоя любимая игра?',
    '{"Собери конструктор","Рисование","Догонялки","Головоломки"}'),
  ('child', 2, 'Что тебе нравится делать в свободное время?',
    '{"Смотреть мультики","Гулять с друзьями","Читать сказки","Строить базы"}'),
  ('child', 3, 'Представь, что у тебя есть суперсила. Какая она?',
    '{"Летать","Читать мысли","Создавать предметы","Становиться невидимым"}')
on conflict do nothing;

-- youth diagnostic (profile/youth/testing.tsx, 12–17 fallback)
insert into public.onboarding_questions (audience, display_order, question_text, answers) values
  ('youth', 1, 'Что тебе сейчас интереснее всего изучать?',
    '{"Программирование","Дизайн","Бизнес/Управление","Наука/Исследования"}'),
  ('youth', 2, 'Как ты предпочитаешь работать над проектами?',
    '{"Полностью самостоятельно","С наставником 1 на 1","В небольшой команде","В большой группе"}'),
  ('youth', 3, 'Кем ты видишь себя через 5 лет?',
    '{"Специалистом (IT/Дизайн)","Предпринимателем","Лидером команды","Свободным фрилансером"}'),
  ('youth', 4, 'Где ты черпаешь вдохновение или информацию?',
    '{"YouTube/Курсы","Книги/Статьи","Общение с людьми","Практика методом ошибок"}')
on conflict do nothing;

-- parent diagnostic (parent/testing/index.tsx — AI-driven quiz about the child)
insert into public.onboarding_questions (audience, display_order, question_text, answers) values
  ('parent_diagnostic', 1,
    'Что ребенку нравится делать больше всего в свободное время?',
    '{"Рисовать, лепить, создавать что-то руками.","Играть в подвижные игры, бегать, танцевать.","Собирать конструкторы по схемам, решать задачки.","Общаться с друзьями, придумывать совместные игры.","Слушать сказки, сочинять истории, много болтать."}'),
  ('parent_diagnostic', 2,
    'Как ребенок относится к новым правилам или сложным задачам?',
    '{"Часто находит нестандартное решение в обход правил.","Любит соревновательный элемент, старается сделать физически быстрее.","Пытается понять систему, почему правило именно такое.","Просит помощи или договаривается с другими.","Пытается обсудить или переубедить вас словами."}'),
  ('parent_diagnostic', 3,
    'Какая любимая игрушка или игра?',
    '{"Краски, пластилин, наборы для творчества.","Мяч, велосипед, спортивный инвентарь.","Головоломки, шашки, кубики с цифрами.","Настольные игры для компании, ролевые игры.","Книжки, аудиосказки, карточки со словами."}')
on conflict do nothing;
