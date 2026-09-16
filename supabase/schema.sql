create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "own progress select" on public.progress for select using (auth.uid() = user_id);
create policy "own progress insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress delete" on public.progress for delete using (auth.uid() = user_id);
