-- ---------------------------------------------------------------------------
-- Slack-style saving: "save for later" on tasks + per-channel bookmarks.
-- ---------------------------------------------------------------------------

-- Save for later ------------------------------------------------------------
alter table public.tasks
  add column if not exists saved_at timestamptz;

-- Partial index: we only ever query the saved subset.
create index if not exists tasks_saved_idx
  on public.tasks (user_id, saved_at desc)
  where saved_at is not null;

-- Channel bookmarks ---------------------------------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete cascade,
  title text not null,
  url text,
  note text,
  emoji text,
  position double precision not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);
create index if not exists bookmarks_channel_id_idx on public.bookmarks (channel_id);

drop trigger if exists bookmarks_set_updated_at on public.bookmarks;
create trigger bookmarks_set_updated_at
  before update on public.bookmarks
  for each row execute function public.set_updated_at();

alter table public.bookmarks enable row level security;

drop policy if exists "Bookmarks are manageable by owner" on public.bookmarks;
create policy "Bookmarks are manageable by owner"
  on public.bookmarks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
