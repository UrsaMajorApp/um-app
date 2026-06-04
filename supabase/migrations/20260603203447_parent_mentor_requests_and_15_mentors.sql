-- Parent mentor booking requests and the remaining mentor showcase profiles.

alter table public.mentor_applications
  add column if not exists photo_url text;

create table if not exists public.parent_mentor_requests (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.um_user_profiles(id) on delete cascade,
  child_profile_id text,
  child_name text not null,
  mentor_application_id uuid not null references public.mentor_applications(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  preferred_slots text[] not null default '{}',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parent_mentor_requests_parent_idx
  on public.parent_mentor_requests(parent_user_id, child_profile_id, status);

create index if not exists parent_mentor_requests_mentor_idx
  on public.parent_mentor_requests(mentor_application_id, status);

create unique index if not exists parent_mentor_requests_active_unique_idx
  on public.parent_mentor_requests(parent_user_id, child_profile_id, mentor_application_id)
  where status in ('pending', 'confirmed') and child_profile_id is not null;

alter table public.parent_mentor_requests enable row level security;

drop policy if exists "parent reads own mentor requests" on public.parent_mentor_requests;
create policy "parent reads own mentor requests" on public.parent_mentor_requests
  for select
  using (parent_user_id = auth.uid() or public.is_admin());

drop policy if exists "parent creates own mentor requests" on public.parent_mentor_requests;
create policy "parent creates own mentor requests" on public.parent_mentor_requests
  for insert
  with check (parent_user_id = auth.uid());

drop policy if exists "parent cancels own mentor requests" on public.parent_mentor_requests;
create policy "parent cancels own mentor requests" on public.parent_mentor_requests
  for update
  using (parent_user_id = auth.uid() or public.is_admin())
  with check (parent_user_id = auth.uid() or public.is_admin());

drop policy if exists "mentor reads assigned parent requests" on public.parent_mentor_requests;
create policy "mentor reads assigned parent requests" on public.parent_mentor_requests
  for select
  using (
    exists (
      select 1
      from public.mentor_applications m
      where m.id = parent_mentor_requests.mentor_application_id
        and m.user_id = auth.uid()
    )
    or public.is_admin()
  );

create or replace function public.clear_parent_mentor_request_showcase_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  delete from public.parent_mentor_requests
  where mentor_application_id in (
    '70000000-0000-4000-a000-000000003513',
    '70000000-0000-4000-a000-000000003514',
    '70000000-0000-4000-a000-000000003515'
  );

  delete from public.mentor_applications
  where id in (
    '70000000-0000-4000-a000-000000003513',
    '70000000-0000-4000-a000-000000003514',
    '70000000-0000-4000-a000-000000003515'
  );

  return jsonb_build_object('clearedParentMentorRequestShowcase', true);
end;
$$;

create or replace function public.seed_parent_mentor_request_showcase_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_dev_seed_admin();

  if exists (
    select 1
    from unnest(array[
      'mentor_applications',
      'parent_mentor_requests'
    ]) as required_table(table_name)
    where to_regclass(format('public.%I', required_table.table_name)) is null
  ) then
    return jsonb_build_object('seededParentMentorRequests', false, 'skippedMissingTables', true);
  end if;

  insert into public.mentor_applications (
    id, name, specialization, email, phone, experience, education, bio, photo_emoji,
    photo_url, status, rating, sessions, city, languages, skills, pitch, price
  )
  values
    (
      '70000000-0000-4000-a000-000000003513',
      '[DEV] Камилла Рахимова',
      'Эмоциональный интеллект',
      'kamilla.mentor.dev@example.com',
      '+77015553513',
      '8 лет',
      'КазНПУ, Педагогика и коучинг',
      'Помогает детям мягко разбирать эмоции, тревогу перед выступлениями и уверенность в группе.',
      '🌿',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      'approved',
      4.86,
      126,
      'Алматы',
      '["Русский","Казахский"]',
      '["Эмоциональный интеллект","Уверенность","Коммуникация"]',
      'Сначала учимся слышать себя, потом спокойнее показываем результат другим.',
      13000
    ),
    (
      '70000000-0000-4000-a000-000000003514',
      '[DEV] Марат Сулейменов',
      'Спорт, фокус и режим',
      'marat.mentor.dev@example.com',
      '+77015553514',
      '10 лет',
      'КазАСТ, спортивная психология',
      'Работает с детьми, которым нужна дисциплина без давления: сон, тренировки, восстановление, командная роль.',
      '🏅',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      'approved',
      4.82,
      154,
      'Алматы',
      '["Русский","Казахский","Английский"]',
      '["Спорт","Фокус","Командность"]',
      'Собираем устойчивый режим, который ребенок действительно может держать.',
      12000
    ),
    (
      '70000000-0000-4000-a000-000000003515',
      '[DEV] Инесса Вон',
      'Музыка, сцена и портфолио',
      'inessa.mentor.dev@example.com',
      '+77015553515',
      '9 лет',
      'Berklee Online, Music Business certificates',
      'Помогает детям превратить музыку, актерство или сценический интерес в регулярную практику и маленькое портфолио.',
      '🎼',
      'https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=600&q=80',
      'approved',
      4.91,
      169,
      'Алматы',
      '["Русский","Английский"]',
      '["Музыка","Сцена","Креативность"]',
      'Творчество становится сильнее, когда у него есть ритм и бережная обратная связь.',
      14000
    )
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

  return jsonb_build_object('seededParentMentorRequests', true, 'mentorsAdded', 3);
end;
$$;

grant execute on function public.clear_parent_mentor_request_showcase_data() to authenticated;
grant execute on function public.seed_parent_mentor_request_showcase_data() to authenticated;
