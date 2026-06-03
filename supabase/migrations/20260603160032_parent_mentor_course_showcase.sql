-- Parent-facing mentor selection and richer populated demo data.

alter table public.org_courses
  add column if not exists image_url text;

alter table public.mentor_applications
  add column if not exists photo_url text;

alter table public.child_profiles
  add column if not exists mentor_application_id uuid
    references public.mentor_applications(id) on delete set null;

create index if not exists child_profiles_mentor_application_idx
  on public.child_profiles(mentor_application_id);

drop policy if exists "authenticated_read_approved_mentors" on public.mentor_applications;
create policy "authenticated_read_approved_mentors" on public.mentor_applications
  for select
  to authenticated
  using (status = 'approved');

create or replace view public.public_mentors as
select
  id,
  name,
  specialization,
  rating,
  sessions,
  photo_emoji,
  photo_url,
  bio,
  experience,
  education,
  status,
  created_at
from public.mentor_applications
where status = 'approved';

grant select on public.public_mentors to anon, authenticated;

create or replace function public.clear_parent_showcase_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  update public.child_profiles
  set mentor_application_id = null
  where id in (
    '70000000-0000-4000-a000-000000001401',
    '70000000-0000-4000-a000-000000001402'
  );

  delete from public.org_applications
  where id in (
    '70000000-0000-4000-a000-000000003001',
    '70000000-0000-4000-a000-000000003002',
    '70000000-0000-4000-a000-000000003003',
    '70000000-0000-4000-a000-000000003004',
    '70000000-0000-4000-a000-000000003005',
    '70000000-0000-4000-a000-000000003006'
  );

  delete from public.trial_lesson_slots
  where id in (
    '70000000-0000-4000-a000-000000003801',
    '70000000-0000-4000-a000-000000003802',
    '70000000-0000-4000-a000-000000003803',
    '70000000-0000-4000-a000-000000003804',
    '70000000-0000-4000-a000-000000003805',
    '70000000-0000-4000-a000-000000003806',
    '70000000-0000-4000-a000-000000003807',
    '70000000-0000-4000-a000-000000003808',
    '70000000-0000-4000-a000-000000003809',
    '70000000-0000-4000-a000-000000003810',
    '70000000-0000-4000-a000-000000003811',
    '70000000-0000-4000-a000-000000003812',
    '70000000-0000-4000-a000-000000003813'
  );

  delete from public.org_groups
  where id in (
    '70000000-0000-4000-a000-000000003301',
    '70000000-0000-4000-a000-000000003302',
    '70000000-0000-4000-a000-000000003303',
    '70000000-0000-4000-a000-000000003304',
    '70000000-0000-4000-a000-000000003305',
    '70000000-0000-4000-a000-000000003306',
    '70000000-0000-4000-a000-000000003307',
    '70000000-0000-4000-a000-000000003308',
    '70000000-0000-4000-a000-000000003309',
    '70000000-0000-4000-a000-000000003310',
    '70000000-0000-4000-a000-000000003311',
    '70000000-0000-4000-a000-000000003312',
    '70000000-0000-4000-a000-000000003313'
  );

  delete from public.org_courses
  where id in (
    '70000000-0000-4000-a000-000000003101',
    '70000000-0000-4000-a000-000000003102',
    '70000000-0000-4000-a000-000000003103',
    '70000000-0000-4000-a000-000000003104',
    '70000000-0000-4000-a000-000000003105',
    '70000000-0000-4000-a000-000000003106',
    '70000000-0000-4000-a000-000000003107',
    '70000000-0000-4000-a000-000000003108',
    '70000000-0000-4000-a000-000000003109',
    '70000000-0000-4000-a000-000000003110',
    '70000000-0000-4000-a000-000000003111',
    '70000000-0000-4000-a000-000000003112',
    '70000000-0000-4000-a000-000000003113'
  );

  delete from public.mentor_applications
  where id in (
    '70000000-0000-4000-a000-000000003501',
    '70000000-0000-4000-a000-000000003502',
    '70000000-0000-4000-a000-000000003503',
    '70000000-0000-4000-a000-000000003504',
    '70000000-0000-4000-a000-000000003505',
    '70000000-0000-4000-a000-000000003506',
    '70000000-0000-4000-a000-000000003507',
    '70000000-0000-4000-a000-000000003508',
    '70000000-0000-4000-a000-000000003509',
    '70000000-0000-4000-a000-000000003510',
    '70000000-0000-4000-a000-000000003511',
    '70000000-0000-4000-a000-000000003512'
  );

  return jsonb_build_object('clearedParentShowcase', true);
end;
$$;

create or replace function public.seed_parent_showcase_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  perform public.clear_parent_showcase_data();

  if exists (
    select 1
    from unnest(array[
      'child_profiles',
      'mentor_applications',
      'organizations',
      'org_applications',
      'org_courses',
      'org_groups',
      'trial_lesson_slots'
    ]) as required_table(table_name)
    where to_regclass(format('public.%I', required_table.table_name)) is null
  ) then
    return jsonb_build_object('seededParentShowcase', false, 'skippedMissingTables', true);
  end if;

  insert into public.mentor_applications (
    id, name, specialization, email, phone, experience, education, bio, photo_emoji,
    photo_url, status, rating, sessions, city, languages, skills, pitch, price
  )
  values
    ('70000000-0000-4000-a000-000000003501', '[DEV] Айгерим Сейдахмет', 'STEM-наставник', 'aigerim.mentor.dev@example.com', '+77015553501', '7 лет', 'Nazarbayev University, Education', 'Помогает детям превращать интерес к технике в понятные проекты и привычку доводить работу до демо.', '👩‍🔬', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'approved', 4.92, 148, 'Алматы', '["Русский","Казахский","Английский"]', '["STEM","Проекты","Подростковая мотивация"]', 'Мягко собираю хаос идей в план на неделю.', 14000),
    ('70000000-0000-4000-a000-000000003502', '[DEV] Тимур Нуртазин', 'Профориентация и IT', 'timur.mentor.dev@example.com', '+77015553502', '6 лет', 'KBTU, Computer Science', 'Работает с подростками, которым интересны кодинг, игры, математика и выбор первого портфолио.', '👨‍💻', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'approved', 4.87, 132, 'Астана', '["Русский","Английский"]', '["IT","Портфолио","Профориентация"]', 'Перевожу интерес к играм в первые реальные навыки разработки.', 15000),
    ('70000000-0000-4000-a000-000000003503', '[DEV] Мадина Омарова', 'Креативные индустрии', 'madina.mentor.dev@example.com', '+77015553503', '9 лет', 'Central Saint Martins short courses', 'Ведет детей через дизайн, визуальное мышление, презентации и творческую уверенность.', '👩‍🎨', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'approved', 4.95, 176, 'Алматы', '["Русский","Казахский"]', '["Дизайн","Портфолио","Креативность"]', 'Помогаю ребенку увидеть, что его стиль уже имеет ценность.', 13000),
    ('70000000-0000-4000-a000-000000003504', '[DEV] Руслан Абдиев', 'Дебаты и коммуникация', 'ruslan.mentor.dev@example.com', '+77015553504', '8 лет', 'КазНУ, Журналистика', 'Тренирует аргументацию, голос, спокойное выступление и социальную уверенность.', '🎙️', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80', 'approved', 4.81, 119, 'Шымкент', '["Русский","Казахский"]', '["Дебаты","Публичные выступления","Лидерство"]', 'Снимаем страх сцены через маленькие победы.', 12000),
    ('70000000-0000-4000-a000-000000003505', '[DEV] Елена Пак', 'Психология обучения', 'elena.mentor.dev@example.com', '+77015553505', '11 лет', 'КазНПУ, Детская психология', 'Помогает настроить учебную нагрузку, внимание, режим и экологичную мотивацию.', '🧠', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80', 'approved', 4.90, 205, 'Алматы', '["Русский","Корейский"]', '["Психология","Навыки учебы","Фокус"]', 'Сначала безопасность и ритм, потом амбиции.', 16000),
    ('70000000-0000-4000-a000-000000003506', '[DEV] Данияр Исаев', 'Инженерия и робототехника', 'daniyar.mentor.dev@example.com', '+77015553506', '10 лет', 'Satbayev University, Robotics', 'Ведет технические проекты: роботы, датчики, 3D-модели, первые инженерные дневники.', '🤖', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 'approved', 4.88, 164, 'Караганда', '["Русский","Казахский","Английский"]', '["Робототехника","Инженерия","Проектное мышление"]', 'Люблю, когда ребенок сам объясняет, почему схема заработала.', 15000),
    ('70000000-0000-4000-a000-000000003507', '[DEV] Салтанат Ким', 'Языки и storytelling', 'saltanat.mentor.dev@example.com', '+77015553507', '6 лет', 'Абылай хан, Foreign Languages', 'Развивает английский, речь, сторителлинг и уверенное общение без школьной скуки.', '📚', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 'approved', 4.78, 98, 'Алматы', '["Русский","Английский","Казахский"]', '["Английский","Storytelling","Коммуникация"]', 'Язык оживает, когда у ребенка есть что сказать.', 11000),
    ('70000000-0000-4000-a000-000000003508', '[DEV] Арман Садыков', 'Математика и олимпиады', 'arman.mentor.dev@example.com', '+77015553508', '12 лет', 'Мехмат КазНУ', 'Поддерживает сильных логиков и тех, кто боится задач: стратегия, темп, понятная математика.', '♟️', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=600&q=80', 'approved', 4.93, 221, 'Астана', '["Русский","Казахский"]', '["Математика","Логика","Олимпиады"]', 'Задача становится дружелюбнее, когда видно ее скелет.', 15000),
    ('70000000-0000-4000-a000-000000003509', '[DEV] Лаура Хасенова', 'Биология и медицина', 'laura.mentor.dev@example.com', '+77015553509', '7 лет', 'Медицинский университет Астана', 'Помогает детям, которым интересны лаборатории, тело человека, медицина и научные наблюдения.', '🧬', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'approved', 4.84, 113, 'Астана', '["Русский","Английский"]', '["Биология","Наука","Исследования"]', 'Любопытство к живому миру можно превратить в аккуратный метод.', 13000),
    ('70000000-0000-4000-a000-000000003510', '[DEV] Самат Ахметов', 'Спорт и дисциплина', 'samat.mentor.dev@example.com', '+77015553510', '9 лет', 'КазАСТ, Coaching', 'Соединяет спортивный интерес с дисциплиной, восстановлением, командностью и самооценкой.', '🏃', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'approved', 4.76, 87, 'Алматы', '["Русский","Казахский"]', '["Спорт","Дисциплина","Командность"]', 'Не давим на результат, строим устойчивость.', 10000),
    ('70000000-0000-4000-a000-000000003511', '[DEV] Жанара Бекова', 'Предпринимательство', 'zhanara.mentor.dev@example.com', '+77015553511', '8 лет', 'AlmaU, MBA', 'Учит подростков проверять идеи, считать простую экономику и презентовать проекты родителям и команде.', '💼', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', 'approved', 4.89, 141, 'Алматы', '["Русский","Казахский","Английский"]', '["Предпринимательство","Презентации","Финансовая грамотность"]', 'Идея взрослеет, когда ее можно проверить за неделю.', 15000),
    ('70000000-0000-4000-a000-000000003512', '[DEV] Никита Морозов', 'Музыка и digital audio', 'nikita.mentor.dev@example.com', '+77015553512', '6 лет', 'Berklee Online certificates', 'Работает с музыкой, битмейкингом, саунд-дизайном и творческой регулярностью.', '🎧', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 'approved', 4.73, 75, 'Алматы', '["Русский","Английский"]', '["Музыка","Саунд-дизайн","Креативность"]', 'Делаем так, чтобы музыка не только нравилась, но и собиралась в трек.', 12000)
  on conflict (id) do update set
    name = excluded.name,
    specialization = excluded.specialization,
    email = excluded.email,
    phone = excluded.phone,
    experience = excluded.experience,
    education = excluded.education,
    bio = excluded.bio,
    photo_emoji = excluded.photo_emoji,
    photo_url = excluded.photo_url,
    status = excluded.status,
    rating = excluded.rating,
    sessions = excluded.sessions,
    city = excluded.city,
    languages = excluded.languages,
    skills = excluded.skills,
    pitch = excluded.pitch,
    price = excluded.price;

  update public.org_courses
  set image_url = case id
    when '70000000-0000-4000-a000-000000000101' then 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
    when '70000000-0000-4000-a000-000000000102' then 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80'
    when '70000000-0000-4000-a000-000000002101' then 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80'
    when '70000000-0000-4000-a000-000000002102' then 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
    when '70000000-0000-4000-a000-000000002103' then 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80'
    when '70000000-0000-4000-a000-000000002104' then 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80'
    when '70000000-0000-4000-a000-000000002105' then 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80'
    else image_url
  end
  where id in (
    '70000000-0000-4000-a000-000000000101',
    '70000000-0000-4000-a000-000000000102',
    '70000000-0000-4000-a000-000000002101',
    '70000000-0000-4000-a000-000000002102',
    '70000000-0000-4000-a000-000000002103',
    '70000000-0000-4000-a000-000000002104',
    '70000000-0000-4000-a000-000000002105'
  );

  insert into public.org_courses (
    id, org_id, title, description, level, price, icon, skills, status, age_min, age_max, image_url
  )
  values
    ('70000000-0000-4000-a000-000000003101', '70000000-0000-4000-a000-000000000001', '[DEV] Game Design Studio', 'Проектируем уровни, персонажей и правила, а затем собираем первый playable-прототип.', 'intermediate', 30000, 'monitor', array['Креативность', 'Дизайн', 'Логика'], 'active', 11, 16, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003102', '70000000-0000-4000-a000-000000000001', '[DEV] AI Junior', 'Нейросети, промпты, мини-боты и этика ИИ в формате понятных подростковых проектов.', 'advanced', 42000, 'cpu', array['AI', 'Крит. мышление', 'Код'], 'active', 13, 17, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003103', '70000000-0000-4000-a000-000000000001', '[DEV] Chess Strategy', 'Шахматы через стратегию, концентрацию, спокойный расчет и разбор партий.', 'beginner', 18000, 'grid', array['Логика', 'Стратегия', 'Фокус'], 'active', 8, 14, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003104', '70000000-0000-4000-a000-000000000001', '[DEV] Python Start', 'Основы Python, маленькие игры, автоматизация и аккуратное мышление программиста.', 'beginner', 28000, 'terminal', array['Код', 'Логика', 'Математика'], 'active', 12, 17, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003105', '70000000-0000-4000-a000-000000002001', '[DEV] 3D Modeling', 'Моделируем простые объекты, сцены и персонажей для игр, печати и портфолио.', 'intermediate', 34000, 'box', array['Дизайн', 'Пространственное мышление', 'Креативность'], 'active', 11, 16, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003106', '70000000-0000-4000-a000-000000002001', '[DEV] Theatre Lab', 'Сцена, голос, импровизация и умение держаться перед группой без зажима.', 'beginner', 22000, 'smile', array['Коммуникация', 'Креативность', 'Уверенность'], 'active', 9, 15, 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003107', '70000000-0000-4000-a000-000000002001', '[DEV] Music Production', 'Биты, аранжировка, запись голоса и первые треки в digital audio workstation.', 'intermediate', 32000, 'headphones', array['Музыка', 'Креативность', 'Фокус'], 'active', 12, 17, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003108', '70000000-0000-4000-a000-000000002001', '[DEV] Photo Storytelling', 'Фотография, композиция, свет и короткие визуальные истории для портфолио.', 'beginner', 26000, 'camera', array['Визуальное мышление', 'Сторителлинг', 'Дизайн'], 'active', 10, 16, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003109', '70000000-0000-4000-a000-000000002002', '[DEV] Chemistry Lab', 'Безопасные опыты, лабораторный дневник, реакции и научные объяснения без зубрежки.', 'beginner', 31000, 'droplet', array['Наука', 'Аналитика', 'Внимательность'], 'active', 11, 16, 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003110', '70000000-0000-4000-a000-000000002002', '[DEV] Space Science', 'Космос, телескопы, физика полета и мини-исследования о планетах и спутниках.', 'intermediate', 33000, 'moon', array['Наука', 'Физика', 'Любопытство'], 'active', 10, 15, 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003111', '70000000-0000-4000-a000-000000002001', '[DEV] Debate Club', 'Аргументы, спокойная речь, командные дебаты и умение отвечать на сложные вопросы.', 'intermediate', 24000, 'message-circle', array['Коммуникация', 'Лидерство', 'Крит. мышление'], 'active', 12, 17, 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003112', '70000000-0000-4000-a000-000000000001', '[DEV] Startup Teens', 'Проверяем идеи, считаем простую экономику, собираем pitch и учимся слышать обратную связь.', 'advanced', 38000, 'briefcase', array['Предпринимательство', 'Презентации', 'Команда'], 'active', 14, 17, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'),
    ('70000000-0000-4000-a000-000000003113', '70000000-0000-4000-a000-000000002001', '[DEV] English Speaking Club', 'Разговорный английский, игры, короткие выступления и словарь для интересов ребенка.', 'beginner', 21000, 'globe', array['Языки', 'Коммуникация', 'Сторителлинг'], 'active', 8, 15, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')
  on conflict (id) do update set
    org_id = excluded.org_id,
    title = excluded.title,
    description = excluded.description,
    level = excluded.level,
    price = excluded.price,
    icon = excluded.icon,
    skills = excluded.skills,
    status = excluded.status,
    age_min = excluded.age_min,
    age_max = excluded.age_max,
    image_url = excluded.image_url,
    updated_at = now();

  insert into public.org_groups (
    id, org_id, course_id, name, course, schedule, capacity, enrolled, active
  )
  values
    ('70000000-0000-4000-a000-000000003301', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000000101', '[DEV] Robotics R-1', '[DEV] Robotics Lab', 'Mon, Wed 16:00', 12, 10, true),
    ('70000000-0000-4000-a000-000000003302', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000000102', '[DEV] Creative Coding C-2', '[DEV] Creative Coding', 'Sat 11:00', 12, 9, true),
    ('70000000-0000-4000-a000-000000003303', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000003101', '[DEV] Game Design G-1', '[DEV] Game Design Studio', 'Tue, Thu 17:00', 10, 8, true),
    ('70000000-0000-4000-a000-000000003304', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000003102', '[DEV] AI Junior A-1', '[DEV] AI Junior', 'Tue, Thu 18:00', 10, 7, true),
    ('70000000-0000-4000-a000-000000003305', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000003103', '[DEV] Chess Strategy S-1', '[DEV] Chess Strategy', 'Sun 11:00', 14, 11, true),
    ('70000000-0000-4000-a000-000000003306', '70000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000003104', '[DEV] Python Start P-1', '[DEV] Python Start', 'Mon, Fri 17:30', 12, 10, true),
    ('70000000-0000-4000-a000-000000003307', '70000000-0000-4000-a000-000000002001', '70000000-0000-4000-a000-000000003105', '[DEV] 3D Modeling M-1', '[DEV] 3D Modeling', 'Wed 17:30', 10, 6, true),
    ('70000000-0000-4000-a000-000000003308', '70000000-0000-4000-a000-000000002001', '70000000-0000-4000-a000-000000003106', '[DEV] Theatre Lab T-1', '[DEV] Theatre Lab', 'Thu 16:30', 12, 8, true),
    ('70000000-0000-4000-a000-000000003309', '70000000-0000-4000-a000-000000002001', '70000000-0000-4000-a000-000000003107', '[DEV] Music Production MP-1', '[DEV] Music Production', 'Sat 14:00', 8, 5, true),
    ('70000000-0000-4000-a000-000000003310', '70000000-0000-4000-a000-000000002002', '70000000-0000-4000-a000-000000003109', '[DEV] Chemistry Lab CH-1', '[DEV] Chemistry Lab', 'Wed 16:00', 10, 8, true),
    ('70000000-0000-4000-a000-000000003311', '70000000-0000-4000-a000-000000002002', '70000000-0000-4000-a000-000000003110', '[DEV] Space Science S-1', '[DEV] Space Science', 'Fri 18:00', 12, 9, true),
    ('70000000-0000-4000-a000-000000003312', '70000000-0000-4000-a000-000000002001', '70000000-0000-4000-a000-000000003111', '[DEV] Debate Club D-1', '[DEV] Debate Club', 'Wed 18:30', 12, 10, true),
    ('70000000-0000-4000-a000-000000003313', '70000000-0000-4000-a000-000000002001', '70000000-0000-4000-a000-000000003113', '[DEV] English Speaking E-1', '[DEV] English Speaking Club', 'Wed 17:30', 12, 9, true)
  on conflict (id) do update set
    org_id = excluded.org_id,
    course_id = excluded.course_id,
    name = excluded.name,
    course = excluded.course,
    schedule = excluded.schedule,
    capacity = excluded.capacity,
    enrolled = excluded.enrolled,
    active = excluded.active;

  insert into public.trial_lesson_slots (
    id, course_id, org_id, day_label, time_label, active, display_order
  )
  values
    ('70000000-0000-4000-a000-000000003801', '70000000-0000-4000-a000-000000003101', '70000000-0000-4000-a000-000000000001', 'Вторник', '17:00', true, 1),
    ('70000000-0000-4000-a000-000000003802', '70000000-0000-4000-a000-000000003102', '70000000-0000-4000-a000-000000000001', 'Четверг', '18:00', true, 1),
    ('70000000-0000-4000-a000-000000003803', '70000000-0000-4000-a000-000000003103', '70000000-0000-4000-a000-000000000001', 'Воскресенье', '11:00', true, 1),
    ('70000000-0000-4000-a000-000000003804', '70000000-0000-4000-a000-000000003104', '70000000-0000-4000-a000-000000000001', 'Понедельник', '17:30', true, 1),
    ('70000000-0000-4000-a000-000000003805', '70000000-0000-4000-a000-000000003105', '70000000-0000-4000-a000-000000002001', 'Среда', '17:30', true, 1),
    ('70000000-0000-4000-a000-000000003806', '70000000-0000-4000-a000-000000003106', '70000000-0000-4000-a000-000000002001', 'Четверг', '16:30', true, 1),
    ('70000000-0000-4000-a000-000000003807', '70000000-0000-4000-a000-000000003107', '70000000-0000-4000-a000-000000002001', 'Суббота', '14:00', true, 1),
    ('70000000-0000-4000-a000-000000003808', '70000000-0000-4000-a000-000000003108', '70000000-0000-4000-a000-000000002001', 'Воскресенье', '12:30', true, 1),
    ('70000000-0000-4000-a000-000000003809', '70000000-0000-4000-a000-000000003109', '70000000-0000-4000-a000-000000002002', 'Среда', '16:00', true, 1),
    ('70000000-0000-4000-a000-000000003810', '70000000-0000-4000-a000-000000003110', '70000000-0000-4000-a000-000000002002', 'Пятница', '18:00', true, 1),
    ('70000000-0000-4000-a000-000000003811', '70000000-0000-4000-a000-000000003111', '70000000-0000-4000-a000-000000002001', 'Среда', '18:30', true, 1),
    ('70000000-0000-4000-a000-000000003812', '70000000-0000-4000-a000-000000003112', '70000000-0000-4000-a000-000000000001', 'Суббота', '15:00', true, 1),
    ('70000000-0000-4000-a000-000000003813', '70000000-0000-4000-a000-000000003113', '70000000-0000-4000-a000-000000002001', 'Среда', '17:30', true, 1)
  on conflict (id) do update set
    course_id = excluded.course_id,
    org_id = excluded.org_id,
    day_label = excluded.day_label,
    time_label = excluded.time_label,
    active = excluded.active,
    display_order = excluded.display_order;

  insert into public.org_applications (
    id, org_id, child_name, child_age, parent_name, club, applied_date, status,
    parent_user_id, child_profile_id, group_id, group_name, group_schedule
  )
  values
    ('70000000-0000-4000-a000-000000003001', '70000000-0000-4000-a000-000000000001', '[DEV] Amina', 10, '[DEV] Dana', '[DEV] Robotics Lab', '3 Jun 2026', 'activated', current_user_id, '70000000-0000-4000-a000-000000001401', '70000000-0000-4000-a000-000000003301', '[DEV] Robotics R-1', 'Mon, Wed 16:00'),
    ('70000000-0000-4000-a000-000000003002', '70000000-0000-4000-a000-000000002001', '[DEV] Amina', 10, '[DEV] Dana', '[DEV] Digital Illustration', '3 Jun 2026', 'activated', current_user_id, '70000000-0000-4000-a000-000000001401', '70000000-0000-4000-a000-000000002303', '[DEV] Illustration I-1', 'Mon, Wed 18:00'),
    ('70000000-0000-4000-a000-000000003003', '70000000-0000-4000-a000-000000000001', '[DEV] Amina', 10, '[DEV] Dana', '[DEV] Math Quest', '3 Jun 2026', 'completed', current_user_id, '70000000-0000-4000-a000-000000001401', '70000000-0000-4000-a000-000000002302', '[DEV] Math Quest M-1', 'Sat 10:00'),
    ('70000000-0000-4000-a000-000000003004', '70000000-0000-4000-a000-000000002001', '[DEV] Amina', 10, '[DEV] Dana', '[DEV] English Speaking Club', '3 Jun 2026', 'activated', current_user_id, '70000000-0000-4000-a000-000000001401', '70000000-0000-4000-a000-000000003313', '[DEV] English Speaking E-1', 'Wed 17:30'),
    ('70000000-0000-4000-a000-000000003005', '70000000-0000-4000-a000-000000000001', '[DEV] Arman', 14, '[DEV] Dana', '[DEV] Creative Coding', '3 Jun 2026', 'activated', current_user_id, '70000000-0000-4000-a000-000000001402', '70000000-0000-4000-a000-000000003302', '[DEV] Creative Coding C-2', 'Sat 11:00'),
    ('70000000-0000-4000-a000-000000003006', '70000000-0000-4000-a000-000000000001', '[DEV] Arman', 14, '[DEV] Dana', '[DEV] AI Junior', '3 Jun 2026', 'activated', current_user_id, '70000000-0000-4000-a000-000000001402', '70000000-0000-4000-a000-000000003304', '[DEV] AI Junior A-1', 'Tue, Thu 18:00')
  on conflict (id) do update set
    org_id = excluded.org_id,
    child_name = excluded.child_name,
    child_age = excluded.child_age,
    parent_name = excluded.parent_name,
    club = excluded.club,
    applied_date = excluded.applied_date,
    status = excluded.status,
    parent_user_id = excluded.parent_user_id,
    child_profile_id = excluded.child_profile_id,
    group_id = excluded.group_id,
    group_name = excluded.group_name,
    group_schedule = excluded.group_schedule;

  update public.child_profiles
  set
    mentor_application_id = case id
      when '70000000-0000-4000-a000-000000001401' then '70000000-0000-4000-a000-000000003501'::uuid
      when '70000000-0000-4000-a000-000000001402' then '70000000-0000-4000-a000-000000003502'::uuid
      else mentor_application_id
    end,
    talent_profile = case id
      when '70000000-0000-4000-a000-000000001401' then jsonb_build_object(
        'childId', '70000000-0000-4000-a000-000000001401',
        'tier', 'basic',
        'ageGroup', '9-11',
        'scores', jsonb_build_object(
          'creativity', 5.2,
          'logic', 5.6,
          'empathy', 2.9,
          'leadership', 3.9,
          'communication', 1.9,
          'analytics', 2.2
        ),
        'recommendedConstellation', 'Architects',
        'summary', '[DEV] BASIC показывает сильную логику, устойчивый интерес к конструированию и аккуратный рост коммуникации. Амине подойдут кружки, где можно собирать руками, объяснять ход мысли и видеть готовый результат.',
        'timestamp', now()
      )
      when '70000000-0000-4000-a000-000000001402' then jsonb_build_object(
        'childId', '70000000-0000-4000-a000-000000001402',
        'tier', 'pro',
        'ageGroup', '12-14',
        'scores', jsonb_build_object(
          'A', 92,
          'I', 86,
          'E', 78,
          'R', 70,
          'S', 64,
          'C', 58
        ),
        'recommendedConstellation', 'Creators',
        'summary', '[DEV] PRO-отчет показывает творческо-исследовательский профиль: Арман быстро генерирует идеи, любит цифровые инструменты и лучше всего раскрывается через проект с видимым результатом.',
        'topStrengths', jsonb_build_array('Визуальное мышление', 'Быстрая генерация идей', 'Интерес к digital-инструментам'),
        'developmentAreas', jsonb_build_array('Доведение прототипа до финальной версии', 'Регулярная рефлексия после занятий'),
        'intellectType', 'Творческо-аналитический интеллект, сильная связка дизайн + технология',
        'personalityBehavior', 'Любит свободу выбора, но лучше удерживает темп при коротких еженедельных дедлайнах.',
        'careerArchetypes', jsonb_build_array('Game designer', 'Product designer', 'Creative technologist'),
        'parentAdvice', 'Давайте Арману пространство для идеи, но фиксируйте маленький измеримый результат каждую неделю.',
        'timestamp', now()
      )
      else talent_profile
    end,
    updated_at = now()
  where id in (
    '70000000-0000-4000-a000-000000001401',
    '70000000-0000-4000-a000-000000001402'
  );

  return jsonb_build_object(
    'seededParentShowcase', true,
    'coursesAdded', 13,
    'mentorsAdded', 12
  );
end;
$$;

grant execute on function public.clear_parent_showcase_data() to authenticated;
grant execute on function public.seed_parent_showcase_data() to authenticated;

notify pgrst, 'reload schema';
