-- Sunsama-inspired daily planner — initial schema
-- Tables: profiles, channels, tasks, subtasks, time_entries, daily_plans
-- Security: row level security scoped to the authenticated user on every table.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.task_status as enum (
  'backlog',
  'planned',
  'in_progress',
  'done',
  'cancelled'
);

create type public.task_priority as enum (
  'none',
  'low',
  'medium',
  'high'
);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- channels (Sunsama "channels" / projects)
-- ---------------------------------------------------------------------------
create table public.channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  emoji text,
  position double precision not null default 1000,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index channels_user_id_idx on public.channels (user_id);

create trigger channels_set_updated_at
  before update on public.channels
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete set null,
  title text not null,
  notes text,
  status public.task_status not null default 'planned',
  priority public.task_priority not null default 'none',
  planned_date date,
  position double precision not null default 1000,
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  actual_minutes integer not null default 0 check (actual_minutes >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_user_planned_date_idx on public.tasks (user_id, planned_date);
create index tasks_user_channel_idx on public.tasks (user_id, channel_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Keep completed_at in sync with the done status.
create or replace function public.handle_task_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' and (old.status is distinct from 'done') then
    new.completed_at = now();
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_sync_completion
  before insert or update on public.tasks
  for each row execute function public.handle_task_completion();

-- ---------------------------------------------------------------------------
-- subtasks
-- ---------------------------------------------------------------------------
create table public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position double precision not null default 1000,
  created_at timestamptz not null default now()
);

create index subtasks_task_id_idx on public.subtasks (task_id);
create index subtasks_user_id_idx on public.subtasks (user_id);

-- ---------------------------------------------------------------------------
-- time_entries (timer / time tracking)
-- ---------------------------------------------------------------------------
create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index time_entries_user_id_idx on public.time_entries (user_id);
create index time_entries_task_id_idx on public.time_entries (task_id);

-- ---------------------------------------------------------------------------
-- daily_plans (daily planning + shutdown ritual)
-- ---------------------------------------------------------------------------
create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  notes text,
  shutdown_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index daily_plans_user_id_idx on public.daily_plans (user_id);

create trigger daily_plans_set_updated_at
  before update on public.daily_plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user bootstrap: create a profile row on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.time_entries enable row level security;
alter table public.daily_plans enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);
create policy "Profiles are updatable by owner"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Profiles are insertable by owner"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Channels are manageable by owner"
  on public.channels for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Tasks are manageable by owner"
  on public.tasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Subtasks are manageable by owner"
  on public.subtasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Time entries are manageable by owner"
  on public.time_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Daily plans are manageable by owner"
  on public.daily_plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
