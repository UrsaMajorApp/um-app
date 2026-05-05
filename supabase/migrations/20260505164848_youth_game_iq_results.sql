-- Persist IQ awarded from youth games as append-only completion events.

create table if not exists public.youth_game_results (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  game_id      text not null check (game_id in ('memory', 'sudoku', 'minesweeper', '2048')),
  iq_points    int not null check (iq_points > 0 and iq_points <= 10000),
  game_score   int,
  metadata     jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists youth_game_results_user_completed_idx
  on public.youth_game_results (user_id, completed_at desc);

create index if not exists youth_game_results_user_game_idx
  on public.youth_game_results (user_id, game_id);

alter table public.youth_game_results enable row level security;

drop policy if exists "youth reads own game results" on public.youth_game_results;
create policy "youth reads own game results" on public.youth_game_results
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "youth inserts own game results" on public.youth_game_results;
create policy "youth inserts own game results" on public.youth_game_results
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "admin manages youth game results" on public.youth_game_results;
create policy "admin manages youth game results" on public.youth_game_results
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
