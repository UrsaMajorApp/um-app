-- MVP organization showcase data from the June partner spreadsheet.

alter table public.organizations
  add column if not exists org_type text,
  add column if not exists contact_person text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists capacity int;

alter table public.org_courses
  add column if not exists image_url text;

create table if not exists public.org_groups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  course text,
  schedule text,
  capacity int default 20,
  enrolled int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.org_groups
  add column if not exists course_id uuid;

do $$
begin
  if to_regclass('public.org_courses') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'org_groups_course_id_fkey'
        and conrelid = 'public.org_groups'::regclass
    )
  then
    alter table public.org_groups
      add constraint org_groups_course_id_fkey
      foreign key (course_id) references public.org_courses(id) on delete set null;
  end if;
end $$;

create table if not exists public.trial_lesson_slots (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.org_courses(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  day_label text not null,
  time_label text not null,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists trial_lesson_slots_course_idx
  on public.trial_lesson_slots(course_id, display_order);

alter table public.trial_lesson_slots enable row level security;

drop policy if exists "public reads active trial slots" on public.trial_lesson_slots;
create policy "public reads active trial slots" on public.trial_lesson_slots
  for select using (active = true);

create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.org_courses(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_display_name text,
  rating int not null default 5 check (rating between 1 and 5),
  body text not null,
  status text not null default 'published' check (status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists course_reviews_course_idx
  on public.course_reviews(course_id, created_at desc);

alter table public.course_reviews enable row level security;

drop policy if exists "public reads published course reviews" on public.course_reviews;
create policy "public reads published course reviews" on public.course_reviews
  for select using (status = 'published');

create or replace function public.clear_mvp_organization_showcase_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  org_ids uuid[] := array(
    select ('70000000-0000-4000-a000-' || lpad((4000 + n)::text, 12, '0'))::uuid
    from generate_series(1, 19) as n
  );
  course_ids uuid[] := array(
    select ('70000000-0000-4000-a000-' || lpad((4100 + n)::text, 12, '0'))::uuid
    from generate_series(1, 19) as n
  );
  group_ids uuid[] := array(
    select ('70000000-0000-4000-a000-' || lpad((4300 + n)::text, 12, '0'))::uuid
    from generate_series(1, 19) as n
  );
  slot_ids uuid[] := array(
    select ('70000000-0000-4000-a000-' || lpad((4800 + n)::text, 12, '0'))::uuid
    from generate_series(1, 19) as n
  );
  review_ids uuid[] := array(
    select ('70000000-0000-4000-a000-' || lpad((4900 + n)::text, 12, '0'))::uuid
    from generate_series(1, 19) as n
  );
begin
  perform public.require_dev_seed_admin();

  if to_regclass('public.trial_lesson_requests') is not null then
    delete from public.trial_lesson_requests
    where course_id = any(course_ids)
      or org_id = any(org_ids)
      or course_title like '[MVP] %';
  end if;

  delete from public.org_applications
  where org_id = any(org_ids)
    or club like '[MVP] %';

  delete from public.course_reviews
  where id = any(review_ids)
    or course_id = any(course_ids);

  delete from public.trial_lesson_slots
  where id = any(slot_ids)
    or course_id = any(course_ids)
    or org_id = any(org_ids);

  delete from public.org_groups
  where id = any(group_ids)
    or course_id = any(course_ids)
    or org_id = any(org_ids);

  delete from public.org_courses
  where id = any(course_ids)
    or title like '[MVP] %';

  delete from public.organizations
  where id = any(org_ids)
    or name like '[MVP] %';

  return jsonb_build_object('clearedMvpOrganizations', true);
end;
$$;

create or replace function public.seed_mvp_organization_showcase_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_dev_seed_admin();
begin
  perform public.clear_mvp_organization_showcase_data();

  if exists (
    select 1
    from unnest(array[
      'organizations',
      'org_courses',
      'org_groups',
      'trial_lesson_slots',
      'course_reviews'
    ]) as required_table(table_name)
    where to_regclass(format('public.%I', required_table.table_name)) is null
  ) then
    return jsonb_build_object('seededMvpOrganizations', false, 'skippedMissingTables', true);
  end if;

  with source_rows (
    row_no,
    organization_name,
    course_title,
    category,
    trial_price,
    price_8,
    price_12,
    unlimited_price,
    monthly_price,
    address,
    gis_url,
    instagram_url,
    icon,
    skills,
    image_url,
    age_min,
    age_max,
    schedule,
    day_label,
    time_label
  ) as (
    values
      (1, '7Rays the boxing department взрослые', 'Бокс взрослые', 'Спорт', '3000 тг', '25000', '30000', null, 25000, 'Хусаинова 225', 'https://2gis.kz/almaty/geo/70000001088201807', 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 16, 18, 'Tue, Thu 19:00', 'Вторник', '19:00'),
      (2, '7Rays the boxing department детский', 'Бокс детский', 'Спорт', '3000 тг', '20000', '25000', null, 20000, 'Хусаинова 225', null, 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 7, 15, 'Mon, Wed 17:00', 'Понедельник', '17:00'),
      (3, 'At.crossbar', 'Гимнастика', 'Спорт', '3000-5000', '35000', '42000', '70000', 35000, null, 'https://2gis.kz/almaty/geo/70000001084453459', 'https://www.instagram.com/at.crossbar?igsh=cDd1aTlybTIwcGZt', 'activity', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Tue, Thu 17:30', 'Вторник', '17:30'),
      (4, 'Sharik-Marik', 'Настольный теннис', 'Спорт', '6000', '26000', '32000', null, 26000, 'Улица Навои, 62а/1', 'https://2gis.kz/almaty/geo/70000001034156166', 'https://www.instagram.com/sharikmarikkz', 'circle', array['Логика', 'Команда']::text[], 'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Wed 18:00', 'Понедельник', '18:00'),
      (5, 'Да Винчи', 'Художественная школа', 'Искусство', '4500', '27000', '33800', null, 27000, null, 'https://2gis.kz/almaty/geo/70000001113886556', null, 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 11:00', 'Суббота', '11:00'),
      (6, 'LevelUp', 'Английский язык', 'Языки', null, '36000', '54000', null, 36000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', 'https://www.instagram.com/levelup.kz?igsh=MXFlZGUzOWV3N3JpMw==', 'globe', array['Языки', 'Команда']::text[], 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 16:00', 'Вторник', '16:00'),
      (7, 'Add Padel', 'Настольный теннис / падл', 'Спорт', '8000', '48000', '72000', null, 48000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', null, 'zap', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 18:00', 'Пятница', '18:00'),
      (8, 'Saule Math Coach', 'Математика', 'Образование', '8000-10000', '64000-80000', '96000-120000', null, 64000, 'ЖК Шахристан, Улица Навои, 208/2', 'https://2gis.kz/almaty/geo/70000001100229889', 'https://www.instagram.com/sulyasadykova?igsh=dTM4YTNicmNldXBz', 'hash', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Thu 17:00', 'Понедельник', '17:00'),
      (9, 'Inventor stem school', 'Робототехника', 'Технологии', null, 'junior 26000-32000; middle 32000-35000; senior 42000', null, null, 26000, 'Улица Кажымукана, 16/1', 'https://2gis.kz/almaty/geo/9430047374978065', 'https://www.instagram.com/stem_inventor_almaty', 'cpu', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 17:30', 'Среда', '17:30'),
      (10, 'tokanov development', 'Архитектура и интерьер для детей', 'Дизайн', null, '270000-770000', null, null, 270000, 'Улица Щепкина, 42 блок 2', 'https://2gis.kz/almaty/geo/70030076828290767', 'https://www.instagram.com/tokanov_development', 'home', array['Дизайн', 'Креативность', 'Математика']::text[], 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 10, 17, 'Sat 12:00', 'Суббота', '12:00'),
      (11, 'Центр шахматного искусства Каисса', 'Шахматы', 'Интеллект', 'бесплатно', '25000-30000', null, null, 25000, 'Микрорайон Аксай-1', 'https://2gis.kz/almaty/geo/70000001057029181', 'https://www.instagram.com/kaissa.kz', 'grid', array['Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 11:00', 'Воскресенье', '11:00'),
      (12, 'Ras Studio', 'Студия творчества и музыка', 'Искусство', null, '28000 группа / 46000 индивидуально', null, null, 28000, 'БЦ Комфорт, проспект Гагарина, 309/1', 'https://2gis.kz/almaty/geo/70000001037066622', 'https://www.instagram.com/ras.studio', 'music', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 14:00', 'Суббота', '14:00'),
      (13, 'Carpe Diem', 'Рисование', 'Искусство', 'бесплатно', '40000-50000', '55000-60000', null, 40000, 'Улица Навои, 302', 'https://2gis.kz/almaty/geo/70000001080542278', 'https://www.instagram.com/carpe.diem_art.studio', 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 18:30', 'Вторник', '18:30'),
      (14, 'Ф.К. Jeyran', 'Футбол', 'Спорт', 'бесплатно', '30000', null, null, 30000, 'Микрорайон Орбита-4, 33/2', 'https://2gis.kz/almaty/geo/70000001044513194', 'https://www.instagram.com/jeyran.football.school', 'flag', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Mon, Wed 18:30', 'Понедельник', '18:30'),
      (15, 'Pro orator', 'Ораторское искусство', 'Коммуникация', '5000', '1 месяц 35000 / 3 месяца 105000', null, null, 35000, 'ЖК Assem plaza, Улица Ауэзова, 5', 'https://2gis.kz/almaty/geo/70000001068738585', 'https://www.instagram.com/pro.orator.almaty', 'mic', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 17:00', 'Пятница', '17:00'),
      (16, 'Школа искусств и дизайна им. А. Кастеева', 'Рисование', 'Искусство', null, null, '35000-45000', null, 35000, 'Улица Ауэзова, 38а', 'https://2gis.kz/almaty/geo/9430047375130504', 'https://www.instagram.com/kasteyev.kz', 'pen-tool', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 16:30', 'Среда', '16:30'),
      (17, 'Daina Education', 'Ментальная арифметика', 'Образование', null, '25000', null, null, 25000, 'Улица Ади Шарипова, 32', 'https://2gis.kz/almaty/geo/9430047374967074', 'https://www.instagram.com/dainaeducation', 'plus-square', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 6, 14, 'Tue, Thu 17:00', 'Вторник', '17:00'),
      (18, 'Happy Choice Programming School', 'Программирование', 'Технологии', 'бесплатно', '25000', null, null, 25000, 'ЖК Central Avenue, Проспект Сейфуллина, 574/6', 'https://2gis.kz/almaty/geo/70030076451748899', 'https://www.instagram.com/happy.choice.almaty', 'code', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Sat 10:00', 'Суббота', '10:00'),
      (19, 'Iconic Creative School', 'Актерское искусство', 'Искусство', null, '26900 группа / 52900 индивидуально', '39900 группа / 79900 индивидуально', null, 26900, 'Улица Жамбыла, 76', 'https://2gis.kz/almaty/geo/70030076155029892', 'https://www.instagram.com/creativeschool.kz', 'smile', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 12:00', 'Воскресенье', '12:00')
  )
  insert into public.organizations (
    id,
    owner_user_id,
    name,
    category,
    description,
    status,
    rating,
    active_students,
    commission_pct,
    org_type,
    address,
    city,
    capacity
  )
  select
    ('70000000-0000-4000-a000-' || lpad((4000 + row_no)::text, 12, '0'))::uuid,
    current_user_id,
    '[MVP] ' || organization_name,
    category,
    concat_ws(
      E'\n',
      'MVP организация из таблицы партнеров.',
      'Направление: ' || course_title,
      'Прайс: пробное ' || coalesce(trial_price, '-') || '; 8 занятий ' || coalesce(price_8, '-') || '; 12 занятий ' || coalesce(price_12, '-') || '; безлимит ' || coalesce(unlimited_price, '-'),
      case when gis_url is not null then '2GIS: ' || gis_url end,
      case when instagram_url is not null then 'Instagram: ' || instagram_url end
    ),
    'verified',
    4.70 + ((row_no % 6)::numeric * 0.03),
    18 + (row_no * 2),
    12.00,
    'partner',
    address,
    'Алматы',
    80
  from source_rows
  on conflict (id) do update set
    owner_user_id = excluded.owner_user_id,
    name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    status = excluded.status,
    rating = excluded.rating,
    active_students = excluded.active_students,
    commission_pct = excluded.commission_pct,
    org_type = excluded.org_type,
    address = excluded.address,
    city = excluded.city,
    capacity = excluded.capacity;

  with source_rows (
    row_no,
    organization_name,
    course_title,
    category,
    trial_price,
    price_8,
    price_12,
    unlimited_price,
    monthly_price,
    address,
    gis_url,
    instagram_url,
    icon,
    skills,
    image_url,
    age_min,
    age_max,
    schedule,
    day_label,
    time_label
  ) as (
    values
      (1, '7Rays the boxing department взрослые', 'Бокс взрослые', 'Спорт', '3000 тг', '25000', '30000', null, 25000, 'Хусаинова 225', 'https://2gis.kz/almaty/geo/70000001088201807', 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 16, 18, 'Tue, Thu 19:00', 'Вторник', '19:00'),
      (2, '7Rays the boxing department детский', 'Бокс детский', 'Спорт', '3000 тг', '20000', '25000', null, 20000, 'Хусаинова 225', null, 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 7, 15, 'Mon, Wed 17:00', 'Понедельник', '17:00'),
      (3, 'At.crossbar', 'Гимнастика', 'Спорт', '3000-5000', '35000', '42000', '70000', 35000, null, 'https://2gis.kz/almaty/geo/70000001084453459', 'https://www.instagram.com/at.crossbar?igsh=cDd1aTlybTIwcGZt', 'activity', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Tue, Thu 17:30', 'Вторник', '17:30'),
      (4, 'Sharik-Marik', 'Настольный теннис', 'Спорт', '6000', '26000', '32000', null, 26000, 'Улица Навои, 62а/1', 'https://2gis.kz/almaty/geo/70000001034156166', 'https://www.instagram.com/sharikmarikkz', 'circle', array['Логика', 'Команда']::text[], 'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Wed 18:00', 'Понедельник', '18:00'),
      (5, 'Да Винчи', 'Художественная школа', 'Искусство', '4500', '27000', '33800', null, 27000, null, 'https://2gis.kz/almaty/geo/70000001113886556', null, 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 11:00', 'Суббота', '11:00'),
      (6, 'LevelUp', 'Английский язык', 'Языки', null, '36000', '54000', null, 36000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', 'https://www.instagram.com/levelup.kz?igsh=MXFlZGUzOWV3N3JpMw==', 'globe', array['Языки', 'Команда']::text[], 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 16:00', 'Вторник', '16:00'),
      (7, 'Add Padel', 'Настольный теннис / падл', 'Спорт', '8000', '48000', '72000', null, 48000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', null, 'zap', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 18:00', 'Пятница', '18:00'),
      (8, 'Saule Math Coach', 'Математика', 'Образование', '8000-10000', '64000-80000', '96000-120000', null, 64000, 'ЖК Шахристан, Улица Навои, 208/2', 'https://2gis.kz/almaty/geo/70000001100229889', 'https://www.instagram.com/sulyasadykova?igsh=dTM4YTNicmNldXBz', 'hash', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Thu 17:00', 'Понедельник', '17:00'),
      (9, 'Inventor stem school', 'Робототехника', 'Технологии', null, 'junior 26000-32000; middle 32000-35000; senior 42000', null, null, 26000, 'Улица Кажымукана, 16/1', 'https://2gis.kz/almaty/geo/9430047374978065', 'https://www.instagram.com/stem_inventor_almaty', 'cpu', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 17:30', 'Среда', '17:30'),
      (10, 'tokanov development', 'Архитектура и интерьер для детей', 'Дизайн', null, '270000-770000', null, null, 270000, 'Улица Щепкина, 42 блок 2', 'https://2gis.kz/almaty/geo/70030076828290767', 'https://www.instagram.com/tokanov_development', 'home', array['Дизайн', 'Креативность', 'Математика']::text[], 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 10, 17, 'Sat 12:00', 'Суббота', '12:00'),
      (11, 'Центр шахматного искусства Каисса', 'Шахматы', 'Интеллект', 'бесплатно', '25000-30000', null, null, 25000, 'Микрорайон Аксай-1', 'https://2gis.kz/almaty/geo/70000001057029181', 'https://www.instagram.com/kaissa.kz', 'grid', array['Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 11:00', 'Воскресенье', '11:00'),
      (12, 'Ras Studio', 'Студия творчества и музыка', 'Искусство', null, '28000 группа / 46000 индивидуально', null, null, 28000, 'БЦ Комфорт, проспект Гагарина, 309/1', 'https://2gis.kz/almaty/geo/70000001037066622', 'https://www.instagram.com/ras.studio', 'music', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 14:00', 'Суббота', '14:00'),
      (13, 'Carpe Diem', 'Рисование', 'Искусство', 'бесплатно', '40000-50000', '55000-60000', null, 40000, 'Улица Навои, 302', 'https://2gis.kz/almaty/geo/70000001080542278', 'https://www.instagram.com/carpe.diem_art.studio', 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 18:30', 'Вторник', '18:30'),
      (14, 'Ф.К. Jeyran', 'Футбол', 'Спорт', 'бесплатно', '30000', null, null, 30000, 'Микрорайон Орбита-4, 33/2', 'https://2gis.kz/almaty/geo/70000001044513194', 'https://www.instagram.com/jeyran.football.school', 'flag', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Mon, Wed 18:30', 'Понедельник', '18:30'),
      (15, 'Pro orator', 'Ораторское искусство', 'Коммуникация', '5000', '1 месяц 35000 / 3 месяца 105000', null, null, 35000, 'ЖК Assem plaza, Улица Ауэзова, 5', 'https://2gis.kz/almaty/geo/70000001068738585', 'https://www.instagram.com/pro.orator.almaty', 'mic', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 17:00', 'Пятница', '17:00'),
      (16, 'Школа искусств и дизайна им. А. Кастеева', 'Рисование', 'Искусство', null, null, '35000-45000', null, 35000, 'Улица Ауэзова, 38а', 'https://2gis.kz/almaty/geo/9430047375130504', 'https://www.instagram.com/kasteyev.kz', 'pen-tool', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 16:30', 'Среда', '16:30'),
      (17, 'Daina Education', 'Ментальная арифметика', 'Образование', null, '25000', null, null, 25000, 'Улица Ади Шарипова, 32', 'https://2gis.kz/almaty/geo/9430047374967074', 'https://www.instagram.com/dainaeducation', 'plus-square', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 6, 14, 'Tue, Thu 17:00', 'Вторник', '17:00'),
      (18, 'Happy Choice Programming School', 'Программирование', 'Технологии', 'бесплатно', '25000', null, null, 25000, 'ЖК Central Avenue, Проспект Сейфуллина, 574/6', 'https://2gis.kz/almaty/geo/70030076451748899', 'https://www.instagram.com/happy.choice.almaty', 'code', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Sat 10:00', 'Суббота', '10:00'),
      (19, 'Iconic Creative School', 'Актерское искусство', 'Искусство', null, '26900 группа / 52900 индивидуально', '39900 группа / 79900 индивидуально', null, 26900, 'Улица Жамбыла, 76', 'https://2gis.kz/almaty/geo/70030076155029892', 'https://www.instagram.com/creativeschool.kz', 'smile', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 12:00', 'Воскресенье', '12:00')
  )
  insert into public.org_courses (
    id,
    org_id,
    title,
    description,
    level,
    price,
    icon,
    skills,
    status,
    age_min,
    age_max,
    image_url
  )
  select
    ('70000000-0000-4000-a000-' || lpad((4100 + row_no)::text, 12, '0'))::uuid,
    ('70000000-0000-4000-a000-' || lpad((4000 + row_no)::text, 12, '0'))::uuid,
    '[MVP] ' || course_title,
    concat_ws(
      ' ',
      course_title || ' от ' || organization_name || '.',
      'Пробное: ' || coalesce(trial_price, 'уточняется') || '.',
      'Адрес: ' || coalesce(address, 'уточняется') || '.'
    ),
    case
      when row_no in (9, 10, 18) then 'intermediate'
      else 'beginner'
    end,
    monthly_price,
    icon,
    skills,
    'active',
    age_min,
    age_max,
    image_url
  from source_rows
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

  with source_rows (
    row_no,
    organization_name,
    course_title,
    category,
    trial_price,
    price_8,
    price_12,
    unlimited_price,
    monthly_price,
    address,
    gis_url,
    instagram_url,
    icon,
    skills,
    image_url,
    age_min,
    age_max,
    schedule,
    day_label,
    time_label
  ) as (
    values
      (1, '7Rays the boxing department взрослые', 'Бокс взрослые', 'Спорт', '3000 тг', '25000', '30000', null, 25000, 'Хусаинова 225', 'https://2gis.kz/almaty/geo/70000001088201807', 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 16, 18, 'Tue, Thu 19:00', 'Вторник', '19:00'),
      (2, '7Rays the boxing department детский', 'Бокс детский', 'Спорт', '3000 тг', '20000', '25000', null, 20000, 'Хусаинова 225', null, 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 7, 15, 'Mon, Wed 17:00', 'Понедельник', '17:00'),
      (3, 'At.crossbar', 'Гимнастика', 'Спорт', '3000-5000', '35000', '42000', '70000', 35000, null, 'https://2gis.kz/almaty/geo/70000001084453459', 'https://www.instagram.com/at.crossbar?igsh=cDd1aTlybTIwcGZt', 'activity', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Tue, Thu 17:30', 'Вторник', '17:30'),
      (4, 'Sharik-Marik', 'Настольный теннис', 'Спорт', '6000', '26000', '32000', null, 26000, 'Улица Навои, 62а/1', 'https://2gis.kz/almaty/geo/70000001034156166', 'https://www.instagram.com/sharikmarikkz', 'circle', array['Логика', 'Команда']::text[], 'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Wed 18:00', 'Понедельник', '18:00'),
      (5, 'Да Винчи', 'Художественная школа', 'Искусство', '4500', '27000', '33800', null, 27000, null, 'https://2gis.kz/almaty/geo/70000001113886556', null, 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 11:00', 'Суббота', '11:00'),
      (6, 'LevelUp', 'Английский язык', 'Языки', null, '36000', '54000', null, 36000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', 'https://www.instagram.com/levelup.kz?igsh=MXFlZGUzOWV3N3JpMw==', 'globe', array['Языки', 'Команда']::text[], 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 16:00', 'Вторник', '16:00'),
      (7, 'Add Padel', 'Настольный теннис / падл', 'Спорт', '8000', '48000', '72000', null, 48000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', null, 'zap', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 18:00', 'Пятница', '18:00'),
      (8, 'Saule Math Coach', 'Математика', 'Образование', '8000-10000', '64000-80000', '96000-120000', null, 64000, 'ЖК Шахристан, Улица Навои, 208/2', 'https://2gis.kz/almaty/geo/70000001100229889', 'https://www.instagram.com/sulyasadykova?igsh=dTM4YTNicmNldXBz', 'hash', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Thu 17:00', 'Понедельник', '17:00'),
      (9, 'Inventor stem school', 'Робототехника', 'Технологии', null, 'junior 26000-32000; middle 32000-35000; senior 42000', null, null, 26000, 'Улица Кажымукана, 16/1', 'https://2gis.kz/almaty/geo/9430047374978065', 'https://www.instagram.com/stem_inventor_almaty', 'cpu', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 17:30', 'Среда', '17:30'),
      (10, 'tokanov development', 'Архитектура и интерьер для детей', 'Дизайн', null, '270000-770000', null, null, 270000, 'Улица Щепкина, 42 блок 2', 'https://2gis.kz/almaty/geo/70030076828290767', 'https://www.instagram.com/tokanov_development', 'home', array['Дизайн', 'Креативность', 'Математика']::text[], 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 10, 17, 'Sat 12:00', 'Суббота', '12:00'),
      (11, 'Центр шахматного искусства Каисса', 'Шахматы', 'Интеллект', 'бесплатно', '25000-30000', null, null, 25000, 'Микрорайон Аксай-1', 'https://2gis.kz/almaty/geo/70000001057029181', 'https://www.instagram.com/kaissa.kz', 'grid', array['Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 11:00', 'Воскресенье', '11:00'),
      (12, 'Ras Studio', 'Студия творчества и музыка', 'Искусство', null, '28000 группа / 46000 индивидуально', null, null, 28000, 'БЦ Комфорт, проспект Гагарина, 309/1', 'https://2gis.kz/almaty/geo/70000001037066622', 'https://www.instagram.com/ras.studio', 'music', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 14:00', 'Суббота', '14:00'),
      (13, 'Carpe Diem', 'Рисование', 'Искусство', 'бесплатно', '40000-50000', '55000-60000', null, 40000, 'Улица Навои, 302', 'https://2gis.kz/almaty/geo/70000001080542278', 'https://www.instagram.com/carpe.diem_art.studio', 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 18:30', 'Вторник', '18:30'),
      (14, 'Ф.К. Jeyran', 'Футбол', 'Спорт', 'бесплатно', '30000', null, null, 30000, 'Микрорайон Орбита-4, 33/2', 'https://2gis.kz/almaty/geo/70000001044513194', 'https://www.instagram.com/jeyran.football.school', 'flag', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Mon, Wed 18:30', 'Понедельник', '18:30'),
      (15, 'Pro orator', 'Ораторское искусство', 'Коммуникация', '5000', '1 месяц 35000 / 3 месяца 105000', null, null, 35000, 'ЖК Assem plaza, Улица Ауэзова, 5', 'https://2gis.kz/almaty/geo/70000001068738585', 'https://www.instagram.com/pro.orator.almaty', 'mic', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 17:00', 'Пятница', '17:00'),
      (16, 'Школа искусств и дизайна им. А. Кастеева', 'Рисование', 'Искусство', null, null, '35000-45000', null, 35000, 'Улица Ауэзова, 38а', 'https://2gis.kz/almaty/geo/9430047375130504', 'https://www.instagram.com/kasteyev.kz', 'pen-tool', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 16:30', 'Среда', '16:30'),
      (17, 'Daina Education', 'Ментальная арифметика', 'Образование', null, '25000', null, null, 25000, 'Улица Ади Шарипова, 32', 'https://2gis.kz/almaty/geo/9430047374967074', 'https://www.instagram.com/dainaeducation', 'plus-square', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 6, 14, 'Tue, Thu 17:00', 'Вторник', '17:00'),
      (18, 'Happy Choice Programming School', 'Программирование', 'Технологии', 'бесплатно', '25000', null, null, 25000, 'ЖК Central Avenue, Проспект Сейфуллина, 574/6', 'https://2gis.kz/almaty/geo/70030076451748899', 'https://www.instagram.com/happy.choice.almaty', 'code', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Sat 10:00', 'Суббота', '10:00'),
      (19, 'Iconic Creative School', 'Актерское искусство', 'Искусство', null, '26900 группа / 52900 индивидуально', '39900 группа / 79900 индивидуально', null, 26900, 'Улица Жамбыла, 76', 'https://2gis.kz/almaty/geo/70030076155029892', 'https://www.instagram.com/creativeschool.kz', 'smile', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 12:00', 'Воскресенье', '12:00')
  )
  insert into public.org_groups (
    id,
    org_id,
    course_id,
    name,
    course,
    schedule,
    capacity,
    enrolled,
    active
  )
  select
    ('70000000-0000-4000-a000-' || lpad((4300 + row_no)::text, 12, '0'))::uuid,
    ('70000000-0000-4000-a000-' || lpad((4000 + row_no)::text, 12, '0'))::uuid,
    ('70000000-0000-4000-a000-' || lpad((4100 + row_no)::text, 12, '0'))::uuid,
    '[MVP] ' || left(course_title, 34) || ' G-' || row_no,
    '[MVP] ' || course_title,
    schedule,
    12,
    4 + (row_no % 7),
    true
  from source_rows
  on conflict (id) do update set
    org_id = excluded.org_id,
    course_id = excluded.course_id,
    name = excluded.name,
    course = excluded.course,
    schedule = excluded.schedule,
    capacity = excluded.capacity,
    enrolled = excluded.enrolled,
    active = excluded.active;

  with source_rows (
    row_no,
    organization_name,
    course_title,
    category,
    trial_price,
    price_8,
    price_12,
    unlimited_price,
    monthly_price,
    address,
    gis_url,
    instagram_url,
    icon,
    skills,
    image_url,
    age_min,
    age_max,
    schedule,
    day_label,
    time_label
  ) as (
    values
      (1, '7Rays the boxing department взрослые', 'Бокс взрослые', 'Спорт', '3000 тг', '25000', '30000', null, 25000, 'Хусаинова 225', 'https://2gis.kz/almaty/geo/70000001088201807', 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 16, 18, 'Tue, Thu 19:00', 'Вторник', '19:00'),
      (2, '7Rays the boxing department детский', 'Бокс детский', 'Спорт', '3000 тг', '20000', '25000', null, 20000, 'Хусаинова 225', null, 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 7, 15, 'Mon, Wed 17:00', 'Понедельник', '17:00'),
      (3, 'At.crossbar', 'Гимнастика', 'Спорт', '3000-5000', '35000', '42000', '70000', 35000, null, 'https://2gis.kz/almaty/geo/70000001084453459', 'https://www.instagram.com/at.crossbar?igsh=cDd1aTlybTIwcGZt', 'activity', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Tue, Thu 17:30', 'Вторник', '17:30'),
      (4, 'Sharik-Marik', 'Настольный теннис', 'Спорт', '6000', '26000', '32000', null, 26000, 'Улица Навои, 62а/1', 'https://2gis.kz/almaty/geo/70000001034156166', 'https://www.instagram.com/sharikmarikkz', 'circle', array['Логика', 'Команда']::text[], 'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Wed 18:00', 'Понедельник', '18:00'),
      (5, 'Да Винчи', 'Художественная школа', 'Искусство', '4500', '27000', '33800', null, 27000, null, 'https://2gis.kz/almaty/geo/70000001113886556', null, 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 11:00', 'Суббота', '11:00'),
      (6, 'LevelUp', 'Английский язык', 'Языки', null, '36000', '54000', null, 36000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', 'https://www.instagram.com/levelup.kz?igsh=MXFlZGUzOWV3N3JpMw==', 'globe', array['Языки', 'Команда']::text[], 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 16:00', 'Вторник', '16:00'),
      (7, 'Add Padel', 'Настольный теннис / падл', 'Спорт', '8000', '48000', '72000', null, 48000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', null, 'zap', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 18:00', 'Пятница', '18:00'),
      (8, 'Saule Math Coach', 'Математика', 'Образование', '8000-10000', '64000-80000', '96000-120000', null, 64000, 'ЖК Шахристан, Улица Навои, 208/2', 'https://2gis.kz/almaty/geo/70000001100229889', 'https://www.instagram.com/sulyasadykova?igsh=dTM4YTNicmNldXBz', 'hash', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Thu 17:00', 'Понедельник', '17:00'),
      (9, 'Inventor stem school', 'Робототехника', 'Технологии', null, 'junior 26000-32000; middle 32000-35000; senior 42000', null, null, 26000, 'Улица Кажымукана, 16/1', 'https://2gis.kz/almaty/geo/9430047374978065', 'https://www.instagram.com/stem_inventor_almaty', 'cpu', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 17:30', 'Среда', '17:30'),
      (10, 'tokanov development', 'Архитектура и интерьер для детей', 'Дизайн', null, '270000-770000', null, null, 270000, 'Улица Щепкина, 42 блок 2', 'https://2gis.kz/almaty/geo/70030076828290767', 'https://www.instagram.com/tokanov_development', 'home', array['Дизайн', 'Креативность', 'Математика']::text[], 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 10, 17, 'Sat 12:00', 'Суббота', '12:00'),
      (11, 'Центр шахматного искусства Каисса', 'Шахматы', 'Интеллект', 'бесплатно', '25000-30000', null, null, 25000, 'Микрорайон Аксай-1', 'https://2gis.kz/almaty/geo/70000001057029181', 'https://www.instagram.com/kaissa.kz', 'grid', array['Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 11:00', 'Воскресенье', '11:00'),
      (12, 'Ras Studio', 'Студия творчества и музыка', 'Искусство', null, '28000 группа / 46000 индивидуально', null, null, 28000, 'БЦ Комфорт, проспект Гагарина, 309/1', 'https://2gis.kz/almaty/geo/70000001037066622', 'https://www.instagram.com/ras.studio', 'music', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 14:00', 'Суббота', '14:00'),
      (13, 'Carpe Diem', 'Рисование', 'Искусство', 'бесплатно', '40000-50000', '55000-60000', null, 40000, 'Улица Навои, 302', 'https://2gis.kz/almaty/geo/70000001080542278', 'https://www.instagram.com/carpe.diem_art.studio', 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 18:30', 'Вторник', '18:30'),
      (14, 'Ф.К. Jeyran', 'Футбол', 'Спорт', 'бесплатно', '30000', null, null, 30000, 'Микрорайон Орбита-4, 33/2', 'https://2gis.kz/almaty/geo/70000001044513194', 'https://www.instagram.com/jeyran.football.school', 'flag', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Mon, Wed 18:30', 'Понедельник', '18:30'),
      (15, 'Pro orator', 'Ораторское искусство', 'Коммуникация', '5000', '1 месяц 35000 / 3 месяца 105000', null, null, 35000, 'ЖК Assem plaza, Улица Ауэзова, 5', 'https://2gis.kz/almaty/geo/70000001068738585', 'https://www.instagram.com/pro.orator.almaty', 'mic', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 17:00', 'Пятница', '17:00'),
      (16, 'Школа искусств и дизайна им. А. Кастеева', 'Рисование', 'Искусство', null, null, '35000-45000', null, 35000, 'Улица Ауэзова, 38а', 'https://2gis.kz/almaty/geo/9430047375130504', 'https://www.instagram.com/kasteyev.kz', 'pen-tool', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 16:30', 'Среда', '16:30'),
      (17, 'Daina Education', 'Ментальная арифметика', 'Образование', null, '25000', null, null, 25000, 'Улица Ади Шарипова, 32', 'https://2gis.kz/almaty/geo/9430047374967074', 'https://www.instagram.com/dainaeducation', 'plus-square', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 6, 14, 'Tue, Thu 17:00', 'Вторник', '17:00'),
      (18, 'Happy Choice Programming School', 'Программирование', 'Технологии', 'бесплатно', '25000', null, null, 25000, 'ЖК Central Avenue, Проспект Сейфуллина, 574/6', 'https://2gis.kz/almaty/geo/70030076451748899', 'https://www.instagram.com/happy.choice.almaty', 'code', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Sat 10:00', 'Суббота', '10:00'),
      (19, 'Iconic Creative School', 'Актерское искусство', 'Искусство', null, '26900 группа / 52900 индивидуально', '39900 группа / 79900 индивидуально', null, 26900, 'Улица Жамбыла, 76', 'https://2gis.kz/almaty/geo/70030076155029892', 'https://www.instagram.com/creativeschool.kz', 'smile', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 12:00', 'Воскресенье', '12:00')
  )
  insert into public.trial_lesson_slots (
    id,
    course_id,
    org_id,
    day_label,
    time_label,
    active,
    display_order
  )
  select
    ('70000000-0000-4000-a000-' || lpad((4800 + row_no)::text, 12, '0'))::uuid,
    ('70000000-0000-4000-a000-' || lpad((4100 + row_no)::text, 12, '0'))::uuid,
    ('70000000-0000-4000-a000-' || lpad((4000 + row_no)::text, 12, '0'))::uuid,
    day_label,
    time_label,
    true,
    row_no
  from source_rows
  on conflict (id) do update set
    course_id = excluded.course_id,
    org_id = excluded.org_id,
    day_label = excluded.day_label,
    time_label = excluded.time_label,
    active = excluded.active,
    display_order = excluded.display_order;

  with source_rows (
    row_no,
    organization_name,
    course_title,
    category,
    trial_price,
    price_8,
    price_12,
    unlimited_price,
    monthly_price,
    address,
    gis_url,
    instagram_url,
    icon,
    skills,
    image_url,
    age_min,
    age_max,
    schedule,
    day_label,
    time_label
  ) as (
    values
      (1, '7Rays the boxing department взрослые', 'Бокс взрослые', 'Спорт', '3000 тг', '25000', '30000', null, 25000, 'Хусаинова 225', 'https://2gis.kz/almaty/geo/70000001088201807', 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 16, 18, 'Tue, Thu 19:00', 'Вторник', '19:00'),
      (2, '7Rays the boxing department детский', 'Бокс детский', 'Спорт', '3000 тг', '20000', '25000', null, 20000, 'Хусаинова 225', null, 'https://www.instagram.com/7raysboxing', 'target', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80', 7, 15, 'Mon, Wed 17:00', 'Понедельник', '17:00'),
      (3, 'At.crossbar', 'Гимнастика', 'Спорт', '3000-5000', '35000', '42000', '70000', 35000, null, 'https://2gis.kz/almaty/geo/70000001084453459', 'https://www.instagram.com/at.crossbar?igsh=cDd1aTlybTIwcGZt', 'activity', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Tue, Thu 17:30', 'Вторник', '17:30'),
      (4, 'Sharik-Marik', 'Настольный теннис', 'Спорт', '6000', '26000', '32000', null, 26000, 'Улица Навои, 62а/1', 'https://2gis.kz/almaty/geo/70000001034156166', 'https://www.instagram.com/sharikmarikkz', 'circle', array['Логика', 'Команда']::text[], 'https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Wed 18:00', 'Понедельник', '18:00'),
      (5, 'Да Винчи', 'Художественная школа', 'Искусство', '4500', '27000', '33800', null, 27000, null, 'https://2gis.kz/almaty/geo/70000001113886556', null, 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 11:00', 'Суббота', '11:00'),
      (6, 'LevelUp', 'Английский язык', 'Языки', null, '36000', '54000', null, 36000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', 'https://www.instagram.com/levelup.kz?igsh=MXFlZGUzOWV3N3JpMw==', 'globe', array['Языки', 'Команда']::text[], 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 16:00', 'Вторник', '16:00'),
      (7, 'Add Padel', 'Настольный теннис / падл', 'Спорт', '8000', '48000', '72000', null, 48000, 'Проспект Серкебаева', 'https://2gis.kz/almaty/geo/70000001093467183', null, 'zap', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 18:00', 'Пятница', '18:00'),
      (8, 'Saule Math Coach', 'Математика', 'Образование', '8000-10000', '64000-80000', '96000-120000', null, 64000, 'ЖК Шахристан, Улица Навои, 208/2', 'https://2gis.kz/almaty/geo/70000001100229889', 'https://www.instagram.com/sulyasadykova?igsh=dTM4YTNicmNldXBz', 'hash', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 7, 17, 'Mon, Thu 17:00', 'Понедельник', '17:00'),
      (9, 'Inventor stem school', 'Робототехника', 'Технологии', null, 'junior 26000-32000; middle 32000-35000; senior 42000', null, null, 26000, 'Улица Кажымукана, 16/1', 'https://2gis.kz/almaty/geo/9430047374978065', 'https://www.instagram.com/stem_inventor_almaty', 'cpu', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 17:30', 'Среда', '17:30'),
      (10, 'tokanov development', 'Архитектура и интерьер для детей', 'Дизайн', null, '270000-770000', null, null, 270000, 'Улица Щепкина, 42 блок 2', 'https://2gis.kz/almaty/geo/70030076828290767', 'https://www.instagram.com/tokanov_development', 'home', array['Дизайн', 'Креативность', 'Математика']::text[], 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 10, 17, 'Sat 12:00', 'Суббота', '12:00'),
      (11, 'Центр шахматного искусства Каисса', 'Шахматы', 'Интеллект', 'бесплатно', '25000-30000', null, null, 25000, 'Микрорайон Аксай-1', 'https://2gis.kz/almaty/geo/70000001057029181', 'https://www.instagram.com/kaissa.kz', 'grid', array['Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 11:00', 'Воскресенье', '11:00'),
      (12, 'Ras Studio', 'Студия творчества и музыка', 'Искусство', null, '28000 группа / 46000 индивидуально', null, null, 28000, 'БЦ Комфорт, проспект Гагарина, 309/1', 'https://2gis.kz/almaty/geo/70000001037066622', 'https://www.instagram.com/ras.studio', 'music', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sat 14:00', 'Суббота', '14:00'),
      (13, 'Carpe Diem', 'Рисование', 'Искусство', 'бесплатно', '40000-50000', '55000-60000', null, 40000, 'Улица Навои, 302', 'https://2gis.kz/almaty/geo/70000001080542278', 'https://www.instagram.com/carpe.diem_art.studio', 'edit-3', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Tue, Thu 18:30', 'Вторник', '18:30'),
      (14, 'Ф.К. Jeyran', 'Футбол', 'Спорт', 'бесплатно', '30000', null, null, 30000, 'Микрорайон Орбита-4, 33/2', 'https://2gis.kz/almaty/geo/70000001044513194', 'https://www.instagram.com/jeyran.football.school', 'flag', array['Команда', 'Логика']::text[], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', 5, 16, 'Mon, Wed 18:30', 'Понедельник', '18:30'),
      (15, 'Pro orator', 'Ораторское искусство', 'Коммуникация', '5000', '1 месяц 35000 / 3 месяца 105000', null, null, 35000, 'ЖК Assem plaza, Улица Ауэзова, 5', 'https://2gis.kz/almaty/geo/70000001068738585', 'https://www.instagram.com/pro.orator.almaty', 'mic', array['Команда', 'Креативность']::text[], 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Fri 17:00', 'Пятница', '17:00'),
      (16, 'Школа искусств и дизайна им. А. Кастеева', 'Рисование', 'Искусство', null, null, '35000-45000', null, 35000, 'Улица Ауэзова, 38а', 'https://2gis.kz/almaty/geo/9430047375130504', 'https://www.instagram.com/kasteyev.kz', 'pen-tool', array['Креативность', 'Дизайн']::text[], 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Wed 16:30', 'Среда', '16:30'),
      (17, 'Daina Education', 'Ментальная арифметика', 'Образование', null, '25000', null, null, 25000, 'Улица Ади Шарипова, 32', 'https://2gis.kz/almaty/geo/9430047374967074', 'https://www.instagram.com/dainaeducation', 'plus-square', array['Математика', 'Логика']::text[], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', 6, 14, 'Tue, Thu 17:00', 'Вторник', '17:00'),
      (18, 'Happy Choice Programming School', 'Программирование', 'Технологии', 'бесплатно', '25000', null, null, 25000, 'ЖК Central Avenue, Проспект Сейфуллина, 574/6', 'https://2gis.kz/almaty/geo/70030076451748899', 'https://www.instagram.com/happy.choice.almaty', 'code', array['Код', 'Логика', 'Математика']::text[], 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80', 8, 17, 'Sat 10:00', 'Суббота', '10:00'),
      (19, 'Iconic Creative School', 'Актерское искусство', 'Искусство', null, '26900 группа / 52900 индивидуально', '39900 группа / 79900 индивидуально', null, 26900, 'Улица Жамбыла, 76', 'https://2gis.kz/almaty/geo/70030076155029892', 'https://www.instagram.com/creativeschool.kz', 'smile', array['Креативность', 'Команда']::text[], 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80', 6, 17, 'Sun 12:00', 'Воскресенье', '12:00')
  )
  insert into public.course_reviews (
    id,
    course_id,
    author_user_id,
    author_display_name,
    rating,
    body,
    status
  )
  select
    ('70000000-0000-4000-a000-' || lpad((4900 + row_no)::text, 12, '0'))::uuid,
    ('70000000-0000-4000-a000-' || lpad((4100 + row_no)::text, 12, '0'))::uuid,
    current_user_id,
    '[MVP] Родитель',
    5,
    'Удобная запись, понятное расписание и хороший формат для знакомства с направлением "' || course_title || '".',
    'published'
  from source_rows
  on conflict (id) do update set
    course_id = excluded.course_id,
    author_user_id = excluded.author_user_id,
    author_display_name = excluded.author_display_name,
    rating = excluded.rating,
    body = excluded.body,
    status = excluded.status;

  return jsonb_build_object('seededMvpOrganizations', true, 'organizationsAdded', 19, 'coursesAdded', 19);
end;
$$;

grant execute on function public.clear_mvp_organization_showcase_data() to authenticated;
grant execute on function public.seed_mvp_organization_showcase_data() to authenticated;
